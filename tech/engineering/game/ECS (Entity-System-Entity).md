## 为什么需要 ECS

```
为什么需要 entityManager？

entity 的主要职责：
- 存储 entity 的 table 信息
- 提供组件的操作接口
- 委托实际操作给 entityManager

entityManager 的主要职责：
- 管理实体的创建和销毁
- 批量处理组件变更
- 协调实体在不同 Table 间的移动

批处理机制
- 性能优化：批量处理变更
- 一致性：统一的更新时机
- 缓存友好：实体数据连续存储
- 灵活性：可以轻松撤销未提交的更改

Table 的存储结构是什么？

// 1. 位置和速度的实体
const player = world.spawn()
    .add(new Position())
    .add(new Velocity());
// 进入 Table1: [Position, Velocity]

// 2. 只有位置的实体
const tree = world.spawn()
    .add(new Position());
// 进入 Table2: [Position]

// 3. 位置、速度和生命值的实体
const monster = world.spawn()
    .add(new Position())
    .add(new Velocity())
    .add(new Health());
// 进入 Table3: [Position, Velocity, Health]

这样会形成多个 Table：

// Table1 - [Position, Velocity]
{
    positions: [Position, Position, ...],  // player 的数据
    velocities: [Velocity, Velocity, ...]
}

// Table2 - [Position]
{
    positions: [Position, Position, ...]   // tree 的数据
}

// Table3 - [Position, Velocity, Health]
{
    positions: [Position, Position, ...],  // monster 的数据
    velocities: [Velocity, Velocity, ...],
    healths: [Health, Health, ...]
}

这种设计的好处：

1. 查询性能

// 查询所有有 Position 和 Velocity 的实体
function moveSystem(world: World) {
    // 只需要遍历 Table1 和 Table3
    // 不需要检查 Table2
    for (const [pos, vel] of world.query(Position, Velocity)) {
        pos.x += vel.x;
    }
}

1. 内存布局

// Table 中的数据是连续的
Table1.positions = [
    {x: 0, y: 0},
    {x: 1, y: 1},
    {x: 2, y: 2}
];
// 对 CPU 缓存更友好

1. 组件操作

// 当添加或移除组件时
player.add(new Health());
// player 会从 Table1 移动到 Table3
// 因为现在它有了相同的组件组合

详细解释 ECS 中基于 archeType 的设计：

1. Archetype 的表示

class Table {
    // 使用位图表示组件组合
    archetype: bigint;  // 例如: 0b0111 表示有组件 0,1,2

    // 组件存储
    #components: ComponentType[];  // [Position, Velocity, Health]
    #columns: Array<object[]>;    // 实际数据存储
}

// 示例
const archetype1 = 0b0011n;  // Position + Velocity
const archetype2 = 0b0111n;  // Position + Velocity + Health

1. 组件 ID 分配

class World {
    private nextComponentId = 0;
    private componentIds = new Map<ComponentType, number>();

    registerComponent(component: ComponentType) {
        const id = this.nextComponentId++;
        this.componentIds.set(component, id);
        return id;
    }

    // 计算 archetype
    getArchetype(components: ComponentType[]) {
        let archetype = 0n;
        for (const comp of components) {
            const id = this.componentIds.get(comp)!;
            archetype |= (1n << BigInt(id));
        }
        return archetype;
    }
}

1. Table 管理

class World {
    private tables = new Map<bigint, Table>();

    getTable(archetype: bigint): Table {
        let table = this.tables.get(archetype);
        if (!table) {
            // 创建新的 Table
            table = new Table(archetype);
            this.tables.set(archetype, table);
        }
        return table;
    }
}

1. 实体移动

class EntityManager {
    moveEntity(entity: Entity, newComponents: Component[]) {
        // 1. 计算新的 archetype
        const newArchetype = this.world.getArchetype(newComponents);
        
        // 2. 获取源和目标表
        const [oldTableId, row] = entity.locate();
        const oldTable = this.world.tables.get(oldTableId)!;
        const newTable = this.world.getTable(newArchetype);
        
        // 3. 移动数据
        oldTable.moveRow(row, newTable);
        
        // 4. 更新实体位置
        entity.move(newTable.id, newTable.length - 1);
    }
}

1. 查询优化

class Query {
    private matchingTables: Table[] = [];

    constructor(world: World, components: ComponentType[]) {
        // 创建查询的组件掩码
        const queryMask = world.getArchetype(components);
        
        // 找到所有匹配的表
        for (const [archetype, table] of world.tables) {
            if ((archetype & queryMask) === queryMask) {
                this.matchingTables.push(table);
            }
        }
    }

    // 迭代匹配的实体
    *[Symbol.iterator]() {
        for (const table of this.matchingTables) {
            yield* table.iterate();
        }
    }
}

1. 性能优化实例

// 1. 缓存友好的数据布局
class Table {
    #columns = [
        [pos1, pos2, pos3],  // Position 数组
        [vel1, vel2, vel3],  // Velocity 数组
    ];

    *iterate() {
        const len = this.#columns[0].length;
        for (let i = 0; i < len; i++) {
            yield this.#columns.map(col => col[i]);
        }
    }
}

// 2. 快速的组件检查
function hasComponents(archetype: bigint, required: bigint) {
    return (archetype & required) === required;
}

这种设计的优势：
查询效率
只需要遍历包含所需组件的表
无需检查每个实体的组件
缓存效率
相同组件组合的实体数据连续存储
提高内存访问效率
组件操作
高效的组件添加/删除
实体在表间的有序移动
内存使用
紧凑的数据存储
减少内存碎片

让我详细对比一下哈希表存储和连续内存存储的特点：

1. 内存访问模式
哈希表存储:

// 哈希表结构
const hashMap = new Map();
hashMap.set(key, value);

// 访问过程
function access(key) {
    // 1. 计算哈希值
    // 2. 处理碰撞
    // 3. 找到实际位置
    // 4. 读取数据
    return hashMap.get(key);
}

连续内存:

// 连续数组
const array = new Float32Array(1000);

// 访问过程
function access(index) {
    // 直接通过偏移量访问
    return array[index];
}

1. 性能对比
CPU 缓存影响:

// 哈希表 - 随机访问模式
for (let key of hashMap.keys()) {
    const value = hashMap.get(key);  // 可能导致缓存未命中
}

// 连续内存 - 顺序访问模式
for (let i = 0; i < array.length; i++) {
    const value = array[i];  // 高缓存命中率
    // CPU 可以预加载后续数据
}

内存布局对比:

// 哈希表内存布局（示意）
{
    buckets: [
        { key: k1, value: v1, next: ptr1 },
        { key: k2, value: v2, next: null },
        null,
        { key: k3, value: v3, next: ptr2 }
    ]
}

// 连续内存布局
[v1, v2, v3, v4, v5, ...]  // 紧凑排列

1. 具体场景分析
大量随机访问场景:

// 哈希表 - O(1) 平均访问时间
function randomAccess(key) {
    return hashMap.get(key);  // 常数时间
}

// 连续内存 - 需要遍历查找
function findInArray(key) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].key === key) return array[i];
    }
}

顺序处理场景:

// 哈希表
for (const [key, value] of hashMap) {
    process(value);  // 可能产生大量缓存未命中
}

// 连续内存
for (let i = 0; i < array.length; i++) {
    process(array[i]);  // 优秀的缓存局部性
}

1. 性能特征对比
2. 访问延迟:

哈希表:
- 平均情况: O(1)
- 最坏情况: O(n) [碰撞]
- 实际延迟: ~10-20 个时钟周期

连续内存:
- 固定时间: O(1)
- 实际延迟: ~1-4 个时钟周期

2.内存开销:

// 哈希表
const overhead = {
    bucketArray: n * sizeof(pointer),
    nodeStructure: n * (sizeof(key) + sizeof(value) + sizeof(pointer)),
    loadFactor: 0.75  // 需要额外空间以维持性能
}

// 连续内存
const overhead = {
    arraySize: n * sizeof(element)  // 紧凑存储
}

1. 优缺点总结
哈希表:
优点：
灵活的键值对应
动态增长
平均 O(1) 查找
缺点：
内存碎片
缓存不友好
额外的内存开销
连续内存:
优点：
最佳的缓存利用
预测性能好
内存效率高
缺点：
固定大小
插入/删除成本高
需要预分配
1. ECS 系统中的选择

// 推荐的混合方式
class ECSStorage {
    // 使用 Map 存储元数据
    componentMeta = new Map();
    
    // 使用连续数组存储实际数据
    componentData = {
        position: new Float32Array(1000 * 3),  // x,y,z连续存储
        velocity: new Float32Array(1000 * 3)
    };
    
    // 使用位图快速查询
    componentMasks = new Uint32Array(1000);
}

在 ECS 系统中，理想的方案通常是：
用哈希表存储元数据和配置信息
1. 用连续内存存储实际的组件数据
2. 使用位图等辅助结构优化查询
这样可以同时获得：
元数据管理的灵活性
实际数据访问的高性能
系统整体的良好扩展性

在 TypeScript 中，确实有其他方式可以实现 O(1) 的实体操作，不一定要使用固定大小的 TypedArray。让我展示几种替代方案：
使用 Map + 数组的混合结构：

使用 Map + 数组的混合结构：

class EntityList {
  private entities: Entity[] = [];
  private entityMap = new Map<EntityId, number>();  // entityId -> index
  
  add(entity: Entity) {
    const index = this.entities.length;
    this.entities.push(entity);
    this.entityMap.set(entity.id, index);
  }
  
  remove(entityId: EntityId) {
    const index = this.entityMap.get(entityId);
    if (index === undefined) return;
    
    // 交换删除，保持数组紧凑
    const lastEntity = this.entities[this.entities.length - 1];
    if (index !== this.entities.length - 1) {
      this.entities[index] = lastEntity;
      this.entityMap.set(lastEntity.id, index);
    }
    
    this.entities.pop();
    this.entityMap.delete(entityId);
  }
  
  has(entityId: EntityId): boolean {
    return this.entityMap.has(entityId);
  }
}

使用分块存储：

class ChunkedEntityStorage {
  private chunks: Entity[][] = [[]];
  private entityToChunk = new Map<EntityId, [number, number]>();  // entityId -> [chunkId, index]
  private readonly CHUNK_SIZE = 1024;
  
  add(entity: Entity) {
    let lastChunk = this.chunks[this.chunks.length - 1];
    if (lastChunk.length >= this.CHUNK_SIZE) {
      lastChunk = [];
      this.chunks.push(lastChunk);
    }
    
    const chunkId = this.chunks.length - 1;
    const index = lastChunk.length;
    lastChunk.push(entity);
    this.entityToChunk.set(entity.id, [chunkId, index]);
  }
  
  remove(entityId: EntityId) {
    const location = this.entityToChunk.get(entityId);
    if (!location) return;
    
    const [chunkId, index] = location;
    const chunk = this.chunks[chunkId];
    const lastIndex = chunk.length - 1;
    
    if (index !== lastIndex) {
      const lastEntity = chunk[lastIndex];
      chunk[index] = lastEntity;
      this.entityToChunk.set(lastEntity.id, [chunkId, index]);
    }
    
    chunk.pop();
    this.entityToChunk.delete(entityId);
  }
}

使用双向链表 + Map：

class LinkedEntityList {
  private head: Entity | null = null;
  private tail: Entity | null = null;
  private entityMap = new Map<EntityId, Entity>();
  
  add(entity: Entity) {
    if (this.tail) {
      entity.prev = this.tail;
      this.tail.next = entity;
      this.tail = entity;
    } else {
      this.head = this.tail = entity;
    }
    this.entityMap.set(entity.id, entity);
  }
  
  remove(entityId: EntityId) {
    const entity = this.entityMap.get(entityId);
    if (!entity) return;
    
    if (entity.prev) entity.prev.next = entity.next;
    if (entity.next) entity.next.prev = entity.prev;
    if (this.head === entity) this.head = entity.next;
    if (this.tail === entity) this.tail = entity.prev;
    
    this.entityMap.delete(entityId);
  }
}

使用稀疏数组 + 动态增长：

class DynamicSparseArray {
  private chunks: (Int32Array | null)[] = [];
  private readonly CHUNK_SIZE = 1024;
  
  private getOrCreateChunk(chunkIndex: number): Int32Array {
    if (!this.chunks[chunkIndex]) {
      this.chunks[chunkIndex] = new Int32Array(this.CHUNK_SIZE).fill(-1);
    }
    return this.chunks[chunkIndex]!;
  }
  
  set(index: number, value: number) {
    const chunkIndex = Math.floor(index / this.CHUNK_SIZE);
    const chunk = this.getOrCreateChunk(chunkIndex);
    chunk[index % this.CHUNK_SIZE] = value;
  }
  
  get(index: number): number {
    const chunkIndex = Math.floor(index / this.CHUNK_SIZE);
    const chunk = this.chunks[chunkIndex];
    return chunk ? chunk[index % this.CHUNK_SIZE] : -1;
  }
}

这些方案的比较：
Map + 数组：
优点：简单，无需固定大小
缺点：Map 操作可能比 TypedArray 慢
分块存储：
优点：内存使用更灵活，仍保持较好性能
缺点：实现复杂，额外的间接寻址
链表 + Map：
优点：插入删除非常快，无需移动数据
缺点：遍历性能较差，内存开销大
动态稀疏数组：
优点：结合了 TypedArray 的性能和动态增长
缺点：内存管理更复杂
选择建议：
如果实体 ID 较小且密集：使用
如果实体 ID 分散：使用 Map + 数组
1. 如果需要频繁遍历：避免使用链表方案
如果内存是主要考虑：使用分块存储
最终选择应该基于：
实体 ID 的分布特征
操作模式（增删vs遍历）
内存限制
性能要求

优化策略：
内联关键操作
减少分支预测失败
优化热路径
主要优化总结：
性能优化：
位运算优化
内联关键操作
批量处理
缓存友好设计
减少间接访问
内存管理：
延迟分配
引用计数
资源池化
内存对齐
紧凑存储
这些优化使得系统能够：
高效处理大量实体
减少内存碎片
提供可预测的性能
优化缓存利用
减少垃圾回收压力

1. miniplex 的优缺点
优点：
简单直观的 API
容易理解和使用
适合小型项目
缺点：
性能不够优化
缺乏内存管理策略
没有并行处理支持
查询系统效率低

总结对比：
性能方面：
Becsy: O(1) 直接寻址，更好的缓存利用
ECSY: O(1) 但有额外的对象查找开销
内存效率：
Becsy: 紧凑的内存布局，预分配
ECSY: 更灵活但更松散的内存使用
使用便利性：
Becsy: 需要更多前期配置，但运行时性能更好
ECSY: 更直观，更容易使用，但性能较差
ECSY 的实现更适合：
原型开发
小规模应用
对性能要求不高的场景
Becsy 的实现更适合：
大规模实体系统
高性能游戏
需要优化内存访问的场景

让我详细解释 destinations 和 archetype 的概念：
Archetype（原型）
在这个ECS系统中，archetype 使用 bigint 类型来表示一个实体当前拥有的所有组件的组合。它实际上是一个位图（bitmap），其中：

// 示例：
let archetype = 1n << BigInt(componentId)

每个位代表一个特定的组件类型
如果某个位为1，表示实体拥有该组件
如果某个位为0，表示实体没有该组件
例如：

// 假设我们有以下组件ID：
// Position: ID = 0
// Velocity: ID = 1
// Sprite: ID = 2

// 一个具有 Position 和 Sprite 的实体的 archetype 可能是：
// 二进制：101 (十进制：5)
// Position (1 << 0) | Sprite (1 << 2) = 101

Destinations（目标原型）
#destinations 是一个映射表，用于跟踪实体的组件变化：

#destinations: Map<Readonly<Entity>, bigint> = new Map();

当你对实体进行组件操作时：
添加组件：

addType(entity: Readonly<Entity>, type: Class) {
    const val = this.#destinations.get(entity) ?? this.getArchetype(entity);
    const componentId = this.#world.getComponentId(type);
    // 使用位运算 OR 来添加新组件
    this.#destinations.set(entity, val | (1n << BigInt(componentId)));
}

移除组件：

remove(entity: Readonly<Entity>, type: Class) {
    const val = this.#destinations.get(entity) ?? this.getArchetype(entity);
    const componentId = this.#world.getComponentId(type);
    // 使用位运算 XOR 来移除组件
    this.#destinations.set(entity, val ^ (1n << BigInt(componentId)));
}

实际运作示例
假设我们有一个实体的变化过程：

// 1. 初始状态：实体只有基础组件
let entityArchetype = 1n;  // 二进制: 001

// 2. 添加 Position 组件 (ID = 1)
// 操作后 archetype = 3n (二进制: 011)
entities.addType(entity, Position);

// 3. 添加 Sprite 组件 (ID = 2)
// 操作后 archetype = 7n (二进制: 111)
entities.addType(entity, Sprite);

// 4. 移除 Position 组件
// 操作后 archetype = 5n (二进制: 101)
entities.remove(entity, Position);

为什么这样设计？
性能优化：
使用位运算进行组件检查和修改，非常高效
可以快速比较两个实体的组件组合
批处理：
destinations 允许系统收集所有的组件变更
在 update() 中一次性处理所有变更，减少碎片化操作
内存效率：
使用位图存储组件组合，非常节省内存
相比使用数组或其他数据结构，位运算操作更快
查询优化：
可以快速确定实体是否满足特定的组件要求
支持高效的实体过滤和查询操作
这种设计在游戏引擎和其他高性能ECS系统中很常见，因为它提供了极好的性能和灵活性。
```

