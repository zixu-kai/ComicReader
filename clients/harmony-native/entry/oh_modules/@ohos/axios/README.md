# <center>axios</center>

This project is adapted from [Axios](https://github.com/axios/axios) v1.3.4 to run on OpenHarmony while retaining its existing usage and features.

## Introduction

[Axios](https://github.com/axios/axios) is a Promise-based network request library. This library adapts Axios v1.3.4 to run on OpenHarmony with the following features:

- HTTP requests (GET, POST, PUT, DELETE)
- Promise API
- Request and response interceptors
- Transformation of request and response data
- Automatic JSON data conversion

## Screenshots

![Screenshots](./screenshots/axios_en.gif)

## How to Install

```bash
ohpm install @ohos/axios
```

For details about the OpenHarmony ohpm environment configuration, see [Installing the OpenHarmony HAR](https://gitcode.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md).

## Constraints

### Compatibility

Verified in the following versions:

- DevEco Studio: NEXT Developer Beta1(5.0.3.122), SDK: API12(5.0.0.18);

> **NOTE**:
> 1. Except for bidirectional certificate authentication (clientCert) and certificate pinning, which require API 11+; `remoteValidation`, which requires API 18+ (determined by the actual device ROM version, not the `compatibleSdkVersion` value); system-level interceptors (interceptorChain), which require API 22+; and maximum redirects (maxRedirects), which require API 23+, all other features are supported since API 10+.
> 2. The `signal` attribute can only cancel requests that have not yet been sent. For a request that has already been sent, calling `abort()` immediately triggers an error and enters `.catch()`, and attempts to terminate the request through the underlying connection interrupt (`destroy()`). However, due to the Network Kit processing mechanism, it cannot be guaranteed that the request will be stopped immediately.
> 3. **@ohos/axiosforhttpclient-specific attributes**: The following configuration attributes are only applicable to @ohos/axiosforhttpclient (not standard Axios API), please refer to [@ohos/axiosforhttpclient documentation](https://gitcode.com/openharmony-tpc/httpclient/tree/master/axiosForHttpclient) when using:
>    - `sslCertificateManager`
>    - `client`
>    - `dns`
>    - `eventListener`
>    - `async`
>    - `cache`

### Required Permissions

Open `entry/src/main/module.json5` and add the network access permission:

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

## Example

Axios supports generic parameters. Since ArkTS does not support implicit `any` types, you must explicitly specify type parameters when calling:

`axios.get<T, R, D>(url[, config])` generic parameter meanings:
- `T`: Response data type, i.e., the type of `response.data`.
- `R`: Complete response object type, typically `AxiosResponse<T>`.
- `D`: Request body data type. For GET requests (no request body), specify `null`; for POST/PUT requests, specify the request body object type.

```typescript
import axios, { AxiosResponse, AxiosError } from '@ohos/axios'

interface UserInfo {
  id: number
  name: string
  phone: number
}

// Initiate a GET request
axios.get<UserInfo, AxiosResponse<UserInfo>, null>('/user?ID=12345')
  .then((response: AxiosResponse<UserInfo>) => {
    console.info('id: ' + response.data.id)
    console.info(JSON.stringify(response))
  })
  .catch((error: AxiosError) => {
    console.error(JSON.stringify(error))
  })

// Initiate a POST request
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

## How to Use

### axios API

#### Create a request by passing a configuration object

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

#### Request method aliases

For convenience, aliases are provided for all supported request methods:

- `axios.request(config)`
- `axios.get(url[, config])`
- `axios.delete(url[, config])`
- `axios.post(url[, data[, config]])`
- `axios.put(url[, data[, config]])`

> **NOTE**: When using alias methods, `url`, `method`, and `data` attributes do not need to be specified again in `config`.

```typescript
axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info', { params: { key: 'value' } })
  .then((response: AxiosResponse<string>) => {
    console.info('result: ' + JSON.stringify(response.data))
  })
  .catch((error: AxiosError) => {
    console.error('error: ' + error.message)
  })
```

### Axios Instance

#### Creating an Instance

Create an instance with custom configuration:

```typescript
const instance = axios.create({
  baseURL: 'https://www.xxx.com/info',
  timeout: 1000,
  headers: { 'X-Custom-Header': 'foobar' }
})
```

#### Instance Methods

- `instance.request(config)`
- `instance.get(url[, config])`
- `instance.delete(url[, config])`
- `instance.post(url[, data[, config]])`
- `instance.put(url[, data[, config]])`

### Request Configuration

The following are available configuration options for making requests. Only `url` is required. Requests default to GET if `method` is not specified.

```typescript
{
  // Server URL used for the request
  url: '/user',

  // Request method: post/get/put/delete (case-insensitive, default: get)
  method: 'get',

  // Automatically prepended to url (ignored when url is an absolute URL)
  baseURL: 'https://www.xxx.com/info',

  // Whether absolute URLs override baseURL (default: true)
  allowAbsoluteUrls: true,

  // Transform request data before sending (only for PUT/POST/PATCH; last function must return string/ArrayBuffer/FormData)
  transformRequest: [(data: ESObject, headers: AxiosRequestHeaders) => {
    return data
  }],

  // Transform response data before passing to then/catch
  transformResponse: [(data: ESObject, headers: AxiosResponseHeaders, status?: number) => {
    return data
  }],

  // Custom request headers
  headers: { 'Content-Type': 'application/json' },

  // URL parameters to send with the request (must be a plain object; other types must be serialized with paramsSerializer)
  params: { ID: 12345 },

  // Custom params serialization function
  paramsSerializer: (params: ESObject) => params,

  // Request body data (only for PUT/POST/PATCH)
  data: { firstName: 'Fred' },

  // Request timeout in milliseconds, 0 means no timeout
  timeout: 1000,

  // Read timeout in milliseconds, 0 means no timeout
  readTimeout: 1000,

  // Connection timeout in milliseconds, 0 means no timeout, default: 60000
  connectTimeout: 60000,

  // Maximum request body size in bytes, -1 means no limit
  maxBodyLength: 5 * 1024 * 1024,

  // Maximum response size in bytes, -1 means no axios-level limit, default: 5MB, max: 100MB
  maxContentLength: 5 * 1024 * 1024,

  // Custom request handler adapter
  adapter: (config: InternalAxiosRequestConfig) => { /* ... */ },

  // Custom CA certificate sandbox path; uses system preset CA (/etc/ssl/certs/cacert.pem) if not set
  caPath: '',

  // Client certificate configuration (mutual authentication, API 11+)
  clientCert: {
    certPath: '',    // Client certificate sandbox path
    certType: 'p12', // Certificate type: pem / der / p12
    keyPath: '',     // Private key sandbox path
    keyPasswd: ''    // Passphrase
  },

  // National cryptography encryption client certificate, used with sslType:'TLCP' (API 20+)
  clientEncCert: {
    certPath: '',
    certType: 'pem',
    keyPath: '',
    keyPasswd: ''
  },

  // SSL protocol type, set to 'TLCP' to enable national cryptography SSL (API 20+)
  sslType: 'TLCP',

  // Configure system CA or skip remote server CA verification (requires device ROM at API 18, see Constraints)
  remoteValidation: 'system', // Options: 'system' | 'skip'

  // Request priority, range [1, 1000], default: 1
  priority: 1,

  // Specify response data type; options: 'string' | 'object' | 'array_buffer'
  responseType: 'string',

  // HTTP proxy configuration, false means no proxy
  proxy: {
    host: 'xx',
    port: 8080,
    exclusionList: []  // Addresses not using proxy
  },

  // AbortController signal for canceling the request
  signal: new AbortController().signal,

  // Maximum number of redirects (API 23+), default: undefined
  maxRedirects: 5,

  // System-level interceptor (API 22+), can intercept redirect requests
  interceptorChain: http.HttpInterceptorChain,

  // Upload progress callback
  onUploadProgress: (progressEvent: AxiosProgressEvent) => { },

  // Download progress callback (must be set for file downloads)
  onDownloadProgress: (progressEvent: AxiosProgressEvent) => { },

  // Application context, only for upload/download requests
  context: context,

  // Download save path (only for download requests)
  // In Stage model, use AbilityContext to obtain the path, e.g., getContext(this).cacheDir + '/test.txt'
  filePath: getContext(this).cacheDir + '/test.txt',

  // Certificate pinning configuration (API 12+)
  certificatePinning: {
    publicKeyHash: 'PIN code',  // Certificate PIN code passed by the application
    hashAlgorithm: 'SHA-256'    // Encryption algorithm, currently only SHA-256 is supported
  },

  // Specify HTTP protocol version, e.g., http.HttpProtocol.HTTP2
  usingProtocol: http.HttpProtocol.HTTP2,

  // Download start position (byte offset)
  resumeFrom: 4096,

  // Download end position (byte offset)
  resumeTo: 8192,

  // Server URL for DNS resolution using HTTPS protocol
  dnsOverHttps: 'https://1.1.1.1:443/dns-query',

  // List of DNS server addresses
  dnsServers: ['223.5.5.5'],

  // IP address family, e.g., http.AddressFamily.ONLY_V4 for IPv4 only
  addressFamily: http.AddressFamily.ONLY_V4,

  // TLS version range configuration
  tlsOptions: {
    tlsVersionMin: http.TlsVersion.TLS_V_1_2,
    tlsVersionMax: http.TlsVersion.TLS_V_1_3
  },

  // Server authentication configuration during secure connection
  serverAuthentication: {
    credential: { username: 'xxxx', password: 'xxxxx' },
    authenticationType: 'basic'
  }
}
```

### Response Structure

The response object contains the following fields:

```typescript
{
  data: {},          // Response data provided by the server
  status: 200,       // HTTP status code from the server response
  statusText: 'OK',  // HTTP status message from the server response
  headers: {},       // Response headers (all names are lowercase, accessible via bracket notation, e.g., response.headers['content-type'])
  config: {},        // Axios request configuration information
  request: {},       // Request object that generated this response
  performanceTiming: http.PerformanceTiming  // Time spent in each HTTP phase (optional)
}
```

For `performanceTiming` attribute descriptions, see [PerformanceTiming](#performancetiming) in Available APIs.

#### Response Example

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

#### Performance Timing Example

Use `performanceTiming` to get timing data for each HTTP phase for performance analysis:

```typescript
axios.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info')
  .then((response: AxiosResponse<string>) => {
    if (response.performanceTiming) {
      const timing = response.performanceTiming
      console.info('DNS resolution time: ' + timing.dnsTiming + 'ms')
      console.info('TCP connection time: ' + timing.tcpTiming + 'ms')
      console.info('TLS connection time: ' + timing.tlsTiming + 'ms')
      console.info('First byte sent time: ' + timing.firstSendTiming + 'ms')
      console.info('First byte received time: ' + timing.firstReceiveTiming + 'ms')
      console.info('Total request time: ' + timing.totalFinishTiming + 'ms')
      console.info('Redirect time: ' + timing.redirectTiming + 'ms')
      console.info('Response header parsing time: ' + timing.responseHeaderTiming + 'ms')
      console.info('Response body parsing time: ' + timing.responseBodyTiming + 'ms')
      console.info('Callback execution time: ' + timing.totalTiming + 'ms')
    }
  })
  .catch((error: AxiosError) => {
    console.error('Request failed: ' + error.message)
  })
```

### Configuration Defaults

#### Global Defaults

```typescript
axios.defaults.baseURL = 'https://www.xxx.com'
axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
```

Set/delete the `authorization` field in the default request header:

```typescript
// Set
axios.setHeaderKey('authorization', value)

// Delete
axios.deleteHeaderKey('authorization')
```

#### Instance Defaults

```typescript
// Set when creating an instance
const instance = axios.create({
  baseURL: 'https://www.xxx.com'
})

// Modify after creation
instance.defaults.headers.common['Authorization'] = AUTH_TOKEN
```

Set and delete instance-level request header defaults:

```typescript
// Set instance-level authorization
axios.setHeaderKey('authorization', value, axios)

// Delete instance-level authorization
axios.deleteHeaderKey('authorization', axios)
```

Configuration priority (low to high): built-in defaults in `lib/defaults.js` → instance `defaults` property → request `config` parameter.

```typescript
const instance = axios.create()
// Default timeout is 0 at this point

instance.defaults.timeout = 2500
// All requests using this instance will wait 2.5 seconds before timing out

instance.get<string, AxiosResponse<string>, null>('https://www.xxx.com/info', {
  timeout: 5000  // Override timeout for this specific request
})
```

### Interceptors

Intercept requests or responses before they are handled by `then`/`catch`:

```typescript
// Add a request interceptor
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Modify the request configuration before sending
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)
```

Remove an interceptor:

```typescript
const myInterceptor = axios.interceptors.request.use((config: InternalAxiosRequestConfig) => config)
axios.interceptors.request.eject(myInterceptor)
```

Add interceptors to a custom Axios instance:

```typescript
const instance = axios.create()
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => config)
```

Set up a system-level interceptor (built with system network API; can intercept redirect requests; requires API 22+):

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

### Specifying the Response Data Type

`responseType` specifies the returned data type. Options: `'string'`, `'object'`, `'array_buffer'`. After setting, `response.data` will be of the specified type:

```typescript
axios<string, AxiosResponse<ArrayBuffer>, null>({
  url: 'https://www.xxx.com/info',
  method: 'get',
  responseType: 'array_buffer'
}).then((res: AxiosResponse<ArrayBuffer>) => {
  // res.data is of type ArrayBuffer
})
```

> **NOTE**: You can also override the `transformResponse` method to modify the returned data format:
>
> ```typescript
> axios<string, AxiosResponse<ArrayBuffer>, null>({
>   url: 'https://www.xxx.com/info',
>   method: 'get',
>   responseType: 'array_buffer',
>   transformResponse: (data) => data
> }).then((res: AxiosResponse<ArrayBuffer>) => {
>   // Handle the response
> })
> ```

### Specifying the CA Certificate

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  caPath: getContext(this).filesDir + '/cacert.pem'  // CA certificate sandbox path
}).then((res: AxiosResponse<infoModel>) => {
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Specifying the Client Certificate

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
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### National Cryptography SSL (TLCP, API 20+)

When `sslType` is `'TLCP'`, both `clientEncCert` and `clientCert` must be valid:

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
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Configure System CA or Skip CA Verification<sup>18+</sup>

> **NOTE**: The availability of `remoteValidation` depends on the actual device ROM version (requires API 18+ ROM), not the `compatibleSdkVersion` value in the code. If the device ROM has not reached API 18, this feature is unavailable even if the code targets a higher API version.

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'post',
  remoteValidation: 'skip'  // 'system' uses system CA; 'skip' skips CA verification
}).then((res: AxiosResponse<infoModel>) => {
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Setting the Proxy

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
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Setting the HTTP Protocol Version

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
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Setting Download Start Location

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

### Setting Download End Location

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

### DNS Resolution Using HTTPS

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'http://www.xxx.com/xx',
  method: 'get',
  headers: { 'Accept': 'application/dns-json' },
  dnsOverHttps: 'https://1.1.1.1:443/dns-query'
}).then((res: AxiosResponse<infoModel>) => {
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Specifying the DNS Server

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  dnsServers: ['223.5.5.5']
}).then((res: AxiosResponse<infoModel>) => {
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Custom DNS Rules (API 11+)

@ohos/axios supports custom DNS resolution rules through the Network Kit connection module. These rules allow to define custom hostname-to-IP mappings that will be used during DNS resolution for all HTTP requests made by axios.

> **NOTE**: These DNS rules are set at the application level through the Network Kit connection module.

#### Adding Custom DNS Rules

Use `connection.addCustomDnsRule()` to add custom hostname-to-IP mappings:

```typescript
import { connection } from '@kit.NetworkKit'
import { BusinessError } from '@kit.BasicServicesKit'

// Add a custom DNS rule: map hostname to specific IP addresses
connection.addCustomDnsRule('www.example.com', ['192.168.1.100', '192.168.1.101'])
  .then(() => {
    console.info('Custom DNS rule added successfully')
  })
  .catch((error: BusinessError) => {
    console.error(`Failed to add custom DNS rule: ${error.message}`)
  })

// After adding the rule, axios requests will use the custom IP addresses
axios.get<string, AxiosResponse<string>, null>('http://www.example.com/api')
  .then((response: AxiosResponse<string>) => {
    console.info('Response: ' + JSON.stringify(response.data))
  })
  .catch((error: AxiosError) => {
    console.error('Error: ' + error.message)
  })
```

#### Removing Custom DNS Rules

Use `connection.removeCustomDnsRule()` to remove a specific custom DNS rule:

```typescript
import { connection } from '@kit.NetworkKit'
import { BusinessError } from '@kit.BasicServicesKit'

// Remove the custom DNS rule for a specific hostname
connection.removeCustomDnsRule('www.example.com')
  .then(() => {
    console.info('Custom DNS rule removed successfully')
  })
  .catch((error: BusinessError) => {
    console.error(`Failed to remove custom DNS rule: ${error.message}`)
  })
```

#### Clearing All Custom DNS Rules

Use `connection.clearCustomDnsRules()` to remove all custom DNS rules for the application:

```typescript
import { connection } from '@kit.NetworkKit'
import { BusinessError } from '@kit.BasicServicesKit'

// Clear all custom DNS rules
connection.clearCustomDnsRules()
  .then(() => {
    console.info('All custom DNS rules cleared successfully')
  })
  .catch((error: BusinessError) => {
    console.error(`Failed to clear custom DNS rules: ${error.message}`)
  })
```

**Requirements:**
- Requires `ohos.permission.INTERNET` permission
- Available since API version 11
- Rules are application-level

### Locking the Certificate

#### Obtaining the Message Digest (PIN Code)

Use OpenSSL to extract the public key message digest from the server:

```bash
openssl s_client -connect host:port 2>&1 < /dev/null \
  | sed -n '/-----BEGIN/,/-----END/p' \
  | openssl x509 -noout -pubkey \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

#### Scheme I: Network Security Configuration File

Configuration file path: `entry/src/main/resources/base/profile/network_config.json`.

> **NOTE**: This configuration is global and applies to all domains.

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

#### Scheme II: Dynamic Certificate Pinning (API 12+)

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'https://www.xxx.com/xx',
  method: 'get',
  certificatePinning: {
    publicKeyHash: 'PIN code',
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
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Setting addressFamily

```typescript
axios<infoModel, AxiosResponse<infoModel>, null>({
  url: 'http://www.xxx.com/xx',
  method: 'get',
  addressFamily: http.AddressFamily.ONLY_V4
}).then((res: AxiosResponse<infoModel>) => {
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Setting the TLS Configuration

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
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Setting Server Authentication

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
  // Handle successful response
}).catch((err: AxiosError) => {
  // Handle error
})
```

### Uploading Files

- The `FormData` module must be imported separately for file uploads.
- Only the Stage model is supported.
- Two upload formats are supported: URI and ArrayBuffer. URIs must start with `"internal://cache/"` for the internal protocol type, or use a sandbox path.
- Request form data values must be of the string type.
- An optional third parameter of `append()` can set the multipart form data name and type.
- For version v2.2.1-rc.1 and earlier, the `context` parameter is required for uploads; it can be omitted in later versions.

##### ArrayBuffer Format

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
  // Optional: set multipart form data name and type
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

##### URI Format

```typescript
import axios, { AxiosResponse, AxiosError, AxiosProgressEvent } from '@ohos/axios'
import { FormData } from '@ohos/axios'

let formData = new FormData()
formData.append('file', 'internal://cache/blue.jpg')
// Sandbox path is also supported: formData.append('file', cacheDir + '/hello.txt')

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

##### Gallery Upload

Upload images selected from the device photo gallery:

```typescript
import axios, { AxiosResponse, AxiosError, AxiosProgressEvent } from '@ohos/axios'
import { FormData } from '@ohos/axios'
import fs from '@ohos.file.fs'
import { photoAccessHelper } from '@kit.MediaLibraryKit'
import { BusinessError } from '@kit.BasicServicesKit'

// Create photo picker and configure selection options
let photoPicker = new photoAccessHelper.PhotoViewPicker()
let photoSelectOptions = new photoAccessHelper.PhotoSelectOptions()
photoSelectOptions.MIMEType = photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE
photoSelectOptions.maxSelectNumber = 1

// Launch photo picker and handle selection
photoPicker.select(photoSelectOptions).then((photoSelectResult: photoAccessHelper.PhotoSelectResult) => {
  if (photoSelectResult && photoSelectResult.photoUris && photoSelectResult.photoUris.length > 0) {
    let uri = photoSelectResult.photoUris[0]
    
    // Open and read the selected image file
    try {
      let file = fs.openSync(uri, fs.OpenMode.READ_ONLY)
      let stat = fs.statSync(file.fd)
      let fileSize = stat.size
      
      // Read file content into ArrayBuffer
      let buffer = new ArrayBuffer(fileSize)
      fs.readSync(file.fd, buffer)
      fs.closeSync(file)
      
      // Create FormData and upload
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
      console.error('Failed to read photo file: ' + JSON.stringify(err))
    }
  }
}).catch((err: BusinessError) => {
  console.error(`Photo picker failed: ${err.code}, ${err.message}`)
})
```

##### About FormData

`FormData` is a custom type within axios used to compile data into key-value pairs, primarily for sending form data.

```typescript
import { FormData } from '@ohos/axios'

const formData = new FormData()
formData.append('username', 'Groucho')
formData.append('accountnum', '123456')
// Optional third parameter to set multipart form data name and type
formData.append('file', 'internal://cache/xx/file.txt', { filename: 'text.txt', type: 'text/plain' })
```

### Downloading Files

- Only the Stage model is supported.
- If the file specified by `filePath` already exists, the download fails. Delete the existing file first.
- Directory auto-creation is not supported. If the directory in `filePath` does not exist, the download fails (e.g., if `filePath` is `cacheDir/download/test.txt`, ensure the `download` directory exists first).
- For version v2.2.1-rc.1 and earlier, the `context` parameter is required for downloads; it can be omitted in later versions.

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

### Canceling a Request

Use `AbortController` to cancel a request:

```typescript
const abortController = new AbortController()

// Listen to the abort event (optional)
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

// Cancel the request (an optional custom reason can be passed)
abortController.abort({ reason: 'user cancelled' })
```

> **NOTE**: `signal` can only cancel requests that have not yet been sent. For a request that has already been sent, calling `abort()` immediately triggers an error and enters `.catch()`, but the underlying request cannot be guaranteed to stop immediately.

### Handling Errors

```typescript
axios.get<string, AxiosResponse<string>, null>('/user/12345')
  .catch((error: AxiosError) => {
    console.error('message: ' + error.message)
    console.error('code: ' + error.code)
    console.error('config: ' + JSON.stringify(error.config))
  })
```

#### Error Codes

- For detailed descriptions of network error codes, see [HTTP error codes](https://docs.openharmony.cn/pages/v5.0/zh-cn/application-dev/reference/apis-network-kit/errorcode-net-http.md).
- HTTP error mapping rule: `2300000 + curl error code`. For more, see [curl error codes](https://curl.se/libcurl/c/libcurl-errors.html).

| Name | Type | Readable | Writable | Description |
|------|------|----------|----------|-------------|
| NETWORK_MOBILE | number | Yes | No | Bit flag indicating download is allowed on a mobile network |
| NETWORK_WIFI | number | Yes | No | Bit flag indicating download is allowed on a WLAN |
| ERR_CANCELED | string | Yes | No | Request explicitly cancelled by the user via AbortSignal |
| ERROR_CANNOT_RESUME<sup>7+</sup> | number | Yes | No | Failure to resume download due to a temporary error |
| ERROR_DEVICE_NOT_FOUND<sup>7+</sup> | number | Yes | No | Storage device such as an SD card not found |
| ERROR_FILE_ALREADY_EXISTS<sup>7+</sup> | number | Yes | No | File already exists; download does not overwrite existing files |
| ERROR_FILE_ERROR<sup>7+</sup> | number | Yes | No | File operation failure |
| ERROR_HTTP_DATA_ERROR<sup>7+</sup> | number | Yes | No | HTTP transmission failure |
| ERROR_INSUFFICIENT_SPACE<sup>7+</sup> | number | Yes | No | Insufficient storage space |
| ERROR_TOO_MANY_REDIRECTS<sup>7+</sup> | number | Yes | No | Error caused by too many network redirections |
| ERROR_UNHANDLED_HTTP_CODE<sup>7+</sup> | number | Yes | No | Unrecognized HTTP status code |
| ERROR_UNKNOWN<sup>7+</sup> | number | Yes | No | Unknown error |
| PAUSED_QUEUED_FOR_WIFI<sup>7+</sup> | number | Yes | No | Download paused, waiting for WLAN because file size exceeds mobile network limit |
| PAUSED_UNKNOWN<sup>7+</sup> | number | Yes | No | Download paused for unknown reasons |
| PAUSED_WAITING_FOR_NETWORK<sup>7+</sup> | number | Yes | No | Download paused due to network disconnection |
| PAUSED_WAITING_TO_RETRY<sup>7+</sup> | number | Yes | No | Network error occurred, waiting to retry |
| SESSION_FAILED<sup>7+</sup> | number | Yes | No | Download session failed with no retry |
| SESSION_PAUSED<sup>7+</sup> | number | Yes | No | Download session paused |
| SESSION_PENDING<sup>7+</sup> | number | Yes | No | Download session being scheduled |
| SESSION_RUNNING<sup>7+</sup> | number | Yes | No | Download session in progress |
| SESSION_SUCCESSFUL<sup>7+</sup> | number | Yes | No | Download session completed successfully |

## Available APIs

### API

| Name | Description | Type | Parameters | Return Value | OpenHarmony Support |
|------|-------------|------|------------|--------------|---------------------|
| axios(config) | Send a request via configuration object | Function | config: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | Yes |
| axios(url[, config]) | Send a request via URL | Function | url: string, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | Yes |
| axios.create([config]) | Create an instance with custom configuration | Function | config?: AxiosRequestConfig | AxiosInstance | Yes |
| axios.request(config) | Send a request | Function | config: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | Yes |
| axios.get(url[, config]) | Send a GET request | Function | url: string, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | Yes |
| axios.delete(url[, config]) | Send a DELETE request | Function | url: string, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | Yes |
| axios.post(url[, data[, config]]) | Send a POST request | Function | url: string, data?: D, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | Yes |
| axios.put(url[, data[, config]]) | Send a PUT request | Function | url: string, data?: D, config?: AxiosRequestConfig | Promise\<AxiosResponse\<T\>\> | Yes |
| axios.defaults | Global default request configuration | Attribute | - | AxiosDefaults | Yes |
| axios.interceptors | Request/response interceptor manager | Attribute | - | { request, response } | Yes |
| axios.setHeaderKey(key, value[, instance]) | Set a default request header field | Function | key: string, value: string, instance?: AxiosInstance | void | Yes |
| axios.deleteHeaderKey(key[, instance]) | Delete a default request header field | Function | key: string, instance?: AxiosInstance | void | Yes |
| axios.getUri(config) | Generate the complete URL for the request, but do not actually send the request. | Function | config?: AxiosRequestConfig | string | Yes |

### AxiosRequestConfig

`AxiosRequestConfig` is the complete configuration object for creating requests. Fields are grouped by purpose:

#### Basic Configuration

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| url | string | Yes | - | Server URL for the request |
| method | string | No | `'get'` | Request method: GET/POST/PUT/DELETE (case-insensitive) |
| baseURL | string | No | - | Automatically prepended to `url` (ignored when `url` is an absolute URL) |
| allowAbsoluteUrls | boolean | No | `true` | When `true`, absolute URLs override `baseURL`; when `false`, always prepends `baseURL` |
| headers | object | No | - | Custom request headers |
| params | object | No | - | URL parameters sent with the request (must be a plain object; other types must be serialized with `paramsSerializer`) |
| paramsSerializer | function | No | - | Custom `params` serialization function |
| data | string \| object \| ArrayBuffer | No | - | Request body data, only for PUT/POST/PATCH |
| responseType | string | No | - | Specify response data type: `'string'` / `'object'` / `'array_buffer'` |
| transformRequest | function[] | No | - | Array of functions to transform request data before sending (only for PUT/POST/PATCH) |
| transformResponse | function[] | No | - | Array of functions to transform response data before passing to then/catch |
| adapter | function | No | - | Custom request handler adapter |
| priority | number | No | `1` | Request priority, range `[1, 1000]` |

#### Timeout and Limits

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| timeout | number | No | `0` | Request timeout in milliseconds, `0` means no timeout |
| readTimeout | number | No | `0` | Read timeout in milliseconds, `0` means no timeout |
| connectTimeout | number | No | `60000` | Connection timeout in milliseconds, `0` means no timeout |
| maxBodyLength | number | No | - | Maximum request body size in bytes, `-1` means no limit |
| maxContentLength | number | No | `5242880` | Maximum response size in bytes, `-1` means no limit; max 100MB |
| maxRedirects | number | No | `undefined` | Maximum number of redirects (API 23+) |

#### Certificates and Security

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| caPath | string | No | - | Custom CA certificate sandbox path; uses system preset CA if not set |
| clientCert | ClientCert | No | - | Client certificate configuration (mutual authentication, API 11+) |
| clientEncCert | ClientCert | No | - | National cryptography encryption client certificate, used with `sslType:'TLCP'` (API 20+) |
| sslType | string | No | - | SSL protocol type, set to `'TLCP'` for national cryptography SSL (API 20+) |
| remoteValidation | string | No | - | `'system'` uses system CA; `'skip'` skips verification (requires device ROM at API 18) |
| certificatePinning | object | No | - | Certificate pinning with `publicKeyHash` and `hashAlgorithm` (API 12+) |
| tlsOptions | object | No | - | TLS version range with `tlsVersionMin` and `tlsVersionMax` |
| serverAuthentication | object | No | - | Server authentication with `credential` and `authenticationType` |

#### Proxy and DNS

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| proxy | AxiosProxyConfig \| boolean | No | `false` | HTTP proxy configuration, `false` disables proxy |
| dnsOverHttps | string | No | - | Server URL for DNS resolution using HTTPS |
| dnsServers | string[] | No | - | List of DNS server addresses |
| addressFamily | http.AddressFamily | No | - | IP address family, e.g., `ONLY_V4` for IPv4 only |

#### Upload/Download

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| onUploadProgress | function | No | - | Upload progress callback, parameter is `AxiosProgressEvent` |
| onDownloadProgress | function | No | - | Download progress callback, parameter is `AxiosProgressEvent` (must be set for file downloads) |
| context | Context | No | - | Application context, only for upload/download requests |
| filePath | string | No | - | Download save path (only for download requests); directory must exist |
| resumeFrom | number | No | - | Download start byte offset |
| resumeTo | number | No | - | Download end byte offset |

#### Other

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| signal | AbortSignal | No | - | AbortController signal for canceling the request |
| interceptorChain | http.HttpInterceptorChain | No | - | System-level interceptor (API 22+, can intercept redirect requests) |
| usingProtocol | http.HttpProtocol | No | - | Specify HTTP protocol version, e.g., `http.HttpProtocol.HTTP2` |

### ClientCert

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| certPath | string | Yes | - | Certificate sandbox path |
| certType | string | No | - | Certificate type: `'pem'` / `'der'` / `'p12'` |
| keyPath | string | No | - | Certificate private key sandbox path |
| keyPasswd | string | No | - | Private key passphrase |

### AxiosProxyConfig

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| host | string | Yes | - | Proxy server address |
| port | number | Yes | - | Proxy server port |
| exclusionList | string[] | Yes | `[]` | List of addresses not using proxy |
| username | string | No | - | Proxy authentication username |
| password | string | No | - | Proxy authentication password |

### PerformanceTiming

HTTP performance timing data for each phase, containing the following attributes:

| Attribute | Type | Description |
|-----------|------|-------------|
| dnsTiming | number | Time from request initiation to DNS resolution completion (includes domain resolution, TCP connection, etc.) |
| tcpTiming | number | Time from request initiation to TCP connection completion |
| tlsTiming | number | Time from request initiation to TLS connection completion |
| firstSendTiming | number | Time from request initiation to sending the first byte |
| firstReceiveTiming | number | Time from request initiation to receiving the first byte |
| totalFinishTiming | number | Total time from request initiation to request completion |
| redirectTiming | number | Time from request initiation to completing all redirect steps |
| responseHeaderTiming | number | Time from request initiation to header parsing completion |
| responseBodyTiming | number | Time from request initiation to body parsing completion |
| totalTiming | number | Time from request initiation to callback to the application |

> **Note**: All timing values are in milliseconds (ms).

## About Obfuscation

For code obfuscation configuration, see [Code Obfuscation](https://docs.openharmony.cn/pages/v6.0/zh-cn/application-dev/arkts-utils/source-obfuscation-overview.md).

To prevent the axios library from being obfuscated, add the following to the obfuscation rules configuration file `obfuscation-rules.txt`:

```
-keep
./oh_modules/@ohos/axios
```

## FAQ

- **Files are not automatically downloaded to a non-existent directory.**
  If the directory in the download path does not exist, the download fails. For example, if `filePath` is `getContext(this).cacheDir + '/download/test.txt'`, ensure the `download` directory exists first.

- **ArkTS does not support implicit `any` type, you must explicitly specify generic parameters when calling axios.**
  Since ArkTS does not support implicit `any` types, you must explicitly specify type parameters when calling axios methods. For example, `axios.get<T, R, D>(url[, config])`:
  - `T`: Response data type, i.e., the type of `response.data`.
  - `R`: Complete response object type, typically `AxiosResponse<T>`.
  - `D`: Request body data type. For GET requests (no request body), specify `null`; for POST/PUT requests, specify the request body object type.

- **HappyEyeballs (IPv4/IPv6 dual-stack connection optimization)**
  @ohos/axios leverages the Network Kit HTTP module, which implements the HappyEyeballs algorithm (RFC 8305). This enables automatic IPv4/IPv6 dual-stack connection optimization, providing faster and more reliable network connections by attempting both IPv4 and IPv6 connections simultaneously and using whichever succeeds first.

- **netHandover (API 12+) - Network connection migration for fast business recovery**
  The Network Boost Kit provides the netHandover module for network connection migration capabilities. In weak network environments, when the system initiates multi-network migration (WiFi↔Cellular, Primary SIM↔Secondary SIM, etc.), applications can receive handover start and completion notifications. By following the recommendations in these notifications, applications can quickly rebuild connections and recover business operations, providing users with a smooth, high-speed, and low-latency network experience. For detailed usage, refer to the [netHandover documentation](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/networkboost-nethandover).

## Directory Structure

```
|---- axios
|     |---- AppScope            # Sample code
|     |---- entry               # Sample code
|     |---- screenshots         # Screenshots
|     |---- library             # axios library folder
|           |---- src           # Module source code
|                |---- ets/components/lib   # axios network request core code
|           |---- index.js      # Entry file
|           |---- index.d.ts    # Declaration file
|           |---- *.json5       # Configuration files
|     |---- README.md           # English documentation
|     |---- README_zh.md        # Chinese documentation
|     |---- README.OpenSource   # Open source notice
|     |---- CHANGELOG.md        # Changelog
```

## How to Contribute

If you find any problem when using Axios, submit an [Issue](https://gitcode.com/openharmony-sig/ohos_axios/issues) or a [PR](https://gitcode.com/openharmony-sig/ohos_axios/pulls).

## License

This project is licensed under the [MIT License](https://gitcode.com/openharmony-sig/ohos_axios/blob/master/LICENSE).
