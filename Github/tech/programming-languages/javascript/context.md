# this 与执行上下文

## 1. 基本概念

### 1.1 什么是执行上下文

执行上下文是 JavaScript 代码执行的环境，包含了变量、函数声明、作用域链、this 等信息。

组成：

```shell
ExecutionContext = {
    // 变量对象/活动对象
    VO/AO: {
        // 变量声明、函数声明、参数
        arguments: {},
        variables: [],
        functions: []
    },
    // 作用域链
    ScopeChain: [],
    // this 绑定
    ThisBinding: <value>
}
```

```javascript
var a = 1;
function foo() {
    var b = 2;
    console.log(a); // 可以访问全局变量
}

// 全局执行上下文
GlobalExecutionContext = {
    VO: {
        a: 1,
        foo: <function>
    }
}

// foo 的执行上下文
FooExecutionContext = {
    AO: {
        b: 2,
        arguments: {}
    },
    ScopeChain: [AO, GlobalVO],
    this: window
}
```

### 1.2 执行上下文的类型

全局执行上下文

```javascript
// 全局执行上下文
var globalVar = 'global';
var globalFunction = function () {};

// 浏览器中
window.globalVar; // 'global'
window.globalFunction; // function
```

函数执行上下文

```javascript
function foo(a) {
  var b = 2;
  function bar() {}

  // foo 的执行上下文
  // {
  //     AO: {
  //         a: <value>,
  //         b: 2,
  //         bar: <function>
  //     }
  // }
}

foo(1);
```

eval 执行上下文

```javascript
eval('var x = 10'); // 不推荐使用

// eval 的执行上下文
// {
//     AO: {
//         x: 10
//     }
// }
```

### 1.3 执行上下文的生命周期

创建阶段

```javascript
function createContext(fn, args) {
    // 1. 创建变量对象
    const VO = {
        arguments: createArgumentsObject(args),
        // 函数声明
        // 变量声明
    };

    // 2. 建立作用域链
    const scopeChain = [VO].concat(fn.[[Scope]]);

    // 3. 确定 this 值
    const thisBinding = determinethis();

    return {
        VO,
        scopeChain,
        thisBinding
    };
}
```

执行阶段

```javascript
function executeContext(context) {
  // 1. 变量赋值
  var a = 1;

  // 2. 函数引用
  function foo() {}

  // 3. 代码执行
  foo();

  // 4. 返回值处理
  return result;
}

// 示例
function example(a) {
  var b = 2;
  var c = a + b;
  return c;
}

// 执行过程
// 1. 创建阶段
// VO = {a: undefined, b: undefined}
// 2. 执行阶段
// AO = {a: 1, b: 2, c: 3}
```

回收阶段

```javascript
// 1. 执行完成
function cleanup() {
  // 函数执行完成
  return;
}

// 2. 上下文弹出栈
ECStack.pop();

// 3. 垃圾回收
// 示例：闭包情况
function outer() {
  var a = 1;
  return function inner() {
    console.log(a);
  };
}

const innerFn = outer();
// outer 的执行上下文被销毁
// 但 a 因为闭包被保留
```

1. 创建阶段：创建变量对象、建立作用域链、确定 this 值、变量和函数提升
2. 执行阶段：变量赋值、函数引用、代码执行、值的修改
3. 回收阶段：执行完成、上下文弹出、垃圾回收、闭包处理

## 2. 调用栈

### 2.1 调用栈的概念

调用栈是一种 LIFO（后进先出）的数据结构，用于跟踪程序中函数调用的执行位置。

```javascript
// 调用栈示例
function main() {
  console.log('main start');
  foo();
  console.log('main end');
}

function foo() {
  console.log('foo start');
  bar();
  console.log('foo end');
}

function bar() {
  console.log('bar');
}

main();

// 调用栈变化过程：
// 1. [main]
// 2. [main, foo]
// 3. [main, foo, bar]
// 4. [main, foo]
// 5. [main]
// 6. []
```

### 2.2 调用栈的工作原理

```javascript
// 模拟调用栈的工作原理
class CallStack {
  constructor() {
    this.stack = [];
  }

  push(frame) {
    this.stack.push(frame);
  }

  pop() {
    return this.stack.pop();
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }
}

// 执行上下文示例
function executeFunction(functionName, context) {
  // 1. 创建执行上下文
  const executionContext = {
    functionName,
    variables: {},
    scopeChain: [],
    this: context,
  };

  // 2. 压入调用栈
  callStack.push(executionContext);

  // 3. 执行函数
  try {
    // 函数执行
  } finally {
    // 4. 执行完成后弹出
    callStack.pop();
  }
}
```

