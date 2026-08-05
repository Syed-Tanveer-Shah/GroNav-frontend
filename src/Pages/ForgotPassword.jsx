import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../Utils/Axios';

function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const onFinish = async (values) => {
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            await api.post('/api/auth/password/reset/', { email: values.email });
            setSuccessMsg("Password reset link sent! Check your email.");
        } catch (err) {
            setErrorMsg(err.response?.data?.error || err.response?.data?.detail || "Failed to send reset link. Please check your email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="rts-navigation-area-breadcrumb bg_light-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="navigator-breadcrumb-wrapper">
                                <Link to="/">Home </Link>
                                <i className="fa-regular fa-chevron-right" />
                                <Link className="current" to="/forgot-password">
                                    Forgot Password
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rts-register-area rts-section-gap bg_light-1">
                <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '450px', width: '100%', background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <div className="logo-area mb--0" style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <img className="mb--10" src="assets/images/logo/fav.png" alt="logo" style={{ display: 'inline-block' }} />
                        </div>
                        
                        <h3 className="title text-center" style={{ fontSize: '24px', fontWeight: '600', color: '#1c1c1c', marginBottom: '8px', textAlign: 'center' }}>Forgot Your Password?</h3>
                        <p className="text-center" style={{ fontSize: '14px', color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                            Enter your email address and we'll send you a reset link.
                        </p>

                        {successMsg && (
                            <Alert
                                message={successMsg}
                                type="success"
                                showIcon
                                style={{ marginBottom: '20px', borderRadius: '4px' }}
                            />
                        )}

                        {errorMsg && (
                            <Alert
                                message={errorMsg}
                                type="error"
                                showIcon
                                style={{ marginBottom: '20px', borderRadius: '4px' }}
                            />
                        )}

                        <Form
                            name="forgot-password"
                            layout="vertical"
                            onFinish={onFinish}
                            requiredMark={false}
                        >
                            <Form.Item
                                name="email"
                                label={<span style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>Email Address</span>}
                                rules={[
                                    { required: true, message: 'Please input your email address!' },
                                    { type: 'email', message: 'Please enter a valid email address!' }
                                ]}
                            >
                                <Input 
                                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Enter your email" 
                                    size="large"
                                    style={{ borderRadius: '4px' }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginTop: '30px', marginBottom: '20px' }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    block
                                    size="large"
                                    style={{ 
                                        backgroundColor: '#6aaa00', 
                                        borderColor: '#6aaa00',
                                        height: '45px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        borderRadius: '4px'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#5c9400';
                                        e.currentTarget.style.borderColor = '#5c9400';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#6aaa00';
                                        e.currentTarget.style.borderColor = '#6aaa00';
                                    }}
                                >
                                    Send Reset Link
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="text-center" style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link to="/login" style={{ color: '#6aaa00', fontSize: '14px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowLeftOutlined /> Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;
