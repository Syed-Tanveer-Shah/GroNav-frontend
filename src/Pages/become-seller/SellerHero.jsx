import React from 'react';
import { Link } from 'react-router-dom';

function SellerHero({ onStartSelling, onLoginClick }) {
    return (
        <>
            {/* Announcement Bar */}
            <div className="bs-announcement-bar">
                <div className="container">
                    <p>🚀 Sell smarter on Gro.Nav — Pakistan's fastest growing grocery platform</p>
                    <div className="bs-ann-links">
                        {/* Login moved to hero section */}
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bs-hero">
                <div className="container">
                    <div className="bs-hero-inner">
                        <div className="bs-hero-badge">🏪 Join 500+ sellers on Gro.Nav</div>

                        <h1 className="animated fadeIn">
                            Grow your business<br />
                            with <span>Gro.Nav</span>
                        </h1>

                        <p className="bs-hero-sub">
                            Reach thousands of customers across Pakistan — sell online or list your physical store.
                            Setup takes less than 5 minutes.
                        </p>

                        <div className="bs-hero-btns" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="bs-btn-primary" onClick={onStartSelling}>
                                🛒 Start selling today
                            </button>
                            <button className="bs-btn-primary" onClick={onLoginClick}>
                                🔑 Login to Dashboard
                            </button>
                        </div>

                        <div className="bs-hero-stats">
                            {[
                                { num: '10K+', label: 'Active buyers' },
                                { num: '500+', label: 'Verified sellers' },
                                { num: '8', label: 'Cities Across Pakistan' },
                                { num: '4.8★', label: 'Avg seller rating' },
                            ].map((s, i) => (
                                <div className="bs-stat" key={i}>
                                    <span className="bs-stat-num">{s.num}</span>
                                    <span className="bs-stat-label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SellerHero;
