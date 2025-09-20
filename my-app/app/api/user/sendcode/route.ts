import { NextRequest, NextResponse } from 'next/server';
import { generateAndSaveVerifyCode } from '@/utils/verifyCode';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, phone, templateId } = body;
        
        // 支持两种参数名称：to 或 phone
        const phoneNumber = to || phone;
        
        console.log('templateId:', templateId);
        console.log('请求发送验证码:', phoneNumber);
        
        // 验证手机号格式
        if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
            return NextResponse.json(
                { code: -1, message: '手机号格式不正确', data: null },
                { status: 400 }
            );
        }

        // 生成并保存验证码到Redis
        const result = await generateAndSaveVerifyCode(phoneNumber, 'number');
        
        if (!result.success) {
            return NextResponse.json(
                { code: -1, message: result.message, data: null },
                { status: 400 }
            );
        }

        // 这里可以集成真实的短信服务API
        // 比如阿里云短信、腾讯云短信等
        console.log(`验证码已生成并保存到Redis: ${phoneNumber} -> ${result.code}`);
        
        // 在开发环境下，可以返回验证码用于测试
        // 生产环境下应该移除这个字段
        const isDev = process.env.NODE_ENV === 'development';
        
        return NextResponse.json({
            code: 0,
            message: '验证码已发送',
            data: {
                phone: phoneNumber,
                // 开发环境下返回验证码便于测试
                ...(isDev && { verifyCode: result.code })
            }
        });
        
    } catch (error) {
        console.error('发送验证码失败:', error);
        return NextResponse.json(
            { code: -1, message: '服务器错误，请稍后重试', data: null },
            { status: 500 }
        );
    }
}