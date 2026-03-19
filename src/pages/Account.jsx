import { useState, useEffect } from 'react';
import "./Account.css";

const Account = () => {
    const [email, setEmail] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setEmail(parsed.email || '');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/';
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5071/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                window.location.href = '/';
            }
        }
    };

    const goToWorkspace = () => {
        window.location.href = '/workspace';
    };

    return (
        <div className="account-page">
            <button className="workspace-btn" onClick={goToWorkspace}>
                Workspace
            </button>
            <div className="account-container">
                <div className="account-card">
                    <h2 className="account-email">{email}</h2>
                    <div className="account-actions">
                        <button className="logout-btn" onClick={handleLogout}>
                            Выйти
                        </button>
                        <button className="delete-btn" onClick={handleDeleteAccount}>
                            Удалить аккаунт
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;