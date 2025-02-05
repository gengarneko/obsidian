# 原型与原型链

## 1. 基本概念

1. 原型是对象的一个特殊属性，用于实现继承
2. 原型链是对象查找属性的路径
3. 构造函数用于创建对象实例
4. 实例继承构造函数的属性和原型的方法

### 1.1 什么是原型 (Prototype)

原型是 JavaScript 中对象的一个特殊属性，它是实现继承的核心机制。

```javascript
// 1. 每个对象都有原型
const obj = {};
console.log(obj.__proto__ === Object.prototype); // true

// 2. 原型本身也是对象
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

// 3. 通过原型共享方法
const person1 = new Person('John');
const person2 = new Person('Jane');
person1.sayHello(); // "Hello, I'm John"
person2.sayHello(); // "Hello, I'm Jane"
```

### 1.2 什么是原型链 (Prototype Chain)

原型链是由原型对象组成的链式结构，它定义了对象属性的查找机制。

```javascript
// 1. 原型链查找过程
function Animal(name) {
  this.name = name;
}
Animal.prototype.eat = function () {
  console.log(`${this.name} is eating`);
};

function Dog(name) {
  Animal.call(this, name);
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const dog = new Dog('Max');
dog.eat(); // "Max is eating"

// 查找顺序：
// dog -> Dog.prototype -> Animal.prototype -> Object.prototype -> null

// 2. 原型链终点
console.log(Object.prototype.__proto__); // null

// 3. 属性查找示例
console.log(dog.hasOwnProperty('name')); // true（自有属性）
console.log(dog.hasOwnProperty('eat')); // false（原型链上的方法）
```

### 1.3 构造函数 (Constructor)

构造函数是用来创建和初始化对象的特殊函数。

```javascript
// 1. 构造函数定义
function User(name, age) {
  this.name = name;
  this.age = age;

  // 实例方法（不推荐，每个实例都会创建一份）
  this.sayHi = function () {
    console.log(`Hi, I'm ${this.name}`);
  };
}

// 原型方法（推荐，所有实例共享）
User.prototype.introduce = function () {
  console.log(`I'm ${this.name}, ${this.age} years old`);
};

// 2. 使用 new 关键字
const user1 = new User('John', 25);
const user2 = new User('Jane', 23);

// 3. new 操作符的过程
function createInstance(Constructor, ...args) {
  // 1) 创建新对象
  const obj = {};
  // 2) 设置原型
  Object.setPrototypeOf(obj, Constructor.prototype);
  // 3) 绑定 this 并执行
  const result = Constructor.apply(obj, args);
  // 4) 返回对象
  return result instanceof Object ? result : obj;
}
```

### 1.4 实例 (Instance)

实例是通过构造函数创建的对象。

```javascript
// 1. 创建实例
function Book(title) {
  this.title = title;
}

Book.prototype.getInfo = function () {
  return `Book: ${this.title}`;
};

const book1 = new Book('JavaScript Guide');
const book2 = new Book('Design Patterns');

// 2. 实例检查
console.log(book1 instanceof Book); // true
console.log(book1.constructor === Book); // true

// 3. 实例属性 vs 原型属性
console.log(book1.hasOwnProperty('title')); // true（实例属性）
console.log(book1.hasOwnProperty('getInfo')); // false（原型方法）

// 4. 实例共享原型
console.log(book1.__proto__ === book2.__proto__); // true
```

## 2. 原型的三个重要属性

### 2.1 prototype (显式原型)

prototype 是函数特有的属性，指向该函数的原型对象。

```javascript
// 1. 函数的 prototype 属性
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

console.log(Person.prototype); // {constructor: ƒ, sayHello: ƒ}

// 2. 普通对象没有 prototype 属性
const obj = {};
console.log(obj.prototype); // undefined

