# Change Log

## 1.3.0 (2025-06-16)

### 🎉 Halo 2.21 Compatibility Update

⚠️ **IMPORTANT**: This version adds full compatibility with Halo 2.21+. Due to API changes in Halo 2.21, **you may need to rerun `Halo Setup`** after updating.

### ✅ New Features & Improvements

- **🔧 Full Halo 2.21+ Compatibility**: Updated all API methods to work seamlessly with Halo 2.21 and future versions
- **📝 Enhanced API Methods**: Migrated from legacy post APIs to new personal post APIs (`listMyPosts`, `getMyPost`, etc.)
- **🔒 Improved Authentication**: Enhanced Personal Access Token authentication system
- **🧪 Comprehensive Testing**: Added extensive test suite with 25+ API structure validation tests
- **⚡ Performance Optimizations**: Better error handling and network request management
- **🌍 Multi-language Support**: Enhanced Chinese and English documentation

### 🔄 API Method Updates

- `listPosts()` → `listMyPosts()`
- `getPost()` → `getMyPost()`
- `getPostDraft()` → `getMyPostDraft()`
- `updatePost()` → `updateMyPost()`
- `updatePostDraft()` → `updateMyPostDraft()`
- `createPost()` → `createMyPost()`
- `publishPost()` → `publishMyPost()`
- `unpublishPost()` → `unpublishMyPost()`

### 🛠️ Technical Improvements

- **TypeScript Configuration**: Enhanced `tsconfig.json` with DOM library support
- **Type Definitions**: Added `src/types/global.d.ts` for better type safety
- **Build System**: Optimized Rspack configuration for better performance
- **Code Quality**: Fixed linting issues and improved code formatting

### 📦 Deployment & Testing

- **Pre-built Package**: Ready-to-install `.vsix` extension package
- **Automated Testing**: Comprehensive test suite including:
  - API structure validation tests
  - Integration tests with real Halo instances
  - Compatibility verification tests
- **Documentation**: Updated README files with installation and troubleshooting guides

### 🔍 Compatibility Matrix

| Extension Version | Halo Version | Status |
|------------------|--------------|---------|
| v1.3.0+ | 2.21+ | ✅ Fully Compatible |
| v1.2.x | 2.20 and below | ⚠️ Legacy Support |

### 🚀 Migration Guide

1. **Update the Extension**: Install v1.3.0 via VS Code marketplace or manually
2. **Reconfigure**: Run `Halo Setup` command to update your configuration
3. **Verify**: Test publishing a simple document to ensure everything works
4. **Enjoy**: All existing features now work with Halo 2.21+!

---

## Previous Versions

## 1.2.0

- Add anchor feature for markdown renderer

## 1.1.0

- Exclude deleted posts when pulling posts
- Exclude hidden attachment group when setup
- Support batch pulling posts
- Add publish parameters to Front-matter
- Optimize the logic of picture upload
- Support setting categories, tags and title
- Support updating post from halo remote
- Check whether the site matches when publishing
- Support to set categories and tags by selection
- Allow insert html code

## 1.0.0

- Initial release