### 2.3 调用栈与函数执行

```javascript
// 1. 同步函数调用
function multiply(a, b) {
  return a * b;
}

function square(n) {
  return multiply(n, n);
}

function printSquare(n) {
  var squared = square(n);
  console.log(squared);
}

printSquare(4);
// 调用栈：
// [printSquare]
// [printSquare, square]
// [printSquare, square, multiply]

// 2. 异步函数调用
async function asyncOperation() {
  console.log('start');
  await delay(1000);
  console.log('end');
}

// 异步操作会清空调用栈
asyncOperation();
```

### 2.4 栈溢出问题

```javascript
// 1. 递归导致栈溢出
function recursion(n) {
  return recursion(n + 1); // 无限递归
}

// 2. 防止栈溢出的方法
// 尾递归优化
function factorial(n, accumulator = 1) {
  if (n <= 1) return accumulator;
  return factorial(n - 1, n * accumulator);
}

// 转换为循环
function factorialLoop(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// 使用 Promise 链
function asyncRecursion(n) {
  return Promise.resolve().then(() => {
    if (n <= 0) return;
    return asyncRecursion(n - 1);
  });
}
```

### 2.5 调试与调用栈

```javascript
// 1. 错误堆栈跟踪
function throwError() {
  throw new Error('Something went wrong');
}

function intermediate() {
  throwError();
}

function main() {
  try {
    intermediate();
  } catch (error) {
    console.log(error.stack);
  }
}

// 2. 调试工具使用
function debugStack() {
  console.trace('Trace stack'); // 打印当前调用栈
  debugger; // 设置断点
}

// 3. 性能分析
console.time('operation');
heavyOperation();
console.timeEnd('operation');
```

调试技巧

1. Chrome DevTools

```javascript
// 1. 设置断点
function debugMe() {
  let a = 1;
  debugger; // 代码断点
  let b = 2;
}

// 2. 查看调用栈
console.trace();

// 3. 异步调试
async function asyncDebug() {
  await fetch('api/data');
  debugger;
}
```

## 3. 变量对象与活动对象

### 3.1 变量对象（VO）

全局上下文中的变量对象

```javascript
// 全局变量对象就是全局对象(window/global)
var globalVar = 'global';
function globalFunc() {}

console.log(window.globalVar); // 'global'
console.log(window.globalFunc); // function

// 全局上下文的变量对象
GlobalVO = {
    // 内置属性
    Math: <...>,
    String: <...>,
    document: <...>,
    window: global,
    // 自定义属性
    globalVar: 'global',
    globalFunc: <reference to function>
}
```

函数上下文中的变量对象

```javascript
function foo(a) {
    var b = 2;
    function c() {}
    var d = function() {};
}

foo(1);

// foo 函数的变量对象
FunctionVO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: undefined,  // 变量声明，初始化前
    c: <reference to function>,  // 函数声明
    d: undefined   // 变量声明，函数表达式
}
```

### 3.2 活动对象（AO）

活动对象的创建过程

```javascript
function createAO(func, args) {
  // 1. 创建 AO
  const AO = {
    arguments: createArguments(args),
  };

  // 2. 函数形参
  func.params.forEach((param, index) => {
    AO[param] = args[index];
  });

  // 3. 函数声明
  getFunctionDeclarations(func).forEach((fn) => {
    AO[fn.name] = fn;
  });

  // 4. 变量声明
  getVariableDeclarations(func).forEach((variable) => {
    if (!(variable in AO)) {
      AO[variable] = undefined;
    }
  });

  return AO;
}
```

变量提升

```javascript
console.log(a); // undefined
var a = 2;

// 等价于
var a; // 提升声明
console.log(a); // undefined
a = 2; // 赋值不提升

// 示例2：let/const 不会提升
console.log(b); // ReferenceError
let b = 2;
```

函数提升

```javascript
// 函数声明提升
foo(); // "foo"
function foo() {
    console.log("foo");
}

// 函数表达式不提升
bar(); // TypeError
var bar = function() {
    console.log("bar");
};

// 函数声明vs变量声明优先级
console.log(f); // function f(){}
var f = 'f';
function f() {}
```

