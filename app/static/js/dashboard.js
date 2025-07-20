// Dashboard JavaScript - Glassmorphic Data Science Dashboard
class Dashboard {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.isInitialized = false;

        // Chart configurations
        this.chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        }
                    }
                }
            }
        };
    }

    // Initialize dashboard
    async init() {
        if (this.isInitialized) return;

        try {
            this.showLoading();

            // Initialize all charts
            await this.initializeCharts();

            // Start real-time updates
            this.startRealTimeUpdates();

            // Set up event listeners
            this.setupEventListeners();

            this.isInitialized = true;
            this.hideLoading();
            this.showNotification('Dashboard initialized successfully!', 'success');

        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.hideLoading();
            this.showNotification('Failed to initialize dashboard', 'error');
        }
    }

    // Initialize all charts
    async initializeCharts() {
        const chartPromises = [
            this.initSalesChart(),
            this.initUserGrowthChart(),
            this.initRevenueChart(),
            this.initPerformanceChart()
        ];

        await Promise.all(chartPromises);
    }

    // Sales Chart (Line Chart)
    async initSalesChart() {
        try {
            const response = await fetch('/api/chart-data/sales');
            const data = await response.json();

            const ctx = document.getElementById('salesChart').getContext('2d');

            this.charts.sales = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    ...this.chartDefaults,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        ...this.chartDefaults.plugins,
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(8px)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        ...this.chartDefaults.scales,
                        y: {
                            ...this.chartDefaults.scales.y,
                            beginAtZero: true,
                            ticks: {
                                ...this.chartDefaults.scales.y.ticks,
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to initialize sales chart:', error);
        }
    }

    // User Growth Chart (Area Chart)
    async initUserGrowthChart() {
        try {
            const response = await fetch('/api/chart-data/users');
            const data = await response.json();

            const ctx = document.getElementById('userGrowthChart').getContext('2d');

            this.charts.userGrowth = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    ...this.chartDefaults,
                    plugins: {
                        ...this.chartDefaults.plugins,
                        filler: {
                            propagate: false
                        }
                    },
                    scales: {
                        ...this.chartDefaults.scales,
                        y: {
                            ...this.chartDefaults.scales.y,
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to initialize user growth chart:', error);
        }
    }

    // Revenue Chart (Doughnut Chart)
    async initRevenueChart() {
        try {
            const response = await fetch('/api/chart-data/revenue');
            const data = await response.json();

            const ctx = document.getElementById('revenueChart').getContext('2d');

            this.charts.revenue = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                font: {
                                    family: 'Inter, sans-serif',
                                    size: 11
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed * 100) / total).toFixed(1);
                                    return context.label + ': ' + percentage + '%';
                                }
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        } catch (error) {
            console.error('Failed to initialize revenue chart:', error);
        }
    }

    // Performance Chart (Radar Chart)
    async initPerformanceChart() {
        try {
            const response = await fetch('/api/chart-data/performance');
            const data = await response.json();

            const ctx = document.getElementById('performanceChart').getContext('2d');

            this.charts.performance = new Chart(ctx, {
                type: 'radar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                font: {
                                    family: 'Inter, sans-serif',
                                    size: 11
                                }
                            }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            pointLabels: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                font: {
                                    family: 'Inter, sans-serif',
                                    size: 11
                                }
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.5)',
                                backdropColor: 'transparent'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to initialize performance chart:', error);
        }
    }

    // Real-time system metrics updates
    startRealTimeUpdates() {
        this.updateRealTimeMetrics();

        this.refreshInterval = setInterval(() => {
            this.updateRealTimeMetrics();
        }, 5000); // Update every 5 seconds
    }

    async updateRealTimeMetrics() {
        try {
            const response = await fetch('/api/realtime-metrics');
            const metrics = await response.json();

            // Update CPU usage
            const cpuProgress = document.getElementById('cpu-progress');
            const cpuValue = document.getElementById('cpu-value');
            if (cpuProgress && cpuValue) {
                cpuProgress.style.width = metrics.cpu_usage + '%';
                cpuValue.textContent = metrics.cpu_usage + '%';

                // Change color based on usage
                if (metrics.cpu_usage > 80) {
                    cpuProgress.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                } else if (metrics.cpu_usage > 60) {
                    cpuProgress.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                } else {
                    cpuProgress.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                }
            }

            // Update Memory usage
            const memoryProgress = document.getElementById('memory-progress');
            const memoryValue = document.getElementById('memory-value');
            if (memoryProgress && memoryValue) {
                memoryProgress.style.width = metrics.memory_usage + '%';
                memoryValue.textContent = metrics.memory_usage + '%';
            }

            // Update Disk usage
            const diskProgress = document.getElementById('disk-progress');
            const diskValue = document.getElementById('disk-value');
            if (diskProgress && diskValue) {
                diskProgress.style.width = metrics.disk_usage + '%';
                diskValue.textContent = metrics.disk_usage + '%';
            }

            // Update Network I/O
            const networkValue = document.getElementById('network-value');
            if (networkValue) {
                const networkKB = (metrics.network_io / 1024).toFixed(1);
                networkValue.textContent = networkKB + ' KB/s';
            }

        } catch (error) {
            console.error('Failed to update real-time metrics:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Chart refresh functionality
        window.refreshAllCharts = () => this.refreshAllCharts();
        window.updateSalesChart = (period) => this.updateSalesChart(period);
        window.exportDashboard = () => this.exportDashboard();
        window.runPrediction = () => this.runMLPrediction();
        window.togglePredictionPanel = () => this.togglePredictionPanel();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshAllCharts();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportDashboard();
                        break;
                }
            }
        });
    }

    // Refresh all charts
    async refreshAllCharts() {
        this.showNotification('Refreshing charts...', 'info');

        try {
            const refreshPromises = Object.keys(this.charts).map(chartName => {
                return this.refreshChart(chartName);
            });

            await Promise.all(refreshPromises);
            this.showNotification('Charts refreshed successfully!', 'success');

        } catch (error) {
            console.error('Failed to refresh charts:', error);
            this.showNotification('Failed to refresh charts', 'error');
        }
    }

    // Refresh individual chart
    async refreshChart(chartName) {
        try {
            const endpoint = {
                'sales': 'sales',
                'userGrowth': 'users',
                'revenue': 'revenue',
                'performance': 'performance'
            }[chartName];

            if (!endpoint || !this.charts[chartName]) return;

            const response = await fetch(`/api/chart-data/${endpoint}`);
            const data = await response.json();

            this.charts[chartName].data = data;
            this.charts[chartName].update('active');

        } catch (error) {
            console.error(`Failed to refresh ${chartName} chart:`, error);
        }
    }

    // Update sales chart with different period
    async updateSalesChart(period) {
        // In a real application, you would pass the period parameter to the API
        await this.refreshChart('sales');
        this.showNotification(`Sales chart updated to ${period} view`, 'info');
    }

    // Run ML Prediction
    async runMLPrediction() {
        const feature1 = document.getElementById('feature1').value;
        const feature2 = document.getElementById('feature2').value;
        const modelType = document.getElementById('model-type').value;

        if (!feature1 || !feature2) {
            this.showNotification('Please fill in all feature values', 'warning');
            return;
        }

        try {
            this.showLoading();

            const response = await fetch('/api/ml-prediction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model_type: modelType,
                    features: {
                        feature1: parseFloat(feature1),
                        feature2: parseFloat(feature2)
                    }
                })
            });

            const result = await response.json();
            this.displayPredictionResult(result);

            this.hideLoading();
            this.showNotification('Prediction completed successfully!', 'success');

        } catch (error) {
            console.error('Prediction failed:', error);
            this.hideLoading();
            this.showNotification('Prediction failed', 'error');
        }
    }

    // Display prediction result
    displayPredictionResult(result) {
        const resultsContainer = document.getElementById('prediction-results');

        let resultHTML = '';

        if (typeof result.prediction === 'object') {
            // Classification or clustering result
            resultHTML = `
                <div class="prediction-result">
                    <div class="result-value">${result.prediction.predicted_class || 'Cluster ' + result.prediction.cluster_id}</div>
                    <div class="result-confidence">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
                    <div class="result-details">
                        <p><strong>Model:</strong> ${result.model_type}</p>
                        <p><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                    ${this.renderFeatureImportance(result.feature_importance)}
                </div>
            `;
        } else {
            // Regression result
            resultHTML = `
                <div class="prediction-result">
                    <div class="result-value">${result.prediction.toFixed(2)}</div>
                    <div class="result-confidence">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
                    <div class="result-details">
                        <p><strong>Model:</strong> ${result.model_type}</p>
                        <p><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                    ${this.renderFeatureImportance(result.feature_importance)}
                </div>
            `;
        }

        resultsContainer.innerHTML = resultHTML;
    }

    // Render feature importance
    renderFeatureImportance(importance) {
        if (!importance || Object.keys(importance).length === 0) {
            return '';
        }

        const sortedFeatures = Object.entries(importance)
            .sort(([,a], [,b]) => b - a);

        const importanceHTML = sortedFeatures.map(([feature, value]) => `
            <div class="importance-item">
                <span>${feature}</span>
                <span>${(value * 100).toFixed(1)}%</span>
            </div>
        `).join('');

        return `
            <div class="feature-importance">
                <h4>Feature Importance</h4>
                ${importanceHTML}
            </div>
        `;
    }

    // Toggle prediction panel
    togglePredictionPanel() {
        const inputs = document.getElementById('prediction-inputs');
        const results = document.getElementById('prediction-results');

        if (inputs.style.display === 'none') {
            inputs.style.display = 'flex';
            results.style.display = 'flex';
        } else {
            inputs.style.display = 'none';
            results.style.display = 'none';
        }
    }

    // Export dashboard
    exportDashboard() {
        // In a real application, this would generate a PDF or image export
        this.showNotification('Export functionality coming soon!', 'info');
    }

    // Utility functions
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Cleanup
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        this.charts = {};
        this.isInitialized = false;
    }
}

// Create global dashboard instance
const dashboard = new Dashboard();

// Initialize dashboard when DOM is loaded
function initializeDashboard() {
    dashboard.init();
}

// Handle page visibility changes to optimize performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause updates when page is hidden
        if (dashboard.refreshInterval) {
            clearInterval(dashboard.refreshInterval);
        }
    } else {
        // Resume updates when page becomes visible
        dashboard.startRealTimeUpdates();
    }
});

// Handle window resize for responsive charts
window.addEventListener('resize', function() {
    Object.values(dashboard.charts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
});

// Add CSS animation keyframes for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
