import React from 'react';

const testimonials = [
    {
        stars: 5,
        quote: '"CartGo نے میرے کاروبار کو بدل دیا۔ پہلے مہینے میں ہی 200 سے زیادہ orders مل گئے!"',
        name: 'Muhammad Usman',
        city: 'Lahore',
        initials: 'MU',
    },
    {
        stars: 5,
        quote: '"Setup was incredibly easy. I had my online store live within minutes. Highly recommended for all grocery sellers!"',
        name: 'Ayesha Tariq',
        city: 'Karachi',
        initials: 'AT',
    },
    {
        stars: 4,
        quote: '"The analytics dashboard is brilliant. I can see exactly which products are selling and plan my stock accordingly."',
        name: 'Bilal Ahmed',
        city: 'Islamabad',
        initials: 'BA',
    },
];

function SellerTestimonials() {
    return (
        <div className="bs-testimonials">
            <div className="container">
                <h2 className="bs-section-title animated fadeIn">What our sellers say</h2>
                <p className="bs-section-sub">Real stories from verified CartGo sellers</p>

                <div className="bs-testimonials-grid">
                    {testimonials.map((t, i) => (
                        <div className="bs-testimonial-card" key={i}>
                            <div className="bs-stars">
                                {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
                            </div>
                            <blockquote>{t.quote}</blockquote>
                            <div className="bs-testimonial-footer">
                                <div className="bs-avatar">{t.initials}</div>
                                <div className="bs-testimonial-info">
                                    <strong>{t.name}</strong>
                                    <span>📍 {t.city}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SellerTestimonials;