// 3. 修改原型对象
Person.prototype = {
  constructor: Person, // 需要手动维护构造器指向
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  },
  introduce() {
    console.log(`My name is ${this.name}`);
  },
};
```

### 2.2 `__proto__` (隐式原型)

`__proto__` 是对象的内部属性，指向该对象的原型。

```javascript
// 1. 对象的 __proto__ 属性
const person = new Person('John');
console.log(person.__proto__ === Person.prototype); // true

// 2. 原型链通过 __proto__ 实现
const arr = [];
console.log(arr.__proto__ === Array.prototype); // true
console.log(arr.__proto__.__proto__ === Object.prototype); // true
console.log(arr.__proto__.__proto__.__proto__ === null); // true

// 3. 推荐使用 Object.getPrototypeOf()
console.log(Object.getPrototypeOf(person) === Person.prototype); // true

// 4. 设置原型
const animal = {
  eat() {
    console.log('eating');
  },
};

const dog = {
  bark() {
    console.log('barking');
  },
};

// 设置原型（不推荐直接使用 __proto__）
Object.setPrototypeOf(dog, animal);
dog.eat(); // "eating"
```

### 2.3 constructor (构造器)

constructor 属性存在于原型对象中，指向构造函数本身。

```javascript
// 1. 原型对象的 constructor 属性
function Student(name) {
  this.name = name;
}

console.log(Student.prototype.constructor === Student); // true

const student = new Student('Tom');
console.log(student.constructor === Student); // true

// 2. 修改原型时保持 constructor
Student.prototype = {
  constructor: Student, // 手动维护
  study() {
    console.log(`${this.name} is studying`);
  },
};

// 3. constructor 的应用
function createInstance(instance) {
  return new instance.constructor();
}

const student1 = new Student('Jack');
const student2 = createInstance(student1);

// 4. 继承中的 constructor
function Teacher(name, subject) {
  Student.call(this, name);
  this.subject = subject;
}

// 设置继承关系
Teacher.prototype = Object.create(Student.prototype);
Teacher.prototype.constructor = Teacher; // 修复 constructor

const teacher = new Teacher('Mr. Smith', 'Math');
console.log(teacher.constructor === Teacher); // true
```

### 2.4 三者关系

```javascript
function Example() {}
const instance = new Example();

// 关系图解
/**
 * Example --prototype--> Example.prototype --constructor--> Example
 * instance --__proto__--> Example.prototype
 */

// 验证关系
console.log(Example.prototype.constructor === Example); // true
console.log(instance.__proto__ === Example.prototype); // true
console.log(instance.constructor === Example); // true

// 完整示例
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(`${this.name} makes a sound`);
};

const cat = new Animal('Cat');

console.log(cat.__proto__ === Animal.prototype); // true
console.log(Animal.prototype.constructor === Animal); // true
console.log(cat.constructor === Animal); // true
```

- prototype 是函数特有的属性，用于实现继承
- `__proto__` 是对象的内部属性，指向原型对象
- constructor 是原型对象的属性，指向构造函数

## 3. 原型链查找机制

### 3.1 属性查找规则

```javascript
// 1. 基本查找规则
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function () {
  console.log(`Hello, ${this.name}`);
};

const person = new Person('John');

// 查找顺序：
// 1) 实例自身
// 2) 实例的原型
// 3) 原型的原型...直到 null
console.log(person.name); // 'John'（实例属性）
person.sayHello(); // 'Hello, John'（原型方法）
console.log(person.age); // undefined（未找到）

// 2. 属性遮蔽（Property Shadowing）
Person.prototype.name = 'Default';
const person2 = new Person('Jane');
console.log(person2.name); // 'Jane'（实例属性遮蔽原型属性）

// 3. 检查属性位置
console.log(person.hasOwnProperty('name')); // true
console.log(person.hasOwnProperty('sayHello')); // false
```

### 3.2 方法继承原理

```javascript
// 1. 基本继承
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function () {
  console.log(`${this.name} is eating`);
};

function Dog(name) {
  Animal.call(this, name);
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  console.log(`${this.name} is barking`);
};

