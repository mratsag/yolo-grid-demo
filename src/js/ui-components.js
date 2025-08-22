/**
 * UI Components - Kullanıcı Arayüzü Bileşenleri
 * 
 * Bu modül UI bileşenlerini yönetir:
 * - Tutorial sistemi
 * - Notification sistemi  
 * - Performance göstergeleri
 * - Interactive controls
 * - State management
 */

export class UIComponents {
    constructor(options = {}) {
        this.elements = options.elements || {};
        this.onStateChange = options.onStateChange || null;
        
        // UI state
        this.state = {
            tutorialStep: 0,
            notifications: [],
            isLoading: false,
            performanceVisible: false
        };
        
        // Tutorial data
        this.tutorialSteps = [];
        this.maxTutorialSteps = 5;
        
        // Notification queue
        this.notificationQueue = [];
        this.notificationTimeout = null;
        
        // Performance monitor
        this.performanceChart = null;
        this.performanceData = [];
        
        this.init();
    }
    
    /**
     * UI Components'i başlatır
     */
    init() {
        this.loadTutorialSteps();
        this.setupNotificationContainer();
        this.setupPerformanceMonitor();
        this.bindUIEvents();
        
        console.log('🎨 UI Components başlatıldı');
    }
    
    /**
     * Tutorial adımlarını yükler
     */
    loadTutorialSteps() {
        this.tutorialSteps = [
            {
                id: 0,
                title: "YOLO'ya Hoş Geldiniz! 👋",
                content: `
                    <div class="tutorial-step">
                        <h4>🎯 YOLO Nedir?</h4>
                        <p><strong>YOLO (You Only Look Once)</strong> görüntüyü sadece bir kez analiz ederek nesneleri tespit eden devrimci bir algoritmadır.</p>
                        
                        <div class="highlight-box">
                            <p>💡 <strong>Ana Fikir:</strong> Görüntüyı ızgaralara böl, her ızgara hücresi "benim alanımda nesne var mı?" sorusunu yanıtlasın.</p>
                        </div>
                        
                        <p>Bu demo ile YOLO'nun nasıl çalıştığını adım adım öğreneceksiniz!</p>
                    </div>
                `,
                action: () => this.highlightElement('.grid-preview'),
                cleanup: () => this.removeHighlight()
            },
            {
                id: 1,
                title: "Grid Sistemi 🔳",
                content: `
                    <div class="tutorial-step">
                        <h4>📐 Grid Mantığı</h4>
                        <p>YOLO görüntüyü <strong>eşit ızgaralara</strong> böler. Her ızgara hücresi kendi alanından sorumludur.</p>
                        
                        <div class="grid-example">
                            <div class="mini-grid">
                                <div class="mini-cell">1</div>
                                <div class="mini-cell">2</div>
                                <div class="mini-cell">3</div>
                                <div class="mini-cell">4</div>
                                <div class="mini-cell active">5</div>
                                <div class="mini-cell">6</div>
                                <div class="mini-cell">7</div>
                                <div class="mini-cell">8</div>
                                <div class="mini-cell">9</div>
                            </div>
                            <p class="caption">Örnek: 3x3 grid, 5. hücre bir nesne tespit ediyor</p>
                        </div>
                        
                        <ul>
                            <li>📏 <strong>7x7:</strong> Hızlı, basit analiz</li>
                            <li>📏 <strong>13x13:</strong> Orta detay seviyesi</li>
                            <li>📏 <strong>19x19:</strong> Yüksek detay, yavaş</li>
                        </ul>
                    </div>
                `,
                action: () => this.highlightElement('#gridSize'),
                cleanup: () => this.removeHighlight()
            },
            {
                id: 2,
                title: "Hücre Sorumluluğu 🎯", 
                content: `
                    <div class="tutorial-step">
                        <h4>🧠 Her Hücre Bir Dedektif!</h4>
                        <p>YOLO'da her grid hücresi kendi alanında şu soruları sorar:</p>
                        
                        <div class="question-box">
                            <div class="question">❓ <strong>Benim alanımda bir nesne var mı?</strong></div>
                            <div class="question">❓ <strong>Varsa ne kadar eminim? (Confidence)</strong></div>
                            <div class="question">❓ <strong>Bu nesne ne? (Sınıf)</strong></div>
                            <div class="question">❓ <strong>Nerede tam olarak? (Bounding Box)</strong></div>
                        </div>
                        
                        <div class="confidence-example">
                            <h5>Confidence Skorları:</h5>
                            <div class="confidence-bar">
                                <div class="conf-high">90%+ 🔥 Çok Emin</div>
                                <div class="conf-med">50-90% ⚡ Orta</div>
                                <div class="conf-low">30-50% 🤔 Düşük</div>
                            </div>
                        </div>
                    </div>
                `,
                action: () => this.animateGridCells(),
                cleanup: () => this.stopGridAnimation()
            },
            {
                id: 3,
                title: "Canlı Demo 📹",
                content: `
                    <div class="tutorial-step">
                        <h4>🚀 Şimdi Gerçek Zamanlı Test!</h4>
                        <p>Artık kameranızı açıp YOLO'yu canlı olarak test edebilirsiniz:</p>
                        
                        <div class="demo-checklist">
                            <div class="check-item">
                                <span class="check">✅</span>
                                <span>Kamerayı başlatın</span>
                            </div>
                            <div class="check-item">
                                <span class="check">✅</span>
                                <span>Farklı nesneler gösterin</span>
                            </div>
                            <div class="check-item">
                                <span class="check">✅</span>
                                <span>Grid hücrelerinin nasıl aktive olduğunu izleyin</span>
                            </div>
                            <div class="check-item">
                                <span class="check">✅</span>
                                <span>Confidence skorlarını gözlemleyin</span>
                            </div>
                        </div>
                        
                        <div class="tip-box">
                            💡 <strong>İpucu:</strong> Kitap, telefon, fincan gibi günlük nesneler deneyin!
                        </div>
                    </div>
                `,
                action: () => this.highlightElement('#startCamera'),
                cleanup: () => this.removeHighlight()
            },
            {
                id: 4,
                title: "Tebrikler! 🎉",
                content: `
                    <div class="tutorial-step">
                        <h4>🎯 YOLO Uzmanı Oldunuz!</h4>
                        <p>Bu demo ile YOLO'nun temel çalışma prensiplerini öğrendiniz:</p>
                        
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-icon">🔳</div>
                                <div class="summary-text">
                                    <strong>Grid Sistemi</strong><br>
                                    Görüntü ızgaralara bölünür
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">⚡</div>
                                <div class="summary-text">
                                    <strong>Tek Geçiş</strong><br>
                                    "You Only Look Once"
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">🎯</div>
                                <div class="summary-text">
                                    <strong>Confidence</strong><br>
                                    Tahmin güveni skorları
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">📊</div>
                                <div class="summary-text">
                                    <strong>Gerçek Zamanlı</strong><br>
                                    Hızlı nesne tespiti
                                </div>
                            </div>
                        </div>
                        
                        <div class="next-steps">
                            <h5>🚀 Sonraki Adımlar:</h5>
                            <ul>
                                <li>Farklı grid boyutlarını deneyin</li>
                                <li>Confidence threshold'u ayarlayın</li>
                                <li>Blog yazısını okuyun</li>
                                <li>GitHub'da projeyi inceleyin</li>
                            </ul>
                        </div>
                    </div>
                `
            }
        ];
    }
    