### 3.3 作用域链

作用域链的形成

```javascript
var global = 'global';

function outer() {
  var outer_var = 'outer';

  function inner() {
    var inner_var = 'inner';
    console.log(global, outer_var, inner_var);
  }

  return inner;
}

// 作用域链
// inner.[[Scope]] = [
//     inner AO,
//     outer AO,
//     Global VO
// ]

const innerFunc = outer();
innerFunc();
```

标识符解析过程

```javascript
var value = 'global';

function foo() {
  console.log(value); // 'global'
}

function bar() {
  var value = 'local';
  foo(); // 输出 'global'
}

bar();

// 闭包中的标识符解析
function createCounter() {
  var count = 0;
  return {
    increment: function () {
      return ++count;
    },
    getCount: function () {
      return count;
    },
  };
}
```

作用域优化

```javascript
// 1. 避免全局查找
function slowFunc() {
  for (let i = 0; i < 100000; i++) {
    window.localStorage.getItem('key'); // 每次都要查找全局
  }
}

function fastFunc() {
  const localStorage = window.localStorage; // 局部变量缓存
  for (let i = 0; i < 100000; i++) {
    localStorage.getItem('key');
  }
}

// 2. 减少作用域链查找
function optimizedFunc() {
  const doc = document; // 缓存全局对象
  const len = items.length; // 缓存长度

  for (let i = 0; i < len; i++) {
    doc.querySelector(/* ... */);
  }
}
```

## 4. this 关键字

### 4.1 this 的概念

this 是执行上下文中的一个属性，指向当前函数执行时的上下文对象。

```javascript
// this 在不同场景下的值
console.log(this); // window/global (非严格模式)

function foo() {
  console.log(this);
}

foo(); // window/global (非严格模式)
// undefined (严格模式)

const obj = {
  method: function () {
    console.log(this); // obj
  },
};
```

### 4.2 this 的绑定规则

默认绑定

```javascript
// 非严格模式
function showThis() {
  console.log(this); // window/global
}

// 严格模式
('use strict');
function strictShowThis() {
  console.log(this); // undefined
}

// 默认绑定的独立函数调用
var value = 1;
function getValue() {
  console.log(this.value);
}
getValue(); // 1 (非严格模式)
```

隐式绑定

```javascript
// 对象方法调用
const obj = {
  value: 1,
  getValue() {
    console.log(this.value);
  },
};
obj.getValue(); // 1

// 隐式丢失
const getValue = obj.getValue;
getValue(); // undefined (this 指向 window)

// 回调函数中的 this
const obj2 = {
  value: 2,
  doSomething() {
    setTimeout(function () {
      console.log(this.value); // undefined
    }, 1000);
  },
};
```

显式绑定

```javascript
// call
function greet() {
  console.log(`Hello, ${this.name}`);
}
const person = { name: 'John' };
greet.call(person); // "Hello, John"

// apply
const numbers = [5, 6, 2, 3, 7];
const max = Math.max.apply(null, numbers);

// bind
const boundGreet = greet.bind(person);
boundGreet(); // "Hello, John"

// 实现简单的 bind
Function.prototype.myBind = function (context, ...args) {
  const fn = this;
  return function (...innerArgs) {
    return fn.apply(context, [...args, ...innerArgs]);
  };
};
```

new 绑定

```javascript
// 构造函数
function Person(name) {
  this.name = name;
  console.log(this); // Person { name: ... }
}

const person = new Person('John');

// new 操作符的过程
function mockNew(Constructor, ...args) {
  // 1. 创建空对象
  const obj = {};

  // 2. 设置原型
  Object.setPrototypeOf(obj, Constructor.prototype);

  // 3. 执行构造函数
  const result = Constructor.apply(obj, args);

  // 4. 返回对象
  return result instanceof Object ? result : obj;
}
```

### 4.3 绑定优先级

new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定

```javascript

```

### 4.4 特殊情况处理

1. 箭头函数

```javascript
const obj = {
  value: 1,
  getValue: () => {
    console.log(this.value);
  },
};
obj.getValue(); // undefined

// 箭头函数继承外层this
const obj2 = {
  value: 2,
  delayed: function () {
    setTimeout(() => {
      console.log(this.value);
    }, 1000);
  },
};
obj2.delayed(); // 2
```

2. 事件处理器

