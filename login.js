// OAuth Configuration
const oAuthConfig = {
    google: {
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        redirect_uri: 'http://localhost:3000/auth/google/callback',
        scope: 'email profile'
    },
    facebook: {
        client_id: 'YOUR_FACEBOOK_CLIENT_ID',
        redirect_uri: 'http://localhost:3000/auth/facebook/callback',
        scope: 'email,public_profile'
    },
    github: {
        client_id: 'YOUR_GITHUB_CLIENT_ID',
        redirect_uri: 'http://localhost:3000/auth/github/callback',
        scope: 'user:email'
    }
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    const oAuthButtons = document.querySelectorAll('.oauth-btn');
    const planButtons = document.querySelectorAll('.select-plan-btn');
    
    // Handle OAuth Button Clicks
    oAuthButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const provider = e.currentTarget.classList[1];
            handleOAuthLogin(provider);
        });
    });

    // Handle Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormLogin();
    });

    // Handle Plan Selection
    planButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const isPremium = e.currentTarget.classList.contains('premium');
            handlePlanSelection(isPremium);
        });
    });
});

// OAuth Login Handler
function handleOAuthLogin(provider) {
    const config = oAuthConfig[provider];
    if (!config) return;

    // Build OAuth URL
    const authUrl = buildOAuthUrl(provider, config);
    
    // Open OAuth popup
    const popup = window.open(authUrl, 'OAuth Login', 'width=600,height=600');
    
    // Handle OAuth response
    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        const { token, user } = event.data;
        if (token && user) {
            handleSuccessfulLogin(token, user);
        }
    });
}

// Build OAuth URL
function buildOAuthUrl(provider, config) {
    const baseUrls = {
        google: 'https://accounts.google.com/o/oauth2/v2/auth',
        facebook: 'https://www.facebook.com/v12.0/dialog/oauth',
        github: 'https://github.com/login/oauth/authorize'
    };

    const url = new URL(baseUrls[provider]);
    url.searchParams.append('client_id', config.client_id);
    url.searchParams.append('redirect_uri', config.redirect_uri);
    url.searchParams.append('scope', config.scope);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('state', generateState());

    return url.toString();
}

// Generate random state for OAuth security
function generateState() {
    return Math.random().toString(36).substring(2);
}

// Form Login Handler
function handleFormLogin() {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    // Basic validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    // Here you would typically make an API call to your backend
    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            handleSuccessfulLogin(data.token, data.user);
        } else {
            showError(data.message || 'Login failed');
        }
    })
    .catch(error => {
        showError('An error occurred. Please try again.');
        console.error('Login error:', error);
    });
}

// Plan Selection Handler
function handlePlanSelection(isPremium) {
    const plan = isPremium ? 'premium' : 'free';
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        showError('Please log in first to select a plan');
        return;
    }

    // Here you would typically make an API call to your backend
    fetch('http://localhost:3000/api/subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (isPremium) {
                // Redirect to payment processing
                window.location.href = '/payment.html';
            } else {
                // Redirect to main app
                window.location.href = '/index.html';
            }
        } else {
            showError(data.message || 'Failed to select plan');
        }
    })
    .catch(error => {
        showError('An error occurred. Please try again.');
        console.error('Subscription error:', error);
    });
}

// Success Login Handler
function handleSuccessfulLogin(token, user) {
    // Store token and user data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Update UI or redirect
    window.location.href = '/index.html';
}

// Error Display
function showError(message) {
    // Create error element if it doesn't exist
    let errorElement = document.querySelector('.login-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'login-error';
        document.querySelector('.login-form').prepend(errorElement);
    }

    // Show error message
    errorElement.textContent = message;
    errorElement.style.display = 'block';

    // Hide error after 3 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// Add error styles to login-styles.css
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .login-error {
        background-color: rgba(255, 0, 0, 0.1);
        color: #ff4444;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        display: none;
        text-align: center;
    }
`;
document.head.appendChild(errorStyles);
