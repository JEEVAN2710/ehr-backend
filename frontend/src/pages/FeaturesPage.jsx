import React from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    FileText,
    Share2,
    Lock,
    Clock,
    Fingerprint,
    Download,
    Smartphone,
    FolderOpen,
    Zap,
    Globe,
    ArrowRight
} from 'lucide-react';
import ShaderBackground from '../components/ui/ShaderBackground';
import './FeaturesPage.css';

const FeaturesPage = () => {
    const features = [
        {
            icon: FileText,
            title: 'Secure Document Storage',
            description: 'Store all your medical records, prescriptions, lab reports, and imaging files in one secure location. Our encrypted storage ensures your data is always protected.',
            iconClass: 'icon-coral'
        },
        {
            icon: Share2,
            title: 'NFC-Enabled Sharing',
            description: 'Share your medical history instantly with healthcare providers using NFC technology. Simply tap your MediCard and approve access requests.',
            iconClass: 'icon-purple'
        },
        {
            icon: Lock,
            title: 'Blockchain Security',
            description: 'Your records are encrypted and stored on blockchain technology, making them completely tamper-proof. Only you control who can access your information.',
            iconClass: 'icon-coral'
        },
        {
            icon: Clock,
            title: '15-Day Upload Window',
            description: 'New users have a 15-day window to upload existing medical records. This prevents document fraud and ensures authenticity of your medical history.',
            iconClass: 'icon-teal'
        },
        {
            icon: Fingerprint,
            title: 'Biometric Authentication',
            description: 'Secure your account with biometric authentication. Use fingerprint or face recognition for quick and secure access to your medical locker.',
            iconClass: 'icon-purple'
        },
        {
            icon: Download,
            title: 'Easy Downloads',
            description: 'Download your records anytime, anywhere. Export in multiple formats including PDF, JPEG, and DICOM for imaging files.',
            iconClass: 'icon-coral'
        }
    ];

    const moreFeatures = [
        {
            icon: Smartphone,
            title: 'Mobile Access',
            description: 'Access your medical locker from any device. Our responsive design ensures a seamless experience on desktop, tablet, and mobile.',
            iconClass: 'icon-teal'
        },
        {
            icon: FolderOpen,
            title: 'Organized Categories',
            description: 'Automatically categorize your records into prescriptions, lab reports, imaging, vaccination records, and more for easy retrieval.',
            iconClass: 'icon-purple'
        },
        {
            icon: Zap,
            title: 'Real-time Updates',
            description: 'Receive instant notifications when new records are uploaded by healthcare providers. Stay informed about your health journey.',
            iconClass: 'icon-coral'
        },
        {
            icon: Globe,
            title: 'Universal Access',
            description: 'Access your records from anywhere in the world. Perfect for travelers or those receiving care from multiple providers.',
            iconClass: 'icon-teal'
        }
    ];

    return (
        <div className="features-page">
            {/* Shader Background */}
            <ShaderBackground className="features-shader" opacity={1} />

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
                        <Link to="/features" className="nav-link active">Features</Link>
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
            <section className="features-hero">
                <div className="features-hero-content">
                    <div className="hero-badge">
                        <Shield size={14} />
                        <span>Comprehensive Feature Set</span>
                    </div>

                    <h1 className="features-title">
                        <span className="title-white">Powerful Features</span>
                        <span className="title-white">for</span>
                        <span className="title-gradient">Complete Control</span>
                    </h1>

                    <p className="features-description">
                        MediLocker combines cutting-edge security with intuitive design to give you complete control over your medical records.
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

            {/* Features Grid - First Set */}
            <section className="features-grid-section">
                <div className="features-grid-3">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card-large">
                            <div className={`feature-icon ${feature.iconClass}`}>
                                <feature.icon size={24} />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid - Second Set */}
            <section className="features-grid-section">
                <div className="features-grid-3">
                    {moreFeatures.map((feature, index) => (
                        <div key={index} className="feature-card-large">
                            <div className={`feature-icon ${feature.iconClass}`}>
                                <feature.icon size={24} />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
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

export default FeaturesPage;
