/**
 * YOLO Grid Demo - Ana Uygulama Kontrolcüsü
 * 
 * Bu modül tüm uygulamanın ana kontrollerini yönetir:
 * - Uygulama başlatma
 * - Modüller arası koordinasyon
 * - Event handling
 * - State management
 */

// Import modülleri - Railway path fix
import { GridManager } from './grid-manager.js';
import { CameraHandler } from './camera-handler.js';
import { YOLOSimulation } from './yolo-simulation.js';
import { UIComponents } from './ui-components.js';

class YOLOGridApp {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        
        // Ana modüller
        this.gridManager = null;
        this.cameraHandler = null;
        this.yoloSimulation = null;
        this.uiComponents = null;
        
        // Uygulama state
        this.state = {
            gridSize: 13,
            showConfidence: true,
            tutorialMode: false,
            currentStep: 0,
            detections: [],
            performance: {
                fps: 0,
                processTime: 0,
                lastUpdate: Date.now()
            }
        };
        
        // DOM elementleri
        this.elements = {};
        
        // Event listeners
        this.eventListeners = new Map();
        
        console.log('🎯 YOLO Grid Demo - Uygulama Başlatılıyor...');
    }
    
    /**
     * Uygulamayı başlatır
     */
    async init() {
        try {
            console.log('📦 Modüller yükleniyor...');
            
            // DOM elementlerini yakala
            this.cacheDOMElements();
            
            // Modülleri initialize et
            await this.initializeModules();
            
            // Event listener'ları bağla
            this.bindEventListeners();
            
            // UI'ı güncelle
            this.updateUI();
            
            // Grid preview'ını başlat
            this.startGridPreview();
            
            this.isInitialized = true;
            console.log('✅ Uygulama başarıyla başlatıldı!');
            
            // Welcome animasyonu
            this.showWelcomeAnimation();
            
        } catch (error) {
            console.error('❌ Uygulama başlatılırken hata:', error);
            this.showError('Uygulama başlatılırken bir hata oluştu.');
        }
    }
    
    /**
     * DOM elementlerini cache'ler
     */
    cacheDOMElements() {
        this.elements = {
            // Buttons
            startCamera: document.getElementById('startCamera'),
            stopCamera: document.getElementById('stopCamera'),
            tutorialMode: document.getElementById('tutorialMode'),
            
            // Controls
            gridSize: document.getElementById('gridSize'),
            showConfidence: document.getElementById('showConfidence'),
            
            // Video section
            webcam: document.getElementById('webcam'),
            gridOverlay: document.getElementById('gridOverlay'),
            detectionOverlay: document.getElementById('detectionOverlay'),
            cameraStatus: document.getElementById('cameraStatus'),
            
            // Info panel
            stepContainer: document.getElementById('stepContainer'),
            detectionResults: document.getElementById('detectionResults'),
            resultsList: document.getElementById('resultsList'),
            gridStats: document.getElementById('gridStats'),
            currentGridSize: document.getElementById('currentGridSize'),
            
            // Statistics
            activeCells: document.getElementById('activeCells'),
            totalCells: document.getElementById('totalCells'),
            detectionCount: document.getElementById('detectionCount'),
            
            // Tutorial
            tutorialSection: document.getElementById('tutorialSection'),
            tutorialSteps: document.getElementById('tutorialSteps'),
            prevStep: document.getElementById('prevStep'),
            nextStep: document.getElementById('nextStep'),
            stepIndicator: document.getElementById('stepIndicator'),
            
            // Grid preview
            gridPreview: document.getElementById('gridPreview')
        };
        
        // Eksik elementleri kontrol et
        const missingElements = Object.entries(this.elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);
            
        if (missingElements.length > 0) {
            console.warn('⚠️ Eksik DOM elementleri:', missingElements);
        }
    }
    
    /**
     * Modülleri initialize eder
     */
    async initializeModules() {
        // Grid Manager
        this.gridManager = new GridManager({
            gridSize: this.state.gridSize,
            overlayCanvas: this.elements.gridOverlay,
            showConfidence: this.state.showConfidence
        });
        
        // Camera Handler  
        this.cameraHandler = new CameraHandler({
            videoElement: this.elements.webcam,
            onFrame: this.handleVideoFrame.bind(this),
            onStatusChange: this.handleCameraStatusChange.bind(this)
        });
        
        // YOLO Simulation
        this.yoloSimulation = new YOLOSimulation({
            onDetection: this.handleDetection.bind(this),
            onProcessingUpdate: this.handleProcessingUpdate.bind(this)
        });
        
        // UI Components
        this.uiComponents = new UIComponents({
            elements: this.elements,
            onStateChange: this.handleUIStateChange.bind(this)
        });
        
        console.log('✅ Tüm modüller yüklendi');
    }
    
    /**
     * Event listener'ları bağlar
     */
    bindEventListeners() {
        // Camera controls
        this.addEventListeners([
            [this.elements.startCamera, 'click', this.startCamera.bind(this)],
            [this.elements.stopCamera, 'click', this.stopCamera.bind(this)],
            
            // Grid controls
            [this.elements.gridSize, 'change', this.handleGridSizeChange.bind(this)],
            [this.elements.showConfidence, 'change', this.handleConfidenceToggle.bind(this)],
            
            // Tutorial controls
            [this.elements.tutorialMode, 'click', this.toggleTutorialMode.bind(this)],
            [this.elements.prevStep, 'click', this.previousTutorialStep.bind(this)],
            [this.elements.nextStep, 'click', this.nextTutorialStep.bind(this)],
            
            // Window events
            [window, 'resize', this.handleWindowResize.bind(this)],
            [window, 'beforeunload', this.cleanup.bind(this)]
        ]);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        console.log('🔗 Event listener\'lar bağlandı');
    }
    
    /**
     * Event listener helper
     */
    addEventListeners(listeners) {
        listeners.forEach(([element, event, handler]) => {
            if (element) {
                element.addEventListener(event, handler);
                this.eventListeners.set(`${element.id || 'window'}-${event}`, {
                    element, event, handler
                });
            }
        });
    }
    
    /**
     * Grid preview animasyonunu başlatır
     */
    startGridPreview() {
        if (!this.elements.gridPreview) return;
        
        // 5x5 grid oluştur
        const gridSize = 5;
        this.elements.gridPreview.innerHTML = '';
        
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-preview-cell';
            cell.textContent = i + 1;
            
            // Random highlight animasyonu
            setTimeout(() => {
                if (Math.random() < 0.3) {
                    cell.classList.add('grid-preview-cell--highlight');
                }
            }, i * 100);
            
            this.elements.gridPreview.appendChild(cell);
        }
    }
    
    /**
     * Kamerayı başlatır
     */
    async startCamera() {
        try {
            this.showLoading('Kamera başlatılıyor...');
            
            await this.cameraHandler.start();
            this.isRunning = true;
            
            // Grid'i başlat
            this.gridManager.start();
            
            // YOLO simülasyonunu başlat
            this.yoloSimulation.start();
            
            this.updateCameraControls(true);
            this.hideLoading();
            
            console.log('📹 Kamera başlatıldı');
            
        } catch (error) {
            console.error('❌ Kamera başlatılırken hata:', error);
            this.showError('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
            this.hideLoading();
        }
    }
    
    /**
     * Kamerayı durdurur
     */
    async stopCamera() {
        try {
            this.cameraHandler.stop();
            this.gridManager.stop();
            this.yoloSimulation.stop();
            
            this.isRunning = false;
            this.updateCameraControls(false);
            
            // Sonuçları temizle
            this.clearDetections();
            
            console.log('⏹️ Kamera durduruldu');
            
        } catch (error) {
            console.error('❌ Kamera durdurulurken hata:', error);
        }
    }
    
    /**
     * Video frame'i işler
     */
    handleVideoFrame(frameData) {
        if (!this.isRunning) return;
        
        // Performance tracking
        const startTime = performance.now();
        
        // Grid'i güncelle
        this.gridManager.updateFrame(frameData);
        
        // YOLO simülasyonu çalıştır
        this.yoloSimulation.processFrame(frameData);
        
        // Performance metrics güncelle
        const processTime = performance.now() - startTime;
        this.updatePerformanceMetrics(processTime);
    }
    
    /**
     * Kamera durumu değişikliğini işler
     */
    handleCameraStatusChange(status) {
        const statusElement = this.elements.cameraStatus;
        if (!statusElement) return;
        
        const statusDot = statusElement.querySelector('.status-dot');
        
        switch (status) {
            case 'connecting':
                statusElement.textContent = 'Kamera Bağlanıyor...';
                statusElement.className = 'status connecting';
                break;
                
            case 'active':
                statusElement.innerHTML = '<span class="status-dot"></span>Kamera Aktif';
                statusElement.className = 'status active';
                break;
                
            case 'error':
                statusElement.innerHTML = '<span class="status-dot"></span>Kamera Hatası';
                statusElement.className = 'status error';
                break;
                
            case 'stopped':
                statusElement.innerHTML = '<span class="status-dot"></span>Kamera Durduruldu';
                statusElement.className = 'status';
                break;
        }
    }
    
    /**
     * Nesne tespitini işler
     */
    handleDetection(detections) {
        this.state.detections = detections;
        
        // Grid'e detection'ları gönder
        this.gridManager.updateDetections(detections);
        
        // UI'ı güncelle
        this.updateDetectionResults(detections);
        this.updateGridStatistics();
    }
    
    /**
     * İşlem güncellemesini işler
     */
    handleProcessingUpdate(processingData) {
        // Grid processing indicator'ı güncelle
        this.gridManager.updateProcessingIndicator(processingData.isProcessing);
        
        // Performance metrics güncelle
        if (processingData.metrics) {
            this.updatePerformanceMetrics(processingData.metrics.processTime);
        }
    }
    
    /**
     * Grid boyutu değişikliğini işler
     */
    handleGridSizeChange(event) {
        const newSize = parseInt(event.target.value);
        this.state.gridSize = newSize;
        
        // Grid'i güncelle
        this.gridManager.setGridSize(newSize);
        
        // UI'ı güncelle
        this.updateGridInfo();
        
        console.log(`📏 Grid boyutu değiştirildi: ${newSize}x${newSize}`);
    }
    
    /**
     * Confidence gösterim toggle'ını işler
     */
    handleConfidenceToggle(event) {
        this.state.showConfidence = event.target.checked;
        this.gridManager.setShowConfidence(this.state.showConfidence);
        
        console.log(`📊 Confidence skorları: ${this.state.showConfidence ? 'açık' : 'kapalı'}`);
    }
    
    /**
     * UI state değişikliğini işler
     */
    handleUIStateChange(stateChange) {
        Object.assign(this.state, stateChange);
        this.updateUI();
    }
    
    /**
     * Keyboard shortcut'ları işler
     */
    handleKeyboard(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case ' ':
                    event.preventDefault();
                    if (this.isRunning) {
                        this.stopCamera();
                    } else {
                        this.startCamera();
                    }
                    break;
                    
                case 't':
                    event.preventDefault();
                    this.toggleTutorialMode();
                    break;
                    
                case '1':
                case '2':
                case '3':
                    event.preventDefault();
                    const gridSizes = [7, 13, 19];
                    const index = parseInt(event.key) - 1;
                    if (gridSizes[index]) {
                        this.elements.gridSize.value = gridSizes[index];
                        this.handleGridSizeChange({target: {value: gridSizes[index]}});
                    }
                    break;
            }
        }
    }
    
    /**
     * Window resize'ı işler
     */
    handleWindowResize() {
        // Grid'i yeniden boyutlandır
        if (this.gridManager) {
            this.gridManager.resize();
        }
        
        // Camera'yı yeniden ayarla
        if (this.cameraHandler && this.isRunning) {
            this.cameraHandler.resize();
        }
    }
    
    /**
     * Tutorial modunu toggle eder
     */
    toggleTutorialMode() {
        this.state.tutorialMode = !this.state.tutorialMode;
        
        const tutorialSection = this.elements.tutorialSection;
        if (tutorialSection) {
            if (this.state.tutorialMode) {
                tutorialSection.style.display = 'block';
                tutorialSection.classList.add('animate-fadeIn');
                this.loadTutorialStep(0);
            } else {
                tutorialSection.classList.add('animate-fadeOut');
                setTimeout(() => {
                    tutorialSection.style.display = 'none';
                    tutorialSection.classList.remove('animate-fadeOut');
                }, 400);
            }
        }
        
        console.log(`🎓 Tutorial modu: ${this.state.tutorialMode ? 'açık' : 'kapalı'}`);
    }
    
    /**
     * Tutorial adımlarını yönetir
     */
    loadTutorialStep(stepIndex) {
        // Tutorial steps component'e yönlendir
        if (this.uiComponents) {
            this.uiComponents.loadTutorialStep(stepIndex);
        }
    }
    
    nextTutorialStep() {
        if (this.state.currentStep < 4) {
            this.state.currentStep++;
            this.loadTutorialStep(this.state.currentStep);
        }
    }
    
    previousTutorialStep() {
        if (this.state.currentStep > 0) {
            this.state.currentStep--;
            this.loadTutorialStep(this.state.currentStep);
        }
    }
    
    /**
     * UI güncellemeleri
     */
    updateUI() {
        this.updateGridInfo();
        this.updateCameraControls(this.isRunning);
        this.updateGridStatistics();
    }
    
    updateGridInfo() {
        if (this.elements.currentGridSize) {
            this.elements.currentGridSize.textContent = `${this.state.gridSize}x${this.state.gridSize}`;
        }
        
        if (this.elements.totalCells) {
            this.elements.totalCells.textContent = this.state.gridSize * this.state.gridSize;
        }
    }
    
    updateCameraControls(isRunning) {
        if (this.elements.startCamera) {
            this.elements.startCamera.disabled = isRunning;
        }
        
        if (this.elements.stopCamera) {
            this.elements.stopCamera.disabled = !isRunning;
        }
    }
    
    updateDetectionResults(detections) {
        const resultsList = this.elements.resultsList;
        if (!resultsList) return;
        
        if (detections.length === 0) {
            resultsList.innerHTML = '<div class="no-detections">Henüz nesne tespit edilmedi</div>';
            return;
        }
        
        const resultsHTML = detections.map(detection => `
            <div class="detection-item">
                <span class="detection-name">${detection.class}</span>
                <span class="detection-confidence">${Math.round(detection.score * 100)}%</span>
            </div>
        `).join('');
        
        resultsList.innerHTML = resultsHTML;
    }
    
    updateGridStatistics() {
        const activeCells = this.gridManager ? this.gridManager.getActiveCellCount() : 0;
        
        if (this.elements.activeCells) {
            this.elements.activeCells.textContent = activeCells;
        }
        
        if (this.elements.detectionCount) {
            this.elements.detectionCount.textContent = this.state.detections.length;
        }
    }
    
    updatePerformanceMetrics(processTime) {
        const now = Date.now();
        const deltaTime = now - this.state.performance.lastUpdate;
        
        if (deltaTime > 0) {
            this.state.performance.fps = Math.round(1000 / deltaTime);
            this.state.performance.processTime = Math.round(processTime);
            this.state.performance.lastUpdate = now;
        }
    }
    
    /**
     * Utility methods
     */
    clearDetections() {
        this.state.detections = [];
        this.updateDetectionResults([]);
        this.updateGridStatistics();
        
        if (this.gridManager) {
            this.gridManager.clearDetections();
        }
    }
    
    showWelcomeAnimation() {
        // Header animasyonu
        const header = document.querySelector('.header');
        if (header) {
            header.classList.add('animate-fadeIn');
        }
        
        // Demo container animasyonu
        setTimeout(() => {
            const demoArea = document.querySelector('.demo-area');
            if (demoArea) {
                demoArea.classList.add('animate-slideInLeft');
            }
        }, 300);
    }
    
    showLoading(message = 'Yükleniyor...') {
        // Loading göstergesi implementasyonu
        console.log(`⏳ ${message}`);
    }
    
    hideLoading() {
        console.log('✅ Yükleme tamamlandı');
    }
    
    showError(message) {
        console.error(`❌ Hata: ${message}`);
        // Toast notification veya modal gösterilebilir
        alert(message);
    }
    
    /**
     * Cleanup - sayfa kapatılırken çağrılır
     */
    cleanup() {
        if (this.isRunning) {
            this.stopCamera();
        }
        
        // Event listener'ları temizle
        this.eventListeners.forEach(({element, event, handler}) => {
            element.removeEventListener(event, handler);
        });
        
        console.log('🧹 Cleanup tamamlandı');
    }
}

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Global app instance
        window.yoloGridApp = new YOLOGridApp();
        await window.yoloGridApp.init();
        
    } catch (error) {
        console.error('💥 Uygulama başlatılamadı:', error);
    }
});

// Export for modules
export { YOLOGridApp };