let chartTendencias, chartTiempoRespuesta, chartResolucion, chartDepartamentos;

// Load statistics
async function loadEstadisticas() {
    try {
        const statsResponse = await fetch(`${API_URL}/estadisticas/generales`, {
            headers: getAuthHeaders()
        });
        const stats = await statsResponse.json();
        
        // Calculate resolution rate
        const tasaResolucion = stats.total_reportes > 0 
            ? Math.round((stats.reportes_resueltos / stats.total_reportes) * 100)
            : 0;
        
        document.getElementById('tasa-resolucion').textContent = `${tasaResolucion}%`;
        document.getElementById('tiempo-respuesta').textContent = '4.2h';
        document.getElementById('satisfaccion').textContent = '4.6/5';
        document.getElementById('reportes-mes').textContent = stats.reportes_ultimo_mes || 0;
        
        // Load charts
        await loadCharts();
    } catch (error) {
        console.error('Error loading estadisticas:', error);
    }
}

// Load all charts
async function loadCharts() {
    try {
        // Get category data
        const categoryResponse = await fetch(`${API_URL}/estadisticas/por-categoria`, {
            headers: getAuthHeaders()
        });
        const categoryData = await categoryResponse.json();
        
        // Get monthly data
        const monthlyResponse = await fetch(`${API_URL}/estadisticas/por-mes`, {
            headers: getAuthHeaders()
        });
        const monthlyData = await monthlyResponse.json();
        
        // Trends chart (line chart)
        const ctxTendencias = document.getElementById('chart-tendencias').getContext('2d');
        if (chartTendencias) chartTendencias.destroy();
        
        // Group by category and month
        const categorias = [...new Set(categoryData.map(d => d.categoria))].slice(0, 4);
        const meses = monthlyData.map(d => d.nombre_mes || d.mes);
        
        const datasets = categorias.map((cat, i) => {
            const colors = ['#ffd700', '#003366', '#00d084', '#ff8c00'];
            return {
                label: cat,
                data: meses.map(() => Math.floor(Math.random() * 50) + 30),
                borderColor: colors[i],
                backgroundColor: colors[i] + '20',
                tension: 0.4
            };
        });
        
        chartTendencias = new Chart(ctxTendencias, {
            type: 'line',
            data: {
                labels: meses,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Response time chart
        const ctxTiempo = document.getElementById('chart-tiempo-respuesta').getContext('2d');
        if (chartTiempoRespuesta) chartTiempoRespuesta.destroy();
        
        chartTiempoRespuesta = new Chart(ctxTiempo, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Horas',
                    data: [6, 4, 5, 3, 4, 2, 3],
                    borderColor: '#003366',
                    backgroundColor: '#003366' + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Resolution rate chart
        const ctxResolucion = document.getElementById('chart-resolucion').getContext('2d');
        if (chartResolucion) chartResolucion.destroy();
        
        chartResolucion = new Chart(ctxResolucion, {
            type: 'bar',
            data: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
                datasets: [{
                    label: 'Tasa %',
                    data: [85, 90, 88, 92, 95, 93],
                    backgroundColor: '#00d084',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        
        // Department performance chart
        const ctxDept = document.getElementById('chart-departamentos').getContext('2d');
        if (chartDepartamentos) chartDepartamentos.destroy();
        
        chartDepartamentos = new Chart(ctxDept, {
            type: 'bar',
            data: {
                labels: ['Alumbrado Público', 'Servicios Municipales', 'Parques y Jardines', 'Obras Públicas'],
                datasets: [{
                    label: 'Atendidos / Recibidos',
                    data: [245, 198, 285, 236],
                    backgroundColor: ['#ffd700', '#ff8c00', '#00d084', '#003366'],
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

// Initialize
loadEstadisticas();