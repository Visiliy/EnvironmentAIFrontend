import { useState, useRef } from 'react';
import './Authorization.css';
import { AuthorizationService } from '../services/AuthorizationService';

const Authorization = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [showCode, setShowCode] = useState(false);
    const [code, setCode] = useState(['', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const inputRefs = useRef([]);
    const authService = new AuthorizationService;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        let response;
        if (activeTab === 'login') {
            response = await authService.login(email, password);
        } else {
            response = await authService.register(email, password);
        }
        
        if (response.success) {
            await authService.sendCode();
            setShowCode(true);
        } else {
            setError(response.error || 'Ошибка авторизации');
        }
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

    const handleVerify = async () => {
        const response = await authService.verifyCode(code);
        if (response.success) {
            window.location.href = '/workspace';
        } else {
            setError('Неверный код подтверждения');
        }
    };

    return (
        <div className="auth-page">
            <button className="back-home" onClick={() => window.location.href = '/'}>На главную</button>
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
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit} className="input-group">
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                            <input 
                                type="password" 
                                placeholder="Пароль" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
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
                        {error && <div className="error-message">{error}</div>}
                        <button className="action-btn" onClick={handleVerify}>Подтвердить</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Authorization; 