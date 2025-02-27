# 模块化

## 1. 基本介绍

### 1.1 什么是模块化

模块化是指将程序拆分为独立的、可复用的代码块。每个模块都有自己的作用域，可以暴露接口与其他模块交互。

```javascript
// 1. 传统方式（全局作用域）
function getUserInfo() { /* ... */ }
function saveUserData() { /* ... */ }

// 2. 简单模块模式
const UserModule = {
    getUserInfo() { /* ... */ },
    saveUserData() { /* ... */ }
};

// 3. IIFE 模块模式
const UserModule = (function() {
    // 私有变量和方法
    let userData = null;

    function validateUser() { /* ... */ }

    // 公共 API
    return {
        getUserInfo() { /* ... */ },
        saveUserData() { /* ... */ }
    };
})();
```

### 1.2模块化的发展历程

1. 全局函数（早期）

问题：全局作用域污染，依赖关系不明确

```javascript
function foo() {
  /* ... */
}
function bar() {
  /* ... */
}
```

2. 命名空间时期

问题：依赖管理困难，命名冲突风险

```javascript
const MyApp = {
  utils: {
    format() {
      /* ... */
    },
  },
  models: {
    User: {
      /* ... */
    },
  },
};
```

3. IIFE 模块模式

改进：实现了基本的封装，但依赖管理仍然困难

```javascript
const Module = (function ($) {
  // 私有成员
  const privateVar = 'private';

  // 公共 API
  return {
    publicMethod() {
      console.log(privateVar);
    },
  };
})(jQuery);
```

4. CommonJS/AMD

```javascript
// CommonJS
const fs = require('fs');
module.exports = {
  /* ... */
};

// AMD
define(['jquery'], function ($) {
  return {
    /* ... */
  };
});
```

5. ES Modules（现代）

```javascript
import { useState } from 'react';

export const MyComponent = () => {
  /* ... */
};
```

### 1.3 模块化的优势

1. 代码组织

```javascript
// 模块化组织

import { UserService } from './services/user';
import { AuthUtils } from './utils/auth';

class UserManager {
  constructor(userService, authUtils) {
    this.userService = userService;
    this.authUtils = authUtils;
  }
}
```

2. 依赖管理

```javascript
// 清晰的依赖关系

import { Config } from './config';
import { Database } from './database';
import { Logger } from './logger';

class App {
  static async init() {
    const config = new Config();
    const logger = new Logger(config);
    const db = new Database(config, logger);
  }
}
```

3. 作用域隔离

```javascript
// module-a.js
const privateVar = 'private';
export const publicVar = 'public';

// module-b.js
import { publicVar } from './module-a';
console.log(privateVar); // ReferenceError
```

4. 代码复用

```javascript
// utils/format.js
export const formatDate = (date) => { /* ... */ };
export const formatCurrency = (amount) => { /* ... */ };

// 在多处复用
import { formatDate, formatCurrency } from './utils/format';
```

### 1.4 模块化规范对比

1. CommonJS

```javascript
// 同步加载，主要用于服务器
const module = require('./module');
module.exports = {
  // 导出内容
};
```

2. AMD

```javascript
// 异步加载，主要用于浏览器
define(['dependency'], function (dependency) {
  return {
    // 模块内容
  };
});
```

3. UMD

```javascript
// 通用模块定义，同时支持 CommonJS 和 AMD
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['dependency'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('dependency'));
    } else {
        root.returnExports = factory(root.dependency);
    }
}));
```

4. ES Modules

```javascript
// 现代标准模块系统

import { something } from './module';

export const other = {
  /* ... */
};

// 动态导入
const module = await import('./module');
```

规范特点对比：

1. CommonJS

- 同步加载
- Node.js 默认规范
- 运行时加载
- 缓存模块

2. AMD

- 异步加载
- 浏览器优先
- 依赖前置
- 配置复杂

3. UMD

- 通用兼容
- 代码复杂
- 运行时判断
- 打包必需

4. ES Modules

- 语言标准
- 静态分析
- Tree Shaking
- 异步加载支持

## 2. CommonJS

### 2.1 基本语法

```javascript
// 1. 基本模块定义
// math.js
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = {
  add,
  subtract,
};

// 2. 模块使用
const math = require('./math');
console.log(math.add(2, 3)); // 5
console.log(math.subtract(5, 2)); // 3

// 3. 文件夹作为模块
// my-module/index.js
module.exports = {
  // 模块内容
};

// 使用文件夹模块
const myModule = require('./my-module');
```

