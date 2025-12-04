const API_URL = 'https://api-sirse.vercel.app/api';
// ================================
//   AUTH FETCH GLOBAL
// ================================
async function authFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
        return null;
    }

    return response;
}

// ================================
//   CHECK AUTH
// ================================
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

// ================================
//   AUTH HEADERS
// ================================
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// ================================
//   LOGOUT
// ================================
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ================================
//   LOAD USER INFO
// ================================
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    
    if (userNameEl && user.nombre) userNameEl.textContent = user.nombre;
    if (userEmailEl && user.email) userEmailEl.textContent = user.email;
}

// ================================
//   INIT
// ================================
if (checkAuth()) {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    loadUserInfo();
}