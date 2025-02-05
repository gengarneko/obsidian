# 事件循环

## 1. 基本概念

什么是进程：

1. 每个程序运行都需要有自己的一个块内存，这块内存就可以理解为进程。
2. 每个应用至少有一个进程，进程之间相互独立，即使要通信，也需要双方同意。

什么是线程：

1. 一个进程可以有多个线程，但是至少得有一个线程。
2. 进程开启后会自动创建一个线程来运行代码，该线程称为主线程。
3. 主线程忙不过来了，主线程就会启动更多的线程来处理。

- 浏览器进程
  - 主要负责页面的显示、用户交互、子进程管理等。浏览器进程内部会启动多个线程处理不同的任务。
- 网络进程
  - 负责加载网络资源。网络进程内部会启动多个线程来处理不同的网络任务。
- 渲染进程
  - 渲染进程启动后，会开启一个渲染主线程，主线程负责执行HTML、CSS、JS代码。
  - 默认情况下，浏览器会为每个标签页开启一个新的渲染进程，以保证不同的标签页面之间不相互影响
  - (后面可能会改变这种模式，如果浏览器窗口开的特别多，就非常消耗内存)

### 1.1 什么是事件循环

事件循环（Event Loop）是 JavaScript 实现异步编程的核心机制。它负责执行代码、收集和处理事件以及执行队列中的子任务。

JS 代码的执行流程：

1. 先执行所有同步任务，碰到异步任务放到任务队列中
2. 同步任务执行完毕，开始执行当前所有的异步任务
3. 先执行任务队列里面所有的微任务
4. 然后执行一个宏任务
5. 然后再执行所有的微任务
6. 再执行一个宏任务，再执行所有的微任务·······依次类推到执行结束。

事件循环的基本工作流程：

1. 执行同步代码（这些代码在主线程上运行）
2. 检查事件队列是否有任务
3. 如果有，则取出一个任务并执行
4. 重复步骤 2-3

```javascript
console.log("1"); // 同步任务

setTimeout(() => {
  console.log("2"); // 异步任务
}, 0);

Promise.resolve().then(() => {
  console.log("3"); // 微任务
});

console.log("4"); // 同步任务
// 输出顺序：1, 4, 3, 2
```

### 1.2 JavaScript 的单线程特性

JavaScript 是单线程语言，这意味着：

- 同一时间只能执行一个任务
- 所有任务需要排队执行
- 前一个任务结束，才能执行后一个任务

这种特性的原因：

- 避免 DOM 操作的冲突
- 简化编程模型
- 降低开发复杂度

### 1.3 同步任务与异步任务

### 1.4 执行栈（Call Stack）

执行栈是一种后进先出（LIFO）的数据结构，用于存储代码执行期间创建的所有执行上下文。

主要特点：

- 当函数被调用时，创建新的执行上下文并压入栈
- 当函数执行完毕，执行上下文从栈中弹出
- 栈底总是全局执行上下文
- 栈的大小是有限的，过深的调用会导致栈溢出

### 1.5 任务队列（Task Queue）

任务队列是一个先进先出（FIFO）的数据结构，用于存储待执行的异步任务回调函数。

两种主要的任务队列：

1. **宏任务队列**：

   - setTimeout/setInterval 回调
   - setImmediate (Node.js)
   - requestAnimationFrame (浏览器)
   - I/O 操作
   - UI 渲染

2. **微任务队列**：
   - Promise.then/catch/finally
   - process.nextTick (Node.js)
   - MutationObserver
   - queueMicrotask

```javascript
// 任务队列执行顺序示例
console.log("1"); // 同步

setTimeout(() => {
 console.log("2"); // 宏任务
 Promise.resolve().then(() => {
  console.log("3"); // 微任务
 });
}, 0);

Promise.resolve().then(() => {
 console.log("4"); // 微任务
 setTimeout(() => {
  console.log("5"); // 宏任务
 }, 0);
});

// 输出顺序：1 -> 4 -> 2 -> 3 -> 5
```

## 2. 宏任务与微任务

### 2.1 宏任务（Macrotask）

setTimeout/setInterval
setImmediate (Node.js)
requestAnimationFrame
I/O
UI rendering

### 2.2 微任务（Microtask）

Promise.then/catch/finally
process.nextTick (Node.js)
MutationObserver
queueMicrotask

## 3. 事件循环的执行顺序

事件循环遵循一个固定的执行顺序，理解这个顺序对于预测代码的执行结果至关重要。

