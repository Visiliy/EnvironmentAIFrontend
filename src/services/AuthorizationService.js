export class AuthorizationService {
    constructor() {
        this.baseURL = 'http://localhost:5071/auth';
        this.token = localStorage.getItem('token');
        this.userData = JSON.parse(localStorage.getItem('userData')) || null;
    }

    async register(email, password) {
        const response = await fetch(`${this.baseURL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            this.token = data.token;
            localStorage.setItem('token', data.token);
        }
        return data;
    }

    async login(email, password) {
        const response = await fetch(`${this.baseURL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            this.token = data.token;
            localStorage.setItem('token', data.token);
        }
        return data;
    }

    async sendCode() {
        const response = await fetch(`${this.baseURL}/send-code`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return await response.json();
    }

    async verifyCode(code) {
        const response = await fetch(`${this.baseURL}/verify`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ code: code.join('') })
        });
        const data = await response.json();
        if (data.success) {
            this.userData = { verified: true, email: this.getEmailFromToken() };
            localStorage.setItem('userData', JSON.stringify(this.userData));
        }
        return data;
    }

    getEmailFromToken() {
        try {
            const base64Url = this.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            return payload.sub || payload.identity;
        } catch {
            return null;
        }
    }

    logout() {
        this.token = null;
        this.userData = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    }

    isVerified() {
        return this.userData?.verified || false;
    }
}