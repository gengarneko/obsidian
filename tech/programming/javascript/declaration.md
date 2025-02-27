# 声明与作用域

声明与作用域（Declarations and Scope）是 JavaScript 中用于定义变量（var、let、const）和确定这些变量在代码中可访问范围（全局作用域、函数作用域、块级作用域）的核心机制，它决定了变量的生命周期和可见性。

或者更口语化的说法：

声明与作用域规定了"在哪里"可以声明变量，以及这些变量"在哪里"可以被访问。

## 1. 变量声明

### 1.1 基本语法

var

```javascript
// 1. 变量提升
console.log(name); // undefined
var name = 'John';

// 2. 函数作用域
function example() {
  var local = '只在函数内可见';
}
// console.log(local);  // ReferenceError

// 3. 可重复声明
var x = 1;
var x = 2; // 合法

// 4. 全局对象属性
var global = '会成为window属性';
console.log(window.global); // "会成为window属性"
```

var 的问题

1. 没有块级作用域

```javascript
if (true) {
  var blockVar = '我在块内声明';
}
console.log(blockVar); // "我在块内声明" - 变量泄露
```

2. 变量提升可能导致混淆

```javascript
function varHoisting() {
  console.log(temp); // undefined 而不是报错
  var temp = '我被提升了';
}
```

let

```javascript
// 1. 块级作用域
{
  let blockScoped = '只在块内可见';
  console.log(blockScoped); // "只在块内可见"
}
// console.log(blockScoped);  // ReferenceError

// 2. 暂时性死区(TDZ)
{
  // console.log(tdzVar);  // ReferenceError
  let tdzVar = 'TDZ演示';
}

// 3. 不允许重复声明
let y = 1;
// let y = 2;  // SyntaxError

// 4. 不会成为全局对象属性
let notGlobal = '不会挂到window上';
console.log(window.notGlobal); // undefined
```

const

```javascript
// 1. 必须初始化
const MUST_INITIALIZE;  // SyntaxError

// 2. 不可重新赋值
const PI = 3.14159;
// PI = 3.14;  // TypeError

// 3. 对象属性可修改
const user = {
    name: "John"
};
user.name = "Jane";  // 允许
// user = {};  // TypeError

// 4. 数组元素可修改
const arr = [1, 2, 3];
arr.push(4);  // 允许
// arr = [];  // TypeError

// 5. 创建真正的常量
const config = Object.freeze({
    API_URL: "https://api.example.com",
    MAX_RETRIES: 3
});
// config.MAX_RETRIES = 5;  // 严格模式下报错，非严格模式下静默失败
```

### 1.2 三种声明的外在区别

```javascript
// ES5 时代 只有 var
var name = 'old';

// ES6 引入 let 和 const
let modern = 'block scope';
const CONSTANT = 'immutable';

// 为什么需要新的声明方式？
function oldWay() {
  var x = 1;
  if (true) {
    var x = 2; // 同一个 x
    console.log(x); // 2
  }
  console.log(x); // 2 - 变量提升导致的问题
}

function newWay() {
  let x = 1;
  if (true) {
    let x = 2; // 不同的x
    console.log(x); // 2
  }
  console.log(x); // 1 - 块级作用域解决了问题
}
```

作用域

```javascript
// var: 函数作用域
function scopeTest() {
  var functionScoped = 'function';
  if (true) {
    var sameVariable = 'still function';
  }
  console.log(sameVariable); // 可访问
}

// let/const: 块级作用域
function blockTest() {
  let blockScoped = 'block';
  if (true) {
    let differentVariable = 'different block';
    const alsoBlockScoped = 'also block';
  }
  // console.log(differentVariable);  // ReferenceError
}
```

变量提升

```javascript
// var 会提升
console.log(varVariable); // undefined
var varVariable = '提升';

// let/const 不会提升
// console.log(letVariable);  // ReferenceError
let letVariable = '不提升';
```

