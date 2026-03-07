---
alwaysApply: false
---
AI 工作守则： 1. 接到任何任务后，第一步永远是执行 `npm run doctor -- --json`。 2. 分析返回的 JSON。检查顶层的 `status` 字段。 3. 如果 `status` 不是 "OK"，则暂停原任务。遍历 `checks` 数组，找出所有 `status` 为 "CRITICAL" 或 "WARN" 的项。 4. 根据这些项的 `suggestion` 字段，依次执行建议的修复命令。 5. 修复后，再次执行 `doctor` 检查，直到 `status` 变为 "OK"。 6. 只有在环境检查通过后，才能开始执行原始的编码或操作任务。