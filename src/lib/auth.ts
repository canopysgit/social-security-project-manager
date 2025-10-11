// 简单的认证逻辑
export const AUTH_CONFIG = {
  USERNAME: 'admin',
  PASSWORD: 'password',
  SESSION_KEY: 'auth_session'
}

export interface AuthResult {
  success: boolean
  message?: string
  user?: {
    username: string
    isAuthenticated: boolean
  }
}

// 登录验证
export function validateLogin(username: string, password: string): AuthResult {
  if (username === AUTH_CONFIG.USERNAME && password === AUTH_CONFIG.PASSWORD) {
    const user = {
      username: AUTH_CONFIG.USERNAME,
      isAuthenticated: true
    }
    
    // 保存到 localStorage
    localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(user))
    
    return {
      success: true,
      user
    }
  }
  
  return {
    success: false,
    message: '用户名或密码错误'
  }
}

// 检查登录状态
export function checkAuthStatus(): AuthResult {
  try {
    const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY)
    if (sessionData) {
      const user = JSON.parse(sessionData)
      if (user.isAuthenticated) {
        return {
          success: true,
          user
        }
      }
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
  }
  
  return { success: false }
}

// 登出
export function logout() {
  localStorage.removeItem(AUTH_CONFIG.SESSION_KEY)
}