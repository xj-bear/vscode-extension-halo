# Halo VSCode 扩展功能测试指南

## 概述

此文档介绍如何进行 Halo VSCode 扩展的功能测试，通过实际的 API 调用验证扩展与 Halo 2.21 的兼容性。

## 测试前准备

### 1. 准备 Halo 2.21 测试环境

#### 选项 A: 使用官方演示站点
```bash
# 使用 Halo 官方演示站点（推荐用于快速测试）
export HALO_URL="https://demo.halo.run"
export HALO_PAT="你的个人访问令牌"
```

#### 选项 B: 本地 Docker 环境
```bash
# 启动 Halo 2.21 本地环境
docker run -d --name halo-test \
  -p 8090:8090 \
  -v ~/.halo2:/root/.halo2 \
  halohub/halo:2.21

# 等待启动完成后访问 http://localhost:8090/console 进行初始化
export HALO_URL="http://localhost:8090"
export HALO_PAT="你的个人访问令牌"
```

### 2. 获取个人访问令牌 (PAT)

1. 登录 Halo 控制台
2. 进入 `用户中心` → `个人访问令牌`
3. 点击 `新建令牌`
4. 填写令牌名称，选择过期时间
5. 复制生成的令牌

### 3. 配置环境变量

```bash
# Windows (PowerShell)
$env:HALO_URL="你的Halo站点URL"
$env:HALO_PAT="你的个人访问令牌"

# Windows (CMD)
set HALO_URL=你的Halo站点URL
set HALO_PAT=你的个人访问令牌

# macOS/Linux
export HALO_URL="你的Halo站点URL"
export HALO_PAT="你的个人访问令牌"
```

## 执行功能测试

### 1. 运行测试脚本

```bash
# 在扩展项目根目录执行
node functional-test.mjs
```

### 2. 测试内容

功能测试将验证以下 API 方法：

- ✅ `listMyPosts()` - 获取文章列表
- ✅ `createMyPost()` - 创建新文章  
- ✅ `publishMyPost()` - 发布文章
- ✅ `getMyPost()` - 获取文章详情

### 3. 预期输出

成功的测试输出示例：
```
============================================================
🧪 Halo VSCode 扩展功能测试
============================================================
ℹ️ [2024/12/19 17:30:00] 测试站点: https://demo.halo.run
ℹ️ [2024/12/19 17:30:00] PAT 长度: 36 字符
ℹ️ [2024/12/19 17:30:01] 测试 Halo 站点连接...
✅ [2024/12/19 17:30:01] 连接成功！当前用户有 5 篇文章
ℹ️ [2024/12/19 17:30:01] 创建测试文章...
✅ [2024/12/19 17:30:02] 文章创建成功! ID: 12345-abcd-6789-efgh
ℹ️ [2024/12/19 17:30:02] 发布测试文章...
✅ [2024/12/19 17:30:03] 文章发布成功!
✅ [2024/12/19 17:30:03] 文章验证成功! 标题: "测试文章 - 2024/12/19 17:30:00"

============================================================
✅ [2024/12/19 17:30:03] 🎉 功能测试完全成功！
============================================================
✅ [2024/12/19 17:30:03] 文章标题: 测试文章 - 2024/12/19 17:30:00
✅ [2024/12/19 17:30:03] 文章链接: https://demo.halo.run/archives/test-post-1703001000000
✅ [2024/12/19 17:30:03] 发布状态: true
✅ [2024/12/19 17:30:03] 创建时间: 2024-12-19T09:30:03.123Z
✅ [2024/12/19 17:30:03] 测试结果已保存到 functional-test-result.json
```

## 测试结果验证

### 1. 检查测试结果文件

测试成功后会生成 `functional-test-result.json` 文件：

```json
{
  "timestamp": "2024-12-19T09:30:03.456Z",
  "success": true,
  "haloVersion": "2.21",
  "extensionVersion": "1.3.0",
  "testPost": {
    "name": "12345-abcd-6789-efgh",
    "title": "测试文章 - 2024/12/19 17:30:00",
    "url": "https://demo.halo.run/archives/test-post-1703001000000",
    "slug": "test-post-1703001000000"
  },
  "apiMethods": {
    "listMyPosts": "✅ 通过",
    "createMyPost": "✅ 通过",
    "publishMyPost": "✅ 通过",
    "getMyPost": "✅ 通过"
  }
}
```

### 2. 验证文章创建

1. 访问 Halo 控制台的文章管理页面
2. 确认测试文章已成功创建
3. 访问测试结果中的文章链接验证前端显示

## 常见问题排查

### 1. 连接失败

**错误**: `连接失败: 401 - Unauthorized`
**解决**: 检查 PAT 是否正确，是否已过期

**错误**: `连接失败: ECONNREFUSED`
**解决**: 检查 Halo 站点 URL 是否正确，站点是否正常运行

### 2. 权限问题

**错误**: `403 - Forbidden`
**解决**: 确认 PAT 拥有文章管理权限

### 3. API 版本问题

**错误**: `404 - Not Found`
**解决**: 确认 Halo 版本为 2.21 或更高版本

## 进阶测试

### 1. 测试其他功能

可以扩展测试脚本来验证更多功能：

```javascript
// 测试分类创建
const categoryResult = await apiClient.post('/apis/content.halo.run/v1alpha1/categories', categoryData);

// 测试标签创建  
const tagResult = await apiClient.post('/apis/content.halo.run/v1alpha1/tags', tagData);

// 测试附件上传
const attachmentResult = await attachmentApi.createAttachmentForPost({...});
```

### 2. 批量测试

创建多篇文章进行压力测试：

```bash
# 循环执行测试
for i in {1..5}; do
  echo "执行第 $i 次测试..."
  node functional-test.mjs
  sleep 2
done
```

## 测试清理

测试完成后，可以在 Halo 控制台删除测试文章，或者添加清理脚本：

```javascript
// 删除测试文章 (添加到测试脚本末尾)
if (result.success && process.env.CLEANUP_TEST === 'true') {
  await postApi.deleteMyPost({ name: result.post.metadata.name });
  log('测试文章已清理', 'SUCCESS');
}
```

---

## 总结

通过这个功能测试，我们可以确保：

1. ✅ 扩展的 API 调用与 Halo 2.21 完全兼容
2. ✅ 核心文章管理功能正常工作
3. ✅ 认证和权限机制正确
4. ✅ 数据传输和处理无误

完成功能测试后，可以确信扩展可以安全地部署到生产环境使用。 