```javascript
// DOM 事件
button.addEventListener('click', function () {
  console.log(this); // button 元素
});

// 箭头函数事件处理器
button.addEventListener('click', () => {
  console.log(this); // window/global
});
```

3. 类中的 this

```javascript
class Example {
  constructor() {
    this.value = 42;
  }

  regularMethod() {
    console.log(this.value);
  }

  arrowMethod = () => {
    console.log(this.value);
  };
}

const example = new Example();
const { regularMethod, arrowMethod } = example;

regularMethod(); // undefined
arrowMethod(); // 42
```

4. 最佳实践

```javascript
// 1. 优先使用箭头函数处理回调
class Handler {
  constructor() {
    this.value = 42;
  }

  handle = () => {
    console.log(this.value);
  };
}

// 2. 显式绑定优于隐式绑定
function process() {
  // ...
}
process.call(context);

// 3. 避免 this 逃逸
const safe = {
  value: 123,
  getValue() {
    const self = this;
    return function () {
      return self.value;
    };
  },
};
```

## 5. 箭头函数的 this

### 5.1 箭头函数特性

```javascript
// 1. 基本形式
const simple = () => 42;
const withParam = (x) => x * 2;
const multiParams = (x, y) => x + y;
const withBody = () => {
  const result = 42;
  return result;
};

// 2. 返回对象字面量
const returnObj = () => ({ key: 'value' });

// 3. 没有自己的 this、arguments、super、new.target
const arrow = () => {
  console.log(this);
  console.log(arguments); // ReferenceError
};

// 普通函数
function regular() {
    this.value = 42;
}

// 箭头函数
const arrow = () => {
    this.value = 42;
};

// 构造函数
const instance = new regular(); // OK
const fail = new arrow(); // TypeError
```

### 5.2 词法作用域下的 this

this 继承

```javascript
const obj = {
  value: 42,
  // 方法中的箭头函数
  delayed: function () {
    setTimeout(() => {
      console.log(this.value); // 42
    }, 1000);
  },

  // 直接使用箭头函数作为方法
  immediate: () => {
    console.log(this.value); // undefined
  },
};

// 类中的箭头函数
class Example {
  constructor() {
    this.value = 42;
  }

  // 箭头函数属性
  arrow = () => {
    console.log(this.value); // 42
  };

  // 普通方法
  regular() {
    console.log(this.value);
  }
}
```

嵌套箭头函数

```javascript
const nested = {
  value: 42,
  outer: function () {
    const inner = () => {
      const deepest = () => {
        console.log(this.value); // 42
      };
      deepest();
    };
    inner();
  },
};
```

### 5.3 常见使用场景

1. 回调函数

```javascript
// 数组方法
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2);

// Promise 链
fetchData()
  .then((data) => processData(data))
  .then((result) => console.log(result))
  .catch((error) => handleError(error));

// 事件处理
class Handler {
  constructor() {
    this.value = 42;
    this.element = document.getElementById('button');
    this.element.addEventListener('click', () => {
      this.handleClick();
    });
  }

  handleClick() {
    console.log(this.value);
  }
}
```

2. 方法简写

```javascript
// React 组件
class Component extends React.Component {
  state = {
    count: 0,
  };

  // 类属性作为箭头函数
  increment = () => {
    this.setState((state) => ({
      count: state.count + 1,
    }));
  };

  render() {
    return <button onClick={this.increment}>Count: {this.state.count}</button>;
  }
}
```

3. 函数式编程

```javascript
// 函数组合
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((y, f) => f(y), x);

// 柯里化
const curry =
  (fn) =>
  (...args) =>
    args.length >= fn.length
      ? fn(...args)
      : (...more) => curry(fn)(...args, ...more);
```

### 5.4 注意事项和陷阱

1. 方法定义

```javascript
// 错误用法
const obj = {
    value: 42,
    method: () => {
        console.log(this.value); // undefined
    }
};

// 正确用法
const obj = {
    value: 42,
    method() {
        console.log(this.value); // 42
    }
};
```

2. 原型方法

```javascript
// 错误用法
function Constructor() {
  this.value = 42;
}
Constructor.prototype.method = () => {
  console.log(this.value); // undefined
};

// 正确用法
Constructor.prototype.method = function () {
  console.log(this.value); // 42
};
```

3. 动态上下文

