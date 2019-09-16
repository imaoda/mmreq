'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require('whatwg-fetch');

var baseURL = '';
var tokens = null;
var beforeRequest = null;
var beforeResponse = null;

function request(OBJECT) {
  var options = Object.assign({ mode: 'cors', header: {} }, OBJECT);
  if (options.url.indexOf('http') == -1) {
    options.url = baseURL + options.url;
    if (tokens) {
      tokens.forEach(function (tk) {
        if (options.header[tk] !== undefined) return;
        var v = getToken(tk);
        if (v) options.header[tk] = v;
      });
    }
  }
  if (beforeRequest) {
    // 拦截器直接篡改也是支持的
    var newOption = beforeRequest(options);
    if (newOption) options = newOption;
  }
  return orginalRequest(options).then(function (res) {
    var resData = res.data;
    if (beforeResponse) {
      var newData = beforeResponse(resData);
      if (newData) resData = newData;
    }
    return resData;
  }, function (res) {
    return Promise.reject(res);
  } // 在错误的时候，才返全部信息
  );
}

// 我们默认对 baseUrl 的域名填充 token
request.setDefault = function (params) {
  var url = params.baseURL;
  if (url) {
    if (url.indexOf('http') == -1) url = 'https://' + url;
    baseURL = url;
  }
  beforeRequest = params.beforeRequest || null;
  beforeResponse = params.beforeResponse || null;
  tokens = params.tokens;
};

exports.default = request;

/**
|--------------------------------------------------
| 工具函数
|--------------------------------------------------
*/

function getToken(token) {
  return getCookie(token) || getStorage(token) || getCookie(token.toUpperCase()) || getStorage(token.toUpperCase());
}

function getStorage(storageName) {
  var v = localStorage[storageName];
  // 如果 storage 里是 {"data" 形式，则可能是有 taro 存储的，需继续提取
  if (v && v.indexOf('{"data"') !== -1) {
    try {
      v = JSON.parse(v).data;
    } catch (error) {}
  }
  return v;
}

function getCookie(cookieName) {
  var cookieObj = {},
      cookieSplit = [],
      cookieArr = document.cookie.split(';');
  for (var i = 0, len = cookieArr.length; i < len; i++) {
    if (cookieArr[i]) {
      cookieSplit = cookieArr[i].split('=');
      cookieObj[cookieSplit[0].trim()] = cookieSplit[1].trim();
    }
  }return cookieObj[cookieName];
}

function serializeParams(params) {
  if (!params) {
    return '';
  }
  return Object.keys(params).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
}
function generateRequestUrlWithParams(url, params) {
  params = typeof params === 'string' ? params : serializeParams(params);
  if (params) {
    url += (~url.indexOf('?') ? '&' : '?') + params;
  }
  url = url.replace('?&', '?');
  return url;
}

function orginalRequest(options) {
  options = options || {};
  if (typeof options === 'string') {
    options = {
      url: options
    };
  }
  var _options = options,
      success = _options.success,
      complete = _options.complete,
      fail = _options.fail;

  var url = options.url;
  var params = {};
  var res = {};
  params.method = options.method || 'GET';
  var methodUpper = params.method.toUpperCase();
  params.cache = options.cache || 'default';
  if (methodUpper === 'GET' || methodUpper === 'HEAD') {
    url = generateRequestUrlWithParams(url, options.data);
  } else if (_typeof(options.data) === 'object') {
    var contentType = options.header && (options.header['Content-Type'] || options.header['content-type']);

    // 对于 post 如果用户没有提供类型，默认 json, 自动识别类型，并追加到 header 中
    if (!contentType) {
      contentType = 'application/json';
      if (typeof options.data === 'string' || typeof options.data === 'number') contentType = 'text/plain';
      // 对 ArrayBuffer Blob FormData 不做处理，不添加 content-type，因为 fetch 会自动处理，尤其是 Formdata 的，fetch 会自动添加 boundary 信息
      if (options.data instanceof ArrayBuffer || options.data instanceof Blob || options.data instanceof FormData) {
        contentType = undefined;
      } else {
        if (!options.header) options.header = {};
        if (!options.header['Content-Type'] && !options.header['content-type']) options.header['content-type'] = contentType;
      }
    }

    if (contentType && contentType.indexOf('application/json') >= 0) {
      params.body = JSON.stringify(options.data);
    } else if (contentType && contentType.indexOf('application/x-www-form-urlencoded') >= 0) {
      params.body = serializeParams(options.data);
    } else {
      params.body = options.data;
    }
  } else {
    params.body = options.data;
  }
  if (options.header) {
    params.headers = options.header;
  }
  if (options.mode) {
    params.mode = options.mode;
  }
  params.credentials = options.credentials;
  return fetch(url, params).then(function (response) {
    res.statusCode = response.status;
    res.header = {};
    response.headers.forEach(function (val, key) {
      res.header[key] = val;
    });
    if (options.responseType === 'arraybuffer') {
      return response.arrayBuffer();
    }
    if (options.dataType === 'json' || typeof options.dataType === 'undefined') {
      return response.json();
    }
    if (options.responseType === 'text') {
      return response.text();
    }
    return Promise.resolve(null);
  }).then(function (data) {
    res.data = data;
    typeof success === 'function' && success(res);
    typeof complete === 'function' && complete(res);
    return res;
  }).catch(function (err) {
    typeof fail === 'function' && fail(err);
    typeof complete === 'function' && complete(res);
    return Promise.reject(err);
  });
}