// Cargar estadísticas del dashboard
async function cargarEstadisticas() {
    try {
        const response = await apiRequest('/estadisticas/generales');
        
        if (response && response.ok) {
            const data = await response.json();
            
            console.log('Datos recibidos:', data);
            
            // Actualizar cards
            document.getElementById('total-reportes').textContent = data.total_reportes || 0;
            document.getElementById('reportes-atendidos').textContent = data.reportes_resueltos || 0;
            document.getElementById('reportes-pendientes').textContent = data.reportes_pendientes || 0;
            document.getElementById('falsos-positivos').textContent = '0'; // Por ahora fijo

            // Cargar gráficos
            cargarGraficos();
            
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

// Cargar gráficos
async function cargarGraficos() {
    console.log('🔍 Iniciando carga de gráficos...');
    
    try {
        // Gráfico por mes
        console.log('📊 Llamando a /estadisticas/por-mes-chart...');
        const responseMes = await apiRequest('/estadisticas/por-mes-chart');
        
        if (responseMes && responseMes.ok) {
            const datosMes = await responseMes.json();
            console.log('📈 Datos mes recibidos:', datosMes);
            crearGraficoMes(datosMes);
        } else {
            console.error('❌ Error cargando gráfico por mes, status:', responseMes?.status);
            crearGraficoMes({
                labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
                values: [5, 8, 12, 6, 9, 15]
            });
        }
        
        // Gráfico por categoría
        console.log('📊 Llamando a /estadisticas/por-categoria-chart...');
        const responseCategoria = await apiRequest('/estadisticas/por-categoria-chart');
        
        if (responseCategoria && responseCategoria.ok) {
            const datosCategoria = await responseCategoria.json();
            console.log('📊 Datos categoría recibidos:', datosCategoria);
            crearGraficoCategoria(datosCategoria);
        } else {
            console.error('❌ Error cargando gráfico por categoría, status:', responseCategoria?.status);
            crearGraficoCategoria({
                labels: ["Seguridad", "Robo", "Accidente", "Vandalismo", "Alumbrado"],
                values: [8, 5, 3, 2, 4]
            });
        }
        
    } catch (error) {
        console.error('💥 Error cargando gráficos:', error);
        crearGraficoMes();
        crearGraficoCategoria();
    }
}

//
// ==========================
//   GRÁFICOS ESTABILIZADOS
// ==========================
//

// Crear gráfico por mes (VERSIÓN ESTABILIZADA)
function crearGraficoMes(datos) {
    const ctx = document.getElementById('chart-por-mes');
    if (!ctx) {
        console.log('❌ Canvas chart-por-mes no encontrado');
        return;
    }

    if (window.chartMes) {
        window.chartMes.destroy();
        window.chartMes = null;
    }

    ctx.style.width = '100%';
    ctx.style.height = '300px';
    ctx.style.maxHeight = '300px';
    ctx.width = ctx.offsetWidth;
    ctx.height = 300;

    const labels = datos?.labels || ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    const values = datos?.values || [5, 8, 12, 6, 9, 15];

    console.log('🎨 Creando gráfico mes con tamaño fijo');

    window.chartMes = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reportes por mes',
                data: values,
                borderColor: '#003366',
                backgroundColor: 'rgba(0, 51, 102, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            layout: {
                padding: { left: 10, right: 10, top: 10, bottom: 10 }
            },
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Crear gráfico por categoría (VERSIÓN ESTABILIZADA)
function crearGraficoCategoria(datos) {
    const ctx = document.getElementById('chart-por-categoria');
    if (!ctx) {
        console.log('❌ Canvas chart-por-categoria no encontrado');
        return;
    }

    if (window.chartCategoria) {
        window.chartCategoria.destroy();
        window.chartCategoria = null;
    }

    ctx.style.width = '100%';
    ctx.style.height = '300px';
    ctx.style.maxHeight = '300px';
    ctx.width = ctx.offsetWidth;
    ctx.height = 300;

    const labels = datos?.labels || ["Seguridad", "Robo", "Accidente", "Vandalismo", "Alumbrado"];
    const values = datos?.values || [8, 5, 3, 2, 4];

    console.log('🎨 Creando gráfico categoría con tamaño fijo');

    window.chartCategoria = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#003366', '#004d99', '#00d084', '#ff9500', '#ff3b30', '#8e44ad'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            layout: {
                padding: { left: 10, right: 10, top: 10, bottom: 10 }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        boxWidth: 12,
                        font: { size: 11 }
                    }
                }
            },
            cutout: '50%'
        }
    });
}

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
            window.location.href = '/index.html';
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

// Recargar datos cuando la página vuelve a ser visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        cargarEstadisticas();
    }
});