```javascript
// 事件处理器
class Wrong {
  constructor() {
    this.button = document.getElementById('button');
    // 错误：丢失动态this
    this.button.addEventListener('click', this.handleClick);
  }

  handleClick = () => {
    console.log(this);
  };
}

// DOM 方法
const element = {
  value: 42,
  // 错误：需要动态this
  click: () => {
    console.log(this === window); // true
  },
};
```

4. 性能考虑

```javascript
class Performance {
  constructor() {
    // 每个实例都创建新的函数
    this.method = () => {
      console.log(this.value);
    };
  }

  // 更好：所有实例共享同一个方法
  sharedMethod() {
    console.log(this.value);
  }
}
```

### 5.5 最佳实践

```javascript
// 1. 回调函数中使用箭头函数
setTimeout(() => this.update(), 1000);

// 2. 类方法中使用普通函数
class Example {
  method() {}
}

// 3. 需要动态this时使用普通函数
element.addEventListener('click', function () {
  console.log(this); // element
});
```

## 6. 显示绑定方式

### 6.1 call 方法

基本用法

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: 'John' };
greet.call(person, 'Hello'); // "Hello, John"

// 多参数调用
function introduce(greeting, profession) {
  console.log(`${greeting}, I'm ${this.name}, a ${profession}`);
}

introduce.call(person, 'Hi', 'developer');
```

实现原理

```javascript
Function.prototype.myCall = function (context, ...args) {
  // 处理 null/undefined 情况
  context = context || window;

  // 创建唯一属性，避免属性冲突
  const key = Symbol();

  // 将函数设为对象的属性
  context[key] = this;

  // 执行函数
  const result = context[key](...args);

  // 删除临时属性
  delete context[key];

  return result;
};
```

### 6.2 apply 方法

基本用法

```javascript
// 数组参数
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

console.log(sum.apply(null, [1, 2, 3, 4])); // 10

// 实用场景
const numbers = [5, 6, 2, 3, 7];
const max = Math.max.apply(null, numbers);
const min = Math.min.apply(null, numbers);
```

实现原理

```javascript
Function.prototype.myApply = function (context, args = []) {
  context = context || window;
  const key = Symbol();

  context[key] = this;
  const result = context[key](...args);
  delete context[key];

  return result;
};
```

### 6.3 bind 方法

基本用法

```javascript
function greet() {
  console.log(`Hello, ${this.name}`);
}

const person = { name: 'John' };
const boundGreet = greet.bind(person);
boundGreet(); // "Hello, John"

// 参数绑定
function multiply(a, b) {
  return a * b;
}

const multiplyByTwo = multiply.bind(null, 2);
console.log(multiplyByTwo(4)); // 8
```

实现原理

```javascript
Function.prototype.myBind = function (context, ...args) {
  const originalFunc = this;

  return function (...innerArgs) {
    // 处理 new 调用的情况
    if (this instanceof originalFunc) {
      return new originalFunc(...args, ...innerArgs);
    }

    return originalFunc.apply(context, [...args, ...innerArgs]);
  };
};
```

### 6.4 实现原理

完整的 bind 实现

```javascript
Function.prototype.customBind = function (context, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }

  const originalFunc = this;
  const bound = function (...innerArgs) {
    // 处理构造函数情况
    if (this instanceof bound) {
      // 创建新的对象，原型指向原函数的原型
      const result = originalFunc.apply(this, [...args, ...innerArgs]);
      // 如果构造函数返回对象，使用该对象
      return typeof result === 'object' && result !== null ? result : this;
    }

    return originalFunc.apply(context, [...args, ...innerArgs]);
  };

  // 维护原型链
  bound.prototype = Object.create(originalFunc.prototype);
  return bound;
};
```

考虑边界情况

```javascript
// 1. null/undefined 处理
function safeBind(fn, context, ...args) {
  context = context ?? window;
  return fn.bind(context, ...args);
}

// 2. 类型检查
function typeCheckBind(fn, context) {
  if (typeof fn !== 'function') {
    throw new TypeError('First argument must be a function');
  }
  return fn.bind(context);
}
```

### 6.5 使用场景

1. 函数借用

```javascript
// 数组方法借用
function arrayLike() {
  const args = Array.prototype.slice.call(arguments);
  return Array.prototype.map.call(args, (x) => x * 2);
}

// 对象方法借用
const numbers = {
  numbers: [1, 2, 3],
  sum() {
    return this.numbers.reduce((a, b) => a + b);
  },
};