### 2.2 模块导出 (module.exports/exports)

```javascript
// 1. module.exports 导出对象
// user.js
module.exports = {
  getName() {
    return 'John';
  },
  getAge() {
    return 25;
  },
};

// 2. exports 快捷方式
exports.getName = function () {
  return 'John';
};
exports.getAge = function () {
  return 25;
};

// 3. 导出类
module.exports = class User {
  constructor(name) {
    this.name = name;
  }
};

// 4. 注意事项：exports 是 module.exports 的引用
exports = { name: 'John' }; // ❌ 错误，断开引用
module.exports = { name: 'John' }; // ✅ 正确

// 5. 混合导出
module.exports.name = 'John';
module.exports.getName = function () {
  return this.name;
};
```

### 2.3 模块导入 (require)

```javascript
// 1. 基本导入
const fs = require('fs');                     // 核心模块
const lodash = require('lodash');             // npm 模块
const myModule = require('./my-module');      // 本地模块

// 2. 解构导入
const { readFile, writeFile } = require('fs');
const { add, subtract } = require('./math');

// 3. 动态导入
const moduleName = 'my-module';
const myModule = require(`./${moduleName}`);

// 4. 条件导入
if (process.env.NODE_ENV === 'development') {
    const devTools = require('./dev-tools');
}

// 5. require.resolve 查找模块路径
const modulePath = require.resolve('./my-module');
console.log(modulePath); // 完整的模块路径
```

### 2.4 模块缓存机制

```javascript
// 1. 基本缓存机制
// module-a.js
console.log('模块 A 被加载');
module.exports = { name: 'A' };

// main.js
const moduleA1 = require('./module-a'); // 输出 "模块 A 被加载"
const moduleA2 = require('./module-a'); // 不会再次输出
console.log(moduleA1 === moduleA2); // true

// 2. 清除缓存
// 获取缓存
console.log(require.cache);

// 删除特定模块的缓存
delete require.cache[require.resolve('./module-a')];

// 清除所有缓存
Object.keys(require.cache).forEach((key) => {
  delete require.cache[key];
});

// 3. 缓存示例
// counter.js
let count = 0;
module.exports = {
  increment() {
    return ++count;
  },
  getCount() {
    return count;
  },
};

// main.js
const counter1 = require('./counter');
const counter2 = require('./counter');

console.log(counter1.increment()); // 1
console.log(counter2.increment()); // 2
```

### 2.5 循环依赖处理

```javascript
// 1. 循环依赖示例
// a.js
console.log('a 开始');
exports.done = false;
const b = require('./b');
console.log('在 a 中，b.done =', b.done);
exports.done = true;
console.log('a 结束');

// b.js
console.log('b 开始');
exports.done = false;
const a = require('./a');
console.log('在 b 中，a.done =', a.done);
exports.done = true;
console.log('b 结束');

// main.js
console.log('main 开始');
const a = require('./a');
const b = require('./b');
console.log('main 结束');

// 2. 避免循环依赖
// 重构为事件驱动
const EventEmitter = require('events');
const emitter = new EventEmitter();

// service.js
emitter.on('userUpdated', (user) => {
    // 处理用户更新
});

// user.js
function updateUser(userData) {
    // 更新用户
    emitter.emit('userUpdated', userData);
}

// 3. 依赖注入方式
class UserService {
    constructor(dependencies) {
        this.authService = dependencies.authService;
    }
}

class AuthService {
    constructor(dependencies) {
        this.userService = dependencies.userService;
    }
}

// 创建实例
const userService = new UserService({});
const authService = new AuthService({});

// 注入依赖
userService.authService = authService;
authService.userService = userService;
```

## 3. AMD (Asynchronous Module Definition)

### 3.1 RequireJS 使用

```javascript
<!-- 1. 基本引入 -->
<script src="require.js"></script>
<script>
    // 配置 RequireJS
    require.config({
        baseUrl: '/js',
        paths: {
            'jquery': 'lib/jquery.min',
            'lodash': 'lib/lodash.min'
        }
    });

    // 使用模块
    require(['jquery', 'app/main'], function($, main) {
        // 初始化应用
        main.init();
    });
</script>

<!-- 2. data-main 属性 -->
<script src="require.js" data-main="js/main"></script>
```

### 3.2 define 定义模块

