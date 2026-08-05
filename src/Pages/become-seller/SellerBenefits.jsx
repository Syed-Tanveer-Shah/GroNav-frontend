import React from 'react';

const benefits = [
    {
        icon: '⏱',
        title: 'Easy Setup',
        desc: 'Get your store live in under 5 minutes. No technical skills needed.',
    },
    {
        icon: '👥',
        title: 'Wide Customer Reach',
        desc: 'Access thousands of active buyers across 8 Pakistani cities.',
    },
    {
        icon: '📈',
        title: 'Live Analytics',
        desc: 'Track store visitors, product views and sales in real time.',
    },
    {
        icon: '🛡',
        title: 'Secure & Trusted',
        desc: 'CNIC verification, secure payments and seller protection built in.',
    },
];

function SellerBenefits() {
    return (
        <div className="bs-benefits">
            <div className="container">
                <h2 className="bs-section-title animated fadeIn">
                    Why sell on <span>Gro.Nav</span>?
                </h2>
                <p className="bs-section-sub">
                    Everything you need to run a successful online grocery business
                </p>
                <div className="bs-benefits-grid">
                    {benefits.map((b, i) => (
                        <div className="bs-benefit-card" key={i}>
                            <div className="bs-benefit-icon">{b.icon}</div>
                            <h4>{b.title}</h4>
                            <p>{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SellerBenefits;