const temp = { numbers: [4, 5, 6] };
console.log(numbers.sum.call(temp)); // 15
```

2. 部分应用

```javascript
// 函数柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, [...args, ...moreArgs]);
    };
  };
}

// 示例
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
```

3. 上下文绑定

```javascript
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log(this.state);
  }
}

// React 类组件中
class ReactComponent extends React.Component {
  state = { count: 0 };

  increment = () => {
    this.setState((state) => ({
      count: state.count + 1,
    }));
  };

  render() {
    return <button onClick={this.increment}>+</button>;
  }
}
```

## 7. this 绑定实际应用

### 7.1 对象方法中的 this

基本对象方法

```javascript
const user = {
  name: 'John',
  age: 30,

  sayHi() {
    console.log(`Hi, I'm ${this.name}`);
  },

  updateInfo(newName, newAge) {
    this.name = newName;
    this.age = newAge;
    return this;
  },

  // 方法解构时的问题
  getName() {
    return this.name;
  },
};

// 正确调用
user.sayHi(); // "Hi, I'm John"

// 解构后调用的问题
const { getName } = user;
getName(); // TypeError: Cannot read property 'name' of undefined
```

解决方法绑定问题

```javascript
const user = {
    name: 'John',

    // 1. 使用箭头函数
    greet: () => {
        console.log(this.name); // 注意：这里的this不是user
    },

    // 2. 在构造函数中绑定
    constructor() {
        this.greet = this.greet.bind(this);
    },

    // 3. 使用类字段语法
    greet = () => {
        console.log(this.name);
    }
};
```

### 7.2 回调函数中的 this

异步回调

```javascript
class AsyncHandler {
  constructor() {
    this.data = [];
  }

  // 问题写法
  fetchData() {
    fetch('/api/data').then(function (response) {
      this.data = response; // this 错误
    });
  }

  // 解决方案1：箭头函数
  fetchDataArrow() {
    fetch('/api/data').then((response) => {
      this.data = response;
    });
  }

  // 解决方案2：绑定this
  fetchDataBind() {
    fetch('/api/data').then(
      function (response) {
        this.data = response;
      }.bind(this),
    );
  }
}
```

数组方法回调

```javascript
class TaskList {
  constructor() {
    this.tasks = ['Task 1', 'Task 2'];
  }

  // 使用箭头函数
  processTasksArrow() {
    return this.tasks.map((task) => {
      return `${task} - Processed`;
    });
  }

  // 使用 function 关键字 + bind
  processTasksBind() {
    return this.tasks.map(
      function (task) {
        return `${task} - ${this.getStatus()}`;
      }.bind(this),
    );
  }

  getStatus() {
    return 'Completed';
  }
}
```

### 7.3 事件处理器中的 this

DOM 事件

```javascript
class DOMHandler {
  constructor() {
    this.button = document.querySelector('#myButton');
    this.count = 0;

    // 1. bind 方式
    this.button.addEventListener('click', this.handleClick.bind(this));

    // 2. 箭头函数方式
    this.button.addEventListener('click', () => this.handleClick());

    // 3. 类字段方式
    this.handleClick = () => {
      this.count++;
      console.log(this.count);
    };
  }

  // 普通方法
  handleClick() {
    this.count++;
    console.log(this.count);
  }
}
```

自定义事件

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback.call(this, data);
      });
    }
  }
}
```

### 7.4 class 中的 this

构造函数和方法

```javascript
class Example {
  constructor() {
    this.value = 42;
    // 构造函数中绑定方法
    this.handleClick = this.handleClick.bind(this);
  }

  // 实例方法
  getValue() {
    return this.value;
  }

  // 类字段语法
  arrowMethod = () => {
    return this.value;
  };

  // 静态方法
  static staticMethod() {
    return this; // 指向类本身
  }
}
```

继承中的 this

```javascript
class Parent {
  constructor() {
    this.name = 'parent';
  }

  getName() {
    return this.name;
  }
}

class Child extends Parent {
  constructor() {
    super(); // 必须先调用 super()
    this.name = 'child';
  }

  getParentName() {
    return super.getName();
  }
}
```

## 8. 执行上下文与闭包

### 8.1 闭包与执行上下文的关系

基本概念

```javascript
function createCounter() {
  let count = 0; // 创建私有变量

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

执行上下文栈分析

```javascript
// 执行上下文栈的变化
function outer() {
  const x = 1;

  function middle() {
    const y = 2;

    function inner() {
      const z = 3;
      console.log(x, y, z);
    }

    return inner;
  }

  return middle();
}