const dog = new Dog('Max');
dog.eat(); // "Max is eating"
dog.bark(); // "Max is barking"

// 2. 方法重写
Dog.prototype.eat = function () {
  console.log(`${this.name} is eating bones`);
};

dog.eat(); // "Max is eating bones"

// 3. super 调用（ES6 class）
class Cat extends Animal {
  eat() {
    super.eat();
    console.log('Finished eating');
  }
}
```

### 3.3 原型链终点

```javascript
// 1. 原型链的终点是 null
const obj = {};
console.log(obj.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true

// 2. 内置对象的原型链
const arr = [];
console.log(arr.__proto__ === Array.prototype); // true
console.log(Array.prototype.__proto__ === Object.prototype); // true

const func = function () {};
console.log(func.__proto__ === Function.prototype); // true
console.log(Function.prototype.__proto__ === Object.prototype); // true

// 3. 完整的原型链示例
class Grandfather {}
class Father extends Grandfather {}
class Son extends Father {}

const son = new Son();
console.log(
  son.__proto__ === Son.prototype, // true
  Son.prototype.__proto__ === Father.prototype, // true
  Father.prototype.__proto__ === Grandfather.prototype, // true
  Grandfather.prototype.__proto__ === Object.prototype, // true
  Object.prototype.__proto__ === null, // true
);
```

### 3.4 性能考虑

```javascript
// 1. 原型链越长，属性查找越慢
function deepChain() {
  let obj = {};
  for (let i = 0; i < 1000; i++) {
    obj = Object.create(obj);
  }
  return obj;
}

const longChainObj = deepChain();
// 访问不存在的属性会遍历整个原型链
console.log(longChainObj.notExist); // undefined（性能差）

// 2. 优化方案：扁平化继承
function OptimizedClass() {
  // 直接继承 Object.prototype
}
OptimizedClass.prototype = Object.create(Object.prototype);

// 3. 缓存常用属性
class FrequentAccess {
  constructor() {
    // 缓存频繁访问的原型方法
    this.cachedMethod = this.constructor.prototype.method;
  }

  static method() {
    // 方法实现
  }
}

// 4. 使用 hasOwnProperty 优化属性检查
const obj = { prop: 'value' };
// ❌ 不好的实践
if (obj.prop) {
  /* ... */
}

// ✅ 好的实践
if (obj.hasOwnProperty('prop')) {
  /* ... */
}
```

- 属性查找遵循就近原则，从实例开始向上查找
- 原型链实现了方法的继承和共享
- 所有原型链最终都指向 null
- 原型链的长度会影响属性查找性能

性能优化建议：

- 保持原型链扁平
- 缓存频繁访问的属性
- 使用 hasOwnProperty 进行属性检查
- 避免创建过长的原型链

## 4. 继承实现方式

### 4.1 原型链继承

最基本的继承方式，将父类的实例作为子类的原型。

```javascript
// 父类
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}
Animal.prototype.sayName = function () {
  console.log(this.name);
};

// 子类
function Dog() {}
// 继承 Animal
Dog.prototype = new Animal();
Dog.prototype.constructor = Dog;

// 使用
const dog1 = new Dog();
const dog2 = new Dog();
dog1.colors.push('brown');
console.log(dog2.colors); // ['black', 'white', 'brown']

// 缺点：
// 1. 引用类型的属性被所有实例共享
// 2. 无法向父类构造函数传参
```

### 4.2 构造函数继承

使用 call/apply 在子类构造函数中执行父类构造函数。

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}
Animal.prototype.sayName = function () {
  console.log(this.name);
};

function Dog(name) {
  // 继承 Animal
  Animal.call(this, name);
}

const dog1 = new Dog('旺财');
const dog2 = new Dog('小黑');
dog1.colors.push('brown');
console.log(dog1.colors); // ['black', 'white', 'brown']
console.log(dog2.colors); // ['black', 'white']
// dog1.sayName(); // Error: dog1.sayName is not a function

// 优点：
// 1. 避免了引用类型的属性被共享
// 2. 可以向父类构造函数传参
// 缺点：
// 1. 方法都在构造函数中定义，每次创建实例都会创建一遍方法
// 2. 无法继承父类原型上的方法
```