全局对象属性

```javascript
var globalVar = 'window property';
let globalLet = 'not window property';
const globalConst = 'not window property';

console.log(window.globalVar); // "window property"
console.log(window.globalLet); // undefined
console.log(window.globalConst); // undefined
```

重复声明

```javascript
// var 允许重复声明
var x = 1;
var x = 2;

// let/const 不允许重复声明
let y = 1;
// let y = 2;  // SyntaxError

const z = 1;
// const z = 2;  // SyntaxError
```

初始化要求

```javascript
// var 和 let 可以不初始化
var uninitializedVar;
let uninitializedLet;

// const 必须初始化
// const mustInitialize;  // SyntaxError
```

### 1.3 深入理解差异

### 1.3.1 执行上下文中的处理差异

执行上下文（Execution Context）是

- 在进入执行上下文时，为 var 分配内存并初始化为 undefined
- 进入执行上下文时，为 let/const 分配内存但不初始化

var 的处理机制

```javascript
// 1. 变量提升：在创建阶段，变量被提升并初始化为 undefined
console.log(x); // undefined
var x = 1;
// 内部实现
VariableObject {
  x: undefined // 创建阶段
  x: 1 // 执行阶段
}
```

let/const 的处理机制

```javascript
// 1. TDZ：在创建阶段，变量已被提升但未初始化
console.log(x); // ReferenceError
let x = 1;

// 内部实现
LexicalEnvironment {
  x: <uninitialized> // 创建阶段（TDZ）
  x: 1 // 执行阶段
}
```

### 1.3.2 作用域实现差异

var：函数作用域

```javascript
function example() {
  var x = 1;
  {
    var x = 2; // 同一个变量
  }
  console.log(x); // 2
}

// 原理：var 声明都被存储在当前函数的变量对象中
FunctionContext {
  VariableObject: {
    x: 2
  }
}
```

let/const：块级作用域

```javascript
function example() {
  let x = 1;
  {
    let x = 2; // 新的变量
  }
  console.log(x); // 1
}

// 原理：每个块级作用域创建新的词法环境
BlockScope {
  LexicalEnvironment: {
    x: 1
  }
  // 内部块的独立环境
  InnerBlock: {
    x: 2
  }
}
```

### 1.3.3 内存和性能影响

var 的影响

- 函数作用域导致变量存活时间较长
- 变量提升可能导致内存占用增加
- 全局变量可能造成内存泄露

let/const 的优势

- 块级作用域允许更早的内存释放
- TDZ 避免了变量提升带来的问题
- 更容易进行代码优化

### 1.3.4 总结

1. 变量提升

- var: 创建阶段即被初始化为 undefined
- let/const: 创建阶段不被初始化，形成 TDZ

2. 作用域

- var: 附加到变量对象（VO）
- let/const: 使用词法环境（Lexical Environment）

3. 内存管理

- var: 函数级别的内存分配
- let/const: 块级别的内存分配

4. const 特性

- 实现了只读绑定（read-only binding）
- 引用类型的内容仍可修改

### 1.4 最佳实践建议

```javascript
// var 允许重复声明
var x = 1;
var x = 2;

// let/const 不允许重复声明
let y = 1;
// let y = 2;  // SyntaxError

const z = 1;
// const z = 2;  // SyntaxError
```

特殊场景：循环

```javascript
// for 循环中的 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}

// for 循环中的 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3
}

// const 在 for...of 中的使用
for (const item of [1, 2, 3]) {
  console.log(item); // 每次迭代创建新的绑定
}
```

## 2. 作用域类型

### 2.1 全局作用域（Global Scope）

```javascript
// 1. 直接声明在最外层
var globalVar = '我是全局变量';
let globalLet = '我也是全局变量';

// 2. window 对象的属性
window.name = '全局 window 属性';

// 3. 不使用声明关键字（不推荐）
implicitGlobal = '隐式全局变量'; // 不使用 var/let/const

// 注意：var 和隐式声明会成为 window 属性
console.log(window.globalVar); // "我是全局变量"
console.log(window.implicitGlobal); // "隐式全局变量"
console.log(window.globalLet); // undefined
```