const closure = outer();
closure(); // 1, 2, 3

// 执行上下文栈变化过程：
// 1. Global EC
// 2. outer EC -> Global EC
// 3. middle EC -> outer EC -> Global EC
// 4. inner EC -> middle EC -> outer EC -> Global EC
```

### 8.2 作用域链与闭包

作用域链形成

```javascript
function createScope() {
  const outerVar = 'outer';

  function middle() {
    const middleVar = 'middle';

    function inner() {
      const innerVar = 'inner';
      console.log(outerVar, middleVar, innerVar);
    }

    return inner;
  }

  return middle();
}

// 作用域链示例
const scopedFunc = createScope();
// scopedFunc 的作用域链：
// inner -> middle -> createScope -> Global
```

闭包访问规则

```javascript
function makeAdder(x) {
  return function (y) {
    return x + y; // 访问外部作用域的 x
  };
}

const add5 = makeAdder(5);
console.log(add5(3)); // 8

// 多层闭包
function multiply(x) {
  return function (y) {
    return function (z) {
      return x * y * z;
    };
  };
}

console.log(multiply(2)(3)(4)); // 24
```

### 8.3 常见闭包陷阱

1. 循环中的闭包

```javascript
// 问题示例
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 3, 3, 3
  }, 1000);
}

// 解决方案1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1, 2
  }, 1000);
}

// 解决方案2：IIFE
for (var i = 0; i < 3; i++) {
  (function (index) {
    setTimeout(() => {
      console.log(index); // 0, 1, 2
    }, 1000);
  })(i);
}
```

2. this 绑定问题

```javascript
const obj = {
  value: 1,
  getValue: function () {
    return function () {
      return this.value;
    };
  },
};

console.log(obj.getValue()()); // undefined

// 解决方案1：箭头函数
const obj2 = {
  value: 1,
  getValue: function () {
    return () => {
      return this.value;
    };
  },
};

// 解决方案2：保存 this
const obj3 = {
  value: 1,
  getValue: function () {
    const self = this;
    return function () {
      return self.value;
    };
  },
};
```

### 8.4 内存管理考虑

1. 内存泄漏问题

```javascript
// 潜在的内存泄漏
function createLeak() {
  const heavyObject = new Array(1000000);

  return function () {
    console.log(heavyObject.length);
  };
}

const leak = createLeak(); // heavyObject 一直被引用

// 解决方案：及时清理
function avoidLeak() {
  let heavyObject = new Array(1000000);
  const length = heavyObject.length;
  heavyObject = null; // 释放引用

  return function () {
    console.log(length);
  };
}
```

2. 闭包清理

```javascript
class ResourceManager {
  constructor() {
    this.resources = new Map();
  }

  // 创建资源
  createResource(key) {
    const resource = {
      data: new Array(1000000),
      timestamp: Date.now(),
    };

    this.resources.set(key, resource);

    return () => {
      const res = this.resources.get(key);
      if (res) {
        return res.data;
      }
    };
  }

  // 清理资源
  cleanup() {
    const now = Date.now();
    for (const [key, resource] of this.resources.entries()) {
      if (now - resource.timestamp > 3600000) {
        // 1小时
        this.resources.delete(key);
      }
    }
  }
}
```

3. 性能优化

```javascript
// 1. 缓存闭包结果
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

// 2. 使用 WeakMap 进行内存优化
const privateData = new WeakMap();

class PrivateClass {
  constructor() {
    privateData.set(this, {
      count: 0,
    });
  }

  increment() {
    const data = privateData.get(this);
    data.count++;
  }
}
```

## 9. 高级特性

### 9.1 尾调用优化

基本概念

尾调用是指函数的最后一步是调用另一个函数。

```javascript
// 尾调用示例

// 未优化的递归：每次调用都会创建新的栈帧
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1); // 不是尾调用
}

// 调用 factorial(5) 的栈帧情况:
// factorial(5) - 等待 factorial(4) 返回
// factorial(4) - 等待 factorial(3) 返回
// factorial(3) - 等待 factorial(2) 返回
// factorial(2) - 等待 factorial(1) 返回
// factorial(1) - 返回 1

// 优化后的尾调用

// 1. 使用累加器参数
function factorialTCO(n, accumulator = 1) {
  if (n === 1) return accumulator;
  return factorialTCO(n - 1, n * accumulator);
}

