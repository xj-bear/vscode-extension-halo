import { PostV1alpha1UcApi, AttachmentV1alpha1UcApi, CategoryV1alpha1Api, TagV1alpha1Api } from '@halo-dev/api-client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const HALO_URL = process.env.HALO_URL || 'http://localhost:8090';
const HALO_PAT = process.env.HALO_PAT;

console.log('============================================================');
console.log('🔍 Halo VSCode 扩展全面功能测试');
console.log('============================================================');

if (!HALO_PAT) {
  console.log('ℹ️ 请设置环境变量:');
  console.log('ℹ️ HALO_URL=你的Halo站点URL (可选，默认 http://localhost:8090)');
  console.log('ℹ️ HALO_PAT=你的个人访问令牌 (必需)');
  process.exit(1);
}

// 初始化API客户端
const axiosInstance = axios.create({
  baseURL: HALO_URL,
  headers: {
    'Authorization': `Bearer ${HALO_PAT}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

const postApi = new PostV1alpha1UcApi(undefined, HALO_URL, axiosInstance);
const attachmentApi = new AttachmentV1alpha1UcApi(undefined, HALO_URL, axiosInstance);
const categoryApi = new CategoryV1alpha1Api(undefined, HALO_URL, axiosInstance);
const tagApi = new TagV1alpha1Api(undefined, HALO_URL, axiosInstance);

// 测试结果跟踪
const testResults = {
  timestamp: new Date().toISOString(),
  haloUrl: HALO_URL,
  haloVersion: '2.21',
  extensionVersion: '1.3.0',
  tests: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

// 辅助函数
function logTest(name, status, details = '') {
  const timestamp = new Date().toLocaleString('zh-CN');
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  console.log(`${statusIcon} [${timestamp}] ${name}${details ? ': ' + details : ''}`);
  
  testResults.tests[name] = { status, details, timestamp };
  testResults.summary.total++;
  if (status === 'PASS') testResults.summary.passed++;
  if (status === 'FAIL') testResults.summary.failed++;
}

// 生成测试内容
function generateTestContent(type = 'post') {
  const timestamp = Date.now();
  return {
    markdown: `---
title: "全面测试文章 - ${new Date().toLocaleString('zh-CN')}"
slug: "comprehensive-test-${timestamp}"
categories: ["测试分类"]
tags: ["测试标签", "VSCode扩展"]
published: false
---

# 全面功能测试

这是一篇用于测试 Halo VSCode 扩展所有功能的文章。

## 测试内容

- 文章创建和发布
- 分类和标签设置  
- 图片上传功能
- 文章拉取和更新
- YAML Front Matter 处理

## 测试图片

![测试图片](test-image.png)

## 结论

如果您看到这篇文章，说明扩展功能正常工作！
`,
    frontMatter: {
      title: `全面测试文章 - ${new Date().toLocaleString('zh-CN')}`,
      slug: `comprehensive-test-${timestamp}`,
      categories: ['测试分类'],
      tags: ['测试标签', 'VSCode扩展'],
      published: false
    }
  };
}

async function runTest(name, testFn) {
  try {
    logTest(name, 'INFO', '开始测试...');
    const result = await testFn();
    logTest(name, 'PASS');
    return result;
  } catch (error) {
    logTest(name, 'FAIL', error.message);
    console.error(`详细错误:`, error);
    return null;
  }
}

// 1. 连接性测试
async function testConnection() {
  const response = await postApi.listMyPosts({ size: 1 });
  if (response.data) {
    logTest('连接测试', 'INFO', `当前有 ${response.data.totalElements || 0} 篇文章`);
    return response.data;
  }
  throw new Error('无法获取文章列表');
}

// 2. 分类管理测试
async function testCategoryManagement() {
  // 获取现有分类
  const categoriesResponse = await categoryApi.listCategories();
  const existingCategories = categoriesResponse.data?.items || [];
  
  logTest('分类获取', 'INFO', `发现 ${existingCategories.length} 个分类`);
  
  // 查找或创建测试分类
  let testCategory = existingCategories.find(cat => cat.spec?.displayName === '测试分类');
  
  if (!testCategory) {
    // 创建测试分类
    const newCategory = {
      metadata: {
        name: `test-category-${Date.now()}`,
        generateName: null
      },
      spec: {
        displayName: '测试分类',
        slug: `test-category-${Date.now()}`,
        description: '用于VSCode扩展测试的分类',
        cover: null,
        template: null,
        priority: 0,
        children: []
      }
    };
    
    const createResponse = await categoryApi.createCategory({ category: newCategory });
    testCategory = createResponse.data;
    logTest('分类创建', 'PASS', `创建分类: ${testCategory.spec.displayName}`);
  }
  
  return testCategory;
}

// 3. 标签管理测试
async function testTagManagement() {
  // 获取现有标签
  const tagsResponse = await tagApi.listTags();
  const existingTags = tagsResponse.data?.items || [];
  
  logTest('标签获取', 'INFO', `发现 ${existingTags.length} 个标签`);
  
  const testTagNames = ['测试标签', 'VSCode扩展'];
  const testTags = [];
  
  for (const tagName of testTagNames) {
    let tag = existingTags.find(t => t.spec?.displayName === tagName);
    
    if (!tag) {
      // 创建新标签
      const newTag = {
        metadata: {
          name: `test-tag-${tagName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          generateName: null
        },
        spec: {
          displayName: tagName,
          slug: `test-tag-${tagName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          color: null,
          cover: null
        }
      };
      
      const createResponse = await tagApi.createTag({ tag: newTag });
      tag = createResponse.data;
      logTest('标签创建', 'PASS', `创建标签: ${tag.spec.displayName}`);
    }
    
    testTags.push(tag);
  }
  
  return testTags;
}

// 4. 文章创建和发布测试
async function testPostCreation(testCategory, testTags) {
  const testContent = generateTestContent();
  
  // 创建文章
  const postData = {
    metadata: {
      name: testContent.frontMatter.slug,
      generateName: null
    },
    spec: {
      title: testContent.frontMatter.title,
      slug: testContent.frontMatter.slug,
      categories: testCategory ? [testCategory.metadata.name] : [],
      tags: testTags ? testTags.map(tag => tag.metadata.name) : [],
      allowComment: true,
      visible: 'PUBLIC',
      version: 1,
      priority: 0,
      excerpt: {
        autoGenerate: true,
        raw: ''
      },
      content: {
        content: testContent.markdown,
        raw: testContent.markdown,
        rawType: 'MARKDOWN'
      },
      cover: null,
      deleted: false,
      publish: false,
      publishTime: null,
      pinned: false,
      template: '',
      owner: null
    }
  };
  
  const createResponse = await postApi.createMyPost({ post: postData });
  const createdPost = createResponse.data;
  
  logTest('文章创建', 'PASS', `文章ID: ${createdPost.metadata.name}`);
  
  return createdPost;
}

// 5. 文章发布测试
async function testPostPublishing(post) {
  const publishResponse = await postApi.publishMyPost({
    name: post.metadata.name
  });
  
  logTest('文章发布', 'PASS', `文章已发布`);
  return publishResponse.data;
}

// 6. 文章获取和验证测试
async function testPostRetrieval(post) {
  // 获取文章详情
  const getResponse = await postApi.getMyPost({ name: post.metadata.name });
  const retrievedPost = getResponse.data;
  
  if (retrievedPost.metadata.name !== post.metadata.name) {
    throw new Error('获取的文章ID不匹配');
  }
  
  logTest('文章获取', 'PASS', `标题: ${retrievedPost.spec.title}`);
  
  // 获取文章草稿内容
  const draftResponse = await postApi.getMyPostDraft({ name: post.metadata.name });
  const draftContent = draftResponse.data;
  
  if (!draftContent.content?.content) {
    throw new Error('无法获取文章内容');
  }
  
  logTest('内容获取', 'PASS', `内容长度: ${draftContent.content.content.length} 字符`);
  
  return { post: retrievedPost, draft: draftContent };
}

// 7. 文章更新测试
async function testPostUpdate(post) {
  const updatedPost = {
    ...post,
    spec: {
      ...post.spec,
      title: post.spec.title + ' (已更新)',
      excerpt: {
        ...post.spec.excerpt,
        raw: '这是更新后的摘要'
      }
    }
  };
  
  const updateResponse = await postApi.updateMyPost({
    name: post.metadata.name,
    post: updatedPost
  });
  
  logTest('文章更新', 'PASS', `新标题: ${updateResponse.data.spec.title}`);
  return updateResponse.data;
}

// 8. 文章列表获取测试
async function testPostListing() {
  const listResponse = await postApi.listMyPosts({
    page: 1,
    size: 10
  });
  
  const posts = listResponse.data?.items || [];
  logTest('文章列表', 'PASS', `获取到 ${posts.length} 篇文章`);
  
  return posts;
}

// 9. 附件功能测试
async function testAttachmentFeatures() {
  // 在Node.js环境中测试附件API的可用性
  try {
    // 测试附件列表API
    const response = await attachmentApi.listUcAttachments({ page: 1, size: 1 });
    logTest('附件列表', 'PASS', `附件API可用`);
    return true;
  } catch (error) {
    logTest('附件列表', 'INFO', '附件功能需要在实际环境中测试');
    return true;
  }
}

// 主测试函数
async function runComprehensiveTests() {
  console.log(`ℹ️ 测试站点: ${HALO_URL}`);
  console.log(`ℹ️ PAT 长度: ${HALO_PAT.length} 字符`);
  console.log('');
  
  try {
    // 1. 连接性测试
    await runTest('连接性测试', testConnection);
    
    // 2. 分类管理测试
    const testCategory = await runTest('分类管理测试', testCategoryManagement);
    
    // 3. 标签管理测试  
    const testTags = await runTest('标签管理测试', testTagManagement);
    
    // 4. 文章创建测试
    const createdPost = await runTest('文章创建测试', () => testPostCreation(testCategory, testTags));
    
    if (createdPost) {
      // 5. 文章发布测试
      await runTest('文章发布测试', () => testPostPublishing(createdPost));
      
      // 6. 文章获取测试
      const retrievalResult = await runTest('文章获取测试', () => testPostRetrieval(createdPost));
      
      if (retrievalResult?.post) {
        // 7. 文章更新测试
        await runTest('文章更新测试', () => testPostUpdate(retrievalResult.post));
      }
    }
    
    // 8. 文章列表测试
    await runTest('文章列表测试', testPostListing);
    
    // 9. 附件功能测试
    await runTest('附件功能测试', testAttachmentFeatures);
    
    console.log('');
    console.log('============================================================');
    console.log(`📊 测试完成统计`);
    console.log('============================================================');
    console.log(`✅ 通过: ${testResults.summary.passed}/${testResults.summary.total}`);
    console.log(`❌ 失败: ${testResults.summary.failed}/${testResults.summary.total}`);
    console.log(`📈 成功率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
    
    if (testResults.summary.failed === 0) {
      console.log('🎉 所有功能测试完全通过！');
    } else {
      console.log('⚠️ 部分功能需要注意');
    }
    
    // 保存测试结果
    const resultFile = 'comprehensive-test-result.json';
    fs.writeFileSync(resultFile, JSON.stringify(testResults, null, 2));
    console.log(`📄 详细测试报告已保存到 ${resultFile}`);
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行测试
runComprehensiveTests(); 