### 2.2 函数作用域（Function Scope）

```javascript
function functionScope() {
  // 1. 函数内部声明
  var functionVar = '函数作用域变量';
  let functionLet = '也是函数作用域变量';

  // 2. 内部函数可以访问外部函数变量
  function innerFunction() {
    console.log(functionVar); // 可以访问
  }

  // 3. 外部无法访问函数内部变量
  return innerFunction;
}

const fn = functionScope();
fn(); // "函数作用域变量"
// console.log(functionVar); // ReferenceError
```

### 2.3 块级作用域（Block Scope）

```javascript
// 1. 基本块级作用域
{
  let blockLet = '块级变量';
  const blockConst = '块级常量';
  var notBlock = '我不是块级的'; // var 不遵守块级作用域
}
// console.log(blockLet);    // ReferenceError
// console.log(blockConst);  // ReferenceError
console.log(notBlock); // "我不是块级的"

// 2. 条件语句中的块级作用域
if (true) {
  let ifVar = 'if 块级变量';
  const ifConst = 'if 块级常量';
}
// console.log(ifVar);    // ReferenceError

// 3. 循环中的块级作用域
for (let i = 0; i < 3; i++) {
  const value = i;
  // 每次循环都是新的变量实例
}
```

### 2.4 作用域链（Scope Chain）

```javascript
// 1. 基本作用域链
const global = '全局变量';

function outer() {
  const outerVar = '外层变量';

  function inner() {
    const innerVar = '内层变量';

    // 作用域链查找顺序：
    console.log(innerVar); // 当前作用域
    console.log(outerVar); // 外层作用域
    console.log(global); // 全局作用域
  }

  inner();
}

// 2. 作用域链和变量遮蔽
function scopeChain() {
  const value = '外层值';

  function inner() {
    const value = '内层值';
    console.log(value); // "内层值"（遮蔽外层变量）
  }

  inner();
  console.log(value); // "外层值"
}

// 3. 闭包中的作用域链
function createCounter() {
  let count = 0; // 外层作用域变量

  return function () {
    return ++count; // 通过作用域链访问外层变量
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

### 2.5 注意事项 / 最佳实践

```javascript
// 1. 模块模式
const module = (function() {
    // 私有作用域
    const private = "私有变量";

    return {
        getPrivate() {
            return private;
        }
    };
})();

// 2. 避免全局污染
{
    // 块级作用域隔离代码
    const api = {/*...*/};
    const config = {/*...*/};

    // 实现功能
}

// 3. 循环中的块级作用域
const actions = [];
for (let i = 0; i < 3; i++) {
    actions.push(() => console.log(i));
}
actions.forEach(fn => fn());  // 0, 1, 2
```

```javascript
// 1. 避免全局变量
// ❌ 不好的实践
window.userId = '123';

// ✅ 好的实践
const UserModule = {
  userId: '123',
};

// 2. 及时释放块级作用域
{
  const heavyData = loadLargeData();
  processData(heavyData);
} // heavyData 在这里可以被垃圾回收

// 3. 合理使用闭包
function factory(value) {
  // 只保留需要的变量在作用域链中
  return () => value;
}
```

```javascript
let global = '全局变量';
function outer() {
  let outerVar = '外层变量';
  function inner() {
    let innerVar = '内层变量';
    console.log(global); // 可访问
    console.log(outerVar); // 可访问
    console.log(innerVar); // 可访问
  }
  inner();
  console.log(innerVar); // ReferenceError
}
```

1. 作用域决定了变量的可访问性和生命周期
2. 作用域链决定了变量查找的顺序
3. 块级作用域提供了更好的变量隔离
4. 合理使用作用域可以提高代码质量和性能

## 3. 变量提升（Hoisting）

### 3.1 变量提升机制

```javascript
// 1. var 的提升
console.log(name); // undefined
var name = 'John';

