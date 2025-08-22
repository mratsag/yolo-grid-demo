/**
 * Camera Handler - Webcam Entegrasyonu
 * 
 * Bu modül webcam işlemlerini yönetir:
 * - Kamera erişimi ve izin yönetimi
 * - Video stream başlatma/durdurma
 * - Frame yakalama ve işleme
 * - Kamera durumu bildirimi
 */

export class CameraHandler {
    constructor(options = {}) {
        this.videoElement = options.videoElement;
        this.onFrame = options.onFrame || null;
        this.onStatusChange = options.onStatusChange || null;
        
        // Camera state
        this.stream = null;
        this.isActive = false;
        this.isInitialized = false;
        
        // Frame processing
        this.frameCanvas = null;
        this.frameContext = null;
        this.frameInterval = null;
        this.frameRate = 30; // FPS
        
        // Video constraints
        this.constraints = {
            video: {
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                frameRate: { ideal: 30, max: 60 },
                facingMode: 'user' // 'user' for front camera, 'environment' for back
            },
            audio: false
        };
        
        // Performance metrics
        this.metrics = {
            frameCount: 0,
            lastFrameTime: 0,
            averageFPS: 0,
            processTime: 0
        };
        
        this.init();
    }
    
    /**
     * Camera Handler'ı başlatır
     */
    init() {
        this.setupFrameCanvas();
        this.checkCameraSupport();
        
        console.log('📹 Camera Handler başlatıldı');
    }
    
    /**
     * Frame yakalama için canvas setup eder
     */
    setupFrameCanvas() {
        this.frameCanvas = document.createElement('canvas');
        this.frameContext = this.frameCanvas.getContext('2d', { willReadFrequently: true });
        
        // Canvas'ı görünmez yap
        this.frameCanvas.style.display = 'none';
        document.body.appendChild(this.frameCanvas);
    }
    
