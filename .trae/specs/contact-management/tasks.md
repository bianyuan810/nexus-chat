# Nexus Chat - 联系人管理功能 - 实现计划

## [x] Task 1: 实现后端联系人搜索API
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在server/api/contacts目录下创建search.get.ts文件
  - 实现通过邮箱搜索用户的功能
  - 确保搜索结果排除当前用户自己
  - 实现分页和安全的搜索逻辑
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: GET /api/contacts/search?email=test@example.com 返回匹配的用户列表
  - `programmatic` TR-1.2: 搜索结果不包含当前登录用户
- **Notes**: 搜索功能需要防止SQL注入，使用参数化查询

## [x] Task 2: 实现后端添加联系人API
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 在server/api/contacts目录下创建add.post.ts文件
  - 实现添加联系人功能，自动创建private conversation
  - 处理已存在conversation的情况
  - 确保双方都成为conversation的成员
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: POST /api/contacts/add 成功创建private conversation
  - `programmatic` TR-2.2: 重复添加联系人时返回已存在的conversation
- **Notes**: 需要处理事务，确保conversation和members表的操作原子性

## [x] Task 3: 实现后端获取联系人列表API
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 在server/api/contacts目录下创建index.get.ts文件
  - 实现获取用户联系人列表的功能
  - 包含联系人基本信息和最近消息摘要
  - 实现按姓名排序功能
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: GET /api/contacts 返回当前用户的联系人列表
  - `programmatic` TR-3.2: 联系人列表按姓名排序
- **Notes**: 需要联表查询获取最近消息信息

## [x] Task 4: 创建前端联系人搜索组件
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 在components目录下创建ContactSearch.vue组件
  - 实现搜索输入框和搜索结果展示
  - 集成后端搜索API
  - 添加加载状态和错误处理
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-4.1: 搜索框输入邮箱后显示搜索结果
  - `human-judgment` TR-4.2: 搜索结果显示用户基本信息和添加按钮
- **Notes**: 实现防抖处理，避免频繁API调用

## [x] Task 5: 创建前端联系人列表组件
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 在components目录下创建ContactList.vue组件
  - 实现联系人列表展示
  - 显示联系人姓名、头像和最近消息
  - 集成后端联系人列表API
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-5.1: 联系人列表正确显示所有联系人
  - `human-judgment` TR-5.2: 每个联系人显示姓名、头像和最近消息
- **Notes**: 实现下拉刷新和加载更多功能

## [x] Task 6: 实现联系人添加功能
- **Priority**: P1
- **Depends On**: Task 2, Task 4
- **Description**: 
  - 在ContactSearch组件中实现添加联系人功能
  - 集成后端添加联系人API
  - 实现添加成功后的反馈和状态更新
  - 处理添加失败的情况
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-6.1: 点击添加按钮后成功添加联系人
  - `human-judgment` TR-6.2: 添加成功后显示反馈信息
- **Notes**: 添加按钮需要有加载状态，防止重复点击

## [x] Task 7: 实现从联系人开始聊天功能
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 在ContactList组件中实现点击联系人进入聊天的功能
  - 跳转到聊天页面并传递conversation_id
  - 确保聊天页面正确加载对应的聊天记录
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-7.1: 点击联系人后跳转到聊天页面
  - `human-judgment` TR-7.2: 聊天页面加载与该联系人的聊天记录
- **Notes**: 需要处理路由跳转和参数传递

## [x] Task 8: 创建联系人管理页面
- **Priority**: P1
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 在app/pages目录下创建contacts/index.vue页面
  - 集成ContactSearch和ContactList组件
  - 实现页面布局和导航
  - 添加页面标题和说明文字
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `human-judgment` TR-8.1: 联系人管理页面布局清晰
  - `human-judgment` TR-8.2: 页面包含搜索和列表功能
- **Notes**: 确保页面响应式设计，适配不同屏幕尺寸

## [x] Task 9: 集成到主应用导航
- **Priority**: P2
- **Depends On**: Task 8
- **Description**: 
  - 在app/app.vue中添加联系人页面的导航链接
  - 确保导航在登录后可见
  - 保持与现有导航风格一致
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-9.1: 导航栏显示联系人入口
  - `human-judgment` TR-9.2: 点击导航链接跳转到联系人页面
- **Notes**: 导航链接需要有适当的图标

## [x] Task 10: 测试和验证
- **Priority**: P0
- **Depends On**: All previous tasks
- **Description**: 
  - 测试所有API端点的功能
  - 测试前端组件的交互
  - 验证联系人添加和聊天功能
  - 确保所有功能符合安全要求
- **Acceptance Criteria Addressed**: All ACs
- **Test Requirements**:
  - `programmatic` TR-10.1: 所有API端点返回正确的响应
  - `human-judgment` TR-10.2: 前端功能正常运行
  - `programmatic` TR-10.3: 安全测试通过
- **Notes**: 需要进行端到端测试，确保完整流程正常工作