// Cargar estadísticas del dashboard
async function cargarEstadisticas() {
    try {
        const response = await apiRequest('/estadisticas/generales');
        
        if (response && response.ok) {
            const data = await response.json();
            
            console.log('Datos recibidos:', data);
            
            document.getElementById('total-reportes').textContent = data.total_reportes || 0;
            document.getElementById('reportes-atendidos').textContent = data.reportes_atendidos || 0;
            document.getElementById('reportes-pendientes').textContent = data.pendientes || 0;
            document.getElementById('falsos-positivos').textContent = data.falsos_positivos || 0;

            // ======================
            // cargarGraficos();
            // ======================

        } else {
            console.error('Error cargando estadísticas:', response?.status);
            mostrarDatosPorDefecto();
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        mostrarDatosPorDefecto();
    }
}

// Mostrar datos por defecto si hay error
function mostrarDatosPorDefecto() {
    document.getElementById('total-reportes').textContent = '0';
    document.getElementById('reportes-atendidos').textContent = '0';
    document.getElementById('reportes-pendientes').textContent = '0';
    document.getElementById('falsos-positivos').textContent = '0';
}

// ======================================================
// ========== SECCIÓN DE GRÁFICOS COMENTADA ============
// ======================================================

/*
async function cargarGraficos() {
    try {
        const responseMes = await apiRequest('/estadisticas/por-mes');
        if (responseMes && responseMes.ok) {
            const datosMes = await responseMes.json();
            crearGraficoMes(datosMes);
        } else {
            crearGraficoMes();
        }

        const responseCategoria = await apiRequest('/estadisticas/por-categoria');
        if (responseCategoria && responseCategoria.ok) {
            const datosCategoria = await responseCategoria.json();
            crearGraficoCategoria(datosCategoria);
        } else {
            crearGraficoCategoria();
        }
    } catch (error) {
        console.error('Error cargando gráficos:', error);
        crearGraficoMes();
        crearGraficoCategoria();
    }
}

function crearGraficoMes(datos) {
    // código original comentado
}

function crearGraficoCategoria(datos) {
    // código original comentado
}
*/

// ======================================================
// ======================================================

// Función para hacer requests autenticados
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Actualizar datos cada 30 segundos
function iniciarActualizacionAutomatica() {
    setInterval(() => {
        cargarEstadisticas();
    }, 30000);
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard cargado - Iniciando carga de datos...');
    cargarEstadisticas();
    iniciarActualizacionAutomatica();
});

// Recargar datos al volver a la página
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        cargarEstadisticas();
    }
});
