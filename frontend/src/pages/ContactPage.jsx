import React from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    MessageCircle,
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle2
} from 'lucide-react';
import ShaderBackground from '../components/ui/ShaderBackground';
import './ContactPage.css';

const ContactPage = () => {
    return (
        <div className="contact-page">
            {/* Shader Background */}
            <ShaderBackground className="contact-shader" opacity={1} />

            {/* Fixed Header */}
            <header className="landing-header">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <div className="logo-icon">
                            <Shield size={24} />
                        </div>
                        <span className="logo-text">Medi Locker</span>
                    </Link>

                    <nav className="nav-links">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/features" className="nav-link">Features</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        <Link to="/contact" className="nav-link active">Contact</Link>
                    </nav>

                    <div className="header-actions">
                        <Link to="/login" className="btn-signin">Sign In</Link>
                        <Link to="/signup" className="btn-get-started">Get Started</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-content">
                    <div className="hero-badge">
                        <MessageCircle size={14} />
                        <span>Get In Touch</span>
                    </div>

                    <h1 className="contact-title">
                        <span className="title-white">We'd Love to</span>
                        <span className="title-gradient">Hear From You</span>
                    </h1>

                    <p className="contact-description">
                        Have questions about MediLocker? Need help with your account? Our team is here to help you 24/7.
                    </p>
                </div>

                {/* Light rays decoration */}
                <div className="hero-rays">
                    <div className="ray ray-1"></div>
                    <div className="ray ray-2"></div>
                    <div className="ray ray-3"></div>
                </div>
            </section>

            {/* Contact Content Section */}
            <section className="contact-content-section">
                <div className="contact-container">

                    {/* Left Column - Contact Form */}
                    <div className="contact-form-card">
                        <h2>Send us a Message</h2>

                        <form className="contact-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input type="text" id="name" placeholder="John Doe" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" placeholder="john@example.com" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input type="text" id="subject" placeholder="How can we help?" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea id="message" rows="5" placeholder="Tell us more about your inquiry..."></textarea>
                            </div>

                            <button type="submit" className="btn-submit">
                                <Send size={18} />
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Right Column - Contact Info */}
                    <div className="contact-info-column">
                        <h3>Contact Information</h3>

                        <div className="info-grid">
                            <div className="info-card">
                                <div className="info-icon">
                                    <Mail size={20} />
                                </div>
                                <div className="info-text">
                                    <h4>Email</h4>
                                    <a href="mailto:m9414315@gmail.com">m9414315@gmail.com</a>
                                    <span>For general inquiries</span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">
                                    <Phone size={20} />
                                </div>
                                <div className="info-text">
                                    <h4>Phone</h4>
                                    <a href="tel:+917506100140">7506100140</a>
                                    <span>Mon-Fri 9am-6pm IST</span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">
                                    <MapPin size={20} />
                                </div>
                                <div className="info-text">
                                    <h4>Address</h4>
                                    <p>Navi Mumbai Kharghar</p>
                                    <span>Maharashtra, India</span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">
                                    <Clock size={20} />
                                </div>
                                <div className="info-text">
                                    <h4>Support Hours</h4>
                                    <p>24/7 Support</p>
                                    <span>Emergency assistance available</span>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="faq-card">
                            <h3>Frequently Asked</h3>
                            <ul className="faq-list">
                                <li>
                                    <CheckCircle2 size={16} />
                                    <span>How do I reset my password?</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} />
                                    <span>How do I share my records with a doctor?</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} />
                                    <span>What happens after the 15-day upload window?</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} />
                                    <span>Is my data really secure?</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Shield size={20} />
                        <span>MediLocker</span>
                    </div>
                    <p className="footer-copyright">© 2026 MediLocker. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