```javascript
// 1. 定义简单模块
define('myModule', function () {
  return {
    sayHello: function () {
      console.log('Hello from myModule');
    },
  };
});

// 2. 带依赖的模块定义
define('userModule', ['jquery', 'utils'], function ($, utils) {
  function UserManager() {
    this.users = [];
  }

  UserManager.prototype.addUser = function (user) {
    this.users.push(user);
    $(document).trigger('userAdded', user);
  };

  return UserManager;
});

// 3. 命名模块
define('math/calculator', [], function () {
  return {
    add: function (a, b) {
      return a + b;
    },
    subtract: function (a, b) {
      return a - b;
    },
  };
});

// 4. 返回对象字面量
define({
  color: 'black',
  size: 'unisize',
});

// 5. CommonJS 风格的模块定义
define(function (require, exports, module) {
  var $ = require('jquery');
  var _ = require('lodash');

  exports.doSomething = function () {
    // 使用 $ 和 _
  };
});
```

### 3.3 require 加载模块

```javascript
// 1. 基本模块加载
require(['moduleA', 'moduleB'], function (moduleA, moduleB) {
  moduleA.init();
  moduleB.init();
});

// 2. 嵌套加载
require(['moduleA'], function (moduleA) {
  moduleA.init();

  require(['moduleB'], function (moduleB) {
    moduleB.init();
  });
});

// 3. 错误处理
require(['nonexistent'], function (module) {
  // 成功回调
}, function (err) {
  // 错误回调
  console.error('Module loading failed:', err);
});

// 4. 动态加载
function loadModule(name) {
  require([name], function (module) {
    module.init();
  });
}

// 5. 条件加载
require([window.JSON ? 'api' : 'api-polyfill'], function (api) {
  api.doSomething();
});
```

### 3.4 配置选项

```javascript
// 1. 基本配置
require.config({
  // 基础路径
  baseUrl: '/js/lib',

  // 路径映射
  paths: {
    jquery: 'jquery.min',
    lodash: 'lodash.min',
    app: '../app',
  },

  // 模块依赖关系
  shim: {
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone',
    },
  },

  // 映射配置
  map: {
    moduleA: {
      jquery: 'jquery-private',
    },
  },

  // 等待时间
  waitSeconds: 15,

  // 强制刷新缓存
  urlArgs: 'bust=' + new Date().getTime(),
});

// 2. 多版本配置
require.config({
  paths: {
    'jquery-1': 'lib/jquery-1.12.4',
    'jquery-2': 'lib/jquery-2.2.4',
  },
  map: {
    'some/oldmodule': {
      jquery: 'jquery-1',
    },
    'some/newmodule': {
      jquery: 'jquery-2',
    },
  },
});
```

### 3.5 与 CommonJS 的区别

1. 语法差异

```javascript
// CommonJS
const moduleA = require('moduleA');
module.exports = {
  /* ... */
};

// AMD
define(['moduleA'], function (moduleA) {
  return {
    /* ... */
  };
});
```

2. 加载机制

```javascript
// CommonJS - 同步加载
const fs = require('fs');
const data = fs.readFileSync('file.txt');

// AMD - 异步加载
require(['fs'], function (fs) {
  fs.readFile('file.txt', function (err, data) {
    // 处理数据
  });
});
```

3. 使用场景

```javascript
// CommonJS - 服务器端
const http = require('http');
const server = http.createServer((req, res) => {
  // 处理请求
});

// AMD - 浏览器端
define(['jquery'], function ($) {
  $(document).ready(function () {
    // DOM 操作
  });
});
```

4. 依赖处理

```javascript
// CommonJS - 运行时加载
const moment = require('moment');
if (needDateTime) {
  const datetime = moment().format();
}

// AMD - 依赖前置声明
define(['moment'], function (moment) {
  function getDateTime() {
    return moment().format();
  }
  return { getDateTime };
});
```

实现原理：

- CommonJS：基于文件系统
- AMD：基于浏览器特性

## 4. UMD (Universal Module Definition)

### 4.1 UMD 的实现原理

UMD 通过检测当前环境来决定使用哪种模块系统。

```javascript
// 1. 基本 UMD 模式
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['dependency'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(require('dependency'));
  } else {
    // 浏览器全局变量
    root.returnExports = factory(root.dependency);
  }
})(this, function (dependency) {
  // 模块代码
  return {};
});

// 2. 带有多个依赖的 UMD
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'underscore'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('underscore'));
  } else {
    root.myModule = factory(root.jQuery, root._);
  }
})(this, function ($, _) {
  // 模块实现
  return {
    // 公共 API
  };
});
```