    /**
     * Belirli tutorial adımını yükler
     */
    loadTutorialStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.tutorialSteps.length) {
            console.warn('⚠️ Geçersiz tutorial adımı:', stepIndex);
            return;
        }
        
        const step = this.tutorialSteps[stepIndex];
        const stepContainer = this.elements.tutorialSteps;
        
        if (!stepContainer) return;
        
        // Önceki adımın cleanup'ını çalıştır
        if (this.state.tutorialStep < this.tutorialSteps.length) {
            const prevStep = this.tutorialSteps[this.state.tutorialStep];
            if (prevStep.cleanup) {
                prevStep.cleanup();
            }
        }
        
        // Yeni adımı yükle
        stepContainer.innerHTML = `
            <div class="tutorial-step-header">
                <h3>${step.title}</h3>
                <span class="step-badge">Adım ${stepIndex + 1}/${this.tutorialSteps.length}</span>
            </div>
            <div class="tutorial-step-content">
                ${step.content}
            </div>
        `;
        
        // Animasyon ekle
        stepContainer.classList.add('animate-step-reveal');
        
        // Action çalıştır
        if (step.action) {
            setTimeout(step.action, 500);
        }
        
        // State güncelle
        this.state.tutorialStep = stepIndex;
        this.updateTutorialControls();
        
        console.log(`📖 Tutorial adım ${stepIndex + 1} yüklendi`);
    }
    
    /**
     * Tutorial kontrollerini günceller
     */
    updateTutorialControls() {
        const { prevStep, nextStep, stepIndicator } = this.elements;
        
        if (prevStep) {
            prevStep.disabled = this.state.tutorialStep === 0;
        }
        
        if (nextStep) {
            nextStep.disabled = this.state.tutorialStep === this.tutorialSteps.length - 1;
        }
        
        if (stepIndicator) {
            stepIndicator.textContent = `${this.state.tutorialStep + 1} / ${this.tutorialSteps.length}`;
        }
    }
    
    /**
     * Notification sistemi setup
     */
    setupNotificationContainer() {
        // Notification container yoksa oluştur
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }
    
    /**
     * Notification gösterir
     */
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type} animate-slideInRight`;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Container'a ekle
        container.appendChild(notification);
        
        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }
        
        return notification;
    }
    
    /**
     * Notification'ı gizler
     */
    hideNotification(notification) {
        if (!notification || !notification.parentNode) return;
        
        notification.classList.add('animate-slideOutRight');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    /**
     * Notification icon döndürür
     */
    getNotificationIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'loading': '⏳'
        };
        
        return icons[type] || icons['info'];
    }
    
    /**
     * Performance monitor setup
     */
    setupPerformanceMonitor() {
        this.performanceData = {
            fps: [],
            inferenceTime: [],
            detectionCount: [],
            timestamps: []
        };
    }
    
    /**
     * Performance data günceller
     */
    updatePerformanceData(metrics) {
        const now = Date.now();
        const maxDataPoints = 50;
        
        // Data points ekle
        this.performanceData.fps.push(metrics.fps || 0);
        this.performanceData.inferenceTime.push(metrics.inferenceTime || 0);
        this.performanceData.detectionCount.push(metrics.detectionCount || 0);
        this.performanceData.timestamps.push(now);
        
        // Eski data points'i sil
        Object.keys(this.performanceData).forEach(key => {
            if (this.performanceData[key].length > maxDataPoints) {
                this.performanceData[key].shift();
            }
        });
        
        // Chart güncelle
        this.updatePerformanceChart();
    }
    
    /**
     * Performance chart günceller
     */
    updatePerformanceChart() {
        if (!this.state.performanceVisible) return;
        
        const chartContainer = document.getElementById('performanceChart');
        if (!chartContainer) return;
        
        // Simple text-based chart (canvas chart yerine)
        const avgFPS = this.performanceData.fps.length > 0 
            ? this.performanceData.fps.reduce((a, b) => a + b, 0) / this.performanceData.fps.length 
            : 0;
            
        const avgInferenceTime = this.performanceData.inferenceTime.length > 0
            ? this.performanceData.inferenceTime.reduce((a, b) => a + b, 0) / this.performanceData.inferenceTime.length
            : 0;
        
        chartContainer.innerHTML = `
            <div class="performance-metrics">
                <div class="metric">
                    <span class="metric-label">Ortalama FPS:</span>
                    <span class="metric-value">${avgFPS.toFixed(1)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">İnferans Süresi:</span>
                    <span class="metric-value">${avgInferenceTime.toFixed(1)}ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Son Tespit:</span>
                    <span class="metric-value">${this.performanceData.detectionCount.slice(-1)[0] || 0}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Loading state gösterir
     */
    showLoading(message = 'Yükleniyor...') {
        this.state.isLoading = true;
        
        // Loading overlay oluştur
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        overlay.style.display = 'flex';
        overlay.classList.add('animate-fadeIn');
    }
    
    /**
     * Loading state'i gizler
     */
    hideLoading() {
        this.state.isLoading = false;
        
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('animate-fadeOut');
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.classList.remove('animate-fadeOut');
            }, 300);
        }
    }
    
    /**
     * Element'i highlight eder
     */
    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        // Highlight class ekle
        element.classList.add('tutorial-highlight');
        
        // Spotlight effect
        const spotlight = document.createElement('div');
        spotlight.className = 'tutorial-spotlight';
        document.body.appendChild(spotlight);
        
        // Element pozisyonunu al
        const rect = element.getBoundingClientRect();
        spotlight.style.top = `${rect.top - 10}px`;
        spotlight.style.left = `${rect.left - 10}px`;
        spotlight.style.width = `${rect.width + 20}px`;
        spotlight.style.height = `${rect.height + 20}px`;
        
        // Smooth scroll to element
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    /**
     * Highlight'ı kaldırır
     */
    removeHighlight() {
        // Highlight class'ları kaldır
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        // Spotlight'ı kaldır
        document.querySelectorAll('.tutorial-spotlight').forEach(el => {
            el.remove();
        });
    }
    
    /**
     * Grid hücrelerini animate eder
     */
    animateGridCells() {
        const gridPreview = this.elements.gridPreview;
        if (!gridPreview) return;
        
        const cells = gridPreview.querySelectorAll('.grid-preview-cell');
        
        // Random cells'leri animate et
        this.gridAnimationInterval = setInterval(() => {
            // Önceki animasyonları temizle
            cells.forEach(cell => {
                cell.classList.remove('grid-preview-cell--highlight');
            });
            
            // Random cells'leri highlight et
            const randomCells = Array.from(cells)
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 3) + 1);
                
            randomCells.forEach((cell, index) => {
                setTimeout(() => {
                    cell.classList.add('grid-preview-cell--highlight');
                }, index * 200);
            });
            
        }, 2000);
    }
    
    /**
     * Grid animasyonunu durdurur
     */
    stopGridAnimation() {
        if (this.gridAnimationInterval) {
            clearInterval(this.gridAnimationInterval);
            this.gridAnimationInterval = null;
        }
        
        // Tüm highlight'ları kaldır
        const cells = document.querySelectorAll('.grid-preview-cell--highlight');
        cells.forEach(cell => {
            cell.classList.remove('grid-preview-cell--highlight');
        });
    }
    
    /**
     * UI event'leri bağlar
     */
    bindUIEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Window events
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        
        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }
    
    /**
     * Keyboard shortcuts işler
     */
    handleKeyboardShortcuts(event) {
        // Tutorial navigation
        if (this.state.tutorialStep !== null) {
            switch (event.key) {
                case 'ArrowLeft':
                    if (this.state.tutorialStep > 0) {
                        event.preventDefault();
                        this.loadTutorialStep(this.state.tutorialStep - 1);
                    }
                    break;
                    
                case 'ArrowRight':
                    if (this.state.tutorialStep < this.tutorialSteps.length - 1) {
                        event.preventDefault();
                        this.loadTutorialStep(this.state.tutorialStep + 1);
                    }
                    break;
                    
                case 'Escape':
                    event.preventDefault();
                    this.closeTutorial();
                    break;
            }
        }
        
        // Other shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'h':
                    event.preventDefault();
                    this.showHelp();
                    break;
                    
                case 'p':
                    event.preventDefault();
                    this.togglePerformanceMonitor();
                    break;
            }
        }
    }
    
    /**
     * Tutorial'ı kapatır
     */
    closeTutorial() {
        const tutorialSection = this.elements.tutorialSection;
        if (tutorialSection) {
            tutorialSection.style.display = 'none';
        }
        
        this.removeHighlight();
        this.stopGridAnimation();
        this.state.tutorialStep = null;
        
        console.log('📚 Tutorial kapatıldı');
    }
    
    /**
     * Help modalını gösterir
     */
    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h3>🛠️ Klavye Kısayolları</h3>
                <div class="shortcuts">
                    <div class="shortcut">
                        <kbd>Ctrl + Space</kbd>
                        <span>Kamerayı başlat/durdur</span>
                    </div>
                    <div class="shortcut">
                        <kbd>Ctrl + T</kbd>
                        <span>Tutorial modu</span>
                    </div>
                    <div class="shortcut">
                        <kbd>Ctrl + P</kbd>
                        <span>Performance monitor</span>
                    </div>
                    <div class="shortcut">
                        <kbd>Ctrl + 1/2/3</kbd>
                        <span>Grid boyutu değiştir</span>
                    </div>
                    <div class="shortcut">
                        <kbd>←/→</kbd>
                        <span>Tutorial navigation</span>
                    </div>
                    <div class="shortcut">
                        <kbd>Esc</kbd>
                        <span>Tutorial'ı kapat</span>
                    </div>
                </div>
                
                <h3>🎯 İpuçları</h3>
                <ul class="tips">
                    <li>En iyi performans için iyi aydınlatma kullanın</li>
                    <li>Kameraya yakın nesneler daha iyi tespit edilir</li>
                    <li>Grid boyutunu nesne boyutuna göre ayarlayın</li>
                    <li>Confidence threshold'u çevreye göre optimize edin</li>
                </ul>
            </div>
        `;
        
        this.showModal('Yardım', helpContent);
    }
    
    /**
     * Modal gösterir
     */
    showModal(title, content) {
        // Modal oluştur
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal animate-scaleIn">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Close events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modal);
            }
        });
        
        document.body.appendChild(modal);
        return modal;
    }
    
    /**
     * Modal'ı gizler
     */
    hideModal(modal) {
        modal.classList.add('animate-fadeOut');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    /**
     * Performance monitor'u toggle eder
     */
    togglePerformanceMonitor() {
        this.state.performanceVisible = !this.state.performanceVisible;
        
        let perfContainer = document.getElementById('performanceMonitor');
        
        if (this.state.performanceVisible) {
            if (!perfContainer) {
                perfContainer = document.createElement('div');
                perfContainer.id = 'performanceMonitor';
                perfContainer.className = 'performance-monitor';
                perfContainer.innerHTML = `
                    <div class="performance-header">
                        <h4>📊 Performance</h4>
                        <button class="performance-close">&times;</button>
                    </div>
                    <div id="performanceChart" class="performance-chart"></div>
                `;
                
                perfContainer.querySelector('.performance-close').addEventListener('click', () => {
                    this.togglePerformanceMonitor();
                });
                
                document.body.appendChild(perfContainer);
            }
            
            perfContainer.classList.add('animate-slideInRight');
            this.updatePerformanceChart();
            
        } else if (perfContainer) {
            perfContainer.classList.add('animate-slideOutRight');
            setTimeout(() => {
                if (perfContainer.parentNode) {
                    perfContainer.parentNode.removeChild(perfContainer);
                }
            }, 300);
        }
    }
    
    /**
     * Intersection Observer setup (scroll animations)
     */
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeIn');
                }
            });
        }, observerOptions);
        
        // Observe elements
        document.querySelectorAll('.step, .detection-item, .stat').forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }
    
    /**
     * Window resize işler
     */
    handleWindowResize() {
        // Tutorial spotlight pozisyonunu güncelle
        const spotlight = document.querySelector('.tutorial-spotlight');
        const highlightedElement = document.querySelector('.tutorial-highlight');
        
        if (spotlight && highlightedElement) {
            const rect = highlightedElement.getBoundingClientRect();
            spotlight.style.top = `${rect.top - 10}px`;
            spotlight.style.left = `${rect.left - 10}px`;
            spotlight.style.width = `${rect.width + 20}px`;
            spotlight.style.height = `${rect.height + 20}px`;
        }
    }
    
    /**
     * Toast notification (kısa mesaj)
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type} animate-slideInRight`;
        toast.textContent = message;
        
        // Toast container yoksa oluştur
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('animate-slideOutRight');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Progress bar gösterir
     */
    showProgress(progress, message = '') {
        let progressBar = document.getElementById('progressBar');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'progressBar';
            progressBar.className = 'progress-bar-container';
            progressBar.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-message"></div>
            `;
            document.body.appendChild(progressBar);
        }
        
        const fill = progressBar.querySelector('.progress-fill');
        const messageEl = progressBar.querySelector('.progress-message');
        
        fill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        messageEl.textContent = message;
        
        progressBar.style.display = 'block';
        
        if (progress >= 100) {
            setTimeout(() => {
                progressBar.style.display = 'none';
            }, 1000);
        }
    }
    
    /**
     * Confetti animasyonu
     */
    showConfetti() {
        // Simple confetti effect
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            
            document.body.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }
    }
    
    /**
     * State değişikliklerini bildirir
     */
    notifyStateChange(changes) {
        if (this.onStateChange) {
            this.onStateChange(changes);
        }
    }
    
    /**
     * UI durumunu döndürür
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * UI state'ini günceller
     */
    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // State değişikliklerini bildir
        this.notifyStateChange({
            old: oldState,
            new: this.state,
            changes: newState
        });
    }
    
    /**
     * Cleanup - kaynakları temizle
     */
    cleanup() {
        // Intervals temizle
        if (this.gridAnimationInterval) {
            clearInterval(this.gridAnimationInterval);
        }
        
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
        // Observers temizle
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Event listeners temizle
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
        window.removeEventListener('resize', this.handleWindowResize);
        
        // DOM elements temizle
        const elementsToRemove = [
            'loadingOverlay',
            'notificationContainer',
            'performanceMonitor',
            'toastContainer',
            'progressBar'
        ];
        
        elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // Highlights temizle
        this.removeHighlight();
        
        console.log('🧹 UI Components temizlendi');
    }
}