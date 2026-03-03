import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Upload, Share2, Download, Lock, Users, Smartphone, Stethoscope, FlaskConical, ArrowRight, Check } from 'lucide-react';
import ShaderBackground from '../components/ui/ShaderBackground';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Shader Background */}
            <ShaderBackground className="landing-shader" opacity={1} />

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
                        <a href="#home" className="nav-link active">Home</a>
                        <Link to="/features" className="nav-link">Features</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        <Link to="/contact" className="nav-link">Contact</Link>
                    </nav>

                    <div className="header-actions">
                        <Link to="/login" className="btn-signin">Sign In</Link>
                        <Link to="/signup" className="btn-get-started">Get Started</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Shield size={14} />
                        <span>Blockchain Secured Medical Records</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="title-white">Your Health,</span>
                        <span className="title-gradient">Your Control</span>
                    </h1>

                    <p className="hero-description">
                        Medi Locker is your personal medical vault. Store, manage, and securely share your health records with healthcare providers using NFC technology.
                    </p>

                    <Link to="/signup" className="btn-hero">
                        Get Started Free <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Light rays decoration */}
                <div className="hero-rays">
                    <div className="ray ray-1"></div>
                    <div className="ray ray-2"></div>
                    <div className="ray ray-3"></div>
                    <div className="ray ray-4"></div>
                    <div className="ray ray-5"></div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="trust-badges">
                <div className="badge-item">
                    <Check size={16} />
                    <span>HIPAA Compliant</span>
                </div>
                <div className="badge-item">
                    <Check size={16} />
                    <span>End-to-End Encrypted</span>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-subtitle">
                        A complete solution for managing your medical records with cutting-edge security and convenience.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon icon-coral">
                            <Upload size={24} />
                        </div>
                        <h3>Upload & Store</h3>
                        <p>Securely upload and store all your medical records, prescriptions, and reports in one place.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon icon-purple">
                            <Share2 size={24} />
                        </div>
                        <h3>Smart Sharing</h3>
                        <p>Share your medical history with healthcare providers using NFC cards with your consent.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon icon-teal">
                            <Download size={24} />
                        </div>
                        <h3>Easy Download</h3>
                        <p>Download your records anytime, anywhere. Your data is always accessible.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon icon-teal">
                            <Lock size={24} />
                        </div>
                        <h3>Blockchain Security</h3>
                        <p>Your records are encrypted and stored on blockchain, making them tamper-proof.</p>
                    </div>
                </div>
            </section>

            {/* User Types Section */}
            <section id="about" className="users-section">
                <div className="section-header">
                    <h2 className="section-title">Built for Everyone</h2>
                    <p className="section-subtitle">
                        Whether you're a patient, doctor, lab assistant, or admin - MediLocker has a tailored experience for you.
                    </p>
                </div>

                <div className="users-grid">
                    <Link to="/signup" className="user-card">
                        <div className="user-icon icon-teal">
                            <Users size={28} />
                        </div>
                        <h3>Admin</h3>
                        <p>Manage users, monitor system, and oversee operations.</p>
                    </Link>

                    <Link to="/signup" className="user-card">
                        <div className="user-icon icon-teal">
                            <Smartphone size={28} />
                        </div>
                        <h3>Patient</h3>
                        <p>Access your medical locker, manage records, and control sharing.</p>
                    </Link>

                    <Link to="/signup" className="user-card">
                        <div className="user-icon icon-coral">
                            <Stethoscope size={28} />
                        </div>
                        <h3>Doctor</h3>
                        <p>Request patient records, upload prescriptions and reports.</p>
                    </Link>

                    <Link to="/signup" className="user-card">
                        <div className="user-icon icon-purple">
                            <FlaskConical size={28} />
                        </div>
                        <h3>Lab Assistant</h3>
                        <p>Upload test results and lab reports to patient records.</p>
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="cta-section">
                <div className="cta-card">
                    <h2>Ready to Secure Your Health Records?</h2>
                    <p>Join thousands of users who trust MediLocker with their medical history.</p>
                    <Link to="/signup" className="btn-cta">
                        Create Your Locker <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Shield size={20} />
                        <span>Medi Locker</span>
                    </div>
                    <p className="footer-copyright">© 2026 MediLocker. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