## Simplifying R3F with ECS

Simplifying React Three Fiber with Entity Component System

December 30, 2022 · Michael Dougall · 4 min read

So this is a bit of a short and simple one but I wanted to finish the year with one last blog post about how I used Entity Component System (ECS) to simplify my camera system in FAZE, a point & click game I'm hacking on as a side project.

If this is your first time hearing ECS, well, think of it as both as a design pattern akin to Model-View-Controller that constrains the code we write to promote flexibility and better performance, and libraries that implement the pattern. I'm using miniplex by Hendrik, you should check it out. On the tin ECS is a performant compositional alternative to inheritance for extending behavior but in a React world where we already lean on composition to compose components together I find its value props to be:

simplify how code that interacts with multiple areas is wired up, such as a camera system
enable systems that need to operate on all world entities, such as collision detection
In this post I'll talk through how I implemented a camera system using idiomatic React patterns and how I refactored it to use ECS.

Idiomatic React
Initially FAZE didn't use ECS at all, relying instead on idiomatic React patterns (state and context). For the camera system I had one primary goal: that the camera should smoothly transition from one entity to another. To accomplish this I figured it made the most sense to use a single camera and then lean on React context for the wiring up.

Using a single top level camera provider and child camera target component to mark entities that can be focused. The following code is slightly simplified but hopefully you get the picture.

