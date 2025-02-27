每周需要进行的一些事情：

- [ ] 算法：保持手感
- [ ] 机器学习：
- [ ] 图形学：WebGL / Shader[[]]
- [ ] Obsidian 改造，弃用 Notion
- [ ] 博客：借助 Obsidian 进行内容创作
- [ ] 主题：搞一套 UI 方案，结合 shadcn/ui magicui 和 motion 的能力
- [ ] 主页：新的 UI 库 + threejs 的方案
- [ ] 健身
- [ ] 饮食

```mermaid
graph TD
    A[Context] --> B[Container]
    B --> C[Component]
    C --> D[Code]

    subgraph Context
    A1[标注平台]--集成-->A2[LDAP]
    A1--调用-->A3[GPU集群]
    end
    
    subgraph Container
    B1[Web前端]-->B2[API Gateway]
    B2-->B3[标注服务]
    B2-->B4[模型训练服务]
    end
```

```plantuml
@startuml
!include <C4/C4_Context>

Person(annotator, "标注员", "执行数据标注任务")
Person(admin, "管理员", "管理项目和用户")

System_Boundary(platform, "智能标注训练平台") {
    System(anno_sys, "标注系统", "支持图像/文本标注")
    System(train_sys, "训练系统", "自动化模型训练")
}

System_Ext(oss, "对象存储", "阿里云OSS")
System_Ext(gpu, "GPU集群", "NVIDIA DGX")

Rel(annotator, anno_sys, "使用")
Rel(admin, anno_sys, "管理")
Rel(anno_sys, oss, "读写", "HTTP API")
Rel(train_sys, gpu, "提交任务", "gRPC")
@enduml
```
