# <center>axios</center>

本项目基于 [Axios](https://github.com/axios/axios) 原库 v1.3.4 版本进行适配，使其可以运行在 OpenHarmony，并沿用其现有用法和特性。

## 简介

[Axios](https://github.com/axios/axios) 是一个基于 Promise 的网络请求库。本库基于 Axios 原库 v1.3.4 版本适配，使其可以运行在 OpenHarmony，支持以下特性：

- HTTP 请求（GET、POST、PUT、DELETE）
- Promise API
- 请求和响应拦截器
- 转换请求和响应数据
- 自动转换 JSON 数据

## 效果展示

![效果展示](./screenshots/axios.gif)

## 下载安装

```bash
ohpm install @ohos/axios
```

OpenHarmony ohpm 环境配置等更多内容，请参考[如何安装 OpenHarmony ohpm 包](https://gitcode.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md)。

## 约束与限制

### 兼容性

在下述版本验证通过：

- DevEco Studio: NEXT Developer Beta1(5.0.3.122), SDK: API12(5.0.0.18);

> 注意：
> 1. 除双向证书验证（clientCert）及证书锁定功能必须使用 API 11+、`remoteValidation` 必须使用 API 18+（取决于设备实际 ROM 镜像版本，而非仅 `compatibleSdkVersion` 配置值）、系统级拦截器（interceptorChain）必须使用 API 22+、最大重定向次数（maxRedirects）必须使用 API 23+ 外，其余功能支持 API 10+。
> 2. `signal` 属性只能取消尚未真正发出的请求。对于已发送的请求，调用 `abort()` 会立即触发错误并进入 `.catch()`，并通过底层连接中断（`destroy()`）尝试终止请求，但由于 Network Kit 处理机制，无法保证请求被立即停止。
> 3. **@ohos/axiosforhttpclient 特有属性**：以下配置属性仅适用于 @ohos/axiosforhttpclient（非标准 Axios API），使用时请参考 [@ohos/axiosforhttpclient 文档](https://gitcode.com/openharmony-tpc/httpclient/tree/master/axiosForHttpclient)：
>    - `sslCertificateManager`
>    - `client`
>    - `dns`
>    - `eventListener`
>    - `async`
>    - `cache`

### 权限要求

打开 `entry/src/main/module.json5`，添加网络访问权限：

```json
"requestPermissions": [
  {
    "name": "ohos.permission.INTERNET",
    "reason": "$string:network_reason",
    "usedScene": {
      "abilities": ["EntryAbility"],
      "when": "inuse"
    }
  }
]
```

## 使用示例

axios 支持泛型参数，由于 ArkTS 不支持隐式 `any` 类型，调用时需显式指定类型参数：

`axios.get<T, R, D>(url[, config])` 泛型参数含义：
- `T`：响应数据类型，即 `response.data` 的类型。
- `R`：完整响应对象类型，通常为 `AxiosResponse<T>`。
- `D`：请求体数据类型。GET 请求（无请求体）时指定为 `null`；POST/PUT 请求时指定为请求体对象类型。

```typescript
import axios, { AxiosResponse, AxiosError } from '@ohos/axios'

interface UserInfo {
  id: number
  name: string
  phone: number
}

// 发起 GET 请求
axios.get<UserInfo, AxiosResponse<UserInfo>, null>('/user?ID=12345')
  .then((response: AxiosResponse<UserInfo>) => {
    console.info('id: ' + response.data.id)
    console.info(JSON.stringify(response))
  })
  .catch((error: AxiosError) => {
    console.error(JSON.stringify(error))
  })

// 发起 POST 请求
interface User {
  firstName: string
  lastName: string
}

axios.post<string, AxiosResponse<string>, User>('/user', {
  firstName: 'Fred',
  lastName: 'Flintstone'
})
  .then((response: AxiosResponse<string>) => {
    console.info(JSON.stringify(response))
  })
  .catch((error: AxiosError) => {
    console.error(JSON.stringify(error))
  })
```

## 使用说明

### axios API

#### 通过配置对象发起请求

##### axios(config)

```typescript
axios<string, AxiosResponse<string>, null>({
  method: 'get',
  url: 'https://www.xxx.com/info'
}).then((res: AxiosResponse<string>) => {
  console.info('result: ' + JSON.stringify(res.data))
}).catch((error: AxiosError) => {
  console.error(error.message)
})
```

##### axios(url[, config])

```typescript
axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info', { params: { key: 'value' } })
  .then((response: AxiosResponse<string>) => {
    console.info('result: ' + JSON.stringify(response.data))
  })
  .catch((error: AxiosError) => {
    console.error('error: ' + error.message)
  })
```

#### 请求方法别名

为方便起见，为所有支持的请求方法提供了别名：

- `axios.request(config)`
- `axios.get(url[, config])`
- `axios.delete(url[, config])`
- `axios.post(url[, data[, config]])`
- `axios.put(url[, data[, config]])`

> 注意：使用别名方法时，`url`、`method`、`data` 属性不必在 `config` 中重复指定。

```typescript
axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info', { params: { key: 'value' } })
  .then((response: AxiosResponse<string>) => {
    console.info('result: ' + JSON.stringify(response.data))
  })
  .catch((error: AxiosError) => {
    console.error('error: ' + error.message)
  })
```

### Axios 实例

#### 创建实例

使用自定义配置创建实例：

```typescript
const instance = axios.create({
  baseURL: 'https://www.xxx.com/info',
  timeout: 1000,
  headers: { 'X-Custom-Header': 'foobar' }
})
```

#### 实例方法

- `instance.request(config)`
- `instance.get(url[, config])`
- `instance.delete(url[, config])`
- `instance.post(url[, data[, config]])`
- `instance.put(url[, data[, config]])`

### 请求配置

以下为创建请求时可用的配置选项，只有 `url` 是必需的，未指定 `method` 时默认使用 GET。

```typescript
{
  // 请求的服务器 URL
  url: '/user',

  // 请求方法，支持 post/get/put/delete，不区分大小写，默认 get
  method: 'get',

  // 自动拼接到 url 前（url 为绝对 URL 时忽略）
  baseURL: 'https://www.xxx.com/info',

  // 决定绝对 URL 是否覆盖 baseURL（默认 true）
  allowAbsoluteUrls: true,

  // 在发送前转换请求数据（仅适用于 PUT/POST/PATCH，最后一个函数须返回 string/ArrayBuffer/FormData）
  transformRequest: [(data: ESObject, headers: AxiosRequestHeaders) => {
    return data
  }],

  // 在传给 then/catch 前转换响应数据
  transformResponse: [(data: ESObject, headers: AxiosResponseHeaders, status?: number) => {
    return data
  }],

  // 自定义请求头
  headers: { 'Content-Type': 'application/json' },

  // 随请求发送的 URL 参数（须为普通对象，其它对象需用 paramsSerializer 序列化）
  params: { ID: 12345 },

  // 自定义 params 序列化函数
  paramsSerializer: (params: ESObject) => params,

  // 请求体数据，仅适用于 PUT/POST/PATCH
  data: { firstName: 'Fred' },

  // 请求超时毫秒数，0 表示无超时
  timeout: 1000,

  // 读取超时毫秒数，0 表示无超时
  readTimeout: 1000,

  // 连接超时毫秒数，0 表示无超时，默认 60000
  connectTimeout: 60000,

  // 请求体最大字节数，-1 表示无限制
  maxBodyLength: 5 * 1024 * 1024,

  // 响应最大字节数，-1 表示放开 axios 层限制，默认 5MB，最大 100MB
  maxContentLength: 5 * 1024 * 1024,

  // 自定义请求处理适配器
  adapter: (config: InternalAxiosRequestConfig) => { /* ... */ },

  // 自定义 CA 证书沙箱路径；未设置时使用系统预设 CA（/etc/ssl/certs/cacert.pem）
  caPath: '',

  // 客户端证书配置（双向认证，API 11+）
  clientCert: {
    certPath: '',    // 客户端证书沙箱路径
    certType: 'p12', // 证书类型：pem / der / p12
    keyPath: '',     // 私钥沙箱路径
    keyPasswd: ''    // 密码短语
  },

  // 国密加密客户端证书，与 sslType:'TLCP' 配合使用（API 20+）
  clientEncCert: {
    certPath: '',
    certType: 'pem',
    keyPath: '',
    keyPasswd: ''
  },

  // SSL 协议类型，设为 'TLCP' 启用国密 SSL（API 20+）
  sslType: 'TLCP',

  // 配置使用系统 CA 或跳过远程服务器 CA 验证（需设备 ROM 达到 API 18，见约束与限制）
  remoteValidation: 'system', // 可选：'system' | 'skip'

  // 请求优先级，范围 [1, 1000]，默认 1
  priority: 1,

  // 指定响应数据类型；可选：'string' | 'object' | 'array_buffer'
  responseType: 'string',

  // HTTP 代理配置，false 表示不使用代理
  proxy: {
    host: 'xx',
    port: 8080,
    exclusionList: []  // 不使用代理的地址列表
  },

  // 使用 AbortController 取消请求
  signal: new AbortController().signal,

  // 最大重定向次数（API 23+），默认 undefined
  maxRedirects: 5,

  // 系统级拦截器（API 22+），可拦截重定向请求
  interceptorChain: http.HttpInterceptorChain,

  // 上传进度回调
  onUploadProgress: (progressEvent: AxiosProgressEvent) => { },

  // 下载进度回调（下载文件时必须设置）
  onDownloadProgress: (progressEvent: AxiosProgressEvent) => { },

  // 应用上下文，仅适用于上传/下载请求
  context: context,

  // 下载保存路径（仅适用于下载请求）
  // Stage 模型下通过 AbilityContext 获取路径，如 getContext(this).cacheDir + '/test.txt'
  filePath: getContext(this).cacheDir + '/test.txt',

  // 证书锁定配置（API 12+）
  certificatePinning: {
    publicKeyHash: 'PIN码',  // 应用传入的证书 PIN 码
    hashAlgorithm: 'SHA-256' // 加密算法，当前仅支持 SHA-256
  },

  // 指定 HTTP 协议版本，如 http.HttpProtocol.HTTP2
  usingProtocol: http.HttpProtocol.HTTP2,

  // 下载起始位置（字节偏移量）
  resumeFrom: 4096,

  // 下载结束位置（字节偏移量）
  resumeTo: 8192,

  // 使用 HTTPS 协议进行 DNS 解析的服务器 URL
  dnsOverHttps: 'https://1.1.1.1:443/dns-query',

  // 指定 DNS 服务器地址列表
  dnsServers: ['223.5.5.5'],

  // IP 地址族，如 http.AddressFamily.ONLY_V4 强制使用 IPv4
  addressFamily: http.AddressFamily.ONLY_V4,

  // TLS 版本范围配置
  tlsOptions: {
    tlsVersionMin: http.TlsVersion.TLS_V_1_2,
    tlsVersionMax: http.TlsVersion.TLS_V_1_3
  },

  // 安全连接期间的服务器身份验证配置
  serverAuthentication: {
    credential: { username: 'xxxx', password: 'xxxxx' },
    authenticationType: 'basic'
  }
}
```

### 响应结构

响应对象包含以下字段：

```typescript
{
  data: {},          // 服务器返回的响应数据
  status: 200,       // HTTP 状态码
  statusText: 'OK',  // HTTP 状态文本
  headers: {},       // 响应头（键名均为小写，可用方括号访问，如 response.headers['content-type']）
  config: {},        // 请求配置信息
  request: {},       // 生成此响应的请求对象
  performanceTiming: http.PerformanceTiming  // HTTP 各阶段耗时数据（可选）
}
```

`performanceTiming` 属性说明参见接口说明中的 [PerformanceTiming](#performancetiming)。

#### 响应示例

```typescript
axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info')
  .then((response: AxiosResponse<string>) => {
    console.info('data: ' + response.data)
    console.info('status: ' + response.status)
    console.info('statusText: ' + response.statusText)
    console.info('headers: ' + JSON.stringify(response.headers))
    console.info('config: ' + JSON.stringify(response.config))
  })
```

#### 性能耗时打印示例

通过 `performanceTiming` 可获取 HTTP 请求各阶段的耗时数据，用于性能分析：

```typescript
axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info')
  .then((response: AxiosResponse<string>) => {
    if (response.performanceTiming) {
      const timing = response.performanceTiming
      console.info('DNS 解析耗时: ' + timing.dnsTiming + 'ms')
      console.info('TCP 连接耗时: ' + timing.tcpTiming + 'ms')
      console.info('TLS 连接耗时: ' + timing.tlsTiming + 'ms')
      console.info('首字节发送耗时: ' + timing.firstSendTiming + 'ms')
      console.info('首字节接收耗时: ' + timing.firstReceiveTiming + 'ms')
      console.info('请求总耗时: ' + timing.totalFinishTiming + 'ms')
      console.info('重定向耗时: ' + timing.redirectTiming + 'ms')
      console.info('响应头解析耗时: ' + timing.responseHeaderTiming + 'ms')
      console.info('响应体解析耗时: ' + timing.responseBodyTiming + 'ms')
      console.info('回调执行耗时: ' + timing.totalTiming + 'ms')
    }
  })
  .catch((error: AxiosError) => {
    console.error('请求失败: ' + error.message)
  })
```

### 默认配置

#### 全局默认值

```typescript
axios.defaults.baseURL = 'https://www.xxx.com'
axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
```

设置 / 删除默认请求头中的 authorization 字段：

```typescript
// 设置
axios.setHeaderKey('authorization', value)

// 删除
axios.deleteHeaderKey('authorization')
```

#### 实例默认值

```typescript
// 创建实例时设置
const instance = axios.create({
  baseURL: 'https://www.xxx.com'
})

// 创建后修改
instance.defaults.headers.common['Authorization'] = AUTH_TOKEN
```

实例请求头默认值的设置与删除：

```typescript
// 设置实例级 authorization
axios.setHeaderKey('authorization', value, axios)

// 删除实例级 authorization
axios.deleteHeaderKey('authorization', axios)
```

配置优先级（由低到高）：`lib/defaults.js` 内置默认值 → 实例 `defaults` 属性 → 请求 `config` 参数。

```typescript
const instance = axios.create()
// 此时超时默认值为 0

instance.defaults.timeout = 2500
// 所有使用此实例的请求将等待 2.5 秒后超时

instance.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info', {
  timeout: 5000  // 此请求单独覆盖超时
})
```

### 拦截器

在请求或响应被 `then`/`catch` 处理前拦截它们：

```typescript
// 添加请求拦截器
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送前修改请求配置
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)
```

移除拦截器：

```typescript
const myInterceptor = axios.interceptors.request.use((config: InternalAxiosRequestConfig) => config)
axios.interceptors.request.eject(myInterceptor)
```

为实例添加拦截器：

```typescript
const instance = axios.create()
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => config)
```

设置系统级拦截器（通过系统网络 API 构建；可拦截重定向请求；需 API 22+）：

```typescript
class LoggingInterceptor implements http.HttpInterceptor {
  interceptorType: http.InterceptorType = http.InterceptorType.REDIRECTION

  async interceptorHandle(
    reqContext: http.HttpRequestContext,
    rspContext: http.HttpResponse
  ): Promise<http.ChainContinue> {
    console.info(`Request to ${reqContext.url} completed with status ${rspContext.responseCode}`)
    return true
  }
}

const interceptorChain = new http.HttpInterceptorChain()
const loggingInterceptor = new LoggingInterceptor()
if (!interceptorChain.addChain([loggingInterceptor])) {
  console.error('Failed to add interceptor chain')
}

axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/redirectUrl', {
  interceptorChain: interceptorChain
}).then((res: AxiosResponse<string>) => {
  console.info(JSON.stringify(res.data))
}).catch((err: AxiosError) => {
  console.error(err.message)
})
```

### 指定响应数据类型

`responseType` 指定返回数据类型，可选 `'string'`、`'object'`、`'array_buffer'`。设置后 `response.data` 将为指定类型：

```typescript
axios<string, AxiosResponse<ArrayBuffer>, null>({
  url: 'https://www.xxx.com/info',
  method: 'get',
  responseType: 'array_buffer'
}).then((res: AxiosResponse<ArrayBuffer>) => {
  // res.data 为 ArrayBuffer 类型
})
```

> 注意：也可通过重写 `transformResponse` 方法修改返回数据格式：
>
> ```typescript
> axios<string, AxiosResponse<ArrayBuffer>, null>({
>   url: 'https://www.xxx.com/info',
>   method: 'get',
>   responseType: 'array_buffer',
>   transformResponse: (data) => data
> }).then((res: AxiosResponse<ArrayBuffer>) => {
>   // 处理响应
> })
> ```

### 自定义 CA 证书

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  caPath: getContext(this).filesDir + '/cacert.pem'  // CA 证书沙箱路径
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 自定义客户端证书

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  caPath: getContext(this).filesDir + '/cacert.pem',
  clientCert: {
    certPath: getContext(this).filesDir + '/client.p12',
    certType: 'p12',
    keyPath: getContext(this).filesDir + '/client.key',
    keyPasswd: 'password'
  }
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 国密 SSL（TLCP，API 20+）

当 `sslType` 为 `'TLCP'` 时，`clientEncCert` 和 `clientCert` 字段均必须有效：

```typescript
axios<InfoModel, AxiosResponse<InfoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  caPath: path_ca,
  clientCert: {
    certPath: '',
    certType: 'pem',
    keyPath: '',
    keyPasswd: ''
  },
  clientEncCert: {
    certPath: '',
    certType: 'pem',
    keyPath: '',
    keyPasswd: ''
  },
  sslType: 'TLCP'
}).then((res: AxiosResponse<InfoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 配置使用系统 CA 或跳过 CA 验证<sup>18+</sup>

> 注意：`remoteValidation` 的可用性取决于设备的实际 ROM 镜像版本（需 API 18+ ROM），与代码中 `compatibleSdkVersion` 的配置无关。若设备 ROM 未达到 API 18，即使代码目标 API 版本更高，该功能也不可用。

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'post',
  remoteValidation: 'skip'  // 'system' 使用系统 CA；'skip' 跳过 CA 验证
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 设置代理

```typescript
axios<string, AxiosResponse<string>, null>({
  url: 'https://www.xxx.com/info',
  method: 'get',
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    exclusionList: []
  }
}).then((res: AxiosResponse<string>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 设置 HTTP 协议版本

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  caPath: '',
  clientCert: {
    certPath: '',
    certType: 'p12',
    keyPath: '',
    keyPasswd: ''
  },
  usingProtocol: http.HttpProtocol.HTTP2
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 设置下载起始位置

```typescript
let filePath = getContext(this).cacheDir + '/blue.jpg'
try {
  fs.accessSync(filePath)
  fs.unlinkSync(filePath)
} catch (err) {}

axios({
  url: 'https://www.xxx.com/blue.jpg',
  method: 'get',
  context: getContext(this),
  resumeFrom: 4096,
  filePath: filePath,
  onDownloadProgress: (progressEvent: AxiosProgressEvent): void => {
    const percent = progressEvent?.loaded && progressEvent?.total
      ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) : 0
    console.info('progress: ' + percent + '%')
  }
}).then((res: AxiosResponse) => {
  console.info('result: ' + JSON.stringify(res.data))
}).catch((error: AxiosError) => {
  console.error('error: ' + JSON.stringify(error))
})
```

### 设置下载结束位置

```typescript
let filePath = getContext(this).cacheDir + '/blue.jpg'
try {
  fs.accessSync(filePath)
  fs.unlinkSync(filePath)
} catch (err) {}

axios({
  url: 'https://www.xxx.com/blue.jpg',
  method: 'get',
  context: getContext(this),
  resumeTo: 4096,
  filePath: filePath,
  onDownloadProgress: (progressEvent: AxiosProgressEvent): void => {
    const percent = progressEvent?.loaded && progressEvent?.total
      ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) : 0
    console.info('progress: ' + percent + '%')
  }
}).then((res: AxiosResponse) => {
  console.info('result: ' + JSON.stringify(res.data))
}).catch((error: AxiosError) => {
  console.error('error: ' + JSON.stringify(error))
})
```

### 使用 HTTPS 协议进行 DNS 解析

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'http://www.xxx.com/xx',
  method: 'get',
  headers: { 'Accept': 'application/dns-json' },
  dnsOverHttps: 'https://1.1.1.1:443/dns-query'
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 指定 DNS 服务器

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  dnsServers: ['223.5.5.5']
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 自定义 DNS 规则（API 11+）

@ohos/axios 支持通过 Network Kit connection 模块设置自定义 DNS 解析规则。这些规则允许定义自定义的主机名到 IP 地址的映射，在 axios 发起 HTTP 请求进行 DNS 解析时使用。

> **注意**：这些 DNS 规则通过 Network Kit connection 模块在应用级别设置。

#### 添加自定义 DNS 规则

使用 `connection.addCustomDnsRule()` 添加自定义主机名到 IP 地址的映射：

```typescript
import { connection } from '@kit.NetworkKit'
import { BusinessError } from '@kit.BasicServicesKit'

// 添加自定义 DNS 规则：将主机名映射到指定的 IP 地址
connection.addCustomDnsRule('www.example.com', ['192.168.1.100', '192.168.1.101'])
  .then(() => {
    console.info('自定义 DNS 规则添加成功')
  })
  .catch((error: BusinessError) => {
    console.error(`添加自定义 DNS 规则失败: ${error.message}`)
  })

// 添加规则后，axios 请求将使用自定义的 IP 地址
axios.get<string, AxiosResponse<string>, null>('http://www.example.com/api')
  .then((response: AxiosResponse<string>) => {
    console.info('响应: ' + JSON.stringify(response.data))
  })
  .catch((error: AxiosError) => {
    console.error('错误: ' + error.message)
  })
```

#### 删除自定义 DNS 规则

使用 `connection.removeCustomDnsRule()` 删除特定的自定义 DNS 规则：

```typescript
import { connection } from '@kit.NetworkKit'
import { BusinessError } from '@kit.BasicServicesKit'

// 删除指定主机名的自定义 DNS 规则
connection.removeCustomDnsRule('www.example.com')
  .then(() => {
    console.info('自定义 DNS 规则删除成功')
  })
  .catch((error: BusinessError) => {
    console.error(`删除自定义 DNS 规则失败: ${error.message}`)
  })
```

#### 清除所有自定义 DNS 规则

使用 `connection.clearCustomDnsRules()` 删除应用的所有自定义 DNS 规则：

```typescript
import { connection } from '@kit.NetworkKit'
import { BusinessError } from '@kit.BasicServicesKit'

// 清除所有自定义 DNS 规则
connection.clearCustomDnsRules()
  .then(() => {
    console.info('所有自定义 DNS 规则已清除')
  })
  .catch((error: BusinessError) => {
    console.error(`清除自定义 DNS 规则失败: ${error.message}`)
  })
```

**使用要求：**
- 需要 `ohos.permission.INTERNET` 权限
- 从 API version 11 开始支持
- 规则为应用级别

### 证书锁定

#### 获取证书消息摘要（PIN 码）

使用 OpenSSL 从服务器提取公钥消息摘要：

```bash
openssl s_client -connect host:port 2>&1 < /dev/null \
  | sed -n '/-----BEGIN/,/-----END/p' \
  | openssl x509 -noout -pubkey \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

#### 方案一：网络安全配置文件

配置文件路径：`entry/src/main/resources/base/profile/network_config.json`。

> 注意：该配置为全局配置，对所有域名生效。

```json
{
  "network-security-config": {
    "domain-config": [
      {
        "domains": [
          {
            "include-subdomains": true,
            "name": "x.x.x.x"
          }
        ],
        "pin-set": {
          "expiration": "2024-8-6",
          "pin": [
            {
              "digest-algorithm": "sha256",
              "digest": "WAFcHG6pAINrztx343ccddfzLOdfoDS9pPgMv2XHk="
            }
          ]
        }
      }
    ]
  }
}
```

#### 方案二：动态设置证书锁定（API 12+）

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  certificatePinning: {
    publicKeyHash: 'PIN码',
    hashAlgorithm: 'SHA-256'
  },
  caPath: '',
  clientCert: {
    certPath: '',
    certType: 'p12',
    keyPath: '',
    keyPasswd: ''
  }
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 设置 addressFamily

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'http://www.xxx.com/xx',
  method: 'get',
  addressFamily: http.AddressFamily.ONLY_V4
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 设置 TLS 配置

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  caPath: '',
  clientCert: {
    certPath: '',
    certType: 'p12',
    keyPath: '',
    keyPasswd: ''
  },
  tlsOptions: {
    tlsVersionMin: http.TlsVersion.TLS_V_1_2,
    tlsVersionMax: http.TlsVersion.TLS_V_1_3
  }
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 设置服务器身份验证

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  serverAuthentication: {
    credential: {
      username: 'xxxx',
      password: 'xxxxx'
    },
    authenticationType: 'basic'
  }
}).then((res: AxiosResponse<infoModel>) => {
  // 处理成功响应
}).catch((err: AxiosError) => {
  // 处理错误
})
```

### 上传文件

- 上传文件需单独导入 `FormData` 模块。
- 仅支持 Stage 模型。
- 支持 URI 和 ArrayBuffer 两种方式；URI 支持 `"internal"` 协议类型（必须以 `internal://cache/` 开头）和沙箱路径。
- 请求表单数据值须为 string 类型。
- 支持通过 `append()` 第三个可选参数设置多部分表单数据的名称和类型。
- v2.2.1-rc.1 及以下版本上传必须传 `context` 参数；更高版本可省略。

##### ArrayBuffer 方式

```typescript
import axios, { AxiosResponse, AxiosError, AxiosProgressEvent } from '@ohos/axios'
import { FormData } from '@ohos/axios'
import fs from '@ohos.file.fs'

let formData = new FormData()
let cacheDir = getContext(this).cacheDir
try {
  const path = cacheDir + '/hello.txt'
  const file = fs.openSync(path, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE)
  fs.writeSync(file.fd, 'hello, world')
  fs.fsyncSync(file.fd)
  fs.closeSync(file.fd)

  const file2 = fs.openSync(path, 0o2)
  const stat = fs.lstatSync(path)
  const buf = new ArrayBuffer(stat.size)
  fs.readSync(file2.fd, buf)
  fs.fsyncSync(file2.fd)
  fs.closeSync(file2.fd)

  formData.append('file', buf)
  // 可选：设置多部分表单数据名称和类型
  // formData.append('file', buf, { filename: 'text.txt', type: 'text/plain' })
} catch (err) {
  console.error('err: ' + JSON.stringify(err))
}

axios.post<string, AxiosResponse<string>, FormData>('https://www.xxx.com/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  context: getContext(this),
  onUploadProgress: (progressEvent: AxiosProgressEvent): void => {
    const percent = progressEvent?.loaded && progressEvent?.total
      ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) + '%' : '0%'
    console.info('progress: ' + percent)
  }
}).then((res: AxiosResponse<string>) => {
  console.info('result: ' + JSON.stringify(res.data))
}).catch((error: AxiosError) => {
  console.error('error: ' + JSON.stringify(error))
})
```

##### URI 方式

```typescript
import axios, { AxiosResponse, AxiosError, AxiosProgressEvent } from '@ohos/axios'
import { FormData } from '@ohos/axios'

let formData = new FormData()
formData.append('file', 'internal://cache/blue.jpg')
// 也可传入沙箱路径：formData.append('file', cacheDir + '/hello.txt')

axios.post<string, AxiosResponse<string>, FormData>('https://www.xxx.com/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  context: getContext(this),
  onUploadProgress: (progressEvent: AxiosProgressEvent): void => {
    const percent = progressEvent?.loaded && progressEvent?.total
      ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) + '%' : '0%'
    console.info('progress: ' + percent)
  }
}).then((res: AxiosResponse<string>) => {
  console.info('result: ' + JSON.stringify(res.data))
}).catch((err: AxiosError) => {
  console.error('error: ' + JSON.stringify(err))
})
```

##### 图库上传

从设备图库选择图片并上传：

```typescript
import axios, { AxiosResponse, AxiosError, AxiosProgressEvent } from '@ohos/axios'
import { FormData } from '@ohos/axios'
import fs from '@ohos.file.fs'
import { photoAccessHelper } from '@kit.MediaLibraryKit'
import { BusinessError } from '@kit.BasicServicesKit'

// 创建图库选择器并配置选择选项
let photoPicker = new photoAccessHelper.PhotoViewPicker()
let photoSelectOptions = new photoAccessHelper.PhotoSelectOptions()
photoSelectOptions.MIMEType = photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE
photoSelectOptions.maxSelectNumber = 1

// 拉起图库选择器并处理选择结果
photoPicker.select(photoSelectOptions).then((photoSelectResult: photoAccessHelper.PhotoSelectResult) => {
  if (photoSelectResult && photoSelectResult.photoUris && photoSelectResult.photoUris.length > 0) {
    let uri = photoSelectResult.photoUris[0]
    
    // 打开并读取选中的图片文件
    try {
      let file = fs.openSync(uri, fs.OpenMode.READ_ONLY)
      let stat = fs.statSync(file.fd)
      let fileSize = stat.size
      
      // 将文件内容读取到 ArrayBuffer
      let buffer = new ArrayBuffer(fileSize)
      fs.readSync(file.fd, buffer)
      fs.closeSync(file)
      
      // 创建 FormData 并上传
      let formData = new FormData()
      formData.append('file', buffer, { filename: 'gallery_image.jpg', type: 'image/jpeg' })
      
      axios.post<string, AxiosResponse<string>, FormData>('https://www.xxx.com/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        context: getContext(this),
        onUploadProgress: (progressEvent: AxiosProgressEvent): void => {
          const percent = progressEvent?.loaded && progressEvent?.total
            ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) + '%' : '0%'
          console.info('progress: ' + percent)
        }
      }).then((res: AxiosResponse<string>) => {
        console.info('result: ' + JSON.stringify(res.data))
      }).catch((err: AxiosError) => {
        console.error('error: ' + JSON.stringify(err))
      })
    } catch (err) {
      console.error('读取图片文件失败: ' + JSON.stringify(err))
    }
  }
}).catch((err: BusinessError) => {
  console.error(`图库选择失败: ${err.code}, ${err.message}`)
})
```

##### FormData 说明

`FormData` 是 axios 内部自定义类型，用于将数据编译为键值对，主要用于发送表单数据。

```typescript
import { FormData } from '@ohos/axios'

const formData = new FormData()
formData.append('username', 'Groucho')
formData.append('accountnum', '123456')
// 设置多部分表单数据的名称和类型（可选第三个参数）
formData.append('file', 'internal://cache/xx/file.txt', { filename: 'text.txt', type: 'text/plain' })
```

### 下载文件

- 仅支持 Stage 模型。
- 若 `filePath` 指定的文件已存在，下载失败，需提前删除文件。
- 不支持自动创建目录，目录不存在时下载失败（如 `filePath` 为 `cacheDir/download/test.txt`，须确保 `download` 目录已存在）。
- v2.2.1-rc.1 及以下版本下载需传 `context` 参数；更高版本可省略。

```typescript
let filePath = getContext(this).cacheDir + '/blue.jpg'
try {
  fs.accessSync(filePath)
  fs.unlinkSync(filePath)
} catch (err) {}

axios({
  url: 'https://www.xxx.com/blue.jpg',
  method: 'get',
  filePath: filePath,
  onDownloadProgress: (progressEvent: AxiosProgressEvent): void => {
    const percent = progressEvent?.loaded && progressEvent?.total
      ? Math.ceil(progressEvent.loaded / progressEvent.total * 100) : 0
    console.info('progress: ' + percent + '%')
  }
}).then((res: AxiosResponse) => {
  console.info('result: ' + JSON.stringify(res.data))
}).catch((error: AxiosError) => {
  console.error('error: ' + JSON.stringify(error))
})
```

### 取消请求

使用 `AbortController` 取消请求：

```typescript
const abortController = new AbortController()

// 监听取消事件（可选）
abortController.signal.onabort = (reason: ESObject) => {
  console.info('request aborted: ' + JSON.stringify(reason))
}

axios({
  url: 'https://www.xxx.com/info',
  method: 'get',
  signal: abortController.signal
}).then((res: AxiosResponse) => {
  console.info('result: ' + JSON.stringify(res.data))
}).catch((error: AxiosError) => {
  console.error('error: ' + JSON.stringify(error))
})

// 取消请求（可传入自定义 reason）
abortController.abort({ reason: 'user cancelled' })
```

> 注意：`signal` 只能取消尚未发出的请求。已发送的请求调用 `abort()` 后会立即触发错误并进入 `.catch()`，但底层无法保证立即停止。

### 错误处理

```typescript
axios.get<string, AxiosResponse<string>, null>('/user/12345')
  .catch((error: AxiosError) => {
    console.error('message: ' + error.message)
    console.error('code: ' + error.code)
    console.error('config: ' + JSON.stringify(error.config))
  })
```

#### 错误码

- 以下错误码详细介绍参见 [HTTP 错误码](https://docs.openharmony.cn/pages/v5.0/zh-cn/application-dev/reference/apis-network-kit/errorcode-net-http.md)。
- HTTP 错误映射规则：`2300000 + curl 错误码`，更多参考 [curl 错误码](https://curl.se/libcurl/c/libcurl-errors.html)。

| 名称 | 类型 | 可读 | 可写 | 说明 |
|------|------|------|------|------|
| NETWORK_MOBILE | number | 是 | 否 | 使用蜂窝网络时允许下载的位标志 |
| NETWORK_WIFI | number | 是 | 否 | 使用 WLAN 时允许下载的位标志 |
| ERR_CANCELED | string | 是 | 否 | 用户通过 AbortSignal 显式取消请求 |
| ERROR_CANNOT_RESUME<sup>7+</sup> | number | 是 | 否 | 临时错误导致恢复下载失败 |
| ERROR_DEVICE_NOT_FOUND<sup>7+</sup> | number | 是 | 否 | 找不到 SD 卡等存储设备 |
| ERROR_FILE_ALREADY_EXISTS<sup>7+</sup> | number | 是 | 否 | 文件已存在，下载不覆盖现有文件 |
| ERROR_FILE_ERROR<sup>7+</sup> | number | 是 | 否 | 文件操作失败 |
| ERROR_HTTP_DATA_ERROR<sup>7+</sup> | number | 是 | 否 | HTTP 传输失败 |
| ERROR_INSUFFICIENT_SPACE<sup>7+</sup> | number | 是 | 否 | 存储空间不足 |
| ERROR_TOO_MANY_REDIRECTS<sup>7+</sup> | number | 是 | 否 | 网络重定向过多 |
| ERROR_UNHANDLED_HTTP_CODE<sup>7+</sup> | number | 是 | 否 | 无法识别的 HTTP 状态码 |
| ERROR_UNKNOWN<sup>7+</sup> | number | 是 | 否 | 未知错误 |
| PAUSED_QUEUED_FOR_WIFI<sup>7+</sup> | number | 是 | 否 | 等待 WLAN，文件大小超出蜂窝网络限制 |
| PAUSED_UNKNOWN<sup>7+</sup> | number | 是 | 否 | 未知原因暂停下载 |
| PAUSED_WAITING_FOR_NETWORK<sup>7+</sup> | number | 是 | 否 | 因网络断开暂停下载 |
| PAUSED_WAITING_TO_RETRY<sup>7+</sup> | number | 是 | 否 | 发生网络错误，等待重试 |
| SESSION_FAILED<sup>7+</sup> | number | 是 | 否 | 下载会话失败，不再重试 |
| SESSION_PAUSED<sup>7+</sup> | number | 是 | 否 | 下载会话已暂停 |
| SESSION_PENDING<sup>7+</sup> | number | 是 | 否 | 下载会话调度中 |
| SESSION_RUNNING<sup>7+</sup> | number | 是 | 否 | 下载会话进行中 |
| SESSION_SUCCESSFUL<sup>7+</sup> | number | 是 | 否 | 下载会话已完成 |

## 接口说明

### API

| 名称 | 描述 | 类型 | 参数 | 返回值 | OpenHarmony 支持 |
|------|------|------|------|--------|-----------------|
| axios(config) | 通过配置对象发送请求 | 函数 | config: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | 是 |
| axios(url[, config]) | 通过 URL 发送请求 | 函数 | url: string, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | 是 |
| axios.create([config]) | 创建自定义配置的实例 | 函数 | config?: AxiosRequestConfig | AxiosInstance | 是 |
| axios.request(config) | 发送请求 | 函数 | config: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | 是 |
| axios.get(url[, config]) | 发送 GET 请求 | 函数 | url: string, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | 是 |
| axios.delete(url[, config]) | 发送 DELETE 请求 | 函数 | url: string, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | 是 |
| axios.post(url[, data[, config]]) | 发送 POST 请求 | 函数 | url: string, data?: D, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | 是 |
| axios.put(url[, data[, config]]) | 发送 PUT 请求 | 函数 | url: string, data?: D, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | 是 |
| axios.defaults | 全局默认请求配置 | 属性 | - | AxiosDefaults | 是 |
| axios.interceptors | 请求/响应拦截器管理器 | 属性 | - | { request, response } | 是 |
| axios.setHeaderKey(key, value[, instance]) | 设置默认请求头字段 | 函数 | key: string, value: string, instance?: AxiosInstance | void | 是 |
| axios.deleteHeaderKey(key[, instance]) | 删除默认请求头字段 | 函数 | key: string, instance?: AxiosInstance | void | 是 |
| axios.getUri(config) | 生成请求的完整 URL，不会实际发送请求 | 函数 | config?: AxiosRequestConfig | string | 是 |

### AxiosRequestConfig

`AxiosRequestConfig` 是创建请求时的完整配置对象，字段按用途分组如下：

#### 基础配置

| 字段名 | 类型 | 必填 | 默认值 | 描述                                                     |
|--------|------|------|--------|--------------------------------------------------------|
| url | string | 是 | - | 请求的服务器 URL                                             |
| method | string | 否 | `'get'` | 请求方法，支持 GET/POST/PUT/DELETE（不区分大小写）                    |
| baseURL | string | 否 | - | 自动拼接到 `url` 前（`url` 为绝对 URL 时忽略）                       |
| allowAbsoluteUrls | boolean | 否 | `true` | `true` 时绝对 URL 覆盖 `baseURL`；`false` 时始终以 `baseURL` 为前缀 |
| headers | object | 否 | - | 自定义请求头                                                 |
| params | object | 否 | - | 随请求发送的 URL 参数（须为普通对象，其它类型须用 `paramsSerializer` 序列化）    |
| paramsSerializer | function | 否 | - | 自定义 `params` 序列化函数                                     |
| data | string \| object \| ArrayBuffer | 否 | - | 请求体数据，仅适用于 PUT/POST/PATCH                              |
| responseType | string | 否 | - | 指定响应数据类型：`'string'` / `'object'` / `'array_buffer'`    |
| transformRequest | function[] | 否 | - | 发送前转换请求数据的函数数组（仅适用于 PUT/POST/PATCH）                    |
| transformResponse | function[] | 否 | - | 传给 then/catch 前转换响应数据的函数数组                             |
| adapter | function | 否 | - | 自定义请求处理适配器                                             |
| priority | number | 否 | `1` | 请求优先级，范围 `[1, 1000]`                                   |

#### 超时与限制

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| timeout | number | 否 | `0` | 请求超时毫秒数，`0` 表示无超时 |
| readTimeout | number | 否 | `0` | 读取超时毫秒数，`0` 表示无超时 |
| connectTimeout | number | 否 | `60000` | 连接超时毫秒数，`0` 表示无超时 |
| maxBodyLength | number | 否 | - | 请求体最大字节数，`-1` 表示无限制 |
| maxContentLength | number | 否 | `5242880` | 响应最大字节数，`-1` 表示放开限制；最大 100MB |
| maxRedirects | number | 否 | `undefined` | 最大重定向次数（API 23+） |

#### 证书与安全

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| caPath | string | 否 | - | 自定义 CA 证书沙箱路径；未设置时使用系统预设 CA |
| clientCert | ClientCert | 否 | - | 客户端证书配置（双向认证，API 11+） |
| clientEncCert | ClientCert | 否 | - | 国密加密客户端证书，与 `sslType:'TLCP'` 配合使用（API 20+） |
| sslType | string | 否 | - | SSL 协议类型，设为 `'TLCP'` 启用国密 SSL（API 20+） |
| remoteValidation | string | 否 | - | `'system'` 使用系统 CA；`'skip'` 跳过验证（需设备 ROM 达到 API 18） |
| certificatePinning | object | 否 | - | 证书锁定，含 `publicKeyHash` 和 `hashAlgorithm`（API 12+） |
| tlsOptions | object | 否 | - | TLS 版本范围，含 `tlsVersionMin` 和 `tlsVersionMax` |
| serverAuthentication | object | 否 | - | 服务器身份验证，含 `credential` 和 `authenticationType` |

#### 代理与 DNS

| 字段名 | 类型                          | 必填 | 默认值 | 描述 |
|--------|-----------------------------|------|--------|------|
| proxy | AxiosProxyConfig \| boolean | 否 | `false` | HTTP 代理配置，`false` 不使用代理 |
| dnsOverHttps | string                      | 否 | - | 使用 HTTPS 协议进行 DNS 解析的服务器 URL |
| dnsServers | string[]                    | 否 | - | 指定 DNS 服务器地址列表 |
| addressFamily | http.AddressFamily          | 否 | - | IP 地址族，如 `ONLY_V4` 强制使用 IPv4 |

#### 上传/下载

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| onUploadProgress | function | 否 | - | 上传进度回调，参数为 `AxiosProgressEvent` |
| onDownloadProgress | function | 否 | - | 下载进度回调，参数为 `AxiosProgressEvent`（下载文件时必须设置） |
| context | Context | 否 | - | 应用上下文，仅适用于上传/下载请求 |
| filePath | string | 否 | - | 下载保存路径（仅适用于下载请求），目录须提前创建 |
| resumeFrom | number | 否 | - | 下载起始字节偏移量 |
| resumeTo | number | 否 | - | 下载结束字节偏移量 |

#### 其它

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| signal | AbortSignal | 否 | - | 用于取消请求的 AbortController 信号 |
| interceptorChain | http.HttpInterceptorChain | 否 | - | 系统级拦截器（API 22+，可拦截重定向请求） |
| usingProtocol | http.HttpProtocol | 否 | - | 指定 HTTP 协议版本，如 `http.HttpProtocol.HTTP2` |

### ClientCert

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| certPath | string | 是 | - | 证书沙箱路径 |
| certType | string | 否 | - | 证书类型：`'pem'` / `'der'` / `'p12'` |
| keyPath | string | 否 | - | 证书私钥沙箱路径 |
| keyPasswd | string | 否 | - | 私钥密码短语 |

### AxiosProxyConfig

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| host | string | 是 | - | 代理服务器地址 |
| port | number | 是 | - | 代理服务器端口 |
| exclusionList | string[] | 是 | `[]` | 不使用代理的地址列表 |
| username | string | 否 | - | 代理认证用户名 |
| password | string | 否 | - | 代理认证密码 |

### PerformanceTiming

HTTP 各阶段耗时数据，包含以下属性：

| 属性名 | 类型 | 描述 |
|--------|------|------|
| dnsTiming | number | 从发起请求到 DNS 解析完成的耗时（包含域名解析、TCP 连接等流程耗时） |
| tcpTiming | number | 从发起请求到 TCP 连接完成的耗时 |
| tlsTiming | number | 从发起请求到 TLS 连接完成的耗时 |
| firstSendTiming | number | 从发起请求到开始发送第一个字节的耗时 |
| firstReceiveTiming | number | 从发起请求到接收到第一个字节的耗时 |
| totalFinishTiming | number | 从发起请求到完成请求的总耗时 |
| redirectTiming | number | 从发起请求到完成所有重定向步骤的耗时 |
| responseHeaderTiming | number | 从发起请求到 header 解析完成的耗时 |
| responseBodyTiming | number | 从发起请求到 body 解析完成的耗时 |
| totalTiming | number | 从发起请求到回调到应用程序的耗时 |

> **注意**：以上耗时单位均为毫秒（ms）。

## 关于混淆

代码混淆配置参考[代码混淆简介](https://docs.openharmony.cn/pages/v6.0/zh-cn/application-dev/arkts-utils/source-obfuscation-overview.md)。

若需在混淆过程中保留 axios 库，在混淆规则配置文件 `obfuscation-rules.txt` 中添加：

```
-keep
./oh_modules/@ohos/axios
```

## 常见问题

- **下载文件不自动创建目录。**
  若下载路径中的目录不存在，则下载失败。例如 `filePath` 为 `getContext(this).cacheDir + '/download/test.txt'` 时，须先确保 `download` 目录已存在。

- **ArkTS 不支持隐式 `any` 类型，调用 axios 时需显式指定泛型参数。**
  由于 ArkTS 不支持隐式 `any` 类型，调用 axios 方法时必须显式指定类型参数。例如 `axios.get<T, R, D>(url[, config])`：
  - `T`：响应数据类型，即 `response.data` 的类型。
  - `R`：完整响应对象类型，通常为 `AxiosResponse<T>`。
  - `D`：请求体数据类型。GET 请求（无请求体）时指定为 `null`；POST/PUT 请求时指定为请求体对象类型。

- **HappyEyeballs（IPv4/IPv6 双栈连接优化）**
  @ohos/axios 依赖 Network Kit 的 HTTP 模块，该模块已实现 HappyEyeballs 算法（RFC 8305）。该算法通过同时尝试 IPv4 和 IPv6 连接，优先使用最先成功的连接方式，从而实现 IPv4/IPv6 双栈连接的自动优化，提供更快、更可靠的网络连接体验。

- **netHandover（API 12+）- 网络迁移快速恢复业务**
  Network Boost Kit 提供 netHandover 模块，用于网络连接迁移能力。在弱网环境下，当系统发起多网迁移（WiFi↔蜂窝、主卡↔副卡等）时，应用可接收迁移开始和完成的通知，根据通知中的建议进行连接重建，快速恢复业务，为用户提供平滑、高速、低时延的上网体验。详细使用方法请参考 [netHandover 文档](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/networkboost-nethandover)。

## 目录结构

```
|---- axios
|     |---- AppScope            # 示例代码
|     |---- entry               # 示例代码
|     |---- screenshots         # 截图
|     |---- library             # axios 库文件夹
|           |---- src           # 模块源码
|                |---- ets/components/lib   # axios 网络请求核心代码
|           |---- index.js      # 入口文件
|           |---- index.d.ts    # 声明文件
|           |---- *.json5       # 配置文件
|     |---- README.md           # 英文说明文档
|     |---- README_zh.md        # 中文说明文档
|     |---- README.OpenSource   # 开源说明
|     |---- CHANGELOG.md        # 更新日志
```

## 贡献代码

使用过程中发现任何问题都可以提交 [Issue](https://gitcode.com/openharmony-sig/ohos_axios/issues)，也非常欢迎提交 [PR](https://gitcode.com/openharmony-sig/ohos_axios/pulls)。

## 开源协议

本项目遵循 [MIT License](https://gitcode.com/openharmony-sig/ohos_axios/blob/master/LICENSE)。