const TargetContext = createContext();

function FollowingCamera({ children }) {
  const ref = useRef();
  // Hold an array for all focused targets.
  const [targets] = useState([]);
  // The last element is considered the target.
  const [target] = targets.at(-1);

  useFrame((_, delta) => {
    // Every frame damp towards the target position.
    damp(ref.current.position, target.position, 3, delta);
  });

  return (
    <TargetContext.Provider value={targets}>
      <PerspectiveCamera ref={ref} />
      {children}
    </TargetContext.Provider>
  );
}
The following camera uses state and context and moves the camera towards the target every frame.
function CameraTarget({ children, disabled }) {
  const targets = useContext(TargetContext);
  const ref = useRef(null);

  useLayoutEffect(() => {
    // On first effect when enabled add the target to the provider.
    if (disabled) {
      return;
    }

    // Traverse through children until we find a mesh with "camera-target" as its name.
    const target = findTarget(ref.current.children);
    targets.push(target);

    return () => {
      // On last effect remove the target from the provider.
      targets.splice(targets.indexOf(data), 1);
    };
  }, [disabled, targets, zoom]);

  return <group ref={ref}>{children}</group>;
}
The camera target finds and adds the target to the following camera on mount and removes on unmount.
function PlayerEntity({ position }) {
  return (
    // The player is always focused.
    <CameraTarget>
      <mesh position={position} name="camera-target">
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </CameraTarget>
  );
}
The player entity wraps itself with the camera target and names the target with "camera-target", it is always focused.
function NPCEntity({ position }) {
  // NPCs are conditionally focused depending on some state.
  const [focused] = useState(false);

  return (
    <CameraTarget disabled={!focused}>
      <mesh position={position} name="camera-target">
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </CameraTarget>
  );
}
The npc entity wraps itself with the camera target and names the target with "camera-target", it is conditionally focused.
<FollowingCamera>
  <PlayerEntity />
  <NPCEntity />
