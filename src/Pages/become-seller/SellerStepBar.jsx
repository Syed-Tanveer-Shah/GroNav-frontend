import React from 'react';

/**
 * SellerStepBar — shows 3 steps with active/done state
 * step: 0 = landing, 1 = store type, 2 = registration
 */
function SellerStepBar({ step }) {
    const steps = ['Become a Seller', 'Choose Store Type', 'Registration'];

    return (
        <div className="bs-stepbar">
            <div className="container">
                <div className="bs-stepbar-inner">
                    {steps.map((label, idx) => {
                        const isDone   = idx < step;
                        const isActive = idx === step;
                        return (
                            <React.Fragment key={idx}>
                                {idx > 0 && (
                                    <div className={`bs-step-connector ${isDone ? 'done' : ''}`} />
                                )}
                                <div className="bs-step">
                                    <div
                                        className={`bs-step-circle ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                                    >
                                        {isDone ? '✓' : idx + 1}
                                    </div>
                                    <span
                                        className={`bs-step-label ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                                    >
                                        {label}
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default SellerStepBar;