### 4.3 组合继承

结合原型链继承和构造函数继承。

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}
Animal.prototype.sayName = function () {
  console.log(this.name);
};

function Dog(name, age) {
  // 继承属性
  Animal.call(this, name);
  this.age = age;
}
// 继承方法
Dog.prototype = new Animal();
Dog.prototype.constructor = Dog;

const dog1 = new Dog('旺财', 2);
const dog2 = new Dog('小黑', 1);
dog1.colors.push('brown');
console.log(dog1.colors); // ['black', 'white', 'brown']
console.log(dog2.colors); // ['black', 'white']
dog2.sayName(); // '小黑'

// 优点：
// 1. 可以继承实例属性/方法，也可以继承原型属性/方法
// 2. 不存在引用属性共享问题
// 缺点：
// 1. 调用了两次父类构造函数
```

### 4.4 寄生组合继承

通过寄生方式，砍掉父类的实例属性，避免了组合继承的缺点。

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}
Animal.prototype.sayName = function () {
  console.log(this.name);
};

function Dog(name, age) {
  Animal.call(this, name);
  this.age = age;
}

// 核心：通过创建中间对象，避免调用父类构造函数
function inheritPrototype(subType, superType) {
  const prototype = Object.create(superType.prototype);
  prototype.constructor = subType;
  subType.prototype = prototype;
}

inheritPrototype(Dog, Animal);

const dog1 = new Dog('旺财', 2);
const dog2 = new Dog('小黑', 1);
dog1.sayName(); // '旺财'

// 优点：
// 1. 只调用一次父类构造函数
// 2. 原型链保持不变
// 3. 能够正常使用 instanceof 和 isPrototypeOf
```

### 4.5 ES6 class 继承

使用 ES6 的 class 关键字实现继承。

```javascript
class Animal {
  constructor(name) {
    this.name = name;
    this.colors = ['black', 'white'];
  }

  sayName() {
    console.log(this.name);
  }
}

class Dog extends Animal {
  constructor(name, age) {
    super(name); // 调用父类构造函数
    this.age = age;
  }

  bark() {
    console.log('Woof!');
    // 可以通过 super 调用父类方法
    super.sayName();
  }
}

const dog = new Dog('旺财', 2);
dog.bark(); // 'Woof!' '旺财'

// 静态方法继承
class Parent {
  static hello() {
    console.log('hello');
  }
}

class Child extends Parent {}
Child.hello(); // 'hello'

// 特点：
// 1. 语法更加清晰、易懂
// 2. 实现了真正的继承
// 3. 支持静态方法继承
// 4. 子类必须在构造函数中调用 super()
```

继承方式对比：

1. 原型链继承：引用类型共享问题
2. 构造函数继承：无法继承原型方法
3. 组合继承：调用两次父类构造函数
4. 寄生组合继承：较完美但实现复杂
5. ES6 class：最理想的继承实现方式

最佳实践：

- 优先使用 ES6 class 继承
- 需要兼容旧浏览器时使用寄生组合继承
- 避免使用原型链继承和构造函数继承
- 理解每种继承方式的优缺点，根据实际需求选择

## 5. 原型方法和属性

### 5.1 Object.create()

创建一个新对象，使用现有对象作为新对象的原型。

```javascript
// 1. 基本用法
const person = {
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  },
};

const john = Object.create(person);
john.name = 'John';
john.sayHello(); // "Hello, I'm John"

// 2. 使用第二个参数定义属性
const jane = Object.create(person, {
  name: {
    value: 'Jane',
    writable: true,
    enumerable: true,
    configurable: true,
  },
  age: {
    value: 25,
  },
});

// 3. 创建纯对象
const pureObject = Object.create(null);
// pureObject 没有任何继承的属性和方法
console.log(pureObject.toString); // undefined
```

