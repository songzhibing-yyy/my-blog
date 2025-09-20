import request from '@/Service/fetch';

// 定义用户信息类型
interface UserInfo {
    phone: string;
    userId: string;
    loginTime?: string;
}

/**
 * 前端Token工具类
 */
export class AuthService {
    private static readonly TOKEN_KEY = 'auth_token';
    private static readonly USER_KEY = 'user_info';

    /**
     * 获取本地存储的token
     */
    static getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * 获取本地存储的用户信息
     */
    static getUserInfo(): UserInfo | null {
        if (typeof window === 'undefined') return null;
        const userInfo = localStorage.getItem(this.USER_KEY);
        return userInfo ? JSON.parse(userInfo) : null;
    }

    /**
     * 设置token和用户信息
     */
    static setAuth(token: string, userInfo: UserInfo): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
    }

    /**
     * 清除认证信息
     */
    static clearAuth(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    /**
     * 检查是否已登录（检查本地token）
     */
    static isLoggedIn(): boolean {
        return !!this.getToken();
    }

    /**
     * 验证token是否有效（调用API验证）
     */
    static async validateToken(): Promise<{
        valid: boolean;
        user?: UserInfo;
        message?: string;
    }> {
        try {
            const token = this.getToken();
            if (!token) {
                return { valid: false, message: '未登录' };
            }

            const response = await request.post('/api/user/validate', { token }) as {
                code: number;
                message: string;
                data: { valid: boolean; user: UserInfo };
            };
            
            if (response?.code === 0 && response.data?.valid) {
                return {
                    valid: true,
                    user: response.data.user
                };
            } else {
                // token无效，清除本地存储
                this.clearAuth();
                return {
                    valid: false,
                    message: response?.message || 'Token已过期'
                };
            }
        } catch (error) {
            console.error('验证token失败:', error);
            this.clearAuth();
            return {
                valid: false,
                message: '验证失败'
            };
        }
    }

    /**
     * 通过Cookie验证token（GET请求）
     */
    static async validateTokenByCookie(): Promise<{
        valid: boolean;
        user?: UserInfo;
        message?: string;
    }> {
        try {
            const response = await request.get('/api/user/validate') as {
                code: number;
                message: string;
                data: { valid: boolean; user: UserInfo };
            };
            
            if (response?.code === 0 && response.data?.valid) {
                // 同步用户信息到localStorage
                if (response.data.user) {
                    localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
                }
                return {
                    valid: true,
                    user: response.data.user
                };
            } else {
                this.clearAuth();
                return {
                    valid: false,
                    message: response?.message || 'Token已过期'
                };
            }
        } catch (error) {
            console.error('Cookie验证token失败:', error);
            this.clearAuth();
            return {
                valid: false,
                message: '验证失败'
            };
        }
    }

    /**
     * 退出登录
     */
    static async logout(): Promise<{
        success: boolean;
        message?: string;
    }> {
        try {
            const token = this.getToken();
            
            const response = await request.post('/api/user/logout', { token }) as {
                code: number;
                message: string;
            };
            
            // 无论API调用是否成功，都清除本地存储
            this.clearAuth();
            
            if (response?.code === 0) {
                return {
                    success: true,
                    message: '退出登录成功'
                };
            } else {
                return {
                    success: false,
                    message: response?.message || '退出登录失败'
                };
            }
        } catch (error) {
            console.error('退出登录失败:', error);
            // 即使API调用失败，也要清除本地存储
            this.clearAuth();
            return {
                success: false,
                message: '退出登录失败'
            };
        }
    }

    /**
     * 发送验证码
     */
    static async sendVerifyCode(phone: string): Promise<{
        success: boolean;
        message: string;
        verifyCode?: string; // 开发环境可能返回
    }> {
        try {
            const response = await request.post('/api/user/sendcode', {
                phone,
                templateId: 1
            }) as {
                code: number;
                message: string;
                data: { verifyCode?: string };
            };
            
            if (response?.code === 0) {
                return {
                    success: true,
                    message: response.message || '验证码已发送',
                    verifyCode: response.data?.verifyCode // 开发环境下的验证码
                };
            } else {
                return {
                    success: false,
                    message: response?.message || '发送验证码失败'
                };
            }
        } catch (error) {
            console.error('发送验证码失败:', error);
            return {
                success: false,
                message: '发送验证码失败'
            };
        }
    }

    /**
     * 登录
     */
    static async login(phone: string, code: string): Promise<{
        success: boolean;
        message: string;
        token?: string;
        user?: UserInfo;
    }> {
        try {
            const response = await request.post('/api/user/login', {
                phone,
                code
            }) as {
                code: number;
                message: string;
                data: { token: string; user: UserInfo };
            };
            
            if (response?.code === 0 && response.data?.token) {
                // 保存认证信息
                this.setAuth(response.data.token, response.data.user);
                
                return {
                    success: true,
                    message: response.message || '登录成功',
                    token: response.data.token,
                    user: response.data.user
                };
            } else {
                return {
                    success: false,
                    message: response?.message || '登录失败'
                };
            }
        } catch (error) {
            console.error('登录失败:', error);
            return {
                success: false,
                message: '登录失败'
            };
        }
    }
}

// 导出一些便捷函数
export const {
    getToken,
    getUserInfo,
    setAuth,
    clearAuth,
    isLoggedIn,
    validateToken,
    validateTokenByCookie,
    logout,
    sendVerifyCode,
    login
} = AuthService;