### 4.2 同时支持 AMD 和 CommonJS

```javascript
// 1. 基础库封装
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else {
    // 浏览器全局变量
    root.MyLibrary = factory();
  }
})(this, function () {
  var MyLibrary = {
    version: '1.0.0',
    method: function () {},
  };
  return MyLibrary;
});

// 2. jQuery 插件的 UMD 封装
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    factory(jQuery);
  }
})(function ($) {
  $.fn.myPlugin = function () {
    // 插件实现
  };
});
```

### 4.3 浏览器全局变量

```javascript
// 1. 简单的全局变量导出
(function (root, factory) {
  root.MyModule = factory();
})(this, function () {
  return {
    name: 'MyModule',
    version: '1.0.0',
  };
});

// 2. 带命名空间的全局变量
(function (root, factory) {
  root.Company = root.Company || {};
  root.Company.MyModule = factory();
})(this, function () {
  return {
    // 模块实现
  };
});

// 3. 防止命名冲突
(function (root, factory) {
  var previousMyModule = root.MyModule;
  var MyModule = factory();

  MyModule.noConflict = function () {
    root.MyModule = previousMyModule;
    return MyModule;
  };

  root.MyModule = MyModule;
})(this, function () {
  return {
    // 模块实现
  };
});
```

### 4.4 UMD 模板

1. 基础 UMD 模板

```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['dependency1', 'dependency2'], factory);
  } else if (typeof exports === 'object') {
    // Node, CommonJS
    module.exports = factory(require('dependency1'), require('dependency2'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.dependency1, root.dependency2);
  }
})(this, function (dependency1, dependency2) {
  // 模块实现
  return {};
});
```

2. 带类型检查的 UMD 模板

```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['dependency'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node, CommonJS-like
    module.exports = factory(require('dependency'));
  } else if (typeof exports === 'object') {
    // CommonJS
    exports['MyModule'] = factory(require('dependency'));
  } else {
    // Browser globals
    root['MyModule'] = factory(root['dependency']);
  }
})(typeof self !== 'undefined' ? self : this, function (dependency) {
  'use strict';

  // 模块实现
  return {};
});
```

3. jQuery 插件 UMD 模板

```javascript
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  'use strict';

  $.fn.myPlugin = function (options) {
    // 插件实现
    return this.each(function () {
      // ...
    });
  };
});
```

注意事项：

- 模块定义：
  - 使用严格模式
  - 明确依赖关系
  - 提供 noConflict 机制
- 依赖处理：
  - 检查依赖是否存在
  - 提供合理的降级方案
  - 处理异步加载情况
- 错误处理：
  - 验证依赖的有效性
  - 提供清晰的错误信息
  - 处理异常情况
- 兼容性：
  - 支持多种模块系统
  - 处理不同环境差异
  - 提供降级方案

## 5. ES Modules

### 5.1 import/export 语法

```javascript
// 1. 基本导出
export const name = 'John';
export function sayHello() {
    console.log(`Hello ${name}`);
}

// 2. 批量导出
const age = 25;
const gender = 'male';
export { age, gender };

// 3. 重命名导出
export { age as userAge, gender as userGender };

// 4. 基本导入
import { name, sayHello } from './module';
import { userAge as age, userGender as gender } from './module';

// 5. 导入所有
import * as userModule from './module';
userModule.sayHello();

// 6. 混合导入导出
export { default as MainComponent } from './MainComponent';
export * from './utils';
```

### 5.2 静态导入导出

```javascript
// 1. 静态导入特点
import { useState } from 'react';  // 必须在顶层
import './styles.css';            // 支持副作用导入

// ❌ 不允许的用法
if (condition) {
    import module from './module'; // 错误
}

// 2. 静态导出
// constants.js
export const API_URL = 'https://api.example.com';
export const MAX_ITEMS = 100;

// 3. 组合模块
// index.js
export { UserService } from './services/user';
export { AuthService } from './services/auth';
export type { User } from './types';

// 4. 类型导出（TypeScript）
export interface User {
    id: string;
    name: string;
}

export type UserRole = 'admin' | 'user';
```

### 5.3 动态导入 (import())

