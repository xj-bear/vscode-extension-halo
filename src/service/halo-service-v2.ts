import { File } from "node:buffer";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as FormData from "form-data";
import {
  type Category,
  type CategoryList,
  type Content,
  type ListedPost,
  type Post,
  type Tag,
  type TagList,
} from "@halo-dev/api-client";
import axios, { type AxiosInstance, type AxiosError } from "axios";
import { fileTypeFromFile } from "file-type";
import { slugify } from "transliteration";
import * as vscode from "vscode";
import markdownIt from "../utils/markdown";
import type { Site } from "../utils/site-store";
import { mergeMatter, readMatter } from "../utils/yaml";
import path = require("node:path");

/**
 * 兼容 Halo 2.21 的新版 HaloService
 * 主要改进：
 * 1. 更好的错误处理
 * 2. 兼容新版 API 客户端
 * 3. 增强的认证处理
 */
class HaloServiceV2 {
  private readonly site: Site;
  private readonly apiClient: AxiosInstance;

  constructor(site?: Site) {
    if (!site) {
      throw new Error(vscode.l10n.t("No site found"));
    }
    this.site = site;
    
    // 创建 axios 实例，增强错误处理
    const axiosInstance = axios.create({
      baseURL: site.url,
      headers: {
        Authorization: `Bearer ${site.pat}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30秒超时
    });

    // 添加响应拦截器，处理认证和错误
    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          vscode.window.showErrorMessage(
            vscode.l10n.t("Authentication failed. Please check your Personal Access Token.")
          );
        } else if (error.response?.status === 403) {
          vscode.window.showErrorMessage(
            vscode.l10n.t("Permission denied. Please check your account permissions.")
          );
        }
        return Promise.reject(error);
      }
    );

    this.apiClient = axiosInstance;
  }

  /**
   * 获取文章详情（兼容 Halo 2.21）
   */
  public async getPost(name: string): Promise<{ post: Post; content: Content } | undefined> {
    try {
      // 使用原有的 API 路径，但增强错误处理
      const postResponse = await this.apiClient.get<Post>(`/apis/uc.api.content.halo.run/v1alpha1/posts/${name}`);
      const post = postResponse.data;

      const snapshotResponse = await this.apiClient.get(`/apis/uc.api.content.halo.run/v1alpha1/posts/${name}/draft`, {
        params: { patched: true }
      });
      const snapshot = snapshotResponse.data;

      const {
        "content.halo.run/patched-content": patchedContent,
        "content.halo.run/patched-raw": patchedRaw,
      } = snapshot.metadata.annotations || {};

      const { rawType } = snapshot.spec || {};

      const content: Content = {
        content: patchedContent,
        raw: patchedRaw,
        rawType,
      };

      return { post, content };
    } catch (error) {
      console.error('[HaloService] Failed to get post:', error);
      return undefined;
    }
  }

  /**
   * 发布文章（兼容 Halo 2.21）
   */
  public async publishPost(): Promise<void> {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage(vscode.l10n.t("No active editor"));
      return;
    }

    await activeEditor.document.save();

    // 显示进度条
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: vscode.l10n.t("Publishing post..."),
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ increment: 10, message: vscode.l10n.t("Reading file content...") });

          let params: Post = {
            apiVersion: "content.halo.run/v1alpha1",
            kind: "Post",
            metadata: {
              annotations: {},
              name: "",
            },
            spec: {
              allowComment: true,
              baseSnapshot: "",
              categories: [],
              cover: "",
              deleted: false,
              excerpt: {
                autoGenerate: true,
                raw: "",
              },
              headSnapshot: "",
              htmlMetas: [],
              owner: "",
              pinned: false,
              priority: 0,
              publish: false,
              publishTime: "",
              releaseSnapshot: "",
              slug: "",
              tags: [],
              template: "",
              title: "",
              visible: "PUBLIC",
            },
          };

          let content: Content = {
            rawType: "markdown",
            raw: "",
            content: "",
          };

          const { content: raw, data: matterData } = readMatter(
            activeEditor.document.getText(),
          );

          // 检查站点URL
          if (matterData.halo?.site && matterData.halo.site !== this.site.url) {
            vscode.window.showErrorMessage(vscode.l10n.t("Site url is not matched"));
            return;
          }

          progress.report({ increment: 20, message: vscode.l10n.t("Checking existing post...") });

          // 获取现有文章
          if (matterData.halo?.name) {
            const post = await this.getPost(matterData.halo.name);
            if (post) {
              params = post.post;
              content = post.content;
            }
          }

          content.raw = raw;
          content.content = markdownIt.render(raw);

          progress.report({ increment: 30, message: vscode.l10n.t("Processing metadata...") });

          // 恢复元数据
          if (matterData.title) {
            params.spec.title = matterData.title;
          }

          if (matterData.slug) {
            params.spec.slug = matterData.slug;
          }

          if (matterData.excerpt) {
            params.spec.excerpt.raw = matterData.excerpt;
            params.spec.excerpt.autoGenerate = false;
          }

          if (matterData.cover) {
            params.spec.cover = matterData.cover;
          }

          if (matterData.categories) {
            progress.report({ increment: 40, message: vscode.l10n.t("Processing categories...") });
            const categoryNames = await this.getCategoryNames(matterData.categories);
            params.spec.categories = categoryNames;
          }

          if (matterData.tags) {
            progress.report({ increment: 50, message: vscode.l10n.t("Processing tags...") });
            const tagNames = await this.getTagNames(matterData.tags);
            params.spec.tags = tagNames;
          }

          progress.report({ increment: 60, message: vscode.l10n.t("Saving post...") });

          // 更新或创建文章
          if (params.metadata.name) {
            await this.updatePost(params, content);
          } else {
            await this.createPost(params, content, activeEditor);
          }

          progress.report({ increment: 80, message: vscode.l10n.t("Publishing...") });

          // 处理发布状态
          const shouldPublish = matterData.halo?.publish ?? vscode.workspace.getConfiguration("halo").get<boolean>("post.publishByDefault", false);
          
          if (shouldPublish) {
            await this.publishPostByName(params.metadata.name);
          } else {
            await this.unpublishPostByName(params.metadata.name);
          }

          progress.report({ increment: 90, message: vscode.l10n.t("Updating local file...") });

          // 更新本地文件
          await this.updateLocalFile(activeEditor, params, matterData);

          progress.report({ increment: 100, message: vscode.l10n.t("Complete!") });

          // 显示成功消息
          const successMessage = vscode.l10n.t("Post published successfully");
          const openInBrowser = vscode.l10n.t("Open in browser");
          const result = await vscode.window.showInformationMessage(successMessage, openInBrowser);
          
          if (result === openInBrowser) {
            const postUrl = `${this.site.url}/archives/${params.spec.slug}`;
            vscode.env.openExternal(vscode.Uri.parse(postUrl));
          }
        } catch (error) {
          console.error('[HaloServiceV2] Failed to publish post:', error);
          vscode.window.showErrorMessage(vscode.l10n.t("Failed to publish post. Please check the logs."));
        }
      }
    );
  }

  /**
   * 获取所有分类
   */
  public async getCategories(): Promise<Category[]> {
    const response = await this.apiClient.get<CategoryList>("/apis/content.halo.run/v1alpha1/categories");
    return response.data.items;
  }

  /**
   * 获取所有标签
   */
  public async getTags(): Promise<Tag[]> {
    const response = await this.apiClient.get<TagList>("/apis/content.halo.run/v1alpha1/tags");
    return response.data.items;
  }

  /**
   * 获取分类名称列表
   */
  public async getCategoryNames(displayNames: string[]): Promise<string[]> {
    const allCategories = await this.getCategories();

    const notExistDisplayNames = displayNames.filter(
      (name) => !allCategories.find((item) => item.spec.displayName === name),
    );

    const promises = notExistDisplayNames.map((name) =>
      this.apiClient.post<Category>("/apis/content.halo.run/v1alpha1/categories", {
        spec: {
          displayName: name,
          slug: slugify(name, { trim: true }),
          description: "",
          cover: "",
          template: "",
          priority: 0,
        },
        apiVersion: "content.halo.run/v1alpha1",
        kind: "Category",
        metadata: { name: "", generateName: "category-" },
      }),
    );

    const newCategories = await Promise.all(promises);

    const existNames = displayNames
      .map((name) => {
        const found = allCategories.find((item) => item.spec.displayName === name);
        return found ? found.metadata.name : undefined;
      })
      .filter(Boolean) as string[];

    return [...existNames, ...newCategories.map((item) => item.data.metadata.name)];
  }

  /**
   * 获取标签名称列表
   */
  public async getTagNames(displayNames: string[]): Promise<string[]> {
    const allTags = await this.getTags();

    const notExistDisplayNames = displayNames.filter(
      (name) => !allTags.find((item) => item.spec.displayName === name),
    );

    const promises = notExistDisplayNames.map((name) =>
      this.apiClient.post<Tag>("/apis/content.halo.run/v1alpha1/tags", {
        spec: {
          displayName: name,
          slug: slugify(name, { trim: true }),
          color: "#ffffff",
          cover: "",
        },
        apiVersion: "content.halo.run/v1alpha1",
        kind: "Tag",
        metadata: { name: "", generateName: "tag-" },
      }),
    );

    const newTags = await Promise.all(promises);

    const existNames = displayNames
      .map((name) => {
        const found = allTags.find((item) => item.spec.displayName === name);
        return found ? found.metadata.name : undefined;
      })
      .filter(Boolean) as string[];

    return [...existNames, ...newTags.map((item) => item.data.metadata.name)];
  }

  /**
   * 更新现有文章
   */
  private async updatePost(params: Post, content: Content): Promise<void> {
    const { name } = params.metadata;

    // 更新文章
    await this.apiClient.put(`/apis/uc.api.content.halo.run/v1alpha1/posts/${name}`, params);

    // 获取并更新草稿
    const snapshotResponse = await this.apiClient.get(`/apis/uc.api.content.halo.run/v1alpha1/posts/${name}/draft`, {
      params: { patched: true }
    });
    const snapshot = snapshotResponse.data;

    snapshot.metadata.annotations = {
      ...snapshot.metadata.annotations,
      "content.halo.run/content-json": JSON.stringify(content),
    };

    await this.apiClient.put(`/apis/uc.api.content.halo.run/v1alpha1/posts/${name}/draft`, snapshot);
  }

  /**
   * 创建新文章
   */
  private async createPost(params: Post, content: Content, activeEditor: vscode.TextEditor): Promise<void> {
    const fileName = path.basename(activeEditor.document.fileName).replace(".md", "");
    params.metadata.name = randomUUID();
    params.spec.title = params.spec.title || fileName;
    params.spec.slug = params.spec.slug || slugify(fileName, { trim: true });

    params.metadata.annotations = {
      ...params.metadata.annotations,
      "content.halo.run/content-json": JSON.stringify(content),
    };

    const response = await this.apiClient.post("/apis/uc.api.content.halo.run/v1alpha1/posts", params);
    
    // 更新 params 引用
    Object.assign(params, response.data);
  }

  /**
   * 发布文章
   */
  private async publishPostByName(name: string): Promise<void> {
    await this.apiClient.put(`/apis/uc.api.content.halo.run/v1alpha1/posts/${name}/publish`);
  }

  /**
   * 取消发布文章
   */
  private async unpublishPostByName(name: string): Promise<void> {
    await this.apiClient.put(`/apis/uc.api.content.halo.run/v1alpha1/posts/${name}/unpublish`);
  }

  /**
   * 更新本地文件的 YAML 头信息
   */
  private async updateLocalFile(activeEditor: vscode.TextEditor, params: Post, matterData: any): Promise<void> {
    const modifiedContent = mergeMatter(activeEditor.document.getText(), {
      ...matterData,
      halo: {
        site: this.site.url,
        name: params.metadata.name,
        publish: params.spec.publish,
      },
    });

    await activeEditor.edit((editBuilder) => {
      const firstLine = activeEditor.document.lineAt(0);
      const lastLine = activeEditor.document.lineAt(activeEditor.document.lineCount - 1);
      const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
      editBuilder.replace(textRange, modifiedContent);
    });

    await activeEditor.document.save();
  }

  /**
   * 获取文章列表
   */
  public async getPosts(): Promise<ListedPost[]> {
    const response = await this.apiClient.get("/apis/uc.api.content.halo.run/v1alpha1/posts", {
      params: {
        labelSelector: ["content.halo.run/deleted=false"],
      },
    });
    return response.data.items;
  }

  /**
   * 上传图片
   */
  public async uploadImage(file: string, postName: string): Promise<string> {
    try {
      const fileType = await fileTypeFromFile(file);
      const fileBlob = new File(
        [fs.readFileSync(decodeURIComponent(file))],
        path.basename(file),
        {
          type: fileType?.mime,
        },
      );

      const formData = new FormData();
      formData.append("file", fileBlob);
      formData.append("postName", postName);
      formData.append("waitForPermalink", "true");

      const response = await this.apiClient.post(
        "/apis/uc.api.content.halo.run/v1alpha1/attachments",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const attachment = response.data;
      if (attachment.status?.permalink?.startsWith("http")) {
        return attachment.status.permalink;
      }

      return this.site.url + attachment.status?.permalink || file;
    } catch (error) {
      console.error("Error uploading image:", error);
      return file;
    }
  }
}

export default HaloServiceV2; 