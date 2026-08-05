import React, { useState } from 'react';
import api from '../../Utils/Axios';
import { toast } from 'react-toastify';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];
const BUSINESS_TYPES = ['Individual', 'Partnership', 'Company'];
const CATEGORIES = ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Poultry', 'Bakery', 'Beverages', 'Snacks', 'Grains & Pulses', 'Frozen Foods', 'Condiments', 'Other'];

const initialForm = {
    store_name: '', owner_name: '', email: '', phone: '',
    business_type: '', product_category: '', city: '',
    password: '', confirm_password: '',
};

function Field({ label, error, children }) {
    return (
        <div className={`input-wrapper${error ? ' error' : ''}`}>
            <label>{label}</label>
            {children}
            {error && <span className="bs-field-error">{error}</span>}
        </div>
    );
}

function OnlineSellerForm({ onBack, onSuccess }) {
    const [form, setForm]       = useState(initialForm);
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const validate = () => {
        const errs = {};
        if (!form.store_name.trim())      errs.store_name      = 'Store name is required';
        if (!form.owner_name.trim())      errs.owner_name      = 'Owner name is required';
        if (!form.email.trim())           errs.email           = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
        if (!form.phone.trim())           errs.phone           = 'Phone is required';
        else if (!/^03\d{2}-\d{7}$/.test(form.phone)) errs.phone = 'Format: 03XX-XXXXXXX';
        if (!form.business_type)          errs.business_type   = 'Please select business type';
        if (!form.product_category)       errs.product_category = 'Please select a category';
        if (!form.city)                   errs.city            = 'Please select a city';
        if (!form.password)               errs.password        = 'Password is required';
        else if (form.password.length < 8) errs.password       = 'Minimum 8 characters';
        if (form.password !== form.confirm_password)
            errs.confirm_password = 'Passwords do not match';
        return errs;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            const res = await api.post('/api/seller/register/online/', form);
            const { token, store_name, user } = res.data;
            localStorage.clear();
            localStorage.setItem('seller_token', token);
            localStorage.setItem('seller_name', store_name);
            localStorage.setItem('is_seller', 'true');
            toast.success('🎉 Seller account created! Welcome to CartGo.');
            onSuccess(user);
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                const fieldErrors = {};
                Object.entries(data).forEach(([k, v]) => {
                    fieldErrors[k] = Array.isArray(v) ? v[0] : v;
                });
                setErrors(fieldErrors);
            } else {
                toast.error('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inp = (name, type = 'text', placeholder = '') => (
        <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handle}
            placeholder={placeholder}
            className={errors[name] ? 'error' : ''}
        />
    );

    return (
        <div className="bs-form-section">
            <div className="container">
                <div className="bs-form-wrapper">
                    <h2 className="bs-form-title">🖥 Online Store Registration</h2>
                    <p className="bs-form-subtitle">Fill in your details to create your CartGo online store</p>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="bs-form-grid">
                            <Field label="Store Name *" error={errors.store_name}>
                                {inp('store_name', 'text', 'My Grocery Store')}
                            </Field>
                            <Field label="Owner Full Name *" error={errors.owner_name}>
                                {inp('owner_name', 'text', 'Muhammad Ali')}
                            </Field>
                            <Field label="Email Address *" error={errors.email}>
                                {inp('email', 'email', 'seller@example.com')}
                            </Field>
                            <Field label="Phone (03XX-XXXXXXX) *" error={errors.phone}>
                                {inp('phone', 'text', '0300-1234567')}
                            </Field>
                            <Field label="Business Type *" error={errors.business_type}>
                                <select name="business_type" value={form.business_type} onChange={handle} className={errors.business_type ? 'error' : ''}>
                                    <option value="">Select business type</option>
                                    {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </Field>
                            <Field label="Product Category *" error={errors.product_category}>
                                <select name="product_category" value={form.product_category} onChange={handle} className={errors.product_category ? 'error' : ''}>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </Field>
                            <Field label="City *" error={errors.city}>
                                <select name="city" value={form.city} onChange={handle} className={errors.city ? 'error' : ''}>
                                    <option value="">Select city</option>
                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </Field>
                            <div /> {/* spacer */}
                            <Field label="Password *" error={errors.password}>
                                {inp('password', 'password', 'Min. 8 characters')}
                            </Field>
                            <Field label="Confirm Password *" error={errors.confirm_password}>
                                {inp('confirm_password', 'password', 'Re-enter password')}
                            </Field>
                        </div>

                        <div className="bs-form-actions">
                            <button type="button" className="bs-back-btn" onClick={onBack}>
                                ← Back
                            </button>
                            <button type="submit" className="bs-submit-btn" disabled={loading}>
                                {loading ? <><div className="bs-spinner" /> Creating store...</> : '🚀 Create my store'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default OnlineSellerForm;
