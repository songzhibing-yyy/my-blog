import { v4 as uuidv4 } from 'uuid';
import { redisService } from './redis';

// Token配置
const TOKEN_CONFIG = {
    expireTime: 7 * 24 * 60 * 60, // 7天过期时间（秒）
    prefix: 'user_token:',        // Redis键前缀
    userPrefix: 'user_data:',     // 用户数据前缀
};

/**
 * 生成32位UUID token
 * @returns 32位无连字符的UUID字符串
 */
export function generateToken(): string {
    return uuidv4().replace(/-/g, '');
}

/**
 * 获取token对应的Redis键名
 * @param token Token字符串
 * @returns Redis键名
 */
function getTokenKey(token: string): string {
    return `${TOKEN_CONFIG.prefix}${token}`;
}

// 用户数据类型定义
export interface UserData {
    phone: string;
    userId: string;
    loginTime: string;
    [key: string]: unknown;
}

/**
 * 保存token到Redis
 * @param token Token字符串
 * @param userData 用户数据
 * @returns 是否保存成功
 */
export async function saveToken(token: string, userData: UserData): Promise<boolean> {
    try {
        const key = getTokenKey(token);
        const userDataStr = JSON.stringify(userData);
        
        const success = await redisService.set(key, userDataStr, TOKEN_CONFIG.expireTime);
        
        if (success) {
            console.log(`Token已保存: ${token} -> ${userData.phone || userData.userId}, 过期时间: ${TOKEN_CONFIG.expireTime}秒`);
        }
        
        return success;
    } catch (error) {
        console.error('保存Token失败:', error);
        return false;
    }
}

/**
 * 从Redis获取token对应的用户数据
 * @param token Token字符串
 * @returns 用户数据或null
 */
export async function getTokenData(token: string): Promise<UserData | null> {
    try {
        const key = getTokenKey(token);
        const userDataStr = await redisService.get(key);
        
        if (!userDataStr) {
            return null;
        }
        
        return JSON.parse(userDataStr);
    } catch (error) {
        console.error('获取Token数据失败:', error);
        return null;
    }
}

/**
 * 验证token是否有效
 * @param token Token字符串
 * @returns 验证结果和用户数据
 */
export async function validateToken(token: string): Promise<{
    valid: boolean;
    userData?: UserData;
    message: string;
}> {
    try {
        if (!token || token.length !== 32) {
            return {
                valid: false,
                message: 'Token格式不正确'
            };
        }
        
        const userData = await getTokenData(token);
        
        if (!userData) {
            return {
                valid: false,
                message: 'Token已过期或不存在'
            };
        }
        
        return {
            valid: true,
            userData,
            message: '验证成功'
        };
        
    } catch (error) {
        console.error('验证Token失败:', error);
        return {
            valid: false,
            message: '验证失败，请重试'
        };
    }
}

/**
 * 删除token
 * @param token Token字符串
 * @returns 是否删除成功
 */
export async function deleteToken(token: string): Promise<boolean> {
    try {
        const key = getTokenKey(token);
        return await redisService.del(key);
    } catch (error) {
        console.error('删除Token失败:', error);
        return false;
    }
}

/**
 * 刷新token过期时间
 * @param token Token字符串
 * @returns 是否刷新成功
 */
export async function refreshToken(token: string): Promise<boolean> {
    try {
        const key = getTokenKey(token);
        return await redisService.expire(key, TOKEN_CONFIG.expireTime);
    } catch (error) {
        console.error('刷新Token失败:', error);
        return false;
    }
}

/**
 * 生成并保存用户token
 * @param userData 用户数据
 * @returns Token和保存结果
 */
export async function generateAndSaveToken(userData: UserData): Promise<{
    token: string | null;
    success: boolean;
    message: string;
}> {
    try {
        const token = generateToken();
        
        const saveSuccess = await saveToken(token, userData);
        
        if (!saveSuccess) {
            return {
                token: null,
                success: false,
                message: '保存Token失败'
            };
        }
        
        return {
            token,
            success: true,
            message: 'Token生成成功'
        };
        
    } catch (error) {
        console.error('生成并保存Token失败:', error);
        return {
            token: null,
            success: false,
            message: '生成Token失败'
        };
    }
}

/**
 * 用户登录成功后生成token
 * @param phone 手机号
 * @param additionalData 额外用户数据
 * @returns Token生成结果
 */
export async function loginWithToken(phone: string, additionalData: Record<string, unknown> = {}): Promise<{
    token: string | null;
    success: boolean;
    message: string;
    userData?: UserData;
}> {
    try {
        const userData = {
            phone,
            loginTime: new Date().toISOString(),
            userId: phone, // 使用手机号作为用户ID，实际项目中可能需要查询数据库获取真实用户ID
            ...additionalData
        };
        
        const result = await generateAndSaveToken(userData);
        
        if (result.success) {
            return {
                ...result,
                userData
            };
        }
        
        return result;
        
    } catch (error) {
        console.error('登录生成Token失败:', error);
        return {
            token: null,
            success: false,
            message: '登录失败'
        };
    }
}

// 导出配置供外部使用
export { TOKEN_CONFIG };