```javascript
// 1. 基本用法
async function loadModule() {
  const module = await import('./module.js');
  module.default(); // 使用默认导出
}

// 2. 条件导入
async function loadLocaleMessages(locale) {
  const messages = await import(`./locales/${locale}.js`);
  return messages.default;
}

// 3. 错误处理
async function safeImport(modulePath) {
  try {
    const module = await import(modulePath);
    return module;
  } catch (error) {
    console.error('Module loading failed:', error);
    return null;
  }
}

// 4. 并行加载多个模块
async function loadDependencies() {
  const [moduleA, moduleB] = await Promise.all([
    import('./moduleA.js'),
    import('./moduleB.js'),
  ]);
  return { moduleA, moduleB };
}
```

### 5.4 默认导出与命名导出

```javascript
// 1. 默认导出
// component.js
export default function Button() {
    return <button>Click me</button>;
}

// 导入默认导出
import Button from './component';

// 2. 混合使用默认导出和命名导出
// utils.js
export const helper = () => {};
export default class MainClass {}

// 导入混合导出
import MainClass, { helper } from './utils';

// 3. 重新导出
export { default } from './OtherComponent';
export { default as Component } from './Component';

// 4. 导出表达式
export default class {
    // 匿名类
}

export default function(x) {
    return x * x;
}
```

### 5.5 模块路径解析

```javascript
// 1. 相对路径

import './styles.css';
import '../utils/helper';
import '../../lib/module';
// 2. 绝对路径
import 'lodash';
import '@material-ui/core';

// 使用别名
import Button from '@components/Button';
// 3. URL 导入
import moduleA from 'https://example.com/modules/moduleA.js';

// 4. 路径别名（需要构建工具支持）
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
    },
  },
};
```

### 5.6 循环依赖处理

```javascript
// a.js
console.log('a.js 开始执行');
import { b } from './b.js';
export const a = 1;
console.log('b 的值是:', b);
console.log('a.js 结束执行');

// b.js
console.log('b.js 开始执行');
import { a } from './a.js';
export const b = 2;
console.log('a 的值是:', a);
console.log('b.js 结束执行');

// 执行顺序：
// 1. a.js 开始执行
// 2. 导入 b.js
// 3. b.js 开始执行
// 4. b.js 尝试导入 a，此时 a 还未定义，返回 undefined
// 5. b.js 定义 b = 2
// 6. b.js 打印 a: undefined
// 7. b.js 结束执行
// 8. a.js 继续执行，定义 a = 1
// 9. a.js 打印 b: 2
// 10. a.js 结束执行
```

```javascript
// 1. 基本循环依赖
// a.js
import { b } from './b';
export const a = 1;
console.log(b);

// b.js
import { a } from './a';
export const b = 2;
console.log(a);

// 2. 解决方案：重构代码结构
// shared.js
export const state = {
    a: 1,
    b: 2
};

// a.js
import { state } from './shared';
export function updateA() {
    state.a += 1;
}

// b.js
import { state } from './shared';
export function updateB() {
    state.b += 1;
}

// 3. 使用动态导入避免循环依赖
// a.js
export async function methodA() {
    const { methodB } = await import('./b.js');
    return methodB();
}

// b.js
export async function methodB() {
    const { methodA } = await import('./a.js');
    return methodA();
}

// 4. 使用依赖注入
// service.js
export class Service {
    constructor(dependencies = {}) {
        this.dependencies = dependencies;
    }

    async operation() {
        const { otherService } = this.dependencies;
        return otherService.doSomething();
    }
}
```

ES Modules 的优势：

1. 静态分析能力
2. 异步加载支持
3. tree-shaking 优化
4. 清晰的模块关系
5. 浏览器原生支持

## 6. 模块打包工具

### 6.1 Webpack

1. 基本工作流

```shell
[入口(Entry)]
       ↓
[编译器(Compiler)]  ←→  [插件系统(Plugins)]
       ↓
[依赖图谱(Dependency Graph)]
       ↓
[加载器(Loaders)]
       ↓
[输出(Output)]
```

2. 模块依赖

```shell
入口文件
   ↓
依赖解析 → 构建依赖图
   ↓
模块转换 ←→ Loaders
   ↓
代码优化 ←→ Plugins
   ↓
输出文件
```

3. 插件系统

```shell
Compiler
   ↓
[Hook System]
   ↓
├── beforeRun
├── run
├── beforeCompile
├── compile
├── make
├── afterCompile
└── emit
```

4. 关键概念

```shell
[Webpack Core]
      ↓
├── Compiler (编译管理)
├── Module (模块处理)
├── Chunk (代码块)
└── Plugin (插件系统)
```

- 优点：

