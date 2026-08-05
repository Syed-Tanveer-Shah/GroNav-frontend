import React, { useState, useEffect } from "react";
import axios from "axios";

function Contact() {
    const [contactInfo, setContactInfo] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);



    const openInGoogleMaps = (address) => {
        if (!address) return;
        const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
        window.open(mapUrl, "_blank", "noopener,noreferrer");
    };

    // Fetch Contact Info & Subjects from Backend
    useEffect(() => {
        axios.get("/api/contact-info/")
            .then(response => setContactInfo(response.data))
            .catch(error => console.error("Error fetching contact info:", error));


    }, []);

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, subject, message } = formData;
        console.log('Form data:', { name, email, subject, message });
        if (!name || !email || !subject || !message) {
            alert('Please fill all fields');
            return;
        }
        try {
            setLoading(true);
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/contact/`, { name, email, subject, message });
            alert('Your message has been sent successfully!');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Contact error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="rts-contact-main-wrapper-banner bg_image">
                <div className="container">
                    <div className="row">
                        <div className="co-lg-12">
                            <div className="contact-banner-content">
                                <h1 className="title">Ask Us Questions</h1>
                                <p className="disc">
                                    We are here to answer any of your questions. Reach out to us anytime.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rts-map-contact-area rts-section-gap2">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="contact-left-area-main-wrapper">
                                <h2 className="title">You can ask us questions!</h2>
                                <p className="disc">
                                    Contact us for all your questions and opinions. 
                                </p>
                                <div className="location-single-card">
                                    <div className="icon">
                                        <i
                                            className="fa-light fa-location-dot"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => openInGoogleMaps(contactInfo.address)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    openInGoogleMaps(contactInfo.address);
                                                }
                                            }}
                                            title="View on Google Maps"
                                        />
                                    </div>
                                    <div className="information">
                                        <h3 className="title animated fadeIn">{contactInfo.store_name || "Our Store"}</h3>
                                        <p>{contactInfo.address}</p>
                                        <a href={`tel:${contactInfo.contact_phone}`} className="number">{contactInfo.contact_phone}</a>
                                        <a href={`mailto:${contactInfo.contact_email}`} className="email">{contactInfo.contact_email}</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="bg_light-1 contact-form-wrapper-bg">
                                <div className="row">
                                    <div className="col-lg-7 pr--30 pr_md--10 pr_sm--5">
                                        <div className="contact-form-wrapper-1">
                                            <h3 className="title mb--50 animated fadeIn">
                                                Fill Up The Form If You Have Any Question
                                            </h3>
                                            <form onSubmit={handleSubmit} className="contact-form-1">
                                                <div className="contact-form-wrapper--half-area">
                                                    <div className="single">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            placeholder="Name*"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="single">
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            placeholder="Email*"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="single-select">
                                                    <select name="subject" value={formData.subject} onChange={handleChange} required>
                                                        <option value="">Select Subject*</option>
                                                        <option value="general">General Inquiry</option>
                                                        <option value="support">Technical Support</option>
                                                        <option value="order">Order Issue</option>
                                                        <option value="feedback">Feedback</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>

                                                <textarea
                                                    name="message"
                                                    placeholder="Write Message Here"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                />

                                                <button type="submit" className="rts-btn btn-primary mt--20" disabled={loading}>
                                                    {loading ? 'Sending...' : 'Send Message'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="col-lg-5 mt_md--30 mt_sm--30">
                                        <div className="thumbnail-area">
                                            <img src="assets/images/contact/02.jpg" alt="contact_form" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                       
                    </div>
                </div>
            </div>
        </>
    );
}

export default Contact;