### 5.2 Object.getPrototypeOf()

获取对象的原型。

```javascript
// 1. 基本用法
const arr = [];
console.log(Object.getPrototypeOf(arr) === Array.prototype); // true

// 2. 获取原型链
function getPrototypeChain(obj) {
  const chain = [];
  let current = obj;

  while (current) {
    chain.push(current);
    current = Object.getPrototypeOf(current);
  }

  return chain;
}

class A {}
class B extends A {}
const b = new B();
console.log(getPrototypeChain(b));
// [B instance, B.prototype, A.prototype, Object.prototype, null]
```

### 5.3 Object.setPrototypeOf()

设置对象的原型（不推荐使用，影响性能）。

```javascript
// 1. 基本用法
const animal = {
  eat() {
    console.log('eating');
  },
};

const dog = {
  bark() {
    console.log('barking');
  },
};

Object.setPrototypeOf(dog, animal);
dog.eat(); // "eating"
dog.bark(); // "barking"

// 2. 替代方案（推荐）
const betterDog = Object.create(animal, {
  bark: {
    value: function () {
      console.log('barking');
    },
  },
});
```

### 5.4 hasOwnProperty()

检查属性是否为对象自身的属性。

```javascript
// 1. 基本用法
const person = {
  name: 'John',
};
person.__proto__.age = 25;

console.log(person.hasOwnProperty('name')); // true
console.log(person.hasOwnProperty('age')); // false

// 2. 安全的 hasOwnProperty
const obj = Object.create(null);
obj.prop = 'exists';

// 直接调用会报错
// obj.hasOwnProperty('prop'); // Error

// 安全的调用方式
console.log(Object.prototype.hasOwnProperty.call(obj, 'prop')); // true
```

### 5.5 isPrototypeOf()

检查一个对象是否存在于另一个对象的原型链中。

```javascript
// 1. 基本用法
function Animal() {}
function Dog() {}
Dog.prototype = Object.create(Animal.prototype);

const dog = new Dog();
console.log(Animal.prototype.isPrototypeOf(dog)); // true
console.log(Dog.prototype.isPrototypeOf(dog)); // true

// 2. 检查继承关系
function isInheritedFrom(obj, constructor) {
  return constructor.prototype.isPrototypeOf(obj);
}

class Parent {}
class Child extends Parent {}
const child = new Child();

console.log(isInheritedFrom(child, Parent)); // true
console.log(isInheritedFrom(child, Object)); // true
```

### 5.6 instanceof 运算符

检查构造函数的 prototype 是否出现在对象的原型链中。

```javascript
// 1. 基本用法
function Car() {}
const car = new Car();
console.log(car instanceof Car); // true
console.log(car instanceof Object); // true

// 2. 手动实现 instanceof
function myInstanceof(obj, constructor) {
  let proto = Object.getPrototypeOf(obj);
  const prototype = constructor.prototype;

  while (proto) {
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

// 3. instanceof 的局限性
const arr = [];
console.log(arr instanceof Array); // true
console.log(arr instanceof Object); // true

// 跨框架问题
function isArray(arr) {
  // 更可靠的数组检查方法
  return Object.prototype.toString.call(arr) === '[object Array]';
  // 或使用
  // return Array.isArray(arr);
}
```

关键点总结：

- Object.create() 是创建对象并设置原型的推荐方法
- getPrototypeOf/setPrototypeOf 用于操作对象原型
- hasOwnProperty 用于属性检查
- isPrototypeOf 用于原型链检查
- instanceof 用于类型检查

最佳实践：

- 优先使用 Object.create() 创建对象
- 避免使用 setPrototypeOf（性能问题）
- 使用安全的 hasOwnProperty 调用方式
- 注意 instanceof 的局限性

## 6. 实际应用

### 6.1 原型继承的最佳实践

