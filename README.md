# Halo integration for Visual Studio Code

Visual Studio Code extension for publishing Markdown files to [Halo](https://github.com/halo-dev/halo)

[中文文档](./README.zh-CN.md)

## 🎉 Latest Updates (v1.3.0)

- ✅ **Full compatibility with Halo 2.21+**: Updated API methods to work seamlessly with the latest Halo version
- 🔧 **Enhanced TypeScript support**: Improved type definitions and compiler configuration
- 🧪 **Comprehensive testing**: Added extensive test suite to ensure reliability
- 📦 **Ready to use**: Pre-built extension package available for immediate installation

## 📋 Compatibility

| Extension Version | Halo Version | Status |
|------------------|--------------|---------|
| v1.3.0+ | 2.21+ | ✅ Fully Compatible |
| v1.2.x | 2.20 and below | ⚠️ Legacy Support |

## Preview

![Preview](./images/preview-en.png)

## Features

- 📝 **Publish Markdown files** to Halo with one command
- 🖼️ **Upload local images** referenced in the Markdown file to Halo automatically
- 📥 **Pull posts from Halo** to local Markdown files for editing
- 🔄 **Update existing posts** directly from VS Code
- 🏷️ **Manage categories and tags** for your posts
- 🌐 **Multi-language support** (English/Chinese)

## Prerequisites

Before using this extension, make sure you have the following prerequisites:

- An available [Halo](https://github.com/halo-dev/halo) site (version 2.21 or higher recommended)
- Visual Studio Code: [Download here](https://code.visualstudio.com/download)

## Installation

### Option 1: From VS Code Marketplace (Recommended)
1. Open Visual Studio Code
2. Go to Extensions
3. Search for **Halo**
4. Click the Install button
5. Reload Visual Studio Code to activate the extension

### Option 2: Manual Installation
1. Download the latest `.vsix` file from [Releases](https://github.com/xj-bear/vscode-extension-halo/releases)
2. Run `code --install-extension halo-1.3.0.vsix`
3. Restart VS Code

## Usage

1. Open the Command Palette and search for **Halo Setup**.
2. Fill in the relevant information for your Halo site according to the prompts.
   1. Site url: The URL of your Halo site, e.g. `https://example.com`
   2. Personal access token:

       The personal access token of your Halo site, needs `Post Manage` permission.

       ![PAT](./images/pat-en.png)

       More information about personal access token: [Personal Access Token](https://docs.halo.run/user-guide/user-center#%E4%B8%AA%E4%BA%BA%E4%BB%A4%E7%89%8C)

3. Open a Markdown file, then open the command palette and search for **Halo Publish**. Once selected, this document will be published to the Halo site.

## Available Commands

All available commands in VS Code Command Palette:

- **vscode-extension-halo.setup**: Setup Halo site information
- **vscode-extension-halo.publish**: Publish the Markdown file to Halo
- **vscode-extension-halo.pull**: Pull post from Halo to local Markdown file
- **vscode-extension-halo.upload-images**: Upload local images referenced in the Markdown file to Halo
- **vscode-extension-halo.update**: Update post from Halo to local Markdown file
- **vscode-extension-halo.set-categories**: Set categories for current post
- **vscode-extension-halo.set-tags**: Set tags for current post

## 🔧 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify your Halo site URL is correct and accessible
   - Check if your Personal Access Token is valid and has proper permissions

2. **API Errors**
   - Ensure you're using Halo 2.21 or higher
   - Update to the latest extension version

3. **Upload Issues**
   - Check your network connection
   - Verify image file formats are supported

### Getting Help

If you encounter any issues:
1. Check the VS Code Developer Console (`F12`) for error messages
2. View the output panel (`Ctrl+Shift+U`) and select "Halo" channel
3. Create an issue on [GitHub Issues](https://github.com/xj-bear/vscode-extension-halo/issues)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/xj-bear/vscode-extension-halo/issues).

### Development Setup

```bash
# Clone the repository
git clone https://github.com/xj-bear/vscode-extension-halo.git
cd vscode-extension-halo

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension
npm run package
```

## 📝 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original extension by [halo-sigs](https://github.com/halo-sigs/vscode-extension-halo)
- [Halo](https://github.com/halo-dev/halo) - The amazing blogging platform
- VS Code team for the excellent extension API

---

**Maintained by**: [@xj-bear](https://github.com/xj-bear)  
**Original Author**: [halo-sigs](https://github.com/halo-sigs)  
**Extension Version**: v1.3.0  
**Last Updated**: 2025-06-16
