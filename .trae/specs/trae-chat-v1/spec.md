# Nexus Chat (极速社交助手) - 产品需求文档

## Overview
- **Summary**: 基于Nuxt4 + Vue3构建的实时聊天应用，提供邮箱注册登录、联系人列表查看、文本消息发送和接收功能，消息持久化存储。
- **Purpose**: 实现高效、稳定的即时通讯与社交网络，提供流畅的消息传递体验。
- **Target Users**: 需要实时通讯功能的个人用户。

## Goals
- 实现邮箱注册与登录功能
- 实现联系人列表查看功能
- 实现发送和接收纯文本消息功能
- 实现消息持久化存储

## Non-Goals (Out of Scope)
- 密码重置与账户验证
- 用户资料管理（昵称、头像）
- 高清图片消息（支持压缩与预览）
- 语音消息（支持录制与播放）
- 消息状态显示（发送中、已发送、已送达、已读）
- 群组聊天（创建与管理群组、群组消息发送与接收、群组成员管理）
- 消息搜索功能
- WebSocket实时消息推送
- 消息订阅与增量更新
- 在线状态显示
- 消息加密与用户数据安全保护
- 内容审核机制
- 数据导出和删除功能
- 云存储方案
- 消息队列
- 第三方实时通讯服务

## Background & Context
- 系统采用分层架构：前端边界（Client）、后端边界（API Route、Service、Repository）、外部服务（Supabase）
- 数据流：客户端发送HTTP请求到API Route，API Route调用Service层，Service层调用Repository层，Repository层与Supabase进行SQL操作，Supabase返回数据给Repository层，Repository层处理数据后返回给Service层，Service层处理业务逻辑后返回结果给API Route，API Route响应客户端请求
- 消息发送流程：用户输入消息并点击发送，客户端向API Route发起POST请求，API Route调用Service层的sendMessage方法，Service层调用Repository层的saveMessage方法，将消息存入Supabase数据库，数据库返回存储成功的结果，Service层通过Supabase Realtime服务发布新消息事件，Service层返回响应给API Route，API Route向客户端返回200 OK，Supabase Realtime服务向订阅了该频道的用户客户端推送新消息事件，客户端接收到事件，获取新消息并更新UI

## Functional Requirements
- **FR-1**: 邮箱注册与登录功能
- **FR-2**: 查看联系人列表
- **FR-3**: 发送和接收纯文本消息
- **FR-4**: 消息持久化存储（单表结构）

## Non-Functional Requirements
- **NFR-1**: 系统可靠性：确保消息发送的可靠性
- **NFR-2**: 系统安全性：遵循数据保护法规，保护用户数据
- **NFR-3**: 系统可维护性：清晰的分层设计，确保职责分离和代码可维护性

## Constraints
- **Technical**: 使用Nuxt4 + Vue3构建前端，使用Supabase作为后端服务
- **Business**: V1版本仅支持核心功能，不包含高级特性
- **Dependencies**: 依赖Supabase提供的PostgreSQL数据库、身份验证和实时消息推送功能

## Assumptions
- 所有业务表启用RLS，默认"只能访问自己的数据"
- 首屏用服务端拉取，后续靠订阅
- 前端只使用anon key，管理员权限操作走服务端route或server action
- 消息查询必须带conversation_id过滤，并且必须分页（默认50条/页）

## Acceptance Criteria

### AC-1: 邮箱注册功能
- **Given**: 用户在注册页面输入有效的邮箱和密码
- **When**: 用户点击注册按钮
- **Then**: 系统创建新用户账户并返回成功响应
- **Verification**: `programmatic`

### AC-2: 邮箱登录功能
- **Given**: 用户在登录页面输入有效的邮箱和密码
- **When**: 用户点击登录按钮
- **Then**: 系统验证用户凭证并返回JWT令牌
- **Verification**: `programmatic`

### AC-3: 查看联系人列表
- **Given**: 用户已登录系统
- **When**: 用户访问联系人页面
- **Then**: 系统显示用户的联系人列表
- **Verification**: `human-judgment`

### AC-4: 发送文本消息
- **Given**: 用户已登录系统并选择了联系人
- **When**: 用户输入文本消息并点击发送按钮
- **Then**: 系统将消息发送给指定联系人并显示在聊天界面
- **Verification**: `human-judgment`

### AC-5: 接收文本消息
- **Given**: 用户已登录系统
- **When**: 其他用户发送消息给该用户
- **Then**: 系统接收消息并显示在聊天界面
- **Verification**: `human-judgment`

### AC-6: 消息持久化存储
- **Given**: 用户发送消息
- **When**: 系统处理消息
- **Then**: 消息被持久化存储到数据库中
- **Verification**: `programmatic`

## Open Questions
- [x] 如何处理用户注销功能？
  - 基于Supabase Auth的注销功能：使用Supabase Auth提供的`signOut`方法，自动处理令牌清除和会话终止，然后重定向到登录页面
- [x] 如何处理会话管理？
  - 基于Nuxt4中间件 + Supabase Auth的会话管理：使用Nuxt4的中间件功能，结合Supabase Auth的会话管理，在路由切换时自动验证会话状态，确保受保护路由只能由已登录用户访问
- [x] 如何实现消息的实时推送？
  - 基于Supabase Realtime的消息实时推送：使用Supabase Realtime服务，在客户端订阅消息表的变更，当有新消息时自动接收并更新UI