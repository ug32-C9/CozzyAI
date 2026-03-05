import React from 'react';

const ErrorBanner = ({ error }) => {
    if (!error) return null;

    return (
        <div className="error-banner">
            ⚠ <span>{error}</span>
        </div>
    );
};

export default ErrorBanner;