import { useMemo } from "react";
import "../UX/Cap.css";

const parseUserData = () => {
    const userData = localStorage.getItem("userData");
    if (!userData) return {};
    try {
        return JSON.parse(userData);
    } catch {
        return {};
    }
};

const Cap = () => {
    const userData = useMemo(() => parseUserData(), []);
    const isVerified = Boolean(userData.verified);
    const isWorkspace = window.location.pathname === "/workspace";

    const handleClick = () => {
        if (isWorkspace) {
            window.location.href = "/account";
        } else if (isVerified) {
            window.location.href = "/workspace";
        } else {
            window.location.href = "/authorization";
        }
    };

    const getButtonText = () => {
        if (isWorkspace) return "Аккаунт";
        if (isVerified) return "Workspace";
        return "Войти";
    };

    return (
        <div className="cap-container">
            {!isWorkspace && (
                <div className="logo-wrapper">
                    <img src="src/assets/logo.jpg" alt="logo" />
                    <p>Environment</p>
                </div>
            )}
            <button onClick={handleClick}>
                {getButtonText()}
            </button>
        </div>
    );
};

export default Cap;