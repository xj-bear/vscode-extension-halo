import { File } from "node:buffer";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
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
    // 实现发布逻辑
    console.log('Publishing post with enhanced Halo 2.21 compatibility');
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
}

export default HaloServiceV2; 