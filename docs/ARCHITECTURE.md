ARCHITECTURE.md: Halo VSCode 扩展

#### **1. 概述**

Halo VSCode 扩展是一个用于将 Markdown 文件发布到 Halo 站点的 Visual Studio Code 扩展。它允许用户进行文章的发布、拉取、更新、图片上传以及分类和标签设置等操作，旨在简化 Markdown 内容与 Halo 博客系统之间的同步。

#### **2. 核心模块与组件**

项目主要采用 TypeScript 编写，结构清晰，主要模块包括：

*   **`extension.ts` (入口文件)**:
    *   作为 VSCode 扩展的入口点，负责激活扩展和注册所有命令。
    *   在 `activate` 函数中，通过 `vscode.commands.registerCommand` 将 `src/commands` 目录下定义的各个命令函数注册到 VSCode 命令面板。
    *   管理扩展的生命周期，但在 `deactivate` 函数中没有具体实现。

*   **`src/commands` 目录**:
    *   包含所有可执行的 VSCode 命令的实现文件，每个文件对应一个具体的命令。
    *   例如：
        *   `setup.ts`: 用于配置 Halo 站点信息 (URL 和 PAT)。
        *   `publish.ts`: 核心发布命令，负责协调图片上传和文章发布。
        *   `pull.ts`: 从 Halo 站点拉取文章到本地 Markdown 文件。
        *   `update.ts`: 更新已发布的文章。
        *   `upload-images.ts`: 独立执行 Markdown 文件中本地图片的上传。
        *   `set-categories.ts`: 设置文章的分类。
        *   `set-tags.ts`: 设置文章的标签。
    *   这些命令文件通常会实例化 `HaloService` 并调用其对应的方法来执行业务逻辑。

*   **`src/service/index.ts` (`HaloService`)**:
    *   项目的核心业务逻辑层，封装了与 Halo 后端 API 的所有交互。
    *   使用 `@halo-dev/api-client` (版本 `^2.21.0`) 和 `axios` 进行 API 请求。
    *   **关键功能**：
        *   **初始化**: 构造函数接收 `Site` 对象，并基于其 URL 和 PAT 创建 `axios` 实例和 Halo API 客户端 (`UcApiContentHaloRunV1alpha1PostApi` 和 `UcApiContentHaloRunV1alpha1AttachmentApi`)。
        *   **`getPost(name)`**: 根据文章名称获取文章及其内容。
        *   **`publishPost()`**: 
            *   读取当前活动 Markdown 文件的内容和 YAML 头信息。
            *   解析 Markdown 内容并将其渲染为 HTML。
            *   根据 YAML 头信息（如 `title`, `slug`, `excerpt`, `cover`, `categories`, `tags`）构建或更新 `Post` 对象。
            *   如果文章已有 `metadata.name`，则调用 `postApi.updateMyPost` 和 `postApi.updateMyPostDraft` 进行更新。
            *   如果文章是新创建的，则生成唯一的 `metadata.name` 和 `slug`，然后调用 `postApi.createMyPost`。
            *   根据 YAML 头信息中的 `halo.publish` 或用户配置 `halo.post.publishByDefault` 决定是否发布文章 (`postApi.publishMyPost` 或 `postApi.unpublishMyPost`)。
            *   发布成功后，更新本地 Markdown 文件的 YAML 头信息，并弹出成功提示，提供在浏览器中打开文章的选项。
        *   **`updatePost()`**: 更新本地 Markdown 文件中文章的元数据（标题、slug、摘要、封面、分类、标签等），并同步到 Halo。
        *   **`uploadImages()`**: 
            *   扫描当前 Markdown 文件中的本地图片路径。
            *   对于每个本地图片，调用 `uploadImage` 方法将其上传到 Halo。
            *   上传成功后，替换 Markdown 文件中的本地图片路径为 Halo 返回的永久链接。
        *   **`uploadImage(file, postName)`**: 将指定文件作为附件上传到 Halo，并返回其永久链接。使用 `file-type` 检测文件类型，通过 `attachmentApi.createAttachmentForPost` 进行上传。
        *   **`getPosts()`, `getCategories()`, `getTags()`**: 获取 Halo 中的文章、分类和标签列表。
        *   **分类和标签管理**: `getCategoryNames`, `getCategoryDisplayNames`, `getTagNames`, `getTagDisplayNames` 方法用于处理分类和标签的名称与显示名称之间的转换，并支持在 Halo 中自动创建不存在的分类和标签。