1. 生态系统最完善
2. 配置灵活，功能强大
3. 支持多种模块类型
4. 丰富的插件系统
5. 强大的代码分割能力

- 缺点：

1. 配置复杂
2. 打包速度较慢
3. 学习曲线陡峭
4. 内存占用大
5. 对大型项目构建速度慢

### 6.2 Rollup

1. 核心特性

- Tree Shaking

  - 更彻底的 Dead Code Elimination
  - 基于 ES Modules 静态分析
  - 可以移除未使用的导出
  - 生成更小的包体积

- 输出格式

  - ESM、CommonJS、UMD、IIFE

2. 适用场景

- 适合于：工具函数、组件库
- 不适合：大型应用、代码分割、HMR、静态资源处理

### 6.3 Parcel

- 优点：

1. 零配置
2. 自动安装依赖
3. 多种资源类型支持
4. 快速的构建速度
5. 开箱即用的开发体验

- 缺点：

1. 配置灵活性差
2. 生态系统较小
3. 自定义能力有限
4. 大型项目可能不适用
5. 构建结果优化空间小

### 6.4 Vite

特性：

1. 极快的启动速度
2. 基于 ES modules
3. 优秀的开发体验
4. 内置现代化特性
5. 生产环境使用 Rollup

## 7. 模块化最佳实践

### 7.1 目录结构组织

功能模块划分

```shell
src/
├── components/     # UI组件
├── services/       # 业务服务
├── utils/          # 工具函数
├── hooks/          # 自定义钩子
├── constants/      # 常量定义
└── types/          # 类型定义
```

```shell
src/
├── features/       # 业务功能模块
│   ├── auth/      # 认证模块
│   ├── user/      # 用户模块
│   └── order/     # 订单模块
├── shared/        # 共享模块
└── core/          # 核心模块
```

### 7.2 命名规范

文件命名

- 组件使用 PascalCase
- 工具函数使用 camelCase
- 类型定义使用 PascalCase
- 常量使用 UPPER_SNAKE_CASE
- 测试文件添加 .test 或 .spec 后缀

导出命名

- 默认导出与文件名一致
- 常量使用大写
- 工具函数使用动词开头

### 7.3 依赖管理

依赖分类

- dependencies: 运行时依赖
- devDependencies: 开发依赖
- peerDependencies: 同伴依赖
- optionalDependencies: 可选依赖

版本控制

- 使用确定的版本号
- 避免使用 ^ 和
- 使用 lock 文件锁定版本
- 定期更新依赖

### 7.4 避免循环依赖

重构策略

1. 提取共享模块
2. 使用依赖注入
3. 使用事件机制
4. 重新设计接口
5. 使用中间层

检测工具

- circular-dependency-plugin
- madge
- dependency-cruiser
- eslint-plugin-import

### 7.5 按需加载

路由级别

```javascript
// React Router 示例
const UserModule = React.lazy(() => import('./features/user'));
const OrderModule = React.lazy(() => import('./features/order'));
```

组件级别

```javascript
// 组件按需加载
const HeavyComponent = React.lazy(() => import('./components/Heavy'));
```

库级别

```javascript
// lodash 按需导入

import { debounce } from 'lodash-es';
```

### 7.6 Tree Shaking

编写可 Tree Shaking 的代码：

1. 使用 ES Modules
2. 避免副作用
3. 使用命名导出
4. 避免动态导入导出

配置优化

```javascript fileName="package.json"
{
  "sideEffects": false,
  "type": "module"
}
```

```javascript fileName="webpack.config.js"
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: true,
  },
};
```

## 8. 模块化高级特性

### 8.1 模块联邦（Module Federation）

基本概念：

- 允许多个独立应用共享模块
- 运行时动态加载远程模块
- 实现微前端架构
- 共享依赖管理

```javascript
// 主应用 webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};

// 使用远程模块
// App.js
const RemoteButton = React.lazy(() => import('app1/Button'));
const RemoteHeader = React.lazy(() => import('app2/Header'));

function App() {
  return (
    <Suspense fallback='Loading...'>
      <RemoteButton />
      <RemoteHeader />
    </Suspense>
  );
}
```

### 8.2 动态模块加载

实现方式

1. ES Modules 动态导入
2. Webpack 动态导入
3. 条件加载
4. 路由级别加载

使用场景

- 路由组件加载
- 大型组件按需加载
- 条件性功能加载
- 性能优化

