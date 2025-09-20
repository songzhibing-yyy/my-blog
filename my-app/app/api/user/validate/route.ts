import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/utils/token';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;
        
        // 也可以从Cookie中获取token
        const cookieToken = request.cookies.get('auth_token')?.value;
        const authToken = token || cookieToken;
        
        console.log('验证token:', authToken);
        
        if (!authToken) {
            return NextResponse.json(
                { code: -1, message: 'Token不能为空', data: null },
                { status: 400 }
            );
        }

        // 验证token
        const result = await validateToken(authToken);
        
        if (result.valid && result.userData) {
            return NextResponse.json({
                code: 0,
                message: '验证成功',
                data: {
                    valid: true,
                    user: {
                        phone: result.userData.phone,
                        userId: result.userData.userId,
                        loginTime: result.userData.loginTime
                    }
                }
            });
        } else {
            return NextResponse.json(
                { code: -1, message: result.message, data: { valid: false } },
                { status: 401 }
            );
        }
        
    } catch (error) {
        console.error('验证token失败:', error);
        return NextResponse.json(
            { code: -1, message: '服务器错误，请稍后重试', data: null },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // 从Cookie中获取token
        const token = request.cookies.get('auth_token')?.value;
        
        console.log('GET验证token:', token);
        
        if (!token) {
            return NextResponse.json(
                { code: -1, message: '未登录', data: { valid: false } },
                { status: 401 }
            );
        }

        // 验证token
        const result = await validateToken(token);
        
        if (result.valid && result.userData) {
            return NextResponse.json({
                code: 0,
                message: '验证成功',
                data: {
                    valid: true,
                    user: {
                        phone: result.userData.phone,
                        userId: result.userData.userId,
                        loginTime: result.userData.loginTime
                    }
                }
            });
        } else {
            return NextResponse.json(
                { code: -1, message: result.message, data: { valid: false } },
                { status: 401 }
            );
        }
        
    } catch (error) {
        console.error('GET验证token失败:', error);
        return NextResponse.json(
            { code: -1, message: '服务器错误，请稍后重试', data: null },
            { status: 500 }
        );
    }
}