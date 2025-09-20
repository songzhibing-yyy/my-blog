import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/utils/verifyCode';
import { loginWithToken } from '@/utils/token';
import { UserService } from '@/utils/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, code, verifyCode: inputCode } = body;
        // 支持两种参数名称：code 或 verifyCode
        const userCode = code || inputCode;
        
        console.log('请求登录:', phone, userCode);
        
        // 验证必要参数
        if (!phone || !userCode) {
            return NextResponse.json(
                { code: -1, message: '手机号和验证码不能为空', data: null },
                { status: 400 }
            );
        }

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return NextResponse.json(
                { code: -1, message: '手机号格式不正确', data: null },
                { status: 400 }
            );
        }

        // 验证码格式检查
        if (!/^\d{6}$/.test(userCode)) {
            return NextResponse.json(
                { code: -1, message: '验证码格式不正确，应为6位数字', data: null },
                { status: 400 }
            );
        }

        // 验证验证码
        const verifyResult = await verifyCode(phone, userCode);
        
        if (!verifyResult.success) {
            return NextResponse.json(
                { code: -1, message: verifyResult.message, data: null },
                { status: 400 }
            );
        }

        // 验证成功，查找用户
        let userWithAuth = await UserService.findUserAuthByPhone(phone);
        let userId: string;

        if (!userWithAuth) {
            // 用户不存在，创建新用户
            console.log(`创建新用户: ${phone}`);
            
            // 创建用户
            const newUserId = await UserService.createUser({
                nickname: `用户${phone.slice(-4)}`, // 使用手机号后4位作为昵称
                avatar: '', // 默认头像
                job: '', // 默认职业
                introduce: '' // 默认介绍
            });
            
            userId = newUserId.toString();

            // 创建用户认证信息
            await UserService.createUserAuth({
                user_id: newUserId,
                identity_type: 'phone',
                identifier: phone,
                credential: '' // 手机号登录不需要密码
            });
            
            // 重新查询用户信息
            userWithAuth = await UserService.findUserAuthByPhone(phone);
            
            console.log(`新用户创建成功: ${phone} -> userId: ${userId}`);
        } else {
            // 用户已存在
            userId = userWithAuth.id.toString();
            console.log(`用户登录: ${phone} -> userId: ${userId}`);
        }

        // 验证成功，生成token
        const tokenResult = await loginWithToken(phone, {
            userId: userId,
            nickname: userWithAuth?.nickname || `用户${phone.slice(-4)}`,
            avatar: userWithAuth?.avatar || '',
            loginMethod: 'sms',
            userAgent: request.headers.get('user-agent') || '',
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        });

        if (!tokenResult.success || !tokenResult.token) {
            return NextResponse.json(
                { code: -1, message: '登录失败，请重试', data: null },
                { status: 500 }
            );
        }

        // 创建响应
        const response = NextResponse.json({
            code: 0,
            message: '登录成功',
            data: {
                token: tokenResult.token,
                user: {
                    id: userId,
                    phone,
                    nickname: userWithAuth?.nickname || `用户${phone.slice(-4)}`,
                    avatar: userWithAuth?.avatar || '',
                    job: userWithAuth?.job || '',
                    introduce: userWithAuth?.introduce || '',
                    userId: tokenResult.userData?.userId,
                    loginTime: tokenResult.userData?.loginTime
                }
            }
        });

        // 设置token到cookie（7天过期）
        response.cookies.set('auth_token', tokenResult.token, {
            httpOnly: true,          // 防止XSS攻击
            secure: process.env.NODE_ENV === 'production', // 生产环境下只允许HTTPS
            sameSite: 'lax',         // CSRF保护
            maxAge: 7 * 24 * 60 * 60, // 7天
            path: '/'                // 全站有效
        });

        // 设置用户信息到cookie（可选，用于前端显示）
        response.cookies.set('user_info', JSON.stringify({
            phone,
            userId: tokenResult.userData?.userId
        }), {
            httpOnly: false,         // 允许前端JavaScript读取
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
        });

        console.log(`用户登录成功: ${phone} -> token: ${tokenResult.token}`);
        
        return response;
        
    } catch (error) {
        console.error('登录失败:', error);
        return NextResponse.json(
            { code: -1, message: '服务器错误，请稍后重试', data: null },
            { status: 500 }
        );
    }
}