// 2. 使用循环替代递归
function factorialLoop(n) {
  let result = 1;
  while (n > 1) {
    result *= n;
    n--;
  }
  return result;
}
```

实现优化

```javascript
// 蹦床函数实现：把递归函数改造成返回新函数的形式，然后用一个循环不断执行这些函数，直到返回最终结果。
function trampoline(fn) {
  return function (...args) {
    let result = fn(...args);
    while (typeof result === 'function') {
      result = result();
    }
    return result;
  };
}

// 优化递归
function sumRecursive(n, sum = 0) {
  if (n === 0) return sum;
  return () => sumRecursive(n - 1, sum + n);
}

const sum = trampoline(sumRecursive);
console.log(sum(1000000)); // 不会栈溢出
```

### 9.2 异步上下文

Promise 执行上下文

```javascript
async function asyncOperation() {
  const context = {
    data: null,
    error: null,
  };

  try {
    context.data = await fetch('/api/data');
  } catch (error) {
    context.error = error;
  }

  return context;
}

// 异步上下文管理
class AsyncContextManager {
  constructor() {
    this.contexts = new Map();
  }

  async run(key, operation) {
    try {
      const result = await operation();
      this.contexts.set(key, result);
      return result;
    } catch (error) {
      this.contexts.set(key, { error });
      throw error;
    }
  }
}
```

异步迭代器

```javascript
async function* asyncGenerator() {
  let i = 0;
  while (i < 3) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield i++;
  }
}

// 使用 for await...of
async function useGenerator() {
  for await (const num of asyncGenerator()) {
    console.log(num);
  }
}
```

### 9.3 模块作用域

ES Modules

```javascript
// module.js
let privateVar = 'private';
export const publicVar = 'public';

export function publicFunction() {
  console.log(privateVar);
}

// 动态导入
async function loadModule() {
  const module = await import('./module.js');
  return module;
}
```

模块作用域隔离

```javascript
// moduleA.js
export let counter = 0;
export function increment() {
    counter++;
}

// moduleB.js
import { counter, increment } from './moduleA.js';
console.log(counter); // 0
increment();
console.log(counter); // 1

// 不同模块实例
import * as moduleA1 from './moduleA.js';
import * as moduleA2 from './moduleA.js';
// moduleA1 === moduleA2 // true，模块是单例
```

### 9.4 Web Worker 中的上下文

Worker 创建与通信

Web Worker 线程中的执行环境，它与主线程的执行环境是隔离的。

```javascript
// 主线程
const worker = new Worker('worker.js');

worker.postMessage({ type: 'INIT', payload: { data: 'initial' } });

worker.onmessage = function (e) {
  console.log('Received:', e.data);
};

// worker.js
self.onmessage = function (e) {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      // 处理初始化
      self.postMessage({ type: 'READY' });
      break;
  }
};
```

SharedWorker 上下文

SharedWorker 是一种特殊的 Web Worker，可以被多个浏览器窗口、iframe 或其他 Worker 共享。

```javascript
// 主线程
const sharedWorker = new SharedWorker('shared.js');
sharedWorker.port.start();

sharedWorker.port.onmessage = function (e) {
  console.log('Shared worker message:', e.data);
};

// shared.js
const connections = new Set();

self.onconnect = function (e) {
  const port = e.ports[0];
  connections.add(port);

  port.onmessage = function (e) {
    // 广播到所有连接
    connections.forEach((connection) => {
      connection.postMessage(e.data);
    });
  };
};
```

### 9.5 严格模式的影响

语法限制

```javascript
'use strict';

// 1. 变量必须声明
x = 1; // ReferenceError

// 2. 禁止删除变量
let y = 2;
delete y; // SyntaxError

// 3. 对象属性重复
const obj = {
    prop: 1,
    prop: 2 // SyntaxError in strict mode
};

// 4. 函数参数重名
function duplicate(a, a) { } // SyntaxError in strict mode
```

this 绑定变化

```javascript
'use strict';

function nonStrict() {
  console.log(this); // window
}

function strict() {
  'use strict';
  console.log(this); // undefined
}

// 构造函数
function Constructor() {
  'use strict';
  console.log(this); // 如果作为构造函数调用，this 指向新创建的对象
}
```

## 10. 扩展阅读

- ECMAScript 规范解读
- V8 引擎实现
- 相关提案与新特性
- 进阶学习资源
- 工具推荐
