import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Utils/Axios';
import { toast } from 'react-toastify';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];

const initialForm = {
    store_name: '', owner_name: '', cnic: '', phone: '',
    city: '', full_address: '', opening_hours: '',
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

/* Auto-format CNIC as XXXXX-XXXXXXX-X while typing */
function formatCNIC(value) {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5)  return digits;
    if (digits.length <= 12) return `${digits.slice(0,5)}-${digits.slice(5)}`;
    return `${digits.slice(0,5)}-${digits.slice(5,12)}-${digits.slice(12)}`;
}

function PhysicalSellerForm({ onBack, onSuccess }) {
    const navigate = useNavigate();
    const [form, setForm]       = useState(initialForm);
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => {
        const { name, value } = e.target;
        if (name === 'cnic') {
            setForm({ ...form, cnic: formatCNIC(value) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.store_name.trim())    errs.store_name    = 'Store name is required';
        if (!form.owner_name.trim())    errs.owner_name    = 'Owner name is required';
        if (!form.cnic.trim())          errs.cnic          = 'CNIC is required';
        else if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic)) errs.cnic = 'Format: XXXXX-XXXXXXX-X';
        if (!form.phone.trim())         errs.phone         = 'Phone is required';
        else if (!/^03\d{2}-\d{7}$/.test(form.phone)) errs.phone = 'Format: 03XX-XXXXXXX';
        if (!form.city)                 errs.city          = 'Please select a city';
        if (!form.full_address.trim())  errs.full_address  = 'Full address is required';
        if (!form.opening_hours.trim()) errs.opening_hours = 'Opening hours are required';
        if (!form.password)             errs.password      = 'Password is required';
        else if (form.password.length < 8) errs.password   = 'Minimum 8 characters';
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
            const res = await api.post('/api/seller/register/physical/', {
                ...form,
                email: form.email || `${form.owner_name.replace(/\s/g, '').toLowerCase()}@cartgo.pk`,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'nocsrf'
                }
            });
            const { token, store_name, user } = res.data;
            localStorage.clear();
            localStorage.setItem('seller_token', token);
            localStorage.setItem('seller_name', store_name);
            localStorage.setItem('is_seller', 'true');
            toast.success('🎉 Physical store registered! Welcome to CartGo.');
            if (onSuccess) onSuccess(user);
            navigate('/seller');
        } catch (err) {
            console.log('Register error:', err.response?.data);
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                const fieldErrors = {};
                let generalMsg = '';
                Object.entries(data).forEach(([k, v]) => {
                    const val = Array.isArray(v) ? v.join(', ') : String(v);
                    if (['detail', 'error', 'message', 'non_field_errors'].includes(k)) {
                        generalMsg = val;
                    } else {
                        fieldErrors[k] = Array.isArray(v) ? v[0] : v;
                    }
                });
                setErrors(fieldErrors);
                if (generalMsg) {
                    toast.error(generalMsg);
                } else if (Object.keys(fieldErrors).length > 0) {
                    const firstErr = Object.values(fieldErrors)[0];
                    toast.error(`Registration failed: ${firstErr}`);
                } else {
                    toast.error('Registration failed. Please try again.');
                }
            } else if (typeof data === 'string') {
                toast.error(data);
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
                    <h2 className="bs-form-title">🏠 Physical Store Registration</h2>
                    <p className="bs-form-subtitle">Register your existing grocery shop on CartGo</p>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="bs-form-grid">
                            <Field label="Store Name *" error={errors.store_name}>
                                {inp('store_name', 'text', 'Al-Noor General Store')}
                            </Field>
                            <Field label="Owner Full Name *" error={errors.owner_name}>
                                {inp('owner_name', 'text', 'Muhammad Hassan')}
                            </Field>
                            <Field label="Email Address *" error={errors.email}>
                                {inp('email', 'email', 'owner@example.com')}
                            </Field>
                            <Field label="CNIC (auto-format) *" error={errors.cnic}>
                                <input
                                    type="text"
                                    name="cnic"
                                    value={form.cnic}
                                    onChange={handle}
                                    placeholder="XXXXX-XXXXXXX-X"
                                    maxLength={15}
                                    className={errors.cnic ? 'error' : ''}
                                />
                            </Field>
                            <Field label="Phone (03XX-XXXXXXX) *" error={errors.phone}>
                                {inp('phone', 'text', '0321-1234567')}
                            </Field>
                            <Field label="City *" error={errors.city}>
                                <select name="city" value={form.city} onChange={handle} className={errors.city ? 'error' : ''}>
                                    <option value="">Select city</option>
                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </Field>
                            <Field label="Full Address *" error={errors.full_address}>
                                <div className="input-wrapper full" style={{ gridColumn: '1 / -1' }}>
                                    <textarea
                                        name="full_address"
                                        value={form.full_address}
                                        onChange={handle}
                                        placeholder="Shop #5, Block B, Defence Road, Lahore"
                                        rows={3}
                                        className={errors.full_address ? 'error' : ''}
                                        style={{ resize: 'vertical' }}
                                    />
                                    {errors.full_address && <span className="bs-field-error">{errors.full_address}</span>}
                                </div>
                            </Field>
                            <Field label="Store Opening Hours *" error={errors.opening_hours}>
                                {inp('opening_hours', 'text', 'Mon–Sat: 8am – 10pm')}
                            </Field>
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
                                {loading ? <><div className="bs-spinner" /> Registering...</> : '🏠 Register my store'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PhysicalSellerForm;
