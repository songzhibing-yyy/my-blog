import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/utils/verifyCode';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, code, verifyCode: inputCode } = body;
        
        // 支持两种参数名称：code 或 verifyCode
        const userCode = code || inputCode;
        
        console.log('请求验证验证码:', phone, userCode);
        
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
        const result = await verifyCode(phone, userCode);
        
        if (result.success) {
            return NextResponse.json({
                code: 0,
                message: result.message,
                data: {
                    phone,
                    verified: true
                }
            });
        } else {
            return NextResponse.json(
                { code: -1, message: result.message, data: null },
                { status: 400 }
            );
        }
        
    } catch (error) {
        console.error('验证验证码失败:', error);
        return NextResponse.json(
            { code: -1, message: '服务器错误，请稍后重试', data: null },
            { status: 500 }
        );
    }
}