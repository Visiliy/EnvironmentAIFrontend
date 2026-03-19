import { useState, useEffect } from 'react';
import "../UX/Cap.css";

const Cap = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [isWorkspace, setIsWorkspace] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setIsVerified(parsed.verified || false);
        }
        setIsWorkspace(window.location.pathname === '/workspace');
    }, []);

    const handleClick = () => {
        if (isWorkspace) {
            window.location.href = '/account';
        } else if (isVerified) {
            window.location.href = '/workspace';
        } else {
            window.location.href = '/authorization';
        }
    };

    const getButtonText = () => {
        if (isWorkspace) return 'Аккаунт';
        if (isVerified) return 'Workspace';
        return 'Войти';
    };

    return (
        <div className="cap-container">
            <div className="logo-wrapper">
                <img src="src/assets/logo.jpg" alt="logo" />
                <p>Environment AI</p>
            </div>
            <button onClick={handleClick}>
                {getButtonText()}
            </button>
        </div>
    );
};

export default Cap;