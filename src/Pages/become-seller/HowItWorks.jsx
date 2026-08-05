import React from 'react';

const steps = [
    {
        num: '1',
        title: 'Choose Store Type',
        desc: 'Select whether you want an online storefront or list your physical grocery shop.',
    },
    {
        num: '2',
        title: 'Fill Registration',
        desc: 'Enter your store details, contact info and set a secure password.',
    },
    {
        num: '3',
        title: 'Start Selling',
        desc: 'Your account is live! Add products and start reaching customers immediately.',
    },
];

function HowItWorks() {
    return (
        <div className="bs-how">
            <div className="container">
                <h2 className="bs-section-title animated fadeIn">How it works</h2>
                <p className="bs-section-sub">Three simple steps to launch your CartGo store</p>

                <div className="bs-steps-row">
                    {steps.map((s, i) => (
                        <React.Fragment key={i}>
                            <div className="bs-how-step">
                                <div className="bs-how-num">{s.num}</div>
                                <h4>{s.title}</h4>
                                <p>{s.desc}</p>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="bs-how-arrow">→</div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HowItWorks;
