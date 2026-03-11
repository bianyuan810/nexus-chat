# Nexus Chat (极速社交助手) - 实现计划

## [x] Task 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 初始化Nuxt4项目
  - 配置Supabase连接
  - 搭建项目目录结构
  - 配置基础路由
- **Acceptance Criteria Addressed**: None
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目能够正常启动
  - `programmatic` TR-1.2: Supabase连接配置正确
- **Notes**: 按照目录约定创建app/、components/、services/、db/目录

## [x] Task 2: 数据库设计与迁移
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 设计User、Conversation、Member、Message表结构
  - 配置RLS策略
  - 执行数据库迁移
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-2.1: 数据库表结构创建成功
  - `programmatic` TR-2.2: RLS策略配置正确
- **Notes**: 确保所有表启用RLS，默认"只能访问自己的数据"

## [x] Task 3: 身份验证模块实现
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 实现邮箱注册功能
  - 实现邮箱登录功能
  - 实现用户注销功能（基于Supabase Auth）
  - 实现会话管理（基于Nuxt4中间件 + Supabase Auth）
  - 实现JWT令牌管理
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: POST /api/auth/register 接口能成功创建用户
  - `programmatic` TR-3.2: POST /api/auth/login 接口能成功返回JWT令牌
  - `programmatic` TR-3.3: 调用Supabase Auth的signOut方法能成功注销用户
  - `programmatic` TR-3.4: Nuxt4中间件能正确验证会话状态
  - `human-judgment` TR-3.5: 登录/注册页面UI美观易用
- **Notes**: 前端只使用anon key，认证操作走服务端route

## [x] Task 4: 联系人列表模块实现
- **Priority**: P1
- **Depends On**: Task 3
- **Description**:
  - 实现获取联系人列表的API
  - 实现联系人列表页面
  - 实现联系人选择功能
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: GET /api/contacts 接口能返回用户的联系人列表
  - `human-judgment` TR-4.2: 联系人列表页面显示正确
- **Notes**: 联系人列表基于用户参与的会话

## [x] Task 5: 消息发送与接收模块实现
- **Priority**: P0
- **Depends On**: Task 4
- **Description**:
  - 实现发送消息的API
  - 实现接收消息的功能
  - 实现聊天界面
  - 实现消息历史加载
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-6
- **Test Requirements**:
  - `programmatic` TR-5.1: POST /api/messages 接口能成功发送消息
  - `programmatic` TR-5.2: 消息被正确存储到数据库
  - `human-judgment` TR-5.3: 聊天界面显示正确
  - `human-judgment` TR-5.4: 消息发送和接收流程流畅
- **Notes**: 消息查询必须带conversation_id过滤，并且必须分页（默认50条/页）

## [x] Task 6: 实时消息推送实现
- **Priority**: P1
- **Depends On**: Task 5
- **Description**:
  - 配置Supabase Realtime服务
  - 实现消息订阅功能
  - 实现实时消息更新
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-6.1: Supabase Realtime服务配置正确
  - `human-judgment` TR-6.2: 实时消息推送功能正常工作
- **Notes**: 实时订阅只做增量更新，禁止重复订阅

## [x] Task 7: 系统测试与优化
- **Priority**: P1
- **Depends On**: Task 6
- **Description**:
  - 执行系统功能测试
  - 执行性能测试
  - 进行代码优化
- **Acceptance Criteria Addressed**: All
- **Test Requirements**:
  - `programmatic` TR-7.1: 所有API接口测试通过
  - `human-judgment` TR-7.2: 系统整体运行流畅
- **Notes**: 确保系统可靠性、安全性和可维护性