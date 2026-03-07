# 红线规则
## 1. 前端永远不能出现 service_role key
- **说明**: 禁止在前端（任何 Client Component、浏览器代码）使用 Supabase service_role key；前端只允许使用 anon key。需要管理员权限的操作必须走服务端 route 或 server action。
## 2. 所有业务表必须启用 RLS，并且默认“只能访问自己的数据”
- **说明**: 所有表必须启用 Row Level Security；默认策略：用户只能读写属于自己的记录（按 user_id / membership 关系判定）。任何放宽权限必须明确说明原因与影响范围。
## 3. 消息查询必须带 conversation_id 过滤，并且必须分页
- **说明**: 消息查询必须包含 conversation_id 过滤；任何消息列表查询必须分页，默认每页 50 条，按 created_at 倒序拉取。禁止一次性查询全部消息。
# 2. 默认结构规则
## 1. 目录约定
- `app/`：路由与页面（尽量薄）
- `components/`：纯 UI 组件（尽量无业务）
- `services/`：业务逻辑（发消息、拉会话、订阅实时等）
- `db/`：所有 Supabase 数据访问封装（查询、插入、更新） 页面和组件禁止直接写复杂查询与业务判断，必须调用 services/db。
## 2. 统一返回结构
- **说明**：所有服务函数与 API route 返回统一结构： `{ ok: boolean, data?: T, error?: { code: string, message: string } }` 禁止直接 throw 给 UI 层；错误必须结构化返回。
# 3. 冲突处理规则
## 1. 当任务指令与项目 Rule 冲突时，必须停下来确认
- **说明**：如果用户需求与项目 Rule 冲突（例如要求全量查询、临时放宽权限、绕过 RLS），不得直接实现。必须先指出冲突点，给出两种方案（合规方案/不合规方案）及风险，由我选择后再继续。

# 4.项目关键场景
## 1. 实时订阅只做增量更新，禁止重复订阅
- **说明**：Realtime 订阅必须在组件生命周期内只创建一次，并在 unmount 时取消订阅。订阅收到新消息只能做增量 append，不允许每条消息触发全量 refetch。
## 2. 首屏用服务端拉取，后续靠订阅
- **说明**：消息页首次渲染必须先获取最近 50 条（服务端或 server action）；客户端只负责订阅新增消息。禁止首屏完全依赖订阅导致空白等待。
# 5. 交付自检清单
## 1. 每次输出代码后必须自检 5 条
- **说明**：
1. 是否启用 RLS 且用户只能访问自己的数据？
2. 消息列表是否分页（50 条）且按 conversation_id 过滤？
3. 是否避免在前端使用 service_role key？
4. 是否遵守目录分层（UI/Services/DB）？
5. 给出最短验证步骤（如何手动验证该功能）？

# 6. 规范
### 1. 使用现代 TypeScript/JavaScript语法
- **说明**：优先使用ES6+的现代语法特性,如箭头函数、解构赋值、扩展运算符等,提高代码的简洁性和可读性.
### 2. 数组初始化规范
- **说明**: 禁止使用 `Array()` 构造函数.始终使用数组字面量来初始化数组,或者使用`Array.from()`来初始化具有特定大小的数组.

### 3. 对象字面型类型指定
- **说明**: 必须使用类型注释`: Type`而不是类断言`(as Type)`来指定对象字面量类型的

### 4. 使用可选链和空值合并
- **说明**: 先使用`?.`和`??`替代`&&`或嵌套三元提升可读性与安全性.

### 5. 默认参数放置规范
- **说明**:默认参数必须放在最后.

### 6. `ref/reactive`类型初始化
- **说明**：简单类型可由初始值自动推导（如`ref(0)、ref(false)、ref('')`）;数组 / 对象 / 联合类型等复杂类型必须显式声明泛型类型（如`ref<User | null>(null)、ref<string[]>([])`）;严禁使用 as 类型断言强行修正类型，必须在声明时完成完整类型定义.

### 7. 禁止使用冗余循环
- **说明**：优先使用 `map/filter/some/every/find` 等高阶函数替代冗余循环.

### 8. 避免复杂条件
- **说明**：复杂条件必须抽取为具名的辅助函数或中间变量.

### 9. 避免危险函数
- **说明**：禁止 “eval”、“new Function” 以及直接不安全的 DOM 操作.

### 10. 必须抽离重复渲染逻辑
- **说明**：相同或高度相似的渲染结构出现≥2次必须提取为组件.

### 11. 禁止冗余 JSX 表达式
- **说明**：禁止无意义的 `{}` 与未使用的占位组件/表达式.

### 12. 禁止冗余 Fragment
- **说明**：禁止仅包裹单一元素且无 ‘key’ 的空 Fragment;避免无意义的 Fragment 嵌套.

### 13. 禁止空块语句和空函数
- **说明**：确需留空时必须用注释说明原因与后续计划.

### 14. 禁止调试代码出现
- **说明**：生产代码中禁止出现 `console.` 与 `debugger`.

### 15. ban_magic_numbers
- **说明**：禁止魔法数字;必须使用常量或枚举.注：不适用于样式数值与样式类名.

### 16. avoid_unnecessary_context_prefixes
- **说明**：属性/变量命名避免重复上下文前缀，保持简洁语义化.

### 17. avoid_heavy_branch_logic
- **说明**：复杂分支应提炼为函数/变量，避免在条件表达式内堆叠复杂逻辑.

### 18. avoid_nested_ternary_operators
- **说明**：禁止嵌套三元表达式.

### 19. 分支数量选择规则
- **说明**：分支 ≤3 可用 `if` 或 `switch`;分支 ≥4 必须使用 `switch` 组织，避免长链 `if-else`.复杂分支逻辑仍需配合抽函数命名化条件.

### 20. reduce_function_parameters
- **说明**：函数参数建议不超过 3 个;超过时使用参数对象（接口定义）承载.

### 21. use_string_startswith_endswith
- **说明**：字符串前后缀判断必须使用 `startsWith/endsWith`.

### 22. keep_classes_small
- **说明**：类应保持职责单一，避免大而全.

### 23. maintain_high_cohesion
- **说明**：类方法应高内聚，主要操作相关实例数据.

### 24. use_exceptions_not_return_codes
- **说明**：使用异常机制处理错误, 不使用返回码分支.

### 25. use_standard_comment_tags
- **说明**: 注释需使用标准标记: `TODO`、`FIXME`、`HACK`、`XXX`.

### 26.CSS 类名命名规范
- **说明**: CSS类名采用 kebab-case

### 27.`!important` 使用规范
- **说明**: 原则上禁用`!important`; 确需使用时必须附带TODO注明原因与移除计划.

### 28.动态样式写法规范
- **说明**: 动态样式仅允许类名切换（推荐）或必要的内联动态值;禁止静态样式写在 style 内部;

### 29. 样式文件命名规范
- **说明**:
	1. 全局 / 通用样式文件：使用 kebab-case 命名，后缀 .less 例：reset. less、theme-variable. less、common-layout. less
	2. Vue 组件私有样式：直接写在组件 `<style scoped lang="less"> ` 内，不单独抽离样式文件
	3. 组件样式必须抽文件时（复杂场景）：命名为 组件名.less，不使用 .module.less 例：Card.less、UserInfo.less
	4. 页面级样式：与页面文件同名，页面名.less 例：index.less、user-center.less
	
### 30.禁用CSS gap属性规范
- **说明**: 在apps/flow-parallel-webapp目录下**全面禁用**`gap/row-gap/column-gap`及派生形式; Flex/Grid间距统—使用margin等替代方案.