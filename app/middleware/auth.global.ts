export default defineNuxtRouteMiddleware(async (to, _from) => {
  // 服务端直接跳过（SSR 安全）
  if (import.meta.server) return

  const supabase = useSupabaseClient()

  // 检查是否为认证页面
  const isAuthPage = to.path === '/login' || to.path === '/register'

  // 尝试获取 session 状态（处理刷新页面后的认证状态）
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch {
    // 获取 session 状态失败，继续执行（让后续逻辑处理）
  }

  // 无有效 session 且不在认证页面 → 跳登录页
  if (!session && !isAuthPage) {
    return navigateTo('/login')
  }

  // 有有效 session 且在认证页面 → 跳首页
  if (session && isAuthPage) {
    return navigateTo('/')
  }
})