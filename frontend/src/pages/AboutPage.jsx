import React from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Heart,
    Lock,
    Lightbulb,
    Globe,
    Wifi
} from 'lucide-react';
import ShaderBackground from '../components/ui/ShaderBackground';
import './AboutPage.css';

const AboutPage = () => {
    const values = [
        {
            icon: Lock,
            title: 'Security First',
            description: 'We prioritize the security and privacy of your medical data above all else. Every decision we make is guided by this principle.',
            iconClass: 'icon-teal'
        },
        {
            icon: Heart,
            title: 'Patient-Centric',
            description: 'We believe patients should have complete control over their medical records. You own your data, and you decide who can access it.',
            iconClass: 'icon-teal'
        },
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'We leverage cutting-edge technologies like blockchain and NFC to create solutions that were previously impossible.',
            iconClass: 'icon-coral'
        },
        {
            icon: Globe,
            title: 'Accessibility',
            description: 'We believe everyone deserves access to their medical history, regardless of location or technical expertise.',
            iconClass: 'icon-teal'
        }
    ];

    return (
        <div className="about-page">
            {/* Shader Background */}
            <ShaderBackground className="about-shader" opacity={1} />

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
                        <Link to="/about" className="nav-link active">About</Link>
                        <Link to="/contact" className="nav-link">Contact</Link>
                    </nav>

                    <div className="header-actions">
                        <Link to="/login" className="btn-signin">Sign In</Link>
                        <Link to="/signup" className="btn-get-started">Get Started</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-content">
                    <div className="hero-badge">
                        <Heart size={14} />
                        <span>Our Story</span>
                    </div>

                    <h1 className="about-title">
                        <span className="title-white">Revolutionizing</span>
                        <span className="title-gradient">Healthcare</span>
                        <span className="title-gradient">Access</span>
                    </h1>

                    <p className="about-description">
                        MediLocker was born from a simple frustration: the difficulty of managing and sharing medical records across different healthcare providers. We set out to create a solution that puts patients in complete control of their health data.
                    </p>
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

            {/* Mission Section */}
            <section className="mission-section">
                <div className="mission-content">
                    <div className="mission-icon">
                        <Wifi size={32} />
                    </div>
                    <h2>Our Mission</h2>
                    <p>
                        To empower every individual with secure, instant access to their complete medical history, enabling better healthcare decisions and seamless coordination between patients and healthcare providers.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="values-header">
                    <h2>Our Values</h2>
                    <p>These core principles guide everything we do at MediLocker.</p>
                </div>

                {/* Light rays decoration */}
                <div className="values-rays">
                    <div className="ray ray-1"></div>
                    <div className="ray ray-2"></div>
                    <div className="ray ray-3"></div>
                </div>

                <div className="values-grid">
                    {values.map((value, index) => (
                        <div key={index} className="value-card">
                            <div className={`value-icon ${value.iconClass}`}>
                                <value.icon size={24} />
                            </div>
                            <h3>{value.title}</h3>
                            <p>{value.description}</p>
                        </div>
                    ))}
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

export default AboutPage;
