import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    icon,
    disabled = false,
    required = false,
    className = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';

    return (
        <div className={`input-wrapper ${className}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <div className="input-container">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={isPasswordField && showPassword ? 'text' : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`input-field ${icon ? 'input-with-icon' : ''} ${isPasswordField ? 'input-with-toggle' : ''} ${error ? 'input-error' : ''}`}
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
};

export default Input;
