export type Param<P extends any | string | ArrayBuffer = any> = {
  url: string
  data?: P
  header?: {
    'content-type'?: string
    'Content-Type'?: string
    token?: string
    [k: string]: any
  }
  method?: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'
  dataType?: string
  responseType?: string
  mode?: 'no-cors' | 'cors' | 'same-origin'
  credentials?: 'include' | 'same-origin' | 'omit'
  cache?: 'default' | 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached'
  timeout?: number
}
declare namespace request {
  function setDefault(params: { baseURL?: string; beforeRequest?: Function; beforeResponse?: Function, tokens?: string[] }): void
}
declare function request(params: Param): Promise<any>
export default request
