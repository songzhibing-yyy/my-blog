import CountDown from '../CountDown';

import type { NextPage } from 'next';
import { Modal, Form, Input, Button, Space, Typography, message } from 'antd';
import { MobileOutlined, SafetyOutlined, GithubOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text, Link } = Typography;

interface LoginProps {
    isShow: boolean;
    onClose: () => void;
}

interface FormValues {
    phone: string;
    verifyCode: string;
}

const Login: NextPage<LoginProps> = ({ isShow, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    const [isShowVerifyCode, setIsShowVerifyCode] = useState(false);
    const handleCountDownEnd = () => {
        setIsShowVerifyCode(false);
    }
    const handleGetCode = async () => {
        try {
            const phone = form.getFieldValue('phone');
            if (!phone) {
                message.error('请先输入手机号');
                return;
            }
            setCodeLoading(true);
            setIsShowVerifyCode(true);
            // 这里添加获取验证码的逻辑
            console.log('获取验证码:', phone);
            message.success('验证码已发送');
        } catch {
            message.error('发送验证码失败');
        } finally {
            setCodeLoading(false);
        }
    };

    const handleLogin = async (values: FormValues) => {
        try {
            setLoading(true);
            // 这里添加登录逻辑
            console.log('登录:', values);
            message.success('登录成功');
            onClose();
        } catch {
            message.error('登录失败');
        } finally {
            setLoading(false);
        }
    };

    const handleOtherLogin = () => {
        console.log('使用GitHub登录');
        // 这里添加GitHub登录逻辑
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="手机号登录"
            open={isShow}
            onCancel={handleCancel}
            footer={null}
            width={400}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleLogin}
                autoComplete="off"
            >
                <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                    ]}
                >
                    <Input
                        prefix={<MobileOutlined />}
                        placeholder="请输入手机号"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="verifyCode"
                    label="验证码"
                    rules={[
                        { required: true, message: '请输入验证码' },
                        { len: 6, message: '验证码为6位数字' }
                    ]}
                >
                    <Input
                        prefix={<SafetyOutlined />}
                        placeholder="请输入验证码"
                        size="large"
                        addonAfter={
                            <Button
                                type="link"
                                onClick={handleGetCode}
                                loading={codeLoading}
                                style={{ padding: 0 }}
                            >
                                {isShowVerifyCode ? <CountDown time={60} onEnd={handleCountDownEnd} /> : '获取验证码'}
                                
                            </Button>
                        }
                    />
                </Form.Item>

                <Form.Item>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                        >
                            登录
                        </Button>
                        
                        <Button
                            icon={<GithubOutlined />}
                            size="large"
                            block
                            onClick={handleOtherLogin}
                        >
                            使用 GitHub 登录
                        </Button>
                    </Space>
                </Form.Item>

                <Form.Item>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        登录即代表同意
                        <Link 
                            href="https://moco.imooc.com/privacy.html" 
                            target="_blank"
                        >
                            《隐私政策》
                        </Link>
                    </Text>
                </Form.Item>
            </Form>
        </Modal>
    );
}
export default Login;