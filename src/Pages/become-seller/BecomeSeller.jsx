import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Utils/Axios';

import './BecomeSeller.css';

import SellerHero from './SellerHero';
import SellerBenefits from './SellerBenefits';
import HowItWorks from './HowItWorks';
import StoreTypeCards from './StoreTypeCards';
import SellerTestimonials from './SellerTestimonials';
import OnlineSellerForm from './OnlineSellerForm';
import PhysicalSellerForm from './PhysicalSellerForm';
import SellerStepBar from './SellerStepBar';

/*
 * View states:
 *   'landing'   – hero + benefits + how-it-works + store-type + testimonials + CTA
 *   'online'    – online registration form
 *   'physical'  – physical registration form
 */
function BecomeSeller() {
    const [view, setView] = useState('landing');
    // eslint-disable-next-line no-unused-vars
    const [storeType, setStoreType] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const formRef = useRef(null);

    // Step index for SellerStepBar
    // eslint-disable-next-line no-unused-vars
    const stepIndex = view === 'landing' ? 0 : view === 'storeType' ? 1 : 2;

    const handleStartSelling = () => {
        setView('storeType');
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const handleStoreSelect = (type) => {
        setStoreType(type);
        setView(type);           // 'online' or 'physical'
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const handleBack = () => {
        if (view === 'online' || view === 'physical') {
            setView('storeType');
        } else {
            setView('landing');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSuccess = () => {
        navigate('/seller');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            const res = await api.post('/api/auth/seller-login/', loginForm);
            localStorage.setItem('seller_token', res.data.token);
            localStorage.setItem('seller_name', res.data.store_name);
            localStorage.setItem('is_seller', 'true');
            localStorage.removeItem('token');
            localStorage.removeItem('user_type');
            navigate('/seller/dashboard');
        } catch (err) {
            setLoginError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoginLoading(false);
        }
    };

    /* ── LANDING PAGE ──────────────────────────────────────────────── */
    if (view === 'landing') {
        return (
            <>
                <SellerHero
                    onStartSelling={handleStartSelling}
                    onLoginClick={() => setShowLogin(true)}
                />

                <SellerBenefits />

                <HowItWorks />

                {/* Store Type Selection — scroll target */}
                <div id="store-type-section">
                    <StoreTypeCards onSelect={handleStoreSelect} />
                </div>

                <SellerTestimonials />

                {/* Bottom CTA */}
                <div className="bs-cta">
                    <div className="container">
                        <h2 className="animated fadeIn">Ready to start selling?</h2>
                        <p>Join 500+ sellers already growing their business on Gro.Nav</p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
                            <button className="bs-btn-primary" onClick={handleStartSelling}>
                                🚀 Create my seller account
                            </button>
                            <button className="bs-btn-primary" onClick={() => setShowLogin(true)}>
                                🔑 Login to Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Login Modal */}
                {showLogin && (
                    <div className="bs-modal-overlay" onClick={() => setShowLogin(false)}>
                        <div className="bs-modal" onClick={e => e.stopPropagation()} style={{padding: 0, overflow: 'hidden', maxWidth: '400px', background: 'transparent', border: 'none', boxShadow: 'none'}}>
                            <button className="bs-modal-close" onClick={() => setShowLogin(false)} style={{zIndex: 9999, color: '#333'}}>×</button>
                            <div className="registration-wrapper-1" style={{padding: '32px', margin: 0}}>
                                <div className="logo-area mb--0" style={{textAlign: 'center'}}>
                                    <img className="mb--10" src="assets/images/logo/fav.png" alt="logo" style={{margin: '0 auto'}} />
                                </div>
                                <h3 className="title animated fadeIn" style={{textAlign: 'center', marginBottom: '10px'}}>Seller Login</h3>

                                <p className="text-center" style={{fontSize: '14px', marginBottom: '20px', color: '#555'}}>Welcome back! Please login to your dashboard.</p>

                                {loginError && (
                                  <p style={{color:'#c62828', fontSize:'13px', marginTop:'8px', marginBottom: '16px'}} className="text-center">{loginError}</p>
                                )}

                                <form className="registration-form" onSubmit={handleLoginSubmit}>
                                    <div className="input-wrapper">
                                        <label htmlFor="email">Email Address*</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={loginForm.email}
                                            onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-wrapper" style={{ position: "relative" }}>
                                        <label htmlFor="password">Password*</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={loginForm.password}
                                            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                            required
                                        />
                                        <i
                                            className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "50px",
                                                cursor: "pointer",
                                                color: "#666"
                                            }}
                                        />
                                    </div>
                                    
                                    <div style={{textAlign: 'right', marginBottom: '20px'}}>
                                        <a 
                                            className="bs-forgot-link" 
                                            onClick={() => { setShowLogin(false); navigate('/forgot-password'); }} 
                                            style={{
                                                fontSize: '13px', 
                                                color: '#4CAF50', 
                                                textDecoration: 'none', 
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Forgot password?
                                        </a>
                                    </div>

                                    <button className="rts-btn btn-primary" type="submit" disabled={loginLoading} style={{width: '100%'}}>
                                        {loginLoading ? "Logging in..." : "Login to Dashboard"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    /* ── STORE TYPE SELECTION (shown inline below hero after CTA click) */
    if (view === 'storeType') {
        return (
            <>
                {/* Step bar only visible during registration flow */}
                <SellerStepBar step={1} />

                <div ref={formRef}>
                    <StoreTypeCards onSelect={handleStoreSelect} />
                </div>
            </>
        );
    }

    /* ── REGISTRATION FORMS ───────────────────────────────────────── */
    return (
        <>
            <SellerStepBar step={2} />

            <div ref={formRef}>
                {view === 'online' ? (
                    <OnlineSellerForm
                        onBack={handleBack}
                        onSuccess={handleSuccess}
                    />
                ) : (
                    <PhysicalSellerForm
                        onBack={handleBack}
                        onSuccess={handleSuccess}
                    />
                )}
            </div>
        </>
    );
}

export default BecomeSeller;
