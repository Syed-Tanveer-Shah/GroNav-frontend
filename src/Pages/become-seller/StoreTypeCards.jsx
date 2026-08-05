import React from 'react';

function StoreTypeCards({ onSelect }) {
    return (
        <div className="bs-store-type">
            <div className="container">
                <h2 className="bs-section-title animated fadeIn">Choose your store type</h2>
                <p className="bs-section-sub">
                    Select the option that best describes your business
                </p>

                <div className="bs-store-cards">
                    {/* Online Store */}
                    <div className="bs-store-card" onClick={() => onSelect('online')}>
                        <div className="bs-store-card-icon">🖥</div>
                        <h3>Online Store</h3>
                        <p>
                            Launch a fully digital storefront on CartGo. List your products,
                            manage inventory and receive orders — all from your phone or laptop.
                            Perfect for home-based businesses and wholesale suppliers.
                        </p>
                        <button className="rts-btn btn-primary" type="button">
                            Continue →
                        </button>
                    </div>

                    {/* Physical Store */}
                    <div className="bs-store-card" onClick={() => onSelect('physical')}>
                        <div className="bs-store-card-icon">🏠</div>
                        <h3>Physical Store</h3>
                        <p>
                            Already have a grocery shop? List it on CartGo so customers can
                            find you, browse your products online and visit your location.
                            Increase walk-in traffic and online visibility at the same time.
                        </p>
                        <button className="rts-btn btn-primary" type="button">
                            Continue →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StoreTypeCards;
