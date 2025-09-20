import { NextRequest, NextResponse } from 'next/server';
import { deleteToken } from '@/utils/token';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;
        
        // 也可以从Cookie中获取token
        const cookieToken = request.cookies.get('auth_token')?.value;
        const authToken = token || cookieToken;
        
        console.log('退出登录:', authToken);
        
        if (!authToken) {
            return NextResponse.json(
                { code: -1, message: 'Token不能为空', data: null },
                { status: 400 }
            );
        }

        // 删除Redis中的token
        const deleteSuccess = await deleteToken(authToken);
        
        // 创建响应
        const response = NextResponse.json({
            code: 0,
            message: '退出登录成功',
            data: {
                logout: true
            }
        });

        // 清除Cookie
        response.cookies.set('auth_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // 立即过期
            path: '/'
        });

        response.cookies.set('user_info', '', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // 立即过期
            path: '/'
        });

        if (deleteSuccess) {
            console.log(`Token已删除: ${authToken}`);
        }
        
        return response;
        
    } catch (error) {
        console.error('退出登录失败:', error);
        return NextResponse.json(
            { code: -1, message: '服务器错误，请稍后重试', data: null },
            { status: 500 }
        );
    }
}