// 等同于：
var name; // 提升声明
console.log(name); // undefined
name = 'John'; // 赋值保持在原位置

// 2. 多个变量声明的提升
console.log(a, b); // undefined undefined
var a = 1;
var b = 2;

// 等同于：
var a, b; // 所有声明提升到顶部
console.log(a, b);
a = 1;
b = 2;
```

### 3.2 函数提升

```javascript
// 1. 函数声明提升
sayHello();  // "Hello!"

function sayHello() {
    console.log("Hello!");
}

// 2. 函数表达式不会被提升
sayHi();  // TypeError: sayHi is not a function
var sayHi = function() {
    console.log("Hi!");
};

// 3. 函数声明vs变量声明优先级
console.log(foo);  // [Function: foo]
var foo = "变量 foo";
function foo() {
    return "函数 foo";
}

// 等同于：
function foo() {    // 函数声明最先提升
    return "函数 foo";
}
var foo;           // 变量声明被忽略（已有同名函数）
console.log(foo);
foo = "变量 foo";  // 赋值正常执行
```

### 3.3 let/const 和暂时性死区（TDZ）

```javascript
// 1. 基本的 TDZ
{
  // TDZ 开始
  console.log(value); // ReferenceError
  let value = 'TDZ 演示'; // TDZ 结束
}

// 2. 复杂 TDZ 场景
{
  const func = () => console.log(value);
  // let value = "TDZ";  // 取消注释后 func 可以正常工作
  func(); // ReferenceError
}

// 3. 类中的 TDZ
class Example {
  // 在构造函数前访问 this 会触发 TDZ
  field = this.helper(); // ReferenceError

  constructor() {
    // 这里可以安全使用 this
  }

  helper() {
    return 42;
  }
}
```

### 3.4 最佳实践

```javascript
// 1. 避免依赖提升
// ❌ 不好的实践
function bad() {
  console.log(value);
  var value = 123;
}

// ✅ 好的实践
function good() {
  const value = 123;
  console.log(value);
}

// 2. 函数声明的合理使用
// ❌ 避免在块级作用域中使用函数声明
if (true) {
  function blockFunc() {}
}

// ✅ 使用函数表达式
if (true) {
  const blockFunc = function () {};
}

// 3. 处理可能的 TDZ
function safePractice() {
  // 确保在使用前完成声明
  const value = 42;
  const result = value + 1;
}
```

## 4. 闭包（Closure）

闭包是指一个函数可以记住并访问其所在的词法作用域，即使该函数在其他地方执行。

简单说，闭包让你可以在一个内层函数中访问到其外层函数的作用域。

### 4.1 闭包原理

```javascript
// 1. 基本闭包结构
function outer() {
  const message = 'Hello'; // 外部变量

  return function inner() {
    console.log(message); // 访问外部变量
  };
}

const fn = outer();
fn(); // "Hello"

// 2. 闭包保持对外部变量的引用
function createCounter() {
  let count = 0; // 私有变量

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getCount() {
      return count;
    },
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount()); // 2
```

### 4.2 闭包应用场景

数据私有化

```javascript
function createUser(name) {
  // 私有变量
  let _name = name;
  let _loginAttempts = 0;

  return {
    getName() {
      return _name;
    },
    login(password) {
      _loginAttempts++;
      return password === 'correct';
    },
    getLoginAttempts() {
      return _loginAttempts;
    },
  };
}

const user = createUser('John');
console.log(user.getName()); // "John"
console.log(user._name); // undefined（无法直接访问）
```

函数工厂

```javascript
// 创建特定功能的函数
function multiply(x) {
  return function (y) {
    return x * y;
  };
}

