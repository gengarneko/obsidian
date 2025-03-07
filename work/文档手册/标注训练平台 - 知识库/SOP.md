# 快速入门

## 数据准备

### 下载数据

1. 登录中台
   - 访问地址：<http://10.100.1.107:81/data-query/imageQuery>
   - 导航路径：左侧项目栏 → 数据查询 → 图片查询

2. 数据筛选
   - 输入工单号进行查询
   - 筛选条件：
     - 漏失数据：选择 AI ok, VRS ng
     - 误报数据：选择 AI ng, VRS ok【可选】

3. 导出设置
   - 点击"图片导出"
   - 导出参数：
     - 选择"按训练图片导出"
       - V1版本
       - JSON格式
       - 是否有多图
   - > ⚠️ 注意：此设置仅适用于一代机，不适用于二代机

4. 下载文件
   - 导航路径：左侧任务栏 → 文件管理 → 文件下载
   - 点击下载图标获取料号文件

### 数据预处理

- 解压下载的数据包
- 删除所有JSON格式文件（使用Ctrl+F查找）

## 数据导入

### 数据标注训练平台

- 平台地址：[Defect Leaning Tool (deepsight.ai)](https://dp02.deepsight.ai)

### 数据分类

> ⚠️ 需要补充说明：八个模型的具体名称和用途

当前重点关注两个模型：

- 方向光模型
- 彩色光模型

### 导入流程

#### 方向光模型数据导入

1. 选择"方向光模型数据"
2. 创建新任务：
   - 点击右下角"+"号
   - 设置任务名称
   - 选择3通道
3. 上传图片：
   - 导入灰度图片（方向光图片）
   - 提交确认

#### 彩色光模型数据导入

- 操作步骤同方向光模型
- 区别：选择彩色图片进行导入

## 数据标注

### 标注任务选择

1. 在标注任务栏选择任务
2. 点击"打开"
3. 选择分工ID号

### 标注操作

1. 切换到图像标注模式
2. 三通道说明：
   - 左侧：待检测图
   - 中间：模版图
   - 右侧：gerber图

### 标注方法

> ⚠️ 需要补充说明：各数字键对应的具体缺陷类型

1. 快捷键说明：
   - 数字键1-0：对应不同缺陷类型
2. 自动化功能：
   - 可开启"自动转到下一帧"
3. 保存操作：
   - 完成标注后点击左上角保存按钮

## 模型训练

### 模型对应关系

方向光模型数据 → defect_second_stage
彩色光模型数据 → stage

### 训练流程（以方向光模型为例）

1. 数据准备：
   - 选择defect_second_stage
   - 导入标注数据
   - 筛选条件设置：
     - annotation task
     - used=false

2. 数据处理：
   - 标记属性：设为used

3. 数据集划分：
   - 方式：Auto
   - 训练集(train)：验证集(Validate) = 7:3

4. 启动训练：
   - 导航：菜单 → 创建训练作业
   - 点击"保存并创建"