```javascript
// 路由级别动态加载
const routes = [
  {
    path: '/users',
    component: React.lazy(() => import('./pages/Users')),
  },
  {
    path: '/orders',
    component: React.lazy(() => import('./pages/Orders')),
  },
];

// 条件动态加载
const loadAnalytics = async () => {
  if (process.env.NODE_ENV === 'production') {
    const { initAnalytics } = await import('./analytics');
    initAnalytics();
  }
};

// 组件级动态加载
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
function App() {
  return (
    <Suspense fallback={<Loading />}>
      {needHeavyComponent && <HeavyComponent />}
    </Suspense>
  );
}
```

### 8.3 模块预加载

预加载策略

1. 路由预加载
2. 组件预加载
3. 资源预加载
4. 条件预加载

实现方法

- prefetch：未来可能需要
- preload：当前必需资源
- 自定义预加载逻辑
- 基于用户行为预测

```javascript
// 路由预加载
const prefetchComponent = (path) => {
  const component = routes.find((route) => route.path === path)?.component;
  if (component) {
    // @vite-ignore
    import(/* @vite-ignore */ component);
  }
};

// Link 组件预加载
const PreloadLink = ({ to, children }) => {
  const prefetchData = () => {
    // 预加载路由组件
    const route = routes.find((r) => r.path === to);
    if (route?.component) {
      route.component.preload();
    }
  };

  return (
    <Link to={to} onMouseEnter={prefetchData} onTouchStart={prefetchData}>
      {children}
    </Link>
  );
};
```

### 8.4 模块热替换 (HMR)

工作原理

1. 文件更改检测
2. 模块替换
3. 状态保持
4. 运行时更新

配置要点

- webpack-dev-server 配置
- HMR 插件启用
- 模块接受机制
- 状态管理处理

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    hot: true,
  },
};

// React 组件 HMR
if (module.hot) {
  module.hot.accept('./App', () => {
    render(<App />, document.getElementById('root'));
  });
}

// Vue 组件 HMR
if (module.hot) {
  module.hot.accept('./App.vue', () => {
    const newApp = require('./App.vue').default;
    app.$mount('#app');
  });
}

// 自定义 HMR 处理
if (module.hot) {
  module.hot.accept('./store', () => {
    const nextStore = require('./store').default;
    store.replaceState(nextStore.state);
  });
}
```

### 8.5 Source Map 支持

```javascript
// webpack.config.js
module.exports = {
  // 开发环境配置
  devtool:
    process.env.NODE_ENV === 'development'
      ? 'eval-source-map' // 完整源码映射
      : 'source-map', // 生产环境源码映射

  // Source Map 加载器配置
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
};

// Vite 配置
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: true, // 生产环境开启 Source Map
  },
});

// 错误处理与 Source Map
window.addEventListener('error', (event) => {
  const errorStack = event.error.stack;
  // 使用 source-map 解析真实错误位置
  const mappedStack = sourcemap.mapStackTrace(errorStack);
  console.log('Mapped error location:', mappedStack);
});
```

## 9. 浏览器原生模块支持

### 9.1 script type="module"

```javascript
<!-- 基本模块引入 -->
<script type="module">
  import { helper } from './utils.js';
  helper();
</script>

<!-- 外部模块引入 -->
<script type="module" src="app.js"></script>

<!-- nomodule 降级处理 -->
<script nomodule src="fallback.js"></script>
```

特性

1. 自动启用严格模式
2. 支持 import/export
3. 默认延迟加载（相当于 defer）
4. 只加载一次
5. 跨域限制

### 9.2 浏览器兼容性

检测支持

```javascript
// 检测模块支持
const supportsModules = 'noModule' in HTMLScriptElement.prototype;

// 动态加载策略
if (supportsModules) {
  loadModuleVersion();
} else {
  loadLegacyVersion();
}
```

兼容性处理

```javascript
<!-- 现代浏览器 -->
<script type="module" src="app.mjs"></script>

<!-- 旧版浏览器 -->
<script nomodule src="app.bundle.js"></script>

<!-- 动态导入兼容 -->
<script>
  async function loadModule() {
    try {
      const module = await import('./module.js');
    } catch (e) {
      // 降级处理
      loadLegacyScript('./module.bundle.js');
    }
  }