</FollowingCamera>
The main point here is that there is a lot of wiring up, and some leaky abstractions - namely meshes needing the name "camera-target". We can't just get the top most child of the CameraTarget component and call it done - we need the mesh that has its position set else the target will always have [0,0,0] world coordinates!

Refactor to ECS
Initially I moved to ECS as I needed to implement collision detection and a basic physics system in FAZE and for this there needed to be a single place that owns the current world state, lest it become unwieldy. Afterwards I wanted to see what it would take for other systems to move to ECS and the camera was something I was keen to try out.

For the camera system we're interested in a few components:

sceneObject — the Object3D that is to be operated on, e.g. have its position updated
focused — the entity is currently focused
camera — the entity is a camera
This is why ECS is considered declarative, we can add any number of components to an entity to enable behavior. With miniplex this comes down to declaring a few components (...on the Component, component). Entities now become simple declarations describing what it is:

function CameraEntity() {
  return (
    <Entity>
      <Component name="camera" data={true} />
      <Component name="sceneObject">
        <PerspectiveCamera />
      </Component>
    </Entity>
  );
}
The camera entity declares the camera tag, and scene object component.
function PlayerEntity({ position }) {
  return (
    <Entity>
      {/* The player is always focused. */}
      <Component name="focused" data={true} />
      <Component name="sceneObject">
        <mesh position={position}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      </Component>
    </Entity>
  );
}
The player entity declares the focused tag, and scene object component.
function NPCEntity({ position }) {
  const [focused] = useState(false);

  return (
    <Entity>
      {/* NPCs are conditionally focused depending on some state. */}
      {focused && <Component name="focused" data={true} />}
      <Component name="sceneObject">
        <mesh position={position}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      </Component>
    </Entity>
  );
}
The npc entity conditionally declares the focused tag, and scene object component.
<CameraEntity />
<PlayerEntity />
<NPCEntity />
Here we've used two kinds of components according to ECS. An entity component is used to hold arbitrary data while an entity tag is used to categorize entities. Miniplex doesn't currently differentiate between them.
Now it's just a matter of writing some systems (functions) to act on the world, thankfully miniplex provides hooks for this. Hooks in, hooks out!

