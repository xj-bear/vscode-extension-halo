import { PostV1alpha1UcApi, AttachmentV1alpha1UcApi } from '@halo-dev/api-client';
import axios from 'axios';
import fs from 'fs';
import { randomUUID } from 'crypto';

// 功能测试配置
const TEST_CONFIG = {
  // 默认配置 - 需要实际的Halo站点和Token
  url: process.env.HALO_URL || 'http://localhost:8090',
  pat: process.env.HALO_PAT || '',
  
  // 测试文章内容
  testPost: {
    title: `测试文章 - ${new Date().toLocaleString()}`,
    content: `# 测试文章

这是一篇由 Halo VSCode 扩展自动生成的测试文章。

## 测试内容

- 测试时间: ${new Date().toISOString()}
- 测试目的: 验证 Halo 2.21 API 兼容性
- 扩展版本: 1.3.0

## 功能验证

✅ 文章创建  
✅ 内容渲染  
✅ API 调用  

---

*此文章由功能测试自动生成*`,
    slug: `test-post-${Date.now()}`,
    excerpt: '这是一篇测试文章，用于验证 Halo VSCode 扩展的 API 兼容性。'
  }
};

// 日志函数
function log(message, type = 'INFO') {
  const timestamp = new Date().toLocaleString();
  const prefix = type === 'ERROR' ? '❌' : type === 'SUCCESS' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// 创建API客户端
function createApiClients(url, pat) {
  const axiosInstance = axios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${pat}`,
    },
    timeout: 30000,
  });

  const postApi = new PostV1alpha1UcApi(undefined, url, axiosInstance);
  const attachmentApi = new AttachmentV1alpha1UcApi(undefined, url, axiosInstance);

  return { postApi, attachmentApi, axiosInstance };
}

// 测试连接性
async function testConnection(postApi) {
  log('测试 Halo 站点连接...');
  
  try {
    const response = await postApi.listMyPosts({
      page: 0,
      size: 1
    });
    
    log(`连接成功！当前用户有 ${response.data.total} 篇文章`, 'SUCCESS');
    return true;
  } catch (error) {
    if (error.response) {
      log(`连接失败: ${error.response.status} - ${error.response.statusText}`, 'ERROR');
      log(`错误详情: ${JSON.stringify(error.response.data)}`, 'ERROR');
    } else {
      log(`连接失败: ${error.message}`, 'ERROR');
    }
    return false;
  }
}

// 创建测试文章
async function createTestPost(postApi, testData) {
  log('创建测试文章...');
  
  const postParams = {
    apiVersion: "content.halo.run/v1alpha1",
    kind: "Post",
    metadata: {
      name: randomUUID(),
      annotations: {
        "content.halo.run/content-json": JSON.stringify({
          rawType: "markdown",
          raw: testData.content,
          content: `<h1>${testData.title}</h1>\n${testData.content.replace(/^# /, '')}`
        })
      }
    },
    spec: {
      allowComment: true,
      baseSnapshot: "",
      categories: [],
      cover: "",
      deleted: false,
      excerpt: {
        autoGenerate: false,
        raw: testData.excerpt
      },
      headSnapshot: "",
      htmlMetas: [],
      owner: "",
      pinned: false,
      priority: 0,
      publish: false,
      publishTime: "",
      releaseSnapshot: "",
      slug: testData.slug,
      tags: [],
      template: "",
      title: testData.title,
      visible: "PUBLIC"
    }
  };

  try {
    // 创建文章
    const createResponse = await postApi.createMyPost({
      post: postParams
    });
    
    const createdPost = createResponse.data;
    log(`文章创建成功! ID: ${createdPost.metadata.name}`, 'SUCCESS');
    
    // 发布文章
    log('发布测试文章...');
    await postApi.publishMyPost({
      name: createdPost.metadata.name
    });
    
    log('文章发布成功!', 'SUCCESS');
    
    // 获取文章详情验证
    const getResponse = await postApi.getMyPost({
      name: createdPost.metadata.name
    });
    
    const retrievedPost = getResponse.data;
    log(`文章验证成功! 标题: "${retrievedPost.spec.title}"`, 'SUCCESS');
    
    return {
      success: true,
      post: retrievedPost,
      url: `${TEST_CONFIG.url}/archives/${retrievedPost.spec.slug}`
    };
    
  } catch (error) {
    if (error.response) {
      log(`创建文章失败: ${error.response.status} - ${error.response.statusText}`, 'ERROR');
      log(`错误详情: ${JSON.stringify(error.response.data)}`, 'ERROR');
    } else {
      log(`创建文章失败: ${error.message}`, 'ERROR');
    }
    return { success: false, error: error.message };
  }
}

// 主测试函数
async function runFunctionalTest() {
  console.log('='.repeat(60));
  console.log('🧪 Halo VSCode 扩展功能测试');
  console.log('='.repeat(60));
  
  // 检查配置
  if (!TEST_CONFIG.pat) {
    log('请设置环境变量:');
    log('HALO_URL=你的Halo站点URL (可选，默认 http://localhost:8090)');
    log('HALO_PAT=你的个人访问令牌 (必需)');
    log('');
    log('示例: HALO_URL=https://demo.halo.run HALO_PAT=你的token node functional-test.mjs', 'ERROR');
    process.exit(1);
  }
  
  log(`测试站点: ${TEST_CONFIG.url}`);
  log(`PAT 长度: ${TEST_CONFIG.pat.length} 字符`);
  
  try {
    // 创建API客户端
    const { postApi } = createApiClients(TEST_CONFIG.url, TEST_CONFIG.pat);
    
    // 测试连接
    const connectionOk = await testConnection(postApi);
    if (!connectionOk) {
      log('连接测试失败，无法继续功能测试', 'ERROR');
      process.exit(1);
    }
    
    // 创建测试文章
    const result = await createTestPost(postApi, TEST_CONFIG.testPost);
    
    if (result.success) {
      console.log('\n' + '='.repeat(60));
      log('🎉 功能测试完全成功！', 'SUCCESS');
      console.log('='.repeat(60));
      log(`文章标题: ${result.post.spec.title}`);
      log(`文章链接: ${result.url}`);
      log(`发布状态: ${result.post.spec.publish ? '已发布' : '草稿'}`);
      log(`创建时间: ${result.post.metadata.creationTimestamp}`);
      
      // 保存测试结果
      const testResult = {
        timestamp: new Date().toISOString(),
        success: true,
        haloVersion: '2.21',
        extensionVersion: '1.3.0',
        testPost: {
          name: result.post.metadata.name,
          title: result.post.spec.title,
          url: result.url,
          slug: result.post.spec.slug
        },
        apiMethods: {
          'listMyPosts': '✅ 通过',
          'createMyPost': '✅ 通过', 
          'publishMyPost': '✅ 通过',
          'getMyPost': '✅ 通过'
        }
      };
      
      fs.writeFileSync('functional-test-result.json', JSON.stringify(testResult, null, 2));
      log('测试结果已保存到 functional-test-result.json', 'SUCCESS');
      
    } else {
      log('功能测试失败', 'ERROR');
      process.exit(1);
    }
    
  } catch (error) {
    log(`测试过程中出现未预期错误: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// 执行测试
runFunctionalTest(); 