# 数据类型

Javascript 的数据类型包含原始类型（Primitive Types）和引用类型（Reference Types）。

## 堆（Heap）与栈（Stack）

在介绍 Javascript 数据类型之前，需要知道 Javascript 的内存管理，这样更利于理解数据排布、事件循环以及 GC 等概念。

### 基本概念

- 栈内存（Stack）
  - 存储原始类型值和引用地址
  - 空间小，存取速度快
  - 按值传递
  - 系统自动分配和释放
- 堆内存（Heap）
  - 存储引用类型的具体内容
  - 空间大，存取速度相对较慢
  - 按引用传递
  - 需要垃圾回收机制处理

### 原始类型存储

```javascript
// 存储在栈内存中
let number = 42;
let string = "hello";
let boolean = true;
let nullValue = null;
let undefinedValue = undefined;
let symbol = Symbol();
let bigInt = 42n;

// 内存示意图
Stack:
|---------------|
| number: 42    |
| string: hello |
| boolean: true |
| ...           |
|---------------|
```

### 引用类型存储

```javascript
// 对象存储
let obj = { name: "John" };
// 数组存储
let arr = [1, 2, 3];
// 函数存储
function fn() {}
// 内存示意图
Stack:                 Heap:
|---------------|      |-----------------|
| obj: <addr1>  | ---> | { name: "John" }|
| arr: <addr2>  | ---> | [1, 2, 3]       |
| fn: <addr3>   | ---> | function(){}    |
|---------------|      |-----------------|
```

### 内存分配过程

- 变量声明和赋值

```javascript
// 原始类型
let a = 1; // 直接在栈中分配空间并存储值

// 引用类型
let obj = {
  // 在堆中分配空间存储对象
  name: 'John',
  age: 30,
}; // 在栈中存储指向堆的引用

// 复制变量
let b = a; // 复制栈中的值
let obj2 = obj; // 复制栈中的引用（指向同一个堆内存）
```

- 函数调用栈

```javascript
function outer() {
  let a = 1;
  function inner() {
    let b = 2;
    return a + b;
  }
  return inner();
}

// 调用栈示意图
Call Stack:
|---------------|
| inner()       |
| - b: 2        |
|---------------|
| outer()       |
| - a: 1        |
|---------------|
| global scope  |
|---------------|
```

### 内存回收机制

- 栈内存回收

```javascript
function stackMemory() {
  let x = 10;
  let y = 20;
} // 函数执行完毕，栈帧自动释放

// 栈内存生命周期
function process() {
  let temp = 100; // 分配栈内存
  // 使用temp
} // 函数返回时自动回收栈内存
```

- 堆内存回收

```javascript
// 垃圾回收
let obj = { data: 'some data' };
obj = null; // 原对象可能被回收

// 循环引用
function createCycle() {
  let obj1 = {};
  let obj2 = {};
  obj1.ref = obj2;
  obj2.ref = obj1;
  return null;
} // 现代GC可以处理循环引用
```

## 原始数据类型（Primitive Types）

- string
- number
- bigint
- boolean
- undefined
- symbol
- null

```javascript
let str = 'hello'; // string（字符串）
let num = 42; // number（数字）
let bigInt = 9007199254740991n; // bigint（大整数）
let bool = true; // boolean（布尔值）
let undef = undefined; // undefined（未定义）
let sym = Symbol('desc'); // symbol（符号）
let empty = null; // null（空值）
```

原始数据类型有这些特点：

- 直接存储：原始类型直接存储在栈内存中
- 不可变性：原始值一旦创建就不能被修改
- 自动包装：Javascript 会自动将原始类型包装成对象，通过原型链复用对象方法

```javascript
// JavaScript 会自动将原始类型包装成对象
let str = "hello";
console.log(str.length); // 5
console.log(str.toUpperCase()); // "HELLO"
// 背后的实现机制
// JavaScript 自动做了这些事：
let str = "hello";
// 1. 创建临时包装对象
// 2. 调用方法
// 3. 销毁临时对象
```

## 引用数据类型（Reference Types）

Javascript 提供了非常多的引用数据类型，最为常用的几个：

- Object
- Array
- Function

## 声明（Declarations）

声明关键字：const let var
