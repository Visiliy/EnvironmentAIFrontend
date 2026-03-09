import { useState, useRef } from 'react';
import './Authorization.css';

const Authorization = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [showCode, setShowCode] = useState(false);
    const [code, setCode] = useState(['', '', '', '', '']);
    const inputRefs = useRef([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowCode(true);
    };

    const handleCodeChange = (index, value) => {
        if (value.length > 1) return;
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 4) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="auth-page">
            <button className="back-home">На главную</button>
            <div className="auth-center">
                {!showCode ? (
                    <div className="auth-box">
                        <div className="switch-group">
                            <button 
                                className={`switch-btn ${activeTab === 'login' ? 'active' : ''}`}
                                onClick={() => setActiveTab('login')}
                            >
                                Вход
                            </button>
                            <button 
                                className={`switch-btn ${activeTab === 'register' ? 'active' : ''}`}
                                onClick={() => setActiveTab('register')}
                            >
                                Регистрация
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="input-group">
                            <input type="email" placeholder="Email" required />
                            <input type="password" placeholder="Пароль" required />
                            <button type="submit" className="action-btn">
                                {activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="code-block">
                        <div className="code-field">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="code-cell"
                                />
                            ))}
                        </div>
                        <button className="action-btn">Подтвердить</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Authorization;