### 3.1 执行同步代码

所有同步代码都在主线程上立即执行，会阻塞后续代码的执行。

```javascript
console.log("1"); // 同步代码
function syncTask() {
 console.log("2");
 const start = Date.now();
 while (Date.now() - start < 1000) {
  // 阻塞 1 秒
 }
 console.log("3");
}
syncTask(); // 同步执行，会阻塞
console.log("4");
// 输出顺序：1 -> 2 -> 3 -> 4
```

### 3.2 清空微任务队列

当同步代码执行完毕后，会立即检查微任务队列，并执行所有微任务。注意：

- 微任务执行过程中新产生的微任务也会在当前循环中执行
- 必须清空所有微任务后，才会执行下一个宏任务

### 3.3 执行一个宏任务

在微任务队列清空后，从宏任务队列中取出一个任务执行。常见的宏任务包括：

```javascript
// 1. setTimeout
setTimeout(() => {
 console.log("setTimeout");
}, 0);
// 2. setInterval
const intervalId = setInterval(() => {
 console.log("setInterval");
}, 1000);
// 3. requestAnimationFrame (浏览器环境)
requestAnimationFrame(() => {
  console.log("requestAnimationFrame");
});
// 4. I/O 操作 (Node.js环境)
const fs = require("fs");
fs.readFile("file.txt", () => {
  console.log("file read complete");
});
// 5. UI 渲染 (浏览器环境)
// DOM 操作通常会在当前宏任务结束后触发重绘
```

### 3.4 重复 3.2-3.**3**

## 4. 浏览器环境

浏览器环境下的事件循环具有其特殊性，需要处理 DOM 渲染、用户交互等特定任务。

### 4.1 Window 事件循环

浏览器的事件循环是基于 Window 对象实现的，主要处理：

- JavaScript 代码执行
- DOM 事件
- 网络请求
- 定时器

### 4.2 渲染时机

浏览器的渲染过程是由事件循环控制的，通常遵循以下规则：

- 每个宏任务之后可能会触发渲染
- requestAnimationFrame 在渲染之前执行
- 渲染之前会执行 requestIdleCallback

### 4.3 用户交互

用户交互事件（如点击、滚动等）会被添加到宏任务队列中

### 4.4 定时器处理

### 4.5 网络请求

## 5. Node.js 环境

### 5.1 Node.js 事件循环阶段

1. timer 定时器阶段
   - 执行 setTimeout 和 setInterval 的回调
2. pending callbacks（待定回调阶段）
   - 执行延迟到下一个循环迭代的 I/O 回调
3. **idle, prepare（空闲、准备阶段）**
   - 仅系统内部使用
4. **poll（轮询阶段）**
   - 检索新的 I/O 事件
   - 执行与 I/O 相关的回调
5. **check（检查阶段）**
   - 执行 setImmediate() 的回调
6. **close callbacks（关闭回调阶段）**
   - 执行关闭事件的回调

timers
pending callbacks
idle, prepare
poll
check
close callbacks

### 5.2 process.nextTick

process.nextTick 是 Node.js 特有的一个进程调度机制，它不属于事件循环的任何阶段。

`process.nextTick` 的优先级高于所有其他异步操作

1. **用于确保异步执行顺序**
2. **处理需要立即响应的操作**
3. **在初始化过程中保证正确的执行顺序**
4. **避免在循环或递归中过度使用**
5. **优先考虑其他异步方法（Promise、setImmediate）**

### 5.3 setImmediate

### 5.4 key

1. **执行顺序**
   - process.nextTick 和 Promise 在每个阶段结束时执行
   - 微任务优先于宏任务
   - 每个阶段都有自己的任务队列

2. **性能考虑**
   - 避免在关键路径上使用 process.nextTick
   - 合理使用 setImmediate 和 setTimeout
   - 注意 I/O 操作的调度

3. **最佳实践**
   - 使用 setImmediate 处理 I/O 密集型任务
   - 使用 process.nextTick 处理需要优先执行的操作
   - 合理规划任务调度以优化性能

## 6. 常见问题和陷阱

### 6.1 定时器延迟

### 6.2 Promise 链式调用

### 6.3 async/await 执行顺序

### 6.4 事件循环阻塞

### 6.5 内存泄漏

## 7. 性能优化

### 7.1 任务拆分

### 7.2 合理使用微任务

### 7.3 避免长任务

### 7.4 优化定时器使用

### 7.5 异步任务管理
