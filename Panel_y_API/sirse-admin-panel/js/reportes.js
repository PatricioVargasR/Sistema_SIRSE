let categorias = [];
let estados = [];
let reportes = [];

// Load categories and states for filters
async function loadFilters() {
    try {
        const [catResponse, estResponse] = await Promise.all([
            fetch(`${API_URL}/categorias/`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/estados/`, { headers: getAuthHeaders() })
        ]);
        
        categorias = await catResponse.json();
        estados = await estResponse.json();
        
        // Populate category filter
        const catSelect = document.getElementById('filter-categoria');
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id_categoria;
            option.textContent = cat.nombre;
            catSelect.appendChild(option);
        });
        
        // Populate state filter
        const estSelect = document.getElementById('filter-estado');
        estados.forEach(est => {
            const option = document.createElement('option');
            option.value = est.id_estado;
            option.textContent = est.nombre;
            estSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

// Load reports
async function loadReportes(categoriaId = '', estadoId = '') {
    try {
        let url = `${API_URL}/reportes/?limit=50`;
        if (categoriaId) url += `&id_categoria=${categoriaId}`;
        if (estadoId) url += `&id_estado=${estadoId}`;
        
        const response = await fetch(url, { headers: getAuthHeaders() });
        reportes = await response.json();
        
        renderReportes();
    } catch (error) {
        console.error('Error loading reportes:', error);
        document.getElementById('reportes-container').innerHTML = 
            '<p class="loading">Error al cargar reportes</p>';
    }
}

// Render reports
function renderReportes() {
    const container = document.getElementById('reportes-container');
    
    if (reportes.length === 0) {
        container.innerHTML = '<p class="loading">No hay reportes disponibles</p>';
        return;
    }
    
    container.innerHTML = reportes.map(reporte => {
        const categoriaBadge = getCategoriaColor(reporte.categoria.nombre);
        const estadoBadge = getEstadoColor(reporte.estado.nombre);
        
        return `
            <div class="report-card">
                <div class="report-image">📷</div>
                <div class="report-content">
                    <div class="report-badges">
                        <span class="badge ${categoriaBadge}">${reporte.categoria.nombre}</span>
                        <span class="badge ${estadoBadge}">${reporte.estado.nombre}</span>
                    </div>
                    <h3 class="report-title">${reporte.nombre} ${reporte.apellido_paterno}</h3>
                    <p class="report-description">${reporte.descripcion || 'Sin descripción'}</p>
                    <div class="report-meta">
                        <span>📅 ${formatDate(reporte.created_at)}</span>
                        <span>🕐 ${formatTime(reporte.created_at)}</span>
                        <span>📍 ${reporte.direccion || 'Sin ubicación'}</span>
                    </div>
                </div>
                <div class="report-actions">
                    <button class="btn-validate" onclick="validarReporte(${reporte.id_reporte})">Validar</button>
                    <button class="btn-resolve" onclick="resolverReporte(${reporte.id_reporte})">✓ Resolver</button>
                    <button class="btn-delete" onclick="eliminarReporte(${reporte.id_reporte})">🗑</button>
                </div>
            </div>
        `;
    }).join('');
}

// Get category badge color
function getCategoriaColor(nombre) {
    const colors = {
        'Luminarias': 'yellow',
        'Servicios Municipales': 'orange',
        'Obras Públicas': 'blue',
        'Parques y Jardines': 'green'
    };
    return colors[nombre] || 'blue';
}

// Get state badge color
function getEstadoColor(nombre) {
    const colors = {
        'Pendiente': 'yellow',
        'En proceso': 'blue',
        'Resuelto': 'green',
        'Rechazado': 'red'
    };
    return colors[nombre] || 'blue';
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

// Format time
function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Validate report
async function validarReporte(id) {
    if (!confirm('¿Validar este reporte?')) return;
    
    try {
        await fetch(`${API_URL}/reportes/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id_estado: 2 }) // En proceso
        });
        
        loadReportes(
            document.getElementById('filter-categoria').value,
            document.getElementById('filter-estado').value
        );
    } catch (error) {
        alert('Error al validar reporte');
        console.error(error);
    }
}

// Resolve report
async function resolverReporte(id) {
    if (!confirm('¿Marcar este reporte como resuelto?')) return;
    
    try {
        await fetch(`${API_URL}/reportes/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id_estado: 3 }) // Resuelto
        });
        
        loadReportes(
            document.getElementById('filter-categoria').value,
            document.getElementById('filter-estado').value
        );
    } catch (error) {
        alert('Error al resolver reporte');
        console.error(error);
    }
}

// Delete report
async function eliminarReporte(id) {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;
    
    try {
        await fetch(`${API_URL}/reportes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        loadReportes(
            document.getElementById('filter-categoria').value,
            document.getElementById('filter-estado').value
        );
    } catch (error) {
        alert('Error al eliminar reporte');
        console.error(error);
    }
}

// Event listeners
document.getElementById('filter-categoria').addEventListener('change', function() {
    loadReportes(this.value, document.getElementById('filter-estado').value);
});

document.getElementById('filter-estado').addEventListener('change', function() {
    loadReportes(document.getElementById('filter-categoria').value, this.value);
});

document.getElementById('search-input').addEventListener('input', function(e) {
    const search = e.target.value.toLowerCase();
    const filtered = reportes.filter(r => 
        r.nombre.toLowerCase().includes(search) ||
        r.descripcion?.toLowerCase().includes(search) ||
        r.folio.toLowerCase().includes(search)
    );
    
    const temp = reportes;
    reportes = filtered;
    renderReportes();
    reportes = temp;
});

// Initialize
loadFilters();
loadReportes();