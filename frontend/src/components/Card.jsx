import React from 'react';
import './Card.css';

const Card = ({
    children,
    className = '',
    hover = false,
    glass = true,
    onClick,
    ...props
}) => {
    const classes = [
        'card',
        glass ? 'card-glass' : '',
        hover ? 'card-hover' : '',
        onClick ? 'card-clickable' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {children}
        </div>
    );
};

export default Card;