```javascript
// 1. 使用 ES6 类语法
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name);
  }

  speak() {
    super.speak();
    console.log(`${this.name} barks`);
  }
}

// 2. 使用工厂函数创建对象
function createAnimal(name, sound) {
  return {
    name,
    makeSound() {
      console.log(`${this.name} ${sound}`);
    },
  };
}

const cat = createAnimal('Cat', 'meows');
const dog = createAnimal('Dog', 'barks');

// 3. 组合优于继承
class Logger {
  log(message) {
    console.log(message);
  }
}

class Database {
  constructor(logger) {
    this.logger = logger;
  }

  save(data) {
    this.logger.log('Saving data...');
    // 保存数据
  }
}
```

### 6.2 常见问题和解决方案

```javascript
// 1. this 绑定问题
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
    // 或使用箭头函数
    // this.handleClick = () => {
    //     this.doSomething();
    // };
  }

  handleClick() {
    this.doSomething();
  }
}

// 2. 属性初始化问题
class User {
  constructor(data = {}) {
    // 使用默认值和解构赋值
    const { name = '', age = 0 } = data;
    this.name = name;
    this.age = age;
  }
}

// 3. 私有属性实现
class PrivateExample {
  #privateField = 'private';

  getPrivate() {
    return this.#privateField;
  }
}

// 4. 多重继承问题
// 使用混入（Mixin）模式
const SpeakerMixin = {
  speak() {
    console.log('Speaking...');
  },
};

const WalkerMixin = {
  walk() {
    console.log('Walking...');
  },
};

function applyMixins(target, ...mixins) {
  Object.assign(target.prototype, ...mixins);
}

class Person {}
applyMixins(Person, SpeakerMixin, WalkerMixin);
```

### 6.3 性能优化建议

```javascript
// 1. 原型方法共享
class Widget {
  constructor(config) {
    this.config = config;
  }

  // 方法放在原型上共享
  render() {
    // 渲染逻辑
  }
}

// 2. 避免深层原型链
// ❌ 不好的实践
class A {}
class B extends A {}
class C extends B {}
class D extends C {}

// ✅ 好的实践
class Base {}
class Feature1 extends Base {}
class Feature2 extends Base {}

// 3. 属性访问优化
class OptimizedClass {
  constructor() {
    // 缓存频繁访问的原型方法
    this.boundMethod = this.method.bind(this);
  }

  method() {
    // 方法实现
  }
}

// 4. 原型污染防护
function safeClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function safeMerge(target, source) {
  // 防止原型污染
  const cleanSource = Object.keys(source).reduce((acc, key) => {
    if (key !== '__proto__' && key !== 'constructor') {
      acc[key] = source[key];
    }
    return acc;
  }, {});

  return Object.assign(target, cleanSource);
}
```

### 6.4 设计模式中的应用

```javascript
// 1. 单例模式
class Singleton {
    static #instance;

    constructor() {
        if (Singleton.#instance) {
            return Singleton.#instance;
        }
        Singleton.#instance = this;
    }

    static getInstance() {
        if (!Singleton.#instance) {
            Singleton.#instance = new Singleton();
        }
        return Singleton.#instance;
    }
}

// 2. 工厂模式
class ProductFactory {
    static createProduct(type) {
        switch(type) {
            case 'A':
                return new ProductA();
            case 'B':
                return new ProductB();
            default:
                throw new Error('Invalid product type');
        }
    }
}

// 3. 观察者模式
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
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

// 4. 装饰器模式（使用ES7装饰器）
function readonly(target, key, descriptor) {
    descriptor.writable = false;
    return descriptor;
}

class Example {
    @readonly
    pi() { return 3.14; }
}
```

实践总结：

1. 代码组织：

- 使用 ES6 类语法
- 优先使用组合而非继承
- 使用工厂函数创建对象
- 实现私有属性和方法

2. 性能优化：

- 共享原型方法
- 避免深层原型链
- 缓存频繁访问的方法
- 防止原型污染