function useCamera() {
  const { entities: focused } = useEntities(world.with('focused', 'sceneObject'));
  const { entities: cameras } = useEntities(world.with('camera', 'sceneObject'));

  // The first element is considered the primary camera.
  const camera = cameras[0];
  // The last element is considered the target.
  const target = focused.at(-1);

  useFrame((_, delta) => {
    // Every frame damp towards the target position.
    damp(camera.sceneObject.position, target.sceneObject.position, 3, delta);
  });
}
The camera system moves the first camera entity towards the last focused entity every frame.
We define a component to house our systems. If this component is mounted the world ticks along one frame at a time, if it isn't mounted the world is frozen in time.

function WorldSystems() {
  useCamera();
  return null;
}
<WorldSystems />
Comparing the ECS implementation to the idiomatic React implementation you can see the separation of data and behavior being very effective. We also got rid of the leaky abstraction now as each entity declares the scene object that is to be acted on.

I'm a big fan of this pattern and would love to hear if you've started using it too, why not join Web Game Dev's discord and share? Hope to see you soon, have a happy new year!


## ECS 内存排布

export class Entities { /** 存储所有实体的元数据 _/ private meta: EntityMeta[] = []; /_* 待处理的实体索引 _/ private pending: number[] = []; /_* 空闲游标 - 表示待处理列表的长度 _/ private freeCursor: number = 0; /_* 当前活跃的实体数量 */ private count: number = 0;

/**

- 分配一个新的实体 */ alloc(): Entity { this.verifyFlushed(); this.count++;

```
if (this.pending.length > 0) {
  // 从待处理列表中获取索引
  const index = this.pending.pop()!;
  this.freeCursor = this.pending.length;
  // 使用现有的 generation
  return new Entity(index, this.meta[index].generation);
} else {
  // 创建新的实体
  const index = this.meta.length;
  if (index > 0xFFFFFFFF) {
    throw new Error('too many entities');
  }
  // 使用初始 generation
  this.meta.push({
    generation: 1,
    location: EntityLocation.INVALID
  });
  return new Entity(index, 1);
}

```

}

/**

- 验证所有待处理的实体都已刷新 */ private verifyFlushed(): void { if (this.pending.length > 0) { throw new Error('Entities must be flushed before allocation'); } }

/**

- 释放一个实体 */ free(entity: Entity): EntityLocation | null { const meta = this.getMeta(entity); if (!meta) return null;

```
const oldLocation = meta.location;

// 增加代数
meta.generation++;
meta.location = EntityLocation.INVALID;

// 加入待处理列表
this.pending.push(entity.getIndex());
this.freeCursor = this.pending.length;
this.count--;

return oldLocation;

```

}

/**

- 刷新待处理的实体 */ flush(f: (entity: Entity, location: EntityLocation) => void): void { for (const index of this.pending) { const entity = new Entity(index, this.meta[index].generation); const location = this.meta[index].location;
    
    if (location === EntityLocation.INVALID) { // 无效位置的实体保持在待处理状态 continue; }
    
    // 调用回调函数 f(entity, location); } // 清空待处理列表 this.pending = []; this.freeCursor = 0; } }
    

export class Entities { /** 存储所有实体的元数据 _/ private meta: EntityMeta[] = []; /_* 待处理的实体索引 _/ private pending: number[] = []; /_* 空闲游标 - 表示待处理列表的长度 _/ private freeCursor: number = 0; /_* 当前活跃的实体数量 */ private count: number = 0;

/**

- 分配一个新的实体 */ alloc(): Entity { this.verifyFlushed(); this.count++;

```
if (this.pending.length > 0) {
  // 从待处理列表中获取索引
  const index = this.pending.pop()!;
  this.freeCursor = this.pending.length;
  // 使用现有的 generation
  return new Entity(index, this.meta[index].generation);
} else {
  // 创建新的实体
  const index = this.meta.length;
  if (index > 0xFFFFFFFF) {
    throw new Error('too many entities');
  }
  // 使用初始 generation
  this.meta.push({
    generation: 1,
    location: EntityLocation.INVALID
  });
  return new Entity(index, 1);
}

```

}

/**

- 验证所有待处理的实体都已刷新 */ private verifyFlushed(): void { if (this.pending.length > 0) { throw new Error('Entities must be flushed before allocation'); } }

/**

- 释放一个实体 */ free(entity: Entity): EntityLocation | null { const meta = this.getMeta(entity); if (!meta) return null;

```
const oldLocation = meta.location;

// 增加代数
meta.generation++;
meta.location = EntityLocation.INVALID;

// 加入待处理列表
this.pending.push(entity.getIndex());
this.freeCursor = this.pending.length;
this.count--;

return oldLocation;

```

}

/**

- 刷新待处理的实体 */ flush(f: (entity: Entity, location: EntityLocation) => void): void { for (const index of this.pending) { const entity = new Entity(index, this.meta[index].generation); const location = this.meta[index].location;
    
    if (location === EntityLocation.INVALID) { // 无效位置的实体保持在待处理状态 continue; }
    
    // 调用回调函数 f(entity, location); } // 清空待处理列表 this.pending = []; this.freeCursor = 0; } }
## 存储结构

### Archetype

让我用图表来解释 Archetype 存储的工作原理： 初始状态 (空世界):

World: Archetypes: [] NextEntityId: 0

创建第一个带有 Transform 和 Geometry 的实体:

Entity(0) + [Transform, Geometry]

Archetype[Transform, Geometry]: ┌─────────┬──────────┬──────────────┐ │ Row │ Entity │ Components │ ├─────────┼──────────┼──────────────┤ │ 0 │ 0 │ T0, G0 │ └─────────┴──────────┴──────────────┘

创建第二个相同组件的实体:

Entity(1) + [Transform, Geometry]

Archetype[Transform, Geometry]: ┌─────────┬──────────┬──────────────┐ │ Row │ Entity │ Components │ ├─────────┼──────────┼──────────────┤ │ 0 │ 0 │ T0, G0 │ │ 1 │ 1 │ T1, G1 │ └─────────┴──────────┴──────────────┘

创建一个不同组件组合的实体:

Entity(2) + [Transform, Geometry, Renderable]

Archetype[Transform, Geometry]:

┌─────────┬──────────┬──────────────┐

│ Row │ Entity │ Components │ ├─────────┼──────────┼──────────────┤ │ 0 │ 0 │ T0, G0 │ │ 1 │ 1 │ T1, G1 │ └─────────┴──────────┴──────────────┘

Archetype[Transform, Geometry, Renderable]: ┌─────────┬──────────┬────────────────────┐ │ Row │ Entity │ Components │ ├─────────┼──────────┼────────────────────┤ │ 0 │ 2 │ T2, G2, R2 │ └─────────┴──────────┴────────────────────┘

添加组件到现有实体 (给 Entity(1) 添加 Renderable):

// Entity(1) 从旧 Archetype 移动到新 Archetype

Archetype[Transform, Geometry]: ┌─────────┬──────────┬──────────────┐

│ Row │ Entity │ Components │

├─────────┼──────────┼──────────────┤

│ 0 │ 0 │ T0, G0 │

└─────────┴──────────┴──────────────┘

Archetype[Transform, Geometry, Renderable]: ┌─────────┬──────────┬────────────────────┐ │ Row │ Entity │ Components │ ├─────────┼──────────┼────────────────────┤ │ 0 │ 2 │ T2, G2, R2 │ │ 1 │ 1 │ T1, G1, R1 │ └─────────┴──────────┴────────────────────┘

内部数据结构:

class Archetype { // 组件数据按列存储 columns: { Transform: [T0], // Entity 0 的 Transform Geometry: [G0], // Entity 0 的 Geometry }

// 实体到行的映射 entityToRow: Map { 0 => 0, // Entity 0 在第 0 行 }

// 行到实体的映射 entities: [ Entity(0) ] }

查询示例:

// 查询 [Transform, Renderable] Query<[Transform, Renderable]>: 匹配的 Archetypes:

- Archetype[Transform, Geometry, Renderable] ┌─────────┬──────────┬────────────┐ │ Entity │ Transform│ Renderable │ ├─────────┼──────────┼────────────┤ │ 2 │ T2 │ R2 │ │ 1 │ T1 │ R1 │ └─────────┴──────────┴────────────┘

这种存储方式的关键点： 组件数据连续存储 每个 Archetype 中的组件数据是连续的 有利于缓存命中和遍历性能 实体移动 添加/删除组件时，实体会在 Archetype 间移动 需要移动组件数据 查询效率 可以直接定位到包含所需组件的 Archetype 在匹配的 Archetype 中连续遍历数据 内存布局 按列存储组件数据 实体ID和行索引的双向映射 这种可视化的理解有助于：

1. 理解实体和组件的存储关系 理解组件操作的性能特征 优化系统的查询和处理逻辑

// 存在的 Archetypes: Archetype1: [Position, Velocity] Archetype2: [Position, Velocity, Render] Archetype3: [Position, Health] Archetype4: [Position, Health, Render]

// 查询示例: Query1 = Query([Position, Velocity]) ┌───────────┬─────────┬───────────┐ │ Archetype │ 必需组件│ 匹配? │ ├───────────┼─────────┼───────────┤ │ 1 │ P,V │ ✓ │ │ 2 │ P,V,R │ ✓ │ │ 3 │ P,H │ ✗ │ │ 4 │ P,H,R │ ✗ │ └───────────┴─────────┴───────────┘

// 带排除的查询: Query2 = Query([Position], [Render]) ┌───────────┬─────────┬──────────┬───────────┐ │ Archetype │ 组件 │ 有Render │ 匹配? │ ├───────────┼─────────┼──────────┼───────────┤ │ 1 │ P,V │ ✗ │ ✓ │ │ 2 │ P,V,R │ ✓ │ ✗ │ │ 3 │ P,H │ ✗ │ ✓ │ │ 4 │ P,H,R │ ✓ │ ✗ │ └───────────┴─────────┴──────────┴───────────┘

remove 实现使用了位运算来修改实体的 archetype。让我解释一下：

Entities.prototype.remove = function (entity: Readonly<Entity>, type: Class) { // 1. 获取实体当前的 archetype（如果在 destinations 中没有，就获取当前的） const val = this._destinations.get(entity) ?? this.getArchetype(entity);

// 2. 获取要删除的组件在世界中的 ID const componentId = this._world.getComponentId(type);

// 3. 使用异或操作 (^) 来移除组件 // 例如：如果当前 archetype 是 1101 (二进制)，要移除第二位的组件 // 1101 ^ 0100 = 1001 this._destinations.set(entity, val ^ (1n << BigInt(componentId))); };

// 假设一个实体有 Position, Velocity, Health 三个组件 // archetype 可能是这样的（二进制）: 111 (7) // Position (id=0): 001 // Velocity (id=1): 010 // Health (id=2): 100

// 如果要移除 Velocity 组件: // 当前 archetype: 111 (7) // 要移除的组件位: 010 (2) // 异或后的结果: 101 (5) <- 新的 archetype，不再包含 Velocity

// 假设一个实体有 Position, Velocity, Health 三个组件 // archetype 可能是这样的（二进制）: 111 (7) // Position (id=0): 001 // Velocity (id=1): 010 // Health (id=2): 100

// 如果要移除 Velocity 组件: // 当前 archetype: 111 (7) // 要移除的组件位: 010 (2) // 异或后的结果: 101 (5) <- 新的 archetype，不再包含 Velocity 关键点： 使用 destinations Map 存储待更新的 archetype 使用位运算高效地修改 archetype 实际的组件移除在 update() 中执行 这是一个延迟操作，不会立即修改实体的组件

// 假设我们有一个表格包含 Entity 和 Position 组件 table = { _components: [Entity, Position], // 组件类型 _columns: [ // Entity 列 [ Entity{id:0, row:0}, // 行 0 Entity{id:1, row:1}, // 行 1 Entity{id:2, row:2} // 行 2 ], // Position 列 [ Position{x:0, y:0}, // 行 0 Position{x:1, y:1}, // 行 1 Position{x:2, y:2} // 行 2 ] ] }

columns 是按组件类型分组的数组 _columns[0] 是 Entity 组件的列 _columns[1] 是 Position 组件的列

row 是每个列中的索引位置 同一个实体的所有组件共享相同的 row 比如 Entity{id:1} 在 row:1，它的 Position 也在对应列的 row:1

// 访问实体及其组件 const entity = table._columns[0][1]; // Entity 列的 row 1 const position = table._columns[1][1]; // Position 列的 row 1

// 它们属于同一个实体，因为 row 相同 console.log([entity.id](http://entity.id/)); // 1 console.log(position.x, position.y); // 1, 1

## 参考 Bevy
### 实现思路
```tsx
world 需要的 api:

- world.get_resource_or_insert_with
- world.bootstrap();
- world.register_required_components
- world.spawn
- world.spawn_batch
- world.entity
- world.try_register_required_components
- world.entity_mut
- world.get_entity_mut(entity)
- world.get_entity(entity)
- world.spawn_empty()
- world.many_entities_mut
- world.despawn
- world.get_mut::<Position>(entity).unwrap()
- world.query
- world.get
- world.last_change_tick
- world.increment_change_tick
- world.resource
- world.init_resource
- world.remove_resource
- world.insert_resource
- world.iter_resources
- world.add_schedule
- world.schedule_scope
- world.get_resource_by_id
- world.remove_resource_by_id
- world.inspect_entity
- world.iter_entities

world 的数据结构:

export class World {
  private _tableManager: TableManager;
  private _componentRegistry: ComponentRegistry;
  private _resourceManager: ResourceManager;
  private _eventManager: EventManager;
  readonly entities: Entities;

  constructor(config: Partial<WorldConfig> = {}) {
    this._tableManager = new TableManager();
    this._componentRegistry = new ComponentRegistry();
    this._resourceManager = new ResourceManager();
    this._eventManager = new EventManager();
    this.entities = new Entities(this);
    this.config = getCompleteConfig(config);
  }

  // 提供受控的访问接口
  getTable(archetype: bigint): Table {
    return this._tableManager.getTable(archetype);
  }

  registerComponent(componentType: Class): number {
    return this._componentRegistry.register(componentType);
  }

  async getResource<T extends Class>(type: T): Promise<InstanceType<T>> {
    return this._resourceManager.getResource(type);
  }

  on(event: string, listener: Function): void {
    this._eventManager.on(event, listener);
  }
}
```

```jsx
import { Atomic } from '../utils/atomic';
import { Entities } from './entities';
import { Archetypes } from './archetype';
import { Storages } from './storage';
import { Bundles } from './bundle';
import { CommandQueue } from './command';

export type WorldId = number;
export type Tick = number;

export class World {
  // 唯一标识符
  private readonly id: WorldId;
  
  // 核心系统
  private readonly entities: Entities;
  private readonly components: Set<Class>;
  private readonly archetypes: Archetypes;
  private readonly storages: Storages;
  private readonly bundles: Bundles;
  
  // 变更追踪
  private readonly changeTick: Atomic<number>;
  private lastChangeTick: Tick;
  private lastCheckTick: Tick;
  
  // 命令系统
  private lastTriggerId: number = 0;
  private readonly commandQueue: CommandQueue;

  constructor() {
    // 1. 生成世界ID
    this.id = World.nextWorldId++;
    
    // 2. 初始化核心系统
    this.entities = new Entities();
    this.components = new Set();
    this.archetypes = new Archetypes();
    this.storages = new Storages();
    this.bundles = new Bundles();
    
    // 3. 初始化变更追踪
    // 从 1 开始，这样首次系统运行时可以检测到变更
    this.changeTick = new Atomic(1);
    this.lastChangeTick = 0;
    this.lastCheckTick = 0;
    
    // 4. 初始化命令系统
    this.commandQueue = new CommandQueue();
    
    // 5. 执行引导程序
    this.bootstrap();
  }

  // 引导程序 - 初始化基础组件和系统
  private bootstrap(): void {
    // 注册核心组件
    // 初始化基础系统
    // 等等...
  }

  // 获取世界ID
  getId(): WorldId {
    return this.id;
  }

  // 获取当前变更计数
  getChangeTick(): number {
    return this.changeTick.get();
  }

  // 标记发生变更
  markChanged(): void {
    this.changeTick.incrementAndGet();
  }

  // 处理命令队列
  flushCommands(): void {
    this.commandQueue.flush(this);
  }

  // 静态成员
  private static nextWorldId = 1;
}

// 相关类型定义
class Atomic<T extends number> {
  private value: T;

  constructor(initial: T) {
    this.value = initial;
  }

  get(): T {
    return this.value;
  }

  incrementAndGet(): T {
    return ++this.value;
  }
}

class CommandQueue {
  private commands: Array<(world: World) => void> = [];

  push(command: (world: World) => void): void {
    this.commands.push(command);
  }

  flush(world: World): void {
    const commands = this.commands;
    this.commands = [];
    for (const command of commands) {
      command(world);
    }
  }
}
```

```jsx
import { Atomic } from '../utils/atomic';
import { Class } from '../utils/class';
import { Event } from '../utils/event';

// 基础类型定义
export type WorldId = number;
export type ComponentId = number;
export type ArchetypeId = number;
export type EntityId = number;
export type Tick = number;

// 组件相关
export interface ComponentInfo {
  id: ComponentId;
  name: string;
  type: Class;
}

export class Components {
  private _components = new Map<Class, ComponentId>();
  private _componentInfo = new Map<ComponentId, ComponentInfo>();
  private _nextComponentId = 0;

  register<T>(componentType: Class<T>): ComponentId {
    let id = this._components.get(componentType);
    if (id !== undefined) return id;

    id = this._nextComponentId++;
    this._components.set(componentType, id);
    this._componentInfo.set(id, {
      id,
      name: componentType.name,
      type: componentType,
    });

    return id;
  }

  getId(componentType: Class): ComponentId | undefined {
    return this._components.get(componentType);
  }

  getInfo(id: ComponentId): ComponentInfo | undefined {
    return this._componentInfo.get(id);
  }
}

// 原型（Table）相关
export class Archetype {
  constructor(
    public readonly id: ArchetypeId,
    public readonly componentIds: Set<ComponentId>,
    public readonly table: Table
  ) {}

  contains(componentId: ComponentId): boolean {
    return this.componentIds.has(componentId);
  }
}

export class Archetypes {
  private _archetypes = new Map<ArchetypeId, Archetype>();
  private _nextArchetypeId = 0;

  create(componentIds: Set<ComponentId>, table: Table): Archetype {
    const id = this._nextArchetypeId++;
    const archetype = new Archetype(id, componentIds, table);
    this._archetypes.set(id, archetype);
    return archetype;
  }

  get(id: ArchetypeId): Archetype | undefined {
    return this._archetypes.get(id);
  }
}

// 存储相关
export class Table {
  private _columns: any[][] = [];
  private _entities: EntityId[] = [];

  constructor(
    public readonly id: number,
    public readonly componentIds: Set<ComponentId>
  ) {}

  insert(row: number, components: any[]): void {
    for (let i = 0; i < components.length; i++) {
      this._columns[i] = this._columns[i] || [];
      this._columns[i][row] = components[i];
    }
  }

  remove(row: number): void {
    for (const column of this._columns) {
      column[row] = undefined;
    }
  }
}

export class Storages {
  private _tables = new Map<number, Table>();
  private _nextTableId = 0;

  createTable(componentIds: Set<ComponentId>): Table {
    const id = this._nextTableId++;
    const table = new Table(id, componentIds);
    this._tables.set(id, table);
    return table;
  }

  getTable(id: number): Table | undefined {
    return this._tables.get(id);
  }
}

// 实体相关
export class Entities {
  private _entities = new Map<EntityId, EntityLocation>();
  private _nextEntityId = 0;

  spawn(): EntityId {
    const id = this._nextEntityId++;
    return id;
  }

  setLocation(entityId: EntityId, location: EntityLocation): void {
    this._entities.set(entityId, location);
  }

  getLocation(entityId: EntityId): EntityLocation | undefined {
    return this._entities.get(entityId);
  }
}

export interface EntityLocation {
  archetype: ArchetypeId;
  row: number;
}

// 命令系统
export interface Command {
  apply(world: World): void;
}

export class CommandQueue {
  private _commands: Command[] = [];

  push(command: Command): void {
    this._commands.push(command);
  }

  flush(world: World): void {
    const commands = this._commands;
    this._commands = [];
    for (const command of commands) {
      command.apply(world);
    }
  }
}

// 事件系统
export class Events {
  private _events = new Map<string, any[]>();
  private _listeners = new Map<string, Set<(event: any) => void>>();

  emit<T>(eventType: string, event: T): void {
    const events = this._events.get(eventType) || [];
    events.push(event);
    this._events.set(eventType, events);

    const listeners = this._listeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  on<T>(eventType: string, listener: (event: T) => void): void {
    let listeners = this._listeners.get(eventType);
    if (!listeners) {
      listeners = new Set();
      this._listeners.set(eventType, listeners);
    }
    listeners.add(listener);
  }
}

// World 主类
export class World {
  private readonly id: WorldId;
  private readonly components: Components;
  private readonly archetypes: Archetypes;
  private readonly storages: Storages;
  private readonly entities: Entities;
  private readonly commandQueue: CommandQueue;
  private readonly events: Events;

  private _changeTick: Atomic<number>;
  private _lastChangeTick: Tick;
  private _lastCheckTick: Tick;

  constructor() {
    this.id = World.nextWorldId++;
    this.components = new Components();
    this.archetypes = new Archetypes();
    this.storages = new Storages();
    this.entities = new Entities();
    this.commandQueue = new CommandQueue();
    this.events = new Events();

    this._changeTick = new Atomic(1);
    this._lastChangeTick = 0;
    this._lastCheckTick = 0;
  }

  // 实体操作
  spawn(): EntityId {
    return this.entities.spawn();
  }

  // 组件操作
  registerComponent<T>(componentType: Class<T>): ComponentId {
    return this.components.register(componentType);
  }

  // 命令操作
  queueCommand(command: Command): void {
    this.commandQueue.push(command);
  }

  flushCommands(): void {
    this.commandQueue.flush(this);
  }

  // 事件操作
  emit<T>(eventType: string, event: T): void {
    this.events.emit(eventType, event);
  }

  on<T>(eventType: string, listener: (event: T) => void): void {
    this.events.on(eventType, listener);
  }

  // 变更追踪
  markChanged(): void {
    this._changeTick.incrementAndGet();
  }

  // 静态成员
  private static nextWorldId = 0;
}
```