</script>
```

### 9.3 跨域问题处理

CORS 配置

```shell
# Nginx 配置
location /modules/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, OPTIONS';
}
```

本地开发服务器

```javascript
// Express 服务器
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Vite 配置
export default {
  server: {
    cors: true,
  },
};
```

代理处理

```javascript
// 开发服务器代理
module.exports = {
  devServer: {
    proxy: {
      '/modules': {
        target: 'https://api.example.com',
        changeOrigin: true,
      },
    },
  },
};
```

### 9.4 性能优化

1. 预加载策略

```javascript
<!-- 预加载关键模块 -->
<link rel="modulepreload" href="./critical-module.js">

<!-- 预加载多个模块 -->
<link rel="modulepreload" href="./app.js">
<link rel="modulepreload" href="./utils.js">
```

2. 模块打包优化

```javascript
// 路径优化
import { helper } from './utils/helper.js';
// 替换为
import { helper } from './utils.js';

// 合并小模块
// 避免过多的 HTTP 请求
```

3. 缓存策略

```shell
# Nginx 缓存配置
location /modules/ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}
```

4. 加载优化

```javascript
// 动态导入
async function loadFeature() {
  const { feature } = await import(
    /* webpackChunkName: "feature" */
    './features/feature.js'
  );
  return feature;
}

// 条件加载
if (condition) {
  await import('./conditional-module.js');
}
```

## 10. Node.js 模块系统

### 10.1 CommonJS 实现

基本语法

```javascript
// 导出
module.exports = {
  method1,
  method2,
};
// 或
exports.method1 = method1;

// 导入
const module = require('./module');
```

模块缓存

```javascript
// 模块缓存机制
console.log(require.cache);

// 清除缓存
delete require.cache[require.resolve('./module')];

// 模块标识符
console.log(module.id);
console.log(module.filename);
```

循环依赖处理

```javascript
// a.js
exports.done = false;
const b = require('./b.js');
exports.done = true;

// b.js
exports.done = false;
const a = require('./a.js');
exports.done = true;
```

### 10.2 ES Modules 支持

启用 ES Modules

```javascript
// package.json
{
  "type": "module"
}
```

基本使用

```javascript
// 命名导出导入
export const name = 'value';
import { name } from './module.js';

// 默认导出导入
export default function() {};
import defaultFn from './module.js';

// 混合导出导入
export { default as Main } from './Main.js';
export * from './utils/index.js';
```

动态导入

```javascript
// 支持动态导入
const module = await import('./module.js');

// 条件导入
if (condition) {
  const { special } = await import('./special.js');
}
```

### 10.3 混合使用处理

在 CommonJS 中使用 ES Modules

```javascript
// 使用 createRequire

import { createRequire } from 'module';

// 使用动态导入
async function loadEsModule() {
  const esModule = await import('./esModule.js');
  return esModule;
}

const require = createRequire(import.meta.url);
const cjsModule = require('./commonjs-module');
```

在 ES Modules 中使用 CommonJS

```javascript
// 导入 CommonJS 模块

import { dirname } from 'path';
// 使用 __filename 和 __dirname
import { fileURLToPath } from 'url';

import cjsModule from './commonjs-module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 10.4 package.json 配置

基本配置

```javascript
{
  "name": "my-package",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js"
}
```

条件导出

```javascript
{
  "exports": {
    ".": {
      "node": {
        "import": "./dist/node/index.js",
        "require": "./dist/node/index.cjs"
      },
      "browser": "./dist/browser/index.js",
      "default": "./dist/default/index.js"
    }
  }
}
```

### 10.5 模块解析算法

路径解析

```javascript
// 1. 相对路径
require('./module');
// 查找顺序：
// - ./module.js
// - ./module.json
// - ./module/index.js

// 2. 模块路径
require('module-name');
// 查找顺序：
// - core modules
// - node_modules/module-name
```

自定义解析

```javascript
// 自定义 require 钩子
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (path) {
  // 自定义解析逻辑
  return originalRequire.apply(this, arguments);
};
```

### 10.6 最佳实践

1. 模块类型选择

```javascript
// 新项目推荐使用 ES Modules
{
  "type": "module",
  "engines": {
    "node": ">=14.0.0"
  }
}
```

2. 兼容性处理

```javascript
// 双模式包发布
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "exports": {
    "import": "./dist/index.js",
    "require": "./dist/index.cjs"
  }
}
```

3. 性能优化

```javascript
// 1. 预编译模块
// 2. 使用模块缓存
// 3. 避免动态 require
// 4. 合理使用异步导入
```

4. 开发工具配置

```javascript
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node"
  }
}

// .eslintrc
{
  "parserOptions": {
    "sourceType": "module"
  }
}
```
