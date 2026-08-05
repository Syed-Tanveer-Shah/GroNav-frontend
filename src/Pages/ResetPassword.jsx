import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import api from '../Utils/Axios';

function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const onFinish = async (values) => {
        if (values.new_password1 !== values.new_password2) {
            setErrorMsg("Passwords do not match.");
            return;
        }
        if (values.new_password1.length < 8) {
            setErrorMsg("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            await api.post('/api/auth/password/reset/confirm/', {
                uid: uid,
                token: token,
                new_password1: values.new_password1,
                new_password2: values.new_password2
            });
            setSuccessMsg("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const data = err.response?.data;
            let errorText = "Failed to reset password. The link may have expired or is invalid.";
            if (data) {
                if (typeof data === 'object') {
                    const errors = Object.values(data).flat();
                    if (errors.length > 0) {
                        errorText = errors.join(" ");
                    }
                } else if (typeof data === 'string') {
                    errorText = data;
                }
            }
            setErrorMsg(errorText);
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
                                <span className="current">Reset Password</span>
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
                        
                        <h3 className="title text-center" style={{ fontSize: '24px', fontWeight: '600', color: '#1c1c1c', marginBottom: '8px', textAlign: 'center' }}>Set New Password</h3>
                        <p className="text-center" style={{ fontSize: '14px', color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                            Please enter your new password below.
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
                            name="reset-password"
                            layout="vertical"
                            onFinish={onFinish}
                            requiredMark={false}
                        >
                            <Form.Item
                                name="new_password1"
                                label={<span style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>New Password</span>}
                                rules={[
                                    { required: true, message: 'Please input your new password!' },
                                    { min: 8, message: 'Password must be at least 8 characters!' }
                                ]}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Enter new password" 
                                    size="large"
                                    style={{ borderRadius: '4px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="new_password2"
                                label={<span style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>Confirm New Password</span>}
                                dependencies={['new_password1']}
                                rules={[
                                    { required: true, message: 'Please confirm your new password!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('new_password1') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Confirm new password" 
                                    size="large"
                                    style={{ borderRadius: '4px' }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginTop: '30px', marginBottom: '0' }}>
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
                                    Reset Password
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;
