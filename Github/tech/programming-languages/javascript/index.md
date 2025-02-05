# JS 基础

JavaScript 是一种动态弱类型语言，它有这些基本概念：

- 高级语言
- 弱类型（不用手动声明类型）
- 动态类型（一个变量可以转换类型）
- 多范式（FP、OO）
- 基于原型的继承
- 函数也是 Object
- 函数是一等公民
- 高阶函数的概念
- 单线程
- 垃圾回收
- 非阻塞（EventLoop 队列）
- JIT（Just-In-Time）

## 强类型 vs 弱类型

强类型（Strong Typing）不同类型之间的转换必须显式进行，类型检查更严格，不允许隐式类型转换。

相比而言弱类型（Weak Typing）宽松的类型转换，使得开发更加灵活，也更容易上手。

### 弱类型带来的问题

弱类型劣势

- 更容易出现运行时错误
- 代码可维护性降低
- 性能可能受影响
- 难以进行静态分析

```javascript
// 1. 意外的类型转换
function add(a, b) {
  return a + b;
}
add(1, "2") // "12" (可能不是预期结果)

// 2. 比较操作的不确定性
[] == false // true
[0] == false // true
["0"] == false // true

// 3. 运算结果不可预测
[] + {} // "[object Object]"
{} + [] // 0 (在某些环境下)
```

因为这些种种问题，所以现代前端需要 Typescript 以及各类 linter 的支持。

### 最佳实践

```javascript
// 1. 使用严格相等
if (value === undefined) { / ... / }
if (array.length === 0) { / ... / }

// 2. 显式类型转换
function add(a, b) {
  return Number(a) + Number(b);
}

// 3. 类型检查
function processValue(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Expected string');
  }
  return value.toUpperCase();
}

// 4. 使用TypeScript
interface User {
  id: number;
  name: string;
}
function processUser(user: User) {
  // 类型安全的代码
}
```

## 动态类型 vs 静态类型

区别在于能否在程序运行时改变自身结构。

动态类型语言可以在程序运行期间改变其自身结构，包括引入新的方法、变量、结构体等，甚至可以删除已有的一些方法、属性、结构体等。 静态类型语言不支持在运行期间改变自身结构。

### 运行时结构修改

```javascript
// 1. 动态添加方法
class Person {
  constructor(name) {
    this.name = name;
  }
}

// 运行时添加实例方法
Person.prototype.sayHi = function() {
  console.log(Hi, I'm ${this.name});
};

// 运行时添加静态方法
Person.create = function(name) {
  return new Person(name);
};

// 2. 动态修改对象结构
const obj = {};
obj.newProperty = 'dynamic'; // 动态添加属性
delete obj.newProperty; // 动态删除属性

// 3. 动态修改类
class MyClass {}
MyClass.prototype.newMethod = function() {}; // 动态添加方法
```

```java
public class Person {
  private String name;
  // 编译时就必须定义所有方法和属性
  public Person(String name) {
    this.name = name;
  }
  // 不能在运行时添加新方法
  // 不能在运行时修改类结构
}
```

### Monkey Patching

动态类型语言支持运行时修改已有功能：

```javascript
// 1. 修改内置对象方法
const originalSlice = Array.prototype.slice;
Array.prototype.slice = function () {
  console.log('slice called');
  return originalSlice.apply(this, arguments);
};

// 2. 扩展内置对象
String.prototype.reverse = function () {
  return this.split('').reverse().join('');
};

// 3. 替换模块功能
const fs = require('fs');
const originalReadFile = fs.readFile;
fs.readFile = function () {
  console.log('Reading file...');
  return originalReadFile.apply(this, arguments);
};
```

### 元编程能力

动态类型语言通常具有强大的元编程能力：

```javascript
// 1. 属性代理
const handler = {
  get: function(target, prop) {
    console.log(Accessing property: ${prop});
    return target[prop];
  }
};
const proxy = new Proxy({}, handler);

// 2. 动态计算属性名
const propertyName = 'dynamicKey';
const obj = {
  [propertyName]: 'value'
};

// 3. 反射 API
const object = {
  property: 'value'
};
Reflect.defineProperty(object, 'newProp', {
  value: 42,
  writable: true
});
```

### 运行时类型检查

动态类型语言需要在运行时进行类型检查：

```javascript
// 1. 类型守卫
function processValue(value) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  } else if (Array.isArray(value)) {
    return value.length;
  } else if (value instanceof Date) {
    return value.getTime();
  }
  throw new TypeError('Unsupported type');
}

// 2. 动态类型判断
function isCallable(value) {
  return typeof value === 'function';
}

// 3. 运行时类型转换
function ensureString(value) {
  return String(value);
}
```

### 优缺点对比

**动态类型优势：**

- 更灵活的代码结构
- 强大的元编程能力
- 快速原型开发
- 运行时适应性强

**动态类型劣势：**

- 更难进行静态分析
- 运行时错误风险更高
- 重构难度更大
- IDE 支持相对较弱

**最佳实践：**

- 使用 JSDoc 进行类型注释
- 使用 Typescript
- 运行时类型检查

动态类型的这种灵活性使 JavaScript 特别适合：

- 快速原型开发
- 脚本编程
- Web 开发
- 元编程
- 运行时适应性要求高的场景

## 扩展阅读

- [The Weird History of JavaScript](https://www.youtube.com/watch?v=Sh6lK57Cuk4)
- [JavaScript: How It's Made](https://www.youtube.com/watch?v=FSs_JYwnAdI)
- [The JavaScript Survival Guide](https://www.youtube.com/watch?v=9emXNzqCKyg)
- [JavaScript Pro Tips - Code This, NOT That](https://www.youtube.com/watch?v=Mus_vwhTCq0)
- [JavaScript: Understanding the Weird Parts - The First 3.5 Hours](https://www.youtube.com/watch?v=Bv_5Zv5c-Ts)

- [best of js](https://bestofjs.org/)