    /**
     * Kamera desteğini kontrol eder
     */
    checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('❌ getUserMedia desteklenmiyor');
            this.notifyStatusChange('error');
            return false;
        }
        
        console.log('✅ Kamera desteği mevcut');
        return true;
    }
    
    /**
     * Kamerayı başlatır
     */
    async start() {
        try {
            this.notifyStatusChange('connecting');
            console.log('📹 Kamera başlatılıyor...');
            
            // Permission check
            const permissionStatus = await this.checkPermissions();
            if (!permissionStatus) {
                throw new Error('Kamera izni reddedildi');
            }
            
            // Get user media
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            // Setup video element
            if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                
                // Video loaded event
                this.videoElement.addEventListener('loadedmetadata', () => {
                    this.onVideoLoaded();
                });
                
                // Video error event
                this.videoElement.addEventListener('error', (error) => {
                    console.error('❌ Video error:', error);
                    this.notifyStatusChange('error');
                });
                
                // Start playing
                await this.videoElement.play();
            }
            
            this.isActive = true;
            this.isInitialized = true;
            this.notifyStatusChange('active');
            
            // Start frame processing
            this.startFrameProcessing();
            
            console.log('✅ Kamera başarıyla başlatıldı');
            
        } catch (error) {
            console.error('❌ Kamera başlatılırken hata:', error);
            this.notifyStatusChange('error');
            throw error;
        }
    }
    
    /**
     * Kamerayı durdurur
     */
    stop() {
        try {
            // Stop frame processing
            this.stopFrameProcessing();
            
            // Stop video stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                });
                this.stream = null;
            }
            
            // Clear video element
            if (this.videoElement) {
                this.videoElement.srcObject = null;
                this.videoElement.pause();
            }
            
            this.isActive = false;
            this.notifyStatusChange('stopped');
            
            console.log('⏹️ Kamera durduruldu');
            
        } catch (error) {
            console.error('❌ Kamera durdurulurken hata:', error);
        }
    }
    
    /**
     * Kamera izinlerini kontrol eder
     */
    async checkPermissions() {
        try {
            if ('permissions' in navigator) {
                const permission = await navigator.permissions.query({ name: 'camera' });
                
                switch (permission.state) {
                    case 'granted':
                        console.log('✅ Kamera izni verilmiş');
                        return true;
                        
                    case 'prompt':
                        console.log('❓ Kamera izni istenecek');
                        return true;
                        
                    case 'denied':
                        console.log('❌ Kamera izni reddedilmiş');
                        return false;
                        
                    default:
                        return true;
                }
            }
            
            return true;
            
        } catch (error) {
            console.warn('⚠️ Permission check hatası:', error);
            return true; // Fallback
        }
    }
    
    /**
     * Video yüklendiğinde çağrılır
     */
    onVideoLoaded() {
        const { videoWidth, videoHeight } = this.videoElement;
        
        // Canvas boyutunu video boyutuna eşitle
        this.frameCanvas.width = videoWidth;
        this.frameCanvas.height = videoHeight;
        
        console.log(`📐 Video boyutu: ${videoWidth}x${videoHeight}`);
        
        // Callback çağır
        this.notifyStatusChange('active');
    }
    
    /**
     * Frame işlemeyi başlatır
     */
    startFrameProcessing() {
        if (this.frameInterval) {
            clearInterval(this.frameInterval);
        }
        
        const intervalMs = 1000 / this.frameRate;
        
        this.frameInterval = setInterval(() => {
            this.processFrame();
        }, intervalMs);
        
        console.log(`🎬 Frame işleme başlatıldı (${this.frameRate} FPS)`);
    }
    
    /**
     * Frame işlemeyi durdurur
     */
    stopFrameProcessing() {
        if (this.frameInterval) {
            clearInterval(this.frameInterval);
            this.frameInterval = null;
        }
        
        console.log('⏸️ Frame işleme durduruldu');
    }
    
    /**
     * Tek bir frame'i işler
     */
    processFrame() {
        if (!this.isActive || !this.videoElement || !this.onFrame) {
            return;
        }
        
        try {
            const startTime = performance.now();
            
            // Video'dan frame yakala
            const frameData = this.captureFrame();
            
            if (frameData) {
                // Callback çağır
                this.onFrame(frameData);
                
                // Performance metrics güncelle
                this.updateMetrics(startTime);
            }
            
        } catch (error) {
            console.error('❌ Frame işleme hatası:', error);
        }
    }
    
    /**
     * Video'dan frame yakalar
     */
    captureFrame() {
        if (!this.videoElement || !this.frameContext) {
            return null;
        }
        
        const { videoWidth, videoHeight } = this.videoElement;
        
        if (videoWidth === 0 || videoHeight === 0) {
            return null;
        }
        
        try {
            // Video frame'ini canvas'a çiz
            this.frameContext.drawImage(this.videoElement, 0, 0, videoWidth, videoHeight);
            
            // ImageData al
            const imageData = this.frameContext.getImageData(0, 0, videoWidth, videoHeight);
            
            // Frame data object oluştur
            const frameData = {
                imageData: imageData,
                canvas: this.frameCanvas,
                width: videoWidth,
                height: videoHeight,
                timestamp: Date.now(),
                frameNumber: this.metrics.frameCount
            };
            
            return frameData;
            
        } catch (error) {
            console.error('❌ Frame yakalama hatası:', error);
            return null;
        }
    }
    
    /**
     * Performance metrics günceller
     */
    updateMetrics(startTime) {
        const now = performance.now();
        const processTime = now - startTime;
        
        this.metrics.frameCount++;
        this.metrics.processTime = processTime;
        
        // FPS hesapla
        if (this.metrics.lastFrameTime > 0) {
            const deltaTime = now - this.metrics.lastFrameTime;
            const currentFPS = 1000 / deltaTime;
            
            // Moving average FPS
            this.metrics.averageFPS = this.metrics.averageFPS * 0.9 + currentFPS * 0.1;
        }
        
        this.metrics.lastFrameTime = now;
    }
    
    /**
     * Video constraint'lerini günceller
     */
    updateConstraints(newConstraints) {
        this.constraints = { ...this.constraints, ...newConstraints };
        
        // Eğer aktifse yeniden başlat
        if (this.isActive) {
            console.log('🔄 Kamera constraint\'leri güncelleniyor...');
            this.restart();
        }
    }
    
    /**
     * Kamerayı yeniden başlatır
     */
    async restart() {
        this.stop();
        await new Promise(resolve => setTimeout(resolve, 100)); // Kısa bekleme
        await this.start();
    }
    
    /**
     * Kamera cihazlarını listeler
     */
    async getCameraDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            
            console.log(`📷 ${cameras.length} kamera bulundu:`, cameras);
            return cameras;
            
        } catch (error) {
            console.error('❌ Kamera listesi alınırken hata:', error);
            return [];
        }
    }
    
    /**
     * Belirli bir kamera cihazını seçer
     */
    async selectCamera(deviceId) {
        if (!deviceId) return;
        
        this.constraints.video.deviceId = { exact: deviceId };
        
        if (this.isActive) {
            await this.restart();
        }
        
        console.log(`📷 Kamera seçildi: ${deviceId}`);
    }
    
    /**
     * Front/back kamera toggle
     */
    async toggleCamera() {
        const currentMode = this.constraints.video.facingMode;
        const newMode = currentMode === 'user' ? 'environment' : 'user';
        
        this.constraints.video.facingMode = newMode;
        delete this.constraints.video.deviceId; // deviceId ile facingMode çakışabilir
        
        if (this.isActive) {
            await this.restart();
        }
        
        console.log(`🔄 Kamera değiştirildi: ${newMode}`);
    }
    
    /**
     * Screenshot alır
     */
    takeScreenshot() {
        if (!this.videoElement) {
            console.error('❌ Video element bulunamadı');
            return null;
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        
        context.drawImage(this.videoElement, 0, 0);
        
        // Data URL olarak döndür
        const dataURL = canvas.toDataURL('image/png');
        
        console.log('📸 Screenshot alındı');
        return dataURL;
    }
    
    /**
     * Video kalitesini ayarlar
     */
    setVideoQuality(quality) {
        const qualities = {
            'low': { width: 320, height: 240 },
            'medium': { width: 640, height: 480 },
            'high': { width: 1280, height: 720 },
            'ultra': { width: 1920, height: 1080 }
        };
        
        if (qualities[quality]) {
            this.constraints.video.width = { ideal: qualities[quality].width };
            this.constraints.video.height = { ideal: qualities[quality].height };
            
            if (this.isActive) {
                this.restart();
            }
            
            console.log(`📺 Video kalitesi ayarlandı: ${quality}`);
        }
    }
    
    /**
     * Frame rate ayarlar
     */
    /**
     * Frame rate ayarlar
     */
    setFrameRate(fps) {
        this.frameRate = Math.max(1, Math.min(60, fps));
        this.constraints.video.frameRate = { ideal: this.frameRate };
        
        // Frame processing interval'ını güncelle
        if (this.isActive) {
            this.stopFrameProcessing();
            this.startFrameProcessing();
        }
        
        console.log(`🎬 Frame rate ayarlandı: ${this.frameRate} FPS`);
    }
    
    /**
     * Canvas boyutunu günceller
     */
    resize() {
        if (this.videoElement && this.frameCanvas) {
            const { videoWidth, videoHeight } = this.videoElement;
            
            if (videoWidth > 0 && videoHeight > 0) {
                this.frameCanvas.width = videoWidth;
                this.frameCanvas.height = videoHeight;
                
                console.log(`📐 Canvas boyutu güncellendi: ${videoWidth}x${videoHeight}`);
            }
        }
    }
    
    /**
     * Kamera durumunu bildirir
     */
    notifyStatusChange(status) {
        if (this.onStatusChange) {
            this.onStatusChange(status);
        }
    }
    
    /**
     * Performance istatistiklerini döndürür
     */
    getMetrics() {
        return {
            ...this.metrics,
            isActive: this.isActive,
            frameRate: this.frameRate,
            resolution: this.getResolution()
        };
    }
    
    /**
     * Video çözünürlüğünü döndürür
     */
    getResolution() {
        if (this.videoElement) {
            return {
                width: this.videoElement.videoWidth,
                height: this.videoElement.videoHeight
            };
        }
        return { width: 0, height: 0 };
    }
    
    /**
     * Stream durumunu kontrol eder
     */
    isStreamActive() {
        if (!this.stream) return false;
        
        const tracks = this.stream.getVideoTracks();
        return tracks.length > 0 && tracks[0].readyState === 'live';
    }
    
    /**
     * Video element durumunu kontrol eder
     */
    isVideoReady() {
        return this.videoElement && 
               this.videoElement.readyState >= 2 && // HAVE_CURRENT_DATA
               !this.videoElement.paused;
    }
    
    /**
     * Error handling
     */
    handleError(error, context = '') {
        console.error(`❌ Camera error ${context}:`, error);
        
        let errorMessage = 'Bilinmeyen kamera hatası';
        
        if (error.name) {
            switch (error.name) {
                case 'NotAllowedError':
                    errorMessage = 'Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından kamera iznini veriniz.';
                    break;
                    
                case 'NotFoundError':
                    errorMessage = 'Kamera bulunamadı. Lütfen kameranızın bağlı olduğundan emin olunuz.';
                    break;
                    
                case 'NotReadableError':
                    errorMessage = 'Kamera kullanımda. Lütfen diğer uygulamaları kapatıp tekrar deneyiniz.';
                    break;
                    
                case 'OverconstrainedError':
                    errorMessage = 'Kamera ayarları desteklenmiyor. Farklı ayarlar deneyiniz.';
                    break;
                    
                case 'SecurityError':
                    errorMessage = 'Güvenlik hatası. HTTPS bağlantısı gereklidir.';
                    break;
                    
                case 'TypeError':
                    errorMessage = 'Kamera desteği bulunmuyor.';
                    break;
            }
        }
        
        this.notifyStatusChange('error');
        return errorMessage;
    }
    
    /**
     * Cleanup - kaynakları temizler
     */
    cleanup() {
        this.stop();
        
        // Frame canvas'ı temizle
        if (this.frameCanvas && this.frameCanvas.parentNode) {
            this.frameCanvas.parentNode.removeChild(this.frameCanvas);
        }
        
        // Event listener'ları temizle
        if (this.videoElement) {
            this.videoElement.removeEventListener('loadedmetadata', this.onVideoLoaded);
            this.videoElement.removeEventListener('error', this.handleError);
        }
        
        console.log('🧹 Camera Handler temizlendi');
    }
    
    /**
     * Debug bilgilerini döndürür
     */
    getDebugInfo() {
        const info = {
            isActive: this.isActive,
            isInitialized: this.isInitialized,
            streamActive: this.isStreamActive(),
            videoReady: this.isVideoReady(),
            constraints: this.constraints,
            metrics: this.getMetrics(),
            resolution: this.getResolution()
        };
        
        if (this.stream) {
            info.streamTracks = this.stream.getTracks().map(track => ({
                kind: track.kind,
                label: track.label,
                enabled: track.enabled,
                readyState: track.readyState,
                settings: track.getSettings()
            }));
        }
        
        return info;
    }
    
    /**
     * Kamera ayarlarını sıfırlar
     */
    resetSettings() {
        this.constraints = {
            video: {
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                frameRate: { ideal: 30, max: 60 },
                facingMode: 'user'
            },
            audio: false
        };
        
        this.frameRate = 30;
        
        console.log('🔄 Kamera ayarları sıfırlandı');
    }
    
    /**
     * Video stream'ini kaydet (experimental)
     */
    startRecording() {
        if (!this.stream) {
            console.error('❌ Recording için aktif stream gerekli');
            return null;
        }
        
        try {
            const mediaRecorder = new MediaRecorder(this.stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // Download link oluştur
                const a = document.createElement('a');
                a.href = url;
                a.download = `yolo-demo-${Date.now()}.webm`;
                a.click();
                
                URL.revokeObjectURL(url);
                console.log('📹 Kayıt tamamlandı');
            };
            
            mediaRecorder.start(1000); // 1 saniye chunk'lar
            console.log('🔴 Kayıt başlatıldı');
            
            return mediaRecorder;
            
        } catch (error) {
            console.error('❌ Kayıt başlatılırken hata:', error);
            return null;
        }
    }
    
    /**
     * Motion detection (basit)
     */
    detectMotion(threshold = 30) {
        if (!this.previousFrameData || !this.frameContext) {
            return false;
        }
        
        const currentImageData = this.frameContext.getImageData(
            0, 0, this.frameCanvas.width, this.frameCanvas.height
        );
        
        let diffPixels = 0;
        const totalPixels = currentImageData.data.length / 4;
        
        for (let i = 0; i < currentImageData.data.length; i += 4) {
            const rDiff = Math.abs(currentImageData.data[i] - this.previousFrameData.data[i]);
            const gDiff = Math.abs(currentImageData.data[i + 1] - this.previousFrameData.data[i + 1]);
            const bDiff = Math.abs(currentImageData.data[i + 2] - this.previousFrameData.data[i + 2]);
            
            const avgDiff = (rDiff + gDiff + bDiff) / 3;
            
            if (avgDiff > threshold) {
                diffPixels++;
            }
        }
        
        const motionPercentage = (diffPixels / totalPixels) * 100;
        
        // Previous frame'i güncelle
        this.previousFrameData = currentImageData;
        
        return motionPercentage > 1; // %1'den fazla değişiklik
    }
    
    /**
     * Brightness/contrast ayarları
     */
    adjustImageSettings(brightness = 1, contrast = 1, saturation = 1) {
        if (this.frameContext) {
            this.frameContext.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
        }
    }
    
    /**
     * Kamera test fonksiyonu
     */
    async testCamera() {
        console.log('🧪 Kamera testi başlatılıyor...');
        
        const testResults = {
            cameraSupport: false,
            permissionStatus: 'unknown',
            availableCameras: [],
            testStream: false,
            resolution: null,
            error: null
        };
        
        try {
            // 1. Camera support check
            testResults.cameraSupport = this.checkCameraSupport();
            
            // 2. Permission check
            const permission = await this.checkPermissions();
            testResults.permissionStatus = permission ? 'granted' : 'denied';
            
            // 3. Available cameras
            testResults.availableCameras = await this.getCameraDevices();
            
            // 4. Test stream
            const testStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240 }
            });
            
            if (testStream) {
                testResults.testStream = true;
                
                // Get resolution
                const video = document.createElement('video');
                video.srcObject = testStream;
                video.play();
                
                video.addEventListener('loadedmetadata', () => {
                    testResults.resolution = {
                        width: video.videoWidth,
                        height: video.videoHeight
                    };
                });
                
                // Stop test stream
                testStream.getTracks().forEach(track => track.stop());
            }
            
        } catch (error) {
            testResults.error = error.message;
            console.error('❌ Kamera testi hatası:', error);
        }
        
        console.log('📊 Kamera test sonuçları:', testResults);
        return testResults;
    }
}