const API_URL = 'http://127.0.0.1:8000/api';

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!token && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
        return false;
    }
    
    if (token && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Load user info
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    
    if (userNameEl && user.nombre) {
        userNameEl.textContent = user.nombre;
    }
    
    if (userEmailEl && user.email) {
        userEmailEl.textContent = user.email;
    }
}

// Initialize auth on page load
if (checkAuth()) {
    // Setup logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Load user info
    loadUserInfo();
}