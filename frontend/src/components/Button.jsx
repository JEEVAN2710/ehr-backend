import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const widthClass = fullWidth ? 'btn-full' : '';
    const disabledClass = disabled || loading ? 'btn-disabled' : '';

    const classes = [
        baseClass,
        variantClass,
        sizeClass,
        widthClass,
        disabledClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="btn-spinner"></span>
            )}
            {!loading && icon && (
                <span className="btn-icon">{icon}</span>
            )}
            <span>{children}</span>
        </button>
    );
};

export default Button;
