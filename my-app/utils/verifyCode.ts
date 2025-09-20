import { redisService } from './redis';

// 验证码配置
const VERIFY_CODE_CONFIG = {
    length: 6,              // 验证码长度
    expireTime: 300,        // 过期时间（秒），5分钟
    prefix: 'verify_code:', // Redis键前缀
    maxRetries: 5,          // 最大重试次数
    cooldown: 60            // 冷却时间（秒），1分钟
};

/**
 * 生成随机数字验证码
 * @param length 验证码长度，默认6位
 * @returns 验证码字符串
 */
export function generateVerifyCode(length: number = VERIFY_CODE_CONFIG.length): string {
    const digits = '0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        result += digits[randomIndex];
    }
    
    return result;
}

/**
 * 生成包含字母和数字的验证码
 * @param length 验证码长度，默认6位
 * @returns 验证码字符串
 */
export function generateMixedVerifyCode(length: number = VERIFY_CODE_CONFIG.length): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    
    return result;
}

/**
 * 获取Redis中存储验证码的键名
 * @param phone 手机号
 * @returns Redis键名
 */
function getVerifyCodeKey(phone: string): string {
    return `${VERIFY_CODE_CONFIG.prefix}${phone}`;
}

/**
 * 获取冷却时间的键名
 * @param phone 手机号
 * @returns Redis键名
 */
function getCooldownKey(phone: string): string {
    return `${VERIFY_CODE_CONFIG.prefix}cooldown:${phone}`;
}

/**
 * 保存验证码到Redis
 * @param phone 手机号
 * @param code 验证码
 * @returns 是否保存成功
 */
export async function saveVerifyCode(phone: string, code: string): Promise<boolean> {
    try {
        const key = getVerifyCodeKey(phone);
        const success = await redisService.set(key, code, VERIFY_CODE_CONFIG.expireTime);
        
        if (success) {
            console.log(`验证码已保存: ${phone} -> ${code}, 过期时间: ${VERIFY_CODE_CONFIG.expireTime}秒`);
        }
        
        return success;
    } catch (error) {
        console.error('保存验证码失败:', error);
        return false;
    }
}

/**
 * 从Redis获取验证码
 * @param phone 手机号
 * @returns 验证码或null
 */
export async function getVerifyCode(phone: string): Promise<string | null> {
    try {
        const key = getVerifyCodeKey(phone);
        return await redisService.get(key);
    } catch (error) {
        console.error('获取验证码失败:', error);
        return null;
    }
}

/**
 * 验证验证码是否正确
 * @param phone 手机号
 * @param inputCode 用户输入的验证码
 * @returns 验证结果
 */
export async function verifyCode(phone: string, inputCode: string): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        // 获取存储的验证码
        const storedCode = await getVerifyCode(phone);
        
        if (!storedCode) {
            return {
                success: false,
                message: '验证码已过期或不存在'
            };
        }
        
        // 验证码比较（不区分大小写）
        if (storedCode.toLowerCase() === inputCode.toLowerCase()) {
            // 验证成功后删除验证码
            await deleteVerifyCode(phone);
            return {
                success: true,
                message: '验证成功'
            };
        } else {
            return {
                success: false,
                message: '验证码错误'
            };
        }
        
    } catch (error) {
        console.error('验证验证码失败:', error);
        return {
            success: false,
            message: '验证失败，请重试'
        };
    }
}

/**
 * 删除验证码
 * @param phone 手机号
 * @returns 是否删除成功
 */
export async function deleteVerifyCode(phone: string): Promise<boolean> {
    try {
        const key = getVerifyCodeKey(phone);
        return await redisService.del(key);
    } catch (error) {
        console.error('删除验证码失败:', error);
        return false;
    }
}

/**
 * 检查是否在冷却时间内
 * @param phone 手机号
 * @returns 是否在冷却时间内
 */
export async function isInCooldown(phone: string): Promise<boolean> {
    try {
        const key = getCooldownKey(phone);
        return await redisService.exists(key);
    } catch (error) {
        console.error('检查冷却时间失败:', error);
        return false;
    }
}

/**
 * 设置冷却时间
 * @param phone 手机号
 * @returns 是否设置成功
 */
export async function setCooldown(phone: string): Promise<boolean> {
    try {
        const key = getCooldownKey(phone);
        return await redisService.set(key, '1', VERIFY_CODE_CONFIG.cooldown);
    } catch (error) {
        console.error('设置冷却时间失败:', error);
        return false;
    }
}

/**
 * 生成并保存验证码
 * @param phone 手机号
 * @param codeType 验证码类型：'number' | 'mixed'
 * @returns 生成的验证码和保存结果
 */
export async function generateAndSaveVerifyCode(
    phone: string, 
    codeType: 'number' | 'mixed' = 'number'
): Promise<{
    code: string | null;
    success: boolean;
    message: string;
}> {
    try {
        // 检查是否在冷却时间内
        const inCooldown = await isInCooldown(phone);
        if (inCooldown) {
            return {
                code: null,
                success: false,
                message: `请等待${VERIFY_CODE_CONFIG.cooldown}秒后再试`
            };
        }
        
        // 生成验证码
        const code = codeType === 'mixed' 
            ? generateMixedVerifyCode() 
            : generateVerifyCode();
        
        // 保存到Redis
        const saveSuccess = await saveVerifyCode(phone, code);
        
        if (!saveSuccess) {
            return {
                code: null,
                success: false,
                message: '保存验证码失败'
            };
        }
        
        // 设置冷却时间
        await setCooldown(phone);
        
        return {
            code,
            success: true,
            message: '验证码生成成功'
        };
        
    } catch (error) {
        console.error('生成并保存验证码失败:', error);
        return {
            code: null,
            success: false,
            message: '生成验证码失败'
        };
    }
}

// 导出配置供外部使用
export { VERIFY_CODE_CONFIG };