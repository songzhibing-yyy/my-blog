// 定义API响应类型
export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

// 定义用户相关的类型
export interface UserInfo {
    id?: string;
    phone: string;
    userId: string;
    nickname?: string;
    avatar?: string;
    job?: string;
    introduce?: string;
    loginTime?: string;
}

// 发送验证码响应类型
export interface SendCodeResponse {
    verifyCode?: string; // 开发环境可能返回
}

// 登录响应类型
export interface LoginResponse {
    token: string;
    user: UserInfo;
}

// 验证token响应类型
export interface ValidateResponse {
    valid: boolean;
    user?: UserInfo;
}