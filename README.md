## 使用说明

一个轻量级的 web 请求工具，与 wx.request 的使用方式类似，只不过 promise 化了，支持 TS

## 快速使用

```js
import mmreq from 'mmreq'
mmreq({url:'https://api.xx.com/user', data:{id:123}}).then(d => {
  console.log(d) // 后端返回数据
})
```

## 配置

在第一次引用 mmreq 时候，进行配置

```js
mmreq.setDefault({
  // 设置 baseURL 之后，相对请求自动填充
  baseURL: 'https://api.xx.com',
  
  // 设置 tokens 之后，每次请求会自动将 cookies 和 storage 中的内容填充到 header 里
  tokens: ['token', 'userid'],

  // 请求拦截器
  beforeRequest(options){
    options.data = {userId: 100}
  }

  // 响应拦截器
  beforeResponse(data){
    data.msg = '你好'
  }
})
```

