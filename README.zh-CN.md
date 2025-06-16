# VSCode 发布插件

用于将 Markdown 文件发布到 [Halo](https://github.com/halo-dev/halo) 的 Visual Studio Code 插件

[English](./README.md)

## 🎉 最新更新 (v1.3.0)

- ✅ **完全兼容 Halo 2.21+**: 更新API方法，与最新版本Halo无缝协作
- 🔧 **增强TypeScript支持**: 改进类型定义和编译器配置
- 🧪 **全面测试**: 添加详尽的测试套件确保可靠性
- 📦 **即用即装**: 预构建扩展包，立即可用

## 📋 兼容性

| 扩展版本 | Halo版本 | 状态 |
|---------|----------|------|
| v1.3.0+ | 2.21+ | ✅ 完全兼容 |
| v1.2.x | 2.20及以下 | ⚠️ 传统支持 |

## 预览

![Preview](./images/preview-zh.png)

## 功能

- 📝 **一键发布Markdown文件** 到Halo博客
- 🖼️ **自动上传本地图片** 到Halo附件库
- 📥 **从Halo拉取文章** 到本地进行编辑
- 🔄 **直接更新已发布文章** 无需重新发布
- 🏷️ **管理文章分类和标签** 
- 🌐 **多语言支持** (中文/英文)

## 先决条件

在使用此插件之前，请确保满足以下先决条件：

- 一个可用的 [Halo](https://github.com/halo-dev/halo) 网站 (推荐版本 2.21 或更高)
- 安装 Visual Studio Code：[在此处下载](https://code.visualstudio.com/download)

## 安装

### 方式一：从VS Code扩展市场安装 (推荐)
1. 打开 Visual Studio Code
2. 进入扩展页面
3. 搜索 Halo
4. 点击安装按钮
5. 重新加载 Visual Studio Code 以激活插件

### 方式二：手动安装
1. 从 [Releases](https://github.com/xj-bear/vscode-extension-halo/releases) 下载最新的 `.vsix` 文件
2. 运行 `code --install-extension halo-1.3.0.vsix`
3. 重启 VS Code

## 使用方法

1. 打开命令面板，搜索 **Halo 初始化**
2. 根据提示填写 Halo 网站的相关信息
   1. 站点地址: Halo 网站的访问地址，示例：`https://example.com`
   2. 个人令牌:

       Halo 网站的个人令牌，需要 `文章管理` 的权限

       ![PAT](./images/pat-zh.png)

       更多关于个人令牌的文档可查阅: [个人令牌](https://docs.halo.run/user-guide/user-center#%E4%B8%AA%E4%BA%BA%E4%BB%A4%E7%89%8C)

3. 打开一个 Markdown 文件，然后打开命令面板，搜索 **Halo 发布**。选择后，该文件将被发布到 Halo 网站

## 可用命令

在VS Code命令面板中的所有可用命令：

- **vscode-extension-halo.setup**：设置 Halo 网站信息
- **vscode-extension-halo.publish**：将 Markdown 文件发布到 Halo
- **vscode-extension-halo.pull**：从 Halo 拉取文章到本地 Markdown 文件
- **vscode-extension-halo.upload-images**：上传 Markdown 文件中引用的本地图片到 Halo
- **vscode-extension-halo.update**: 从 Halo 更新文章到本地 Markdown 文件
- **vscode-extension-halo.set-categories**: 设置当前文章的分类
- **vscode-extension-halo.set-tags**: 设置当前文章的标签

## 🔧 故障排除

### 常见问题

1. **连接失败**
   - 验证您的Halo站点URL是否正确且可访问
   - 检查个人访问令牌是否有效且具有适当权限

2. **API错误**
   - 确保您使用的是Halo 2.21或更高版本
   - 更新到最新的扩展版本

3. **上传问题**
   - 检查网络连接
   - 验证图片文件格式是否受支持

### 获取帮助

如果遇到任何问题：
1. 检查VS Code开发者控制台 (`F12`) 查看错误信息
2. 查看输出面板 (`Ctrl+Shift+U`) 并选择"Halo"频道
3. 在 [GitHub Issues](https://github.com/xj-bear/vscode-extension-halo/issues) 创建问题

## 🤝 贡献

欢迎贡献、报告问题和提出功能请求！请随时查看 [问题页面](https://github.com/xj-bear/vscode-extension-halo/issues)。

### 开发设置

```bash
# 克隆仓库
git clone https://github.com/xj-bear/vscode-extension-halo.git
cd vscode-extension-halo

# 安装依赖
npm install

# 编译扩展
npm run compile

# 打包扩展
npm run package
```

## 📝 许可证

此项目在GPL-3.0许可证下发布 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 原始扩展由 [halo-sigs](https://github.com/halo-sigs/vscode-extension-halo) 开发
- [Halo](https://github.com/halo-dev/halo) - 优秀的博客平台
- VS Code团队提供的出色扩展API

---

**维护者**: [@xj-bear](https://github.com/xj-bear)  
**原作者**: [halo-sigs](https://github.com/halo-sigs)  
**扩展版本**: v1.3.0  
**最后更新**: 2025-06-16
