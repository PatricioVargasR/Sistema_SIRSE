// Load users from API
async function loadUsuarios() {
    try {
        const response = await fetch(`${API_URL}/usuarios/`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }
        
        const usuarios = await response.json();
        renderUsuarios(usuarios);
        updateStats(usuarios);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('users-table-body').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar usuarios</td></tr>';
    }
}

// Render users in table
function renderUsuarios(usuarios) {
    const tbody = document.getElementById('users-table-body');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay usuarios registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = usuarios.map(user => {
        const initials = user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="user-avatar">${initials}</div>
                        <div>
                            <div style="font-weight: 500;">${user.nombre}</div>
                            <div style="font-size: 12px; color: #666;">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>${user.rol || 'Operador'}</td>
                <td>${user.departamento || '-'}</td>
                <td>📅 ${formatDate(user.created_at)}</td>
                <td><span class="badge green">Activo</span></td>
                <td>
                    <button class="btn-validate" onclick="editarUsuario(${user.id})" style="margin-right: 5px;">✏️</button>
                    <button class="btn-delete" onclick="eliminarUsuario(${user.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update stats
function updateStats(usuarios) {
    document.getElementById('total-usuarios').textContent = usuarios.length;
    document.getElementById('usuarios-activos').textContent = usuarios.length;
    document.getElementById('total-departamentos').textContent = 5;
}

// Load current user profile
function loadCurrentProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.nombre) {
        document.getElementById('profile-name').textContent = user.nombre;
        document.getElementById('profile-email').textContent = user.email;
        
        const initials = user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.querySelector('.user-avatar-large').textContent = initials;
    }
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Edit user (actualizado con rol y departamento)
async function editarUsuario(id) {
    const nombre = prompt('Nuevo nombre:');
    if (!nombre) return;
    
    const email = prompt('Nuevo email:');
    if (!email) return;
    
    const telefono = prompt('Teléfono (opcional):');
    const departamento = prompt('Departamento (opcional):');
    const rol = prompt('Rol (Administrador/Coordinador/Supervisor/Operador):');
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                nombre, 
                email, 
                telefono: telefono || null, 
                departamento: departamento || null,
                rol: rol || 'Operador',
                contraseña: null 
            })
        });
        
        if (response.ok) {
            alert('Usuario actualizado correctamente');
            loadUsuarios();
        } else {
            alert('Error al actualizar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar usuario');
    }
}

// Delete user
async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            alert('Usuario eliminado correctamente');
            loadUsuarios();
        } else {
            const error = await response.json();
            alert(error.detail || 'Error al eliminar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar usuario');
    }
}

// Add user (actualizado con rol y departamento)
document.getElementById('btn-add-user').addEventListener('click', async function() {
    const nombre = prompt('Nombre completo:');
    if (!nombre) return;
    
    const email = prompt('Email:');
    if (!email) return;
    
    const contraseña = prompt('Contraseña:');
    if (!contraseña) return;
    
    const telefono = prompt('Teléfono (opcional):');
    const departamento = prompt('Departamento (opcional):');
    const rol = prompt('Rol (Administrador/Coordinador/Supervisor/Operador):');
    
    try {
        const response = await fetch(`${API_URL}/usuarios/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                nombre, 
                email, 
                contraseña, 
                telefono: telefono || null,
                departamento: departamento || null,
                rol: rol || 'Operador'
            })
        });
        
        if (response.ok) {
            alert('Usuario creado correctamente');
            loadUsuarios();
        } else {
            const error = await response.json();
            alert(error.detail || 'Error al crear usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear usuario');
    }
});

// Change password
document.getElementById('btn-change-password').addEventListener('click', async function() {
    const newPassword = prompt('Ingresa tu nueva contraseña:');
    if (!newPassword) return;
    
    try {
        const response = await fetch(`${API_URL}/usuarios/me/cambiar-contraseña?contraseña_nueva=${newPassword}`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            alert('Contraseña actualizada correctamente');
        } else {
            alert('Error al cambiar contraseña');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cambiar contraseña');
    }
});

// Initialize
loadCurrentProfile();
loadUsuarios();