const multiplyByTwo = multiply(2);
const multiplyByTen = multiply(10);

console.log(multiplyByTwo(4)); // 8
console.log(multiplyByTen(5)); // 50
```

事件处理和回调

```javascript
function setupHandler() {
  let count = 0;

  document.getElementById('button').addEventListener('click', function () {
    console.log(`Button clicked ${++count} times`);
  });
}
```

### 4.3 模块模式（IIFE）

```javascript
// 1. 基本模块模式
const Calculator = (function () {
  // 私有变量和方法
  let result = 0;

  function validate(num) {
    return typeof num === 'number';
  }

  // 公共 API
  return {
    add(num) {
      if (validate(num)) {
        result += num;
      }
      return result;
    },
    subtract(num) {
      if (validate(num)) {
        result -= num;
      }
      return result;
    },
    getResult() {
      return result;
    },
  };
})();

// 2. 带有初始化的模块
const UserModule = (function () {
  // 私有变量
  const users = new Map();

  // 初始化
  function initialize() {
    users.set('admin', { name: 'Admin', role: 'admin' });
  }

  // 立即执行初始化
  initialize();

  // 返回公共 API
  return {
    getUser(id) {
      return users.get(id);
    },
    addUser(id, user) {
      users.set(id, user);
    },
  };
})();
```

### 4.4 内存管理

内存泄漏防范

```javascript
// ❌ 可能导致内存泄漏的闭包
function leakyClosure() {
  const heavyObject = {
    /* 大量数据 */
  };

  return function () {
    console.log(heavyObject);
  };
}

// ✅ 优化后的闭包
function optimizedClosure() {
  const heavyObject = {
    /* 大量数据 */
  };
  const necessary = heavyObject.necessaryProp;

  // heavyObject 可以被垃圾回收
  return function () {
    console.log(necessary);
  };
}
```

性能优化

```javascript
// 1. 避免在循环中创建闭包
// ❌ 不好的实践
for (var i = 0; i < 1000; i++) {
  element.addEventListener('click', function () {
    console.log(i);
  });
}

// ✅ 好的实践
function createHandler(i) {
  return function () {
    console.log(i);
  };
}

for (var i = 0; i < 1000; i++) {
  element.addEventListener('click', createHandler(i));
}

// 2. 及时解除引用
function cleanup() {
  const element = document.getElementById('button');
  const handler = function () {
    /* ... */
  };

  element.addEventListener('click', handler);

  // 清理函数
  return function () {
    element.removeEventListener('click', handler);
    // 解除引用
    element = null;
  };
}
```

### 4.5 实际应用

```javascript
// 1. 缓存函数（记忆化）
function memoize(fn) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 2. 柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }

    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

// 3. 状态管理
function createStore(initialState = {}) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    setState(newState) {
      state = { ...state, ...newState };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
```

## 5. 循环处理

### 5.1 var 在循环中的问题

```javascript
// var 的问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3
}
// 原因：var 没有块级作用域，所有定时器共享同一个 i
```

### 5.2 let 的正确处理

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
// 原因：每次迭代都创建新的块级作用域，每个定时器捕获自己的 i
```

### 5.3 循环中的闭包

```javascript
// 使用 IIFE 解决 var 的问题
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}

// forEach 和箭头函数
[1, 2, 3].forEach((num, index) => {
  setTimeout(() => console.log(index), 0);
});
```

### 5.4 实际应用

```javascript
// 事件监听器
const buttons = document.querySelectorAll('button');
// ❌ 错误方式
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    console.log('Button ' + i + ' clicked');
  });
}
// ✅ 正确方式
buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    console.log('Button ' + index + ' clicked');
  });
});
```

### 5.5 异步循环处理

```javascript
// 串行处理
async function processSequentially(items) {
  for (const item of items) {
    await processItem(item);
  }
}
// 并行处理
async function processParallel(items) {
  await Promise.all(items.map((item) => processItem(item)));
}
```