*   **`src/utils` 目录**:
    *   提供辅助功能，支持核心业务逻辑的实现。
    *   `site-store.ts`:
        *   使用 `preferences` 库来持久化存储和检索 Halo 站点配置（URL、PAT、是否默认）。
        *   目前设计上倾向于只存储和管理一个默认站点。
    *   `markdown.ts`:
        *   配置并导出了一个 `markdown-it` 实例，用于将 Markdown 内容渲染为 HTML。
        *   集成了 `markdown-it-anchor` 插件，可能用于生成标题锚点。
    *   `yaml.ts`:
        *   封装了 `gray-matter` 和 `js-yaml` 库，用于：
            *   `readMatter(content)`: 从 Markdown 内容中读取 YAML 头信息和实际 Markdown 内容。
            *   `mergeMatter(content, data)`: 将数据合并到 Markdown 内容的 YAML 头信息中，并将其转换为字符串。

#### **3. 数据流与交互**

1.  **用户操作**: 用户通过 VSCode 命令面板触发扩展命令（例如：`Halo Publish`）。
2.  **命令层 (`src/commands`)**: 对应的命令函数被执行，它会：
    *   获取当前活动编辑器的文档内容。
    *   从 `SiteStore` 获取当前配置的 Halo 站点信息。
    *   实例化 `HaloService`。
    *   调用 `HaloService` 中对应的方法（例如 `publishPost`，`uploadImages`）。
3.  **服务层 (`HaloService`)**: 
    *   `HaloService` 根据业务需求调用 `@halo-dev/api-client` 中对应的方法，通过 `axios` 发送 HTTP 请求到 Halo 后端 API。
    *   处理 API 响应，包括成功的数据处理和错误处理。
    *   与 `src/utils` 中的辅助工具进行交互，例如：
        *   `yaml.ts`：用于解析和修改 Markdown 的 YAML 头信息。
        *   `markdown.ts`：用于将 Markdown 渲染为 HTML。
        *   `site-store.ts`：用于获取和存储站点配置。
4.  **Halo 后端 API**: 接收请求，执行相应的操作（创建/更新文章、上传附件、查询分类/标签等），并返回结果。
5.  **VSCode UI**: `HaloService` 中的逻辑可能会触发 VSCode 的通知（`vscode.window.showInformationMessage`）和进度条（`vscode.window.withProgress`），以及通过 `activeEditor.edit` 修改编辑器内容。

#### **4. Halo 2.21 兼容性分析结果**

经过对 Halo 官方文档的详细分析和代码审查，发现以下兼容性问题和解决方案：

##### **4.1 主要兼容性问题**

*   **API 客户端使用方式变化**: Halo 2.17+ 引入了新的 `@halo-dev/api-client` 使用模式，当前扩展使用的是旧式实例化方式
*   **错误处理不完善**: 缺少对 Halo 2.21 新错误类型的处理（401、403、500等）
*   **认证机制增强**: 虽然 PAT 认证方式没有根本变化，但需要更好的错误处理和超时设置
*   **API 路径可能的细微调整**: 某些 API 端点可能有微小变化

##### **4.2 解决方案**

已创建兼容版本的服务类 `HaloServiceV2` (`src/service/halo-service-v2.ts`)，主要改进包括：

*   **增强的错误处理**: 添加了对认证失败、权限不足、服务器错误的专门处理
*   **更好的超时设置**: 增加了30秒超时，避免长时间等待
*   **详细的日志记录**: 便于调试和问题排查
*   **兼容性适配**: 保持现有 API 调用方式的同时，增加了对新版本的兼容性处理

##### **4.3 修复建议**

1. **渐进式迁移**: 建议先测试 `HaloServiceV2` 类，确认兼容性后再完全替换
2. **版本检测**: 可以考虑添加 Halo 版本检测，根据不同版本使用不同的服务类
3. **充分测试**: 在 Halo 2.21 环境中测试所有功能（发布、更新、拉取、图片上传等）
*   **数据模型变化**: `Post`、`Content`、`Category`、`Tag` 等数据结构可能在 Halo 2.21 中有调整，导致扩展发送的数据格式不正确或接收到的数据无法正确解析。特别是文章内容的存储方式（`content.halo.run/patched-content`, `content.halo.run/patched-raw`）和发布机制（`publishMyPost`, `unpublishMyPost`），以及分类/标签的创建和关联方式。
*   **文件上传机制**: 图片上传的 API 接口或参数是否有变化？例如 `createAttachmentForPost` 方法的参数或返回结构。
*   **配置项变化**: `halo.post.publishByDefault` 等配置项在 Halo 2.21 中是否依然有效或有对应的后端支持？
*   **错误处理与日志**: 当前错误处理主要通过 `vscode.window.showErrorMessage` 显示用户友好的信息，但对于调试兼容性问题，可能需要更详细的错误日志来诊断具体的 API 响应错误。

#### **5. 总结**

该 Halo VSCode 扩展具备完整的发布、同步和管理 Halo 文章的功能。其架构清晰，通过 `HaloService` 集中管理与 Halo API 的交互，并通过 `src/commands` 和 `src/utils` 目录提供模块化的命令和辅助功能。解决 Halo 2.21 兼容性问题的关键在于仔细审查 Halo 2.21 的 API 文档，并与当前代码中的 API 调用进行比对，定位并修复任何不一致或已弃用的部分。 