/**
 * YOLO Simulation - YOLO Algoritması Simülasyonu
 * 
 * Bu modül YOLO nesne tespit algoritmasını simüle eder:
 * - TensorFlow.js ile gerçek nesne tespiti
 * - YOLO grid mantığının görselleştirilmesi
 * - Confidence skorları ve bounding box'lar
 * - Eğitici amaçlı algoritma adımlarının gösterimi
 */

export class YOLOSimulation {
    constructor(options = {}) {
        this.onDetection = options.onDetection || null;
        this.onProcessingUpdate = options.onProcessingUpdate || null;
        
        // YOLO model
        this.model = null;
        this.isModelLoaded = false;
        this.modelLoadingPromise = null;
        
        // Detection state
        this.isRunning = false;
        this.detections = [];
        this.processingQueue = [];
        
        // Simulation settings
        this.confidenceThreshold = 0.3;
        this.iouThreshold = 0.5;
        this.maxDetections = 10;
        
        // Performance tracking
        this.processMetrics = {
            inferenceTime: 0,
            postprocessTime: 0,
            totalTime: 0,
            frameCount: 0
        };
        
        // YOLO grid simulation
        this.gridSize = 13;
        this.simulationMode = 'educational'; // 'educational' or 'realtime'
        this.stepByStepMode = false;
        
        this.init();
    }
    
    /**
     * YOLO Simulation'ı başlatır
     */
    init() {
        this.loadModel();
        console.log('🧠 YOLO Simulation başlatıldı');
    }
    
    /**
     * YOLO modelini yükler
     */
    async loadModel() {
        try {
            console.log('📦 YOLO modeli yükleniyor...');
            this.notifyProcessingUpdate({ isLoading: true, message: 'Model yükleniyor...' });
            
            // COCO-SSD modelini yükle (YOLO benzeri)
            this.modelLoadingPromise = window.cocoSsd.load({
                base: 'mobilenet_v2', // veya 'lite_mobilenet_v2'
                modelUrl: undefined // Default kullan
            });
            
            this.model = await this.modelLoadingPromise;
            this.isModelLoaded = true;
            
            console.log('✅ YOLO modeli yüklendi');
            this.notifyProcessingUpdate({ isLoading: false, message: 'Model hazır' });
            
        } catch (error) {
            console.error('❌ Model yükleme hatası:', error);
            this.notifyProcessingUpdate({ 
                isLoading: false, 
                error: 'Model yüklenemedi',
                message: error.message 
            });
        }
    }
    
    /**
     * YOLO simülasyonunu başlatır
     */
    start() {
        this.isRunning = true;
        console.log('▶️ YOLO simülasyonu başlatıldı');
    }
    
    /**
     * YOLO simülasyonunu durdurur
     */
    stop() {
        this.isRunning = false;
        this.detections = [];
        this.processingQueue = [];
        console.log('⏹️ YOLO simülasyonu durduruldu');
    }
    
    /**
     * Frame'i işler - Ana YOLO pipeline
     */
    async processFrame(frameData) {
        if (!this.isRunning || !this.isModelLoaded) {
            return;
        }
        
        try {
            const startTime = performance.now();
            
            // Step 1: Preprocessing
            this.notifyProcessingUpdate({ 
                isProcessing: true, 
                step: 1, 
                message: 'Görüntü ön işleme...' 
            });
            
            const preprocessedData = this.preprocessFrame(frameData);
            
            // Step 2: YOLO Inference
            this.notifyProcessingUpdate({ 
                isProcessing: true, 
                step: 2, 
                message: 'YOLO analizi...' 
            });
            
            const rawDetections = await this.runInference(preprocessedData);
            
            // Step 3: Post-processing
            this.notifyProcessingUpdate({ 
                isProcessing: true, 
                step: 3, 
                message: 'Sonuçlar işleniyor...' 
            });
            
            const processedDetections = this.postprocessDetections(rawDetections, frameData);
            
            // Step 4: Grid Mapping (Educational)
            if (this.simulationMode === 'educational') {
                this.notifyProcessingUpdate({ 
                    isProcessing: true, 
                    step: 4, 
                    message: 'Grid haritalama...' 
                });
                
                this.simulateGridMapping(processedDetections, frameData);
            }
            
            // Update metrics
            const totalTime = performance.now() - startTime;
            this.updateMetrics(totalTime);
            
            // Store detections
            this.detections = processedDetections;
            
            // Notify results
            this.notifyDetection(processedDetections);
            this.notifyProcessingUpdate({ 
                isProcessing: false, 
                metrics: this.processMetrics 
            });
            
        } catch (error) {
            console.error('❌ Frame işleme hatası:', error);
            this.notifyProcessingUpdate({ 
                isProcessing: false, 
                error: error.message 
            });
        }
    }
    
    /**
     * Frame ön işleme
     */
    preprocessFrame(frameData) {
        const { canvas, width, height } = frameData;
        
        // YOLO input normalization (simulated)
        // Gerçek YOLO: resize to 416x416, normalize [0,1]
        
        return {
            canvas: canvas,
            originalWidth: width,
            originalHeight: height,
            inputWidth: 416, // YOLO standard input
            inputHeight: 416,
            scaleFactor: Math.min(416 / width, 416 / height)
        };
    }
    
    /**
     * YOLO inference çalıştırır
     */
    async runInference(preprocessedData) {
        if (!this.model) {
            throw new Error('Model henüz yüklenmedi');
        }
        
        const inferenceStart = performance.now();
        
        // TensorFlow.js model ile tespit yap
        const detections = await this.model.detect(
            preprocessedData.canvas,
            this.maxDetections
        );
        
        this.processMetrics.inferenceTime = performance.now() - inferenceStart;
        
        return detections;
    }
    
    /**
     * Detection sonuçlarını post-process eder
     */
    postprocessDetections(rawDetections, frameData) {
        const postprocessStart = performance.now();
        
        const processedDetections = rawDetections
            .filter(detection => detection.score >= this.confidenceThreshold)
            .map(detection => this.formatDetection(detection, frameData))
            .sort((a, b) => b.score - a.score); // Confidence'a göre sırala
        
        // Non-Maximum Suppression (NMS) simülasyonu
        const finalDetections = this.applyNMS(processedDetections);
        
        this.processMetrics.postprocessTime = performance.now() - postprocessStart;
        
        return finalDetections;
    }
    
    /**
     * Detection'ı standart formata çevirir
     */
    formatDetection(detection, frameData) {
        const { bbox, class: className, score } = detection;
        const { width, height } = frameData;
        
        return {
            class: className,
            score: score,
            bbox: [
                bbox[0] * width / frameData.canvas.width,  // x
                bbox[1] * height / frameData.canvas.height, // y
                bbox[2] * width / frameData.canvas.width,  // width  
                bbox[3] * height / frameData.canvas.height  // height
            ],
            center: [
                (bbox[0] + bbox[2] / 2) * width / frameData.canvas.width,
                (bbox[1] + bbox[3] / 2) * height / frameData.canvas.height
            ],
            id: Math.random().toString(36).substring(7)
        };
    }
    
    /**
     * Non-Maximum Suppression uygular
     */
    applyNMS(detections) {
        if (detections.length === 0) return [];
        
        // Confidence'a göre sıralı geldiği varsayılıyor
        const selected = [];
        const suppressed = new Set();
        
        for (let i = 0; i < detections.length; i++) {
            if (suppressed.has(i)) continue;
            
            selected.push(detections[i]);
            
            // Bu detection ile overlap eden diğerlerini suppress et
            for (let j = i + 1; j < detections.length; j++) {
                if (suppressed.has(j)) continue;
                
                const iou = this.calculateIoU(detections[i].bbox, detections[j].bbox);
                if (iou > this.iouThreshold) {
                    suppressed.add(j);
                }
            }
        }
        
        return selected;
    }
    
    /**
     * Intersection over Union (IoU) hesaplar
     */
    calculateIoU(bbox1, bbox2) {
        const [x1_1, y1_1, w1, h1] = bbox1;
        const [x1_2, y1_2, w2, h2] = bbox2;
        
        const x2_1 = x1_1 + w1;
        const y2_1 = y1_1 + h1;
        const x2_2 = x1_2 + w2;
        const y2_2 = y1_2 + h2;
        
        // Intersection
        const intersectX1 = Math.max(x1_1, x1_2);
        const intersectY1 = Math.max(y1_1, y1_2);
        const intersectX2 = Math.min(x2_1, x2_2);
        const intersectY2 = Math.min(y2_1, y2_2);
        
        const intersectArea = Math.max(0, intersectX2 - intersectX1) * 
                             Math.max(0, intersectY2 - intersectY1);
        
        // Union
        const area1 = w1 * h1;
        const area2 = w2 * h2;
        const unionArea = area1 + area2 - intersectArea;
        
        return unionArea > 0 ? intersectArea / unionArea : 0;
    }
    
    /**
     * YOLO grid haritalama simülasyonu (Eğitici)
     */
    simulateGridMapping(detections, frameData) {
        if (this.simulationMode !== 'educational') return;
        
        const { width, height } = frameData;
        const cellWidth = width / this.gridSize;
        const cellHeight = height / this.gridSize;
        
        // Her detection için hangi grid hücrelerinin sorumlu olduğunu göster
        const gridActivation = [];
        
        detections.forEach(detection => {
            const { center, bbox, score } = detection;
            const [centerX, centerY] = center;
            
            // Object center'ın hangi grid hücresinde olduğunu bul
            const gridX = Math.floor(centerX / cellWidth);
            const gridY = Math.floor(centerY / cellHeight);
            const gridIndex = gridY * this.gridSize + gridX;
            
            // Bu hücre bu detection'dan sorumlu
            gridActivation.push({
                gridIndex: gridIndex,
                gridX: gridX,
                gridY: gridY,
                detection: detection,
                confidence: score,
                isResponsible: true
            });
            
            // Çevredeki hücreler de etkilenir (YOLO mantığı)
            this.simulateNeighborActivation(gridX, gridY, detection, gridActivation);
        });
        
        // Grid activation'ı bildır
        this.notifyGridActivation(gridActivation);
    }
    
    /**
     * Komşu hücre aktivasyonunu simüle eder
     */
    simulateNeighborActivation(centerX, centerY, detection, gridActivation) {
        const radius = 1; // 1 hücre çapı
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx === 0 && dy === 0) continue; // Center hücre zaten eklendi
                
                const gridX = centerX + dx;
                const gridY = centerY + dy;
                
                // Grid sınırları kontrolü
                if (gridX < 0 || gridX >= this.gridSize || 
                    gridY < 0 || gridY >= this.gridSize) {
                    continue;
                }
                
                const gridIndex = gridY * this.gridSize + gridX;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Distance'a göre confidence azalt
                const neighborConfidence = detection.score * (1 - distance / 3);
                
                if (neighborConfidence > 0.1) {
                    gridActivation.push({
                        gridIndex: gridIndex,
                        gridX: gridX,
                        gridY: gridY,
                        detection: detection,
                        confidence: neighborConfidence,
                        isResponsible: false
                    });
                }
            }
        }
    }
    
    /**
     * Step-by-step modda bir sonraki adıma geç
     */
    nextStep() {
        if (!this.stepByStepMode) return;
        
        // Tutorial stepping logic
        console.log('➡️ Sonraki adım');
    }
    
    /**
     * YOLO confidence threshold ayarlar
     */
    setConfidenceThreshold(threshold) {
        this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
        console.log(`🎯 Confidence threshold: ${this.confidenceThreshold}`);
    }
    
    /**
     * IoU threshold ayarlar
     */
    setIoUThreshold(threshold) {
        this.iouThreshold = Math.max(0, Math.min(1, threshold));
        console.log(`📐 IoU threshold: ${this.iouThreshold}`);
    }
    
    /**
     * Grid boyutunu ayarlar
     */
    setGridSize(size) {
        this.gridSize = size;
        console.log(`🔳 Grid boyutu: ${size}x${size}`);
    }
    
    /**
     * Simülasyon modunu değiştirir
     */
    setSimulationMode(mode) {
        this.simulationMode = mode; // 'educational' or 'realtime'
        console.log(`🎓 Simülasyon modu: ${mode}`);
    }
    
    /**
     * Step-by-step modu toggle eder
     */
    toggleStepByStepMode() {
        this.stepByStepMode = !this.stepByStepMode;
        console.log(`👣 Step-by-step modu: ${this.stepByStepMode ? 'açık' : 'kapalı'}`);
    }
    
    /**
     * Performance metrics günceller
     */
    updateMetrics(totalTime) {
        this.processMetrics.totalTime = totalTime;
        this.processMetrics.frameCount++;
        
        // Moving averages
        const alpha = 0.1;
        this.processMetrics.avgInferenceTime = 
            (this.processMetrics.avgInferenceTime || 0) * (1 - alpha) + 
            this.processMetrics.inferenceTime * alpha;
            
        this.processMetrics.avgPostprocessTime = 
            (this.processMetrics.avgPostprocessTime || 0) * (1 - alpha) + 
            this.processMetrics.postprocessTime * alpha;
            
        this.processMetrics.avgTotalTime = 
            (this.processMetrics.avgTotalTime || 0) * (1 - alpha) + 
            this.processMetrics.totalTime * alpha;
    }
    
    /**
     * Model bilgilerini döndürür
     */
    getModelInfo() {
        if (!this.model) return null;
        
        return {
            isLoaded: this.isModelLoaded,
            architecture: 'COCO-SSD (MobileNet)',
            inputSize: '300x300', // COCO-SSD default
            classes: this.getClassNames(),
            version: 'TensorFlow.js'
        };
    }
    
    /**
     * Desteklenen sınıf isimlerini döndürür
     */
    getClassNames() {
        // COCO dataset sınıfları (80 sınıf)
        return [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
            'train', 'truck', 'boat', 'traffic light', 'fire hydrant',
            'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
            'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe',
            'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
            'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat',
            'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
            'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot',
            'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
            'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
            'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven',
            'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase',
            'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ];
    }
    
    /**
     * Detection sonuçlarını bildirir
     */
    notifyDetection(detections) {
        if (this.onDetection) {
            this.onDetection(detections);
        }
    }
    
    /**
     * Processing güncellemelerini bildirir
     */
    notifyProcessingUpdate(updateData) {
        if (this.onProcessingUpdate) {
            this.onProcessingUpdate(updateData);
        }
    }
    
    /**
     * Grid aktivasyonunu bildirir
     */
    notifyGridActivation(gridActivation) {
        // Bu grid manager'a gönderilecek
        if (this.onGridActivation) {
            this.onGridActivation(gridActivation);
        }
    }
    
    /**
     * Gerçek zamanlı istatistikleri döndürür
     */
    getRealtimeStats() {
        return {
            detectionCount: this.detections.length,
            isProcessing: this.isRunning,
            modelLoaded: this.isModelLoaded,
            averageFPS: this.processMetrics.frameCount / (this.processMetrics.totalTime / 1000),
            confidenceThreshold: this.confidenceThreshold,
            iouThreshold: this.iouThreshold,
            gridSize: this.gridSize,
            simulationMode: this.simulationMode
        };
    }
    
    /**
     * Detaylı performance raporu
     */
    getPerformanceReport() {
        const avgTime = this.processMetrics.avgTotalTime || 0;
        const fps = avgTime > 0 ? 1000 / avgTime : 0;
        
        return {
            frameCount: this.processMetrics.frameCount,
            totalProcessingTime: this.processMetrics.totalTime,
            averageInferenceTime: this.processMetrics.avgInferenceTime || 0,
            averagePostprocessTime: this.processMetrics.avgPostprocessTime || 0,
            averageTotalTime: avgTime,
            estimatedFPS: fps,
            efficiency: {
                inferencePercentage: ((this.processMetrics.avgInferenceTime || 0) / avgTime) * 100,
                postprocessPercentage: ((this.processMetrics.avgPostprocessTime || 0) / avgTime) * 100
            }
        };
    }
    
    /**
     * Demo modları için önceden tanımlı senaryolar
     */
    loadDemoScenario(scenarioName) {
        const scenarios = {
            'beginner': {
                confidenceThreshold: 0.5,
                iouThreshold: 0.5,
                gridSize: 7,
                simulationMode: 'educational',
                stepByStepMode: true
            },
            'intermediate': {
                confidenceThreshold: 0.4,
                iouThreshold: 0.4,
                gridSize: 13,
                simulationMode: 'educational',
                stepByStepMode: false
            },
            'advanced': {
                confidenceThreshold: 0.3,
                iouThreshold: 0.3,
                gridSize: 19,
                simulationMode: 'realtime',
                stepByStepMode: false
            },
            'performance': {
                confidenceThreshold: 0.6,
                iouThreshold: 0.6,
                gridSize: 7,
                simulationMode: 'realtime',
                stepByStepMode: false
            }
        };
        
        const scenario = scenarios[scenarioName];
        if (scenario) {
            Object.assign(this, scenario);
            console.log(`🎬 Demo senaryosu yüklendi: ${scenarioName}`, scenario);
        }
    }
    
    /**
     * YOLO algoritması hakkında eğitici bilgiler
     */
    getEducationalInfo() {
        return {
            algorithmSteps: [
                {
                    step: 1,
                    title: "Görüntü Ön İşleme",
                    description: "Görüntü YOLO input boyutuna (416x416) resize edilir ve normalize edilir",
                    detail: "Input preprocessing YOLO'nun sabit input size gereksinimine göre yapılır"
                },
                {
                    step: 2, 
                    title: "Grid Bölme",
                    description: `Görüntü ${this.gridSize}x${this.gridSize} grid hücrelerine bölünür`,
                    detail: "Her grid hücresi kendine düşen alandaki nesneleri tespit etmekten sorumludur"
                },
                {
                    step: 3,
                    title: "Neural Network İnferansı",
                    description: "Derin öğrenme modeli her grid hücresi için tahminler yapar",
                    detail: "Her hücre: [x, y, w, h, confidence, class_probabilities] formatında çıktı üretir"
                },
                {
                    step: 4,
                    title: "Confidence Filtreleme",
                    description: `Confidence ${this.confidenceThreshold} altındaki tahminler elenirr`,
                    detail: "Düşük güvenilirlik skorlu tahminler gürültü olarak kabul edilir"
                },
                {
                    step: 5,
                    title: "Non-Maximum Suppression",
                    description: `IoU ${this.iouThreshold} üstündeki overlapping box'lar birleştirilir`,
                    detail: "Aynı nesne için multiple detection'ları birleştirmek için kullanılır"
                }
            ],
            advantages: [
                "Tek geçişte (single-pass) çalışır - çok hızlı",
                "Gerçek zamanlı uygulamalar için ideal",
                "Global context'i göz önünde bulundurur",
                "End-to-end eğitilebilir"
            ],
            limitations: [
                "Küçük nesnelerde daha az başarılı",
                "Aynı grid hücresindeki multiple nesnelerde zorluk",
                "Speed-accuracy trade-off"
            ]
        };
    }
    
    /**
     * Debug modunda detaylı bilgi
     */
    getDebugInfo() {
        return {
            modelStatus: {
                loaded: this.isModelLoaded,
                loading: this.modelLoadingPromise !== null,
                error: this.modelLoadingPromise === null && !this.isModelLoaded
            },
            processingStatus: {
                running: this.isRunning,
                queueLength: this.processingQueue.length,
                lastProcessTime: this.processMetrics.totalTime
            },
            detectionStatus: {
                count: this.detections.length,
                classes: [...new Set(this.detections.map(d => d.class))],
                avgConfidence: this.detections.length > 0 
                    ? this.detections.reduce((sum, d) => sum + d.score, 0) / this.detections.length 
                    : 0
            },
            settings: {
                confidenceThreshold: this.confidenceThreshold,
                iouThreshold: this.iouThreshold,
                gridSize: this.gridSize,
                simulationMode: this.simulationMode,
                stepByStepMode: this.stepByStepMode
            },
            performance: this.getPerformanceReport()
        };
    }
    
    /**
     * Model yeniden yükleme
     */
    async reloadModel() {
        console.log('🔄 Model yeniden yükleniyor...');
        
        this.model = null;
        this.isModelLoaded = false;
        this.modelLoadingPromise = null;
        
        await this.loadModel();
    }
    
    /**
     * Ayarları sıfırla
     */
    resetSettings() {
        this.confidenceThreshold = 0.3;
        this.iouThreshold = 0.5;
        this.maxDetections = 10;
        this.gridSize = 13;
        this.simulationMode = 'educational';
        this.stepByStepMode = false;
        
        console.log('🔄 YOLO ayarları sıfırlandı');
    }
    
    /**
     * Belirli bir nesne sınıfını filtrele
     */
    filterByClass(className) {
        return this.detections.filter(detection => 
            detection.class.toLowerCase() === className.toLowerCase()
        );
    }
    
    /**
     * Confidence aralığına göre filtrele
     */
    filterByConfidence(minConfidence, maxConfidence = 1.0) {
        return this.detections.filter(detection => 
            detection.score >= minConfidence && detection.score <= maxConfidence
        );
    }
    
    /**
     * Belirli bir alandaki detection'ları bul
     */
    getDetectionsInRegion(x, y, width, height) {
        return this.detections.filter(detection => {
            const [detX, detY, detW, detH] = detection.bbox;
            const detCenterX = detX + detW / 2;
            const detCenterY = detY + detH / 2;
            
            return detCenterX >= x && detCenterX <= x + width &&
                   detCenterY >= y && detCenterY <= y + height;
        });
    }
    
    /**
     * İki detection arasındaki mesafeyi hesapla
     */
    calculateDistance(detection1, detection2) {
        const [x1, y1] = detection1.center;
        const [x2, y2] = detection2.center;
        
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    /**
     * Detection'ların clusters'ını bul
     */
    findDetectionClusters(maxDistance = 100) {
        const clusters = [];
        const visited = new Set();
        
        this.detections.forEach((detection, index) => {
            if (visited.has(index)) return;
            
            const cluster = [detection];
            visited.add(index);
            
            this.detections.forEach((otherDetection, otherIndex) => {
                if (visited.has(otherIndex) || index === otherIndex) return;
                
                const distance = this.calculateDistance(detection, otherDetection);
                if (distance <= maxDistance) {
                    cluster.push(otherDetection);
                    visited.add(otherIndex);
                }
            });
            
            if (cluster.length > 0) {
                clusters.push(cluster);
            }
        });
        
        return clusters;
    }
    
    /**
     * Cleanup - kaynakları temizle
     */
    cleanup() {
        this.stop();
        
        // Model'i temizle
        if (this.model && this.model.dispose) {
            this.model.dispose();
        }
        
        this.model = null;
        this.isModelLoaded = false;
        this.detections = [];
        this.processingQueue = [];
        
        console.log('🧹 YOLO Simulation temizlendi');
    }
    
    /**
     * Export detection results
     */
    exportResults(format = 'json') {
        const data = {
            timestamp: new Date().toISOString(),
            detections: this.detections,
            settings: {
                confidenceThreshold: this.confidenceThreshold,
                iouThreshold: this.iouThreshold,
                gridSize: this.gridSize
            },
            performance: this.getPerformanceReport(),
            metadata: {
                totalDetections: this.detections.length,
                uniqueClasses: [...new Set(this.detections.map(d => d.class))].length,
                averageConfidence: this.detections.length > 0 
                    ? this.detections.reduce((sum, d) => sum + d.score, 0) / this.detections.length 
                    : 0
            }
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
                
            case 'csv':
                const headers = ['class', 'confidence', 'x', 'y', 'width', 'height'];
                const rows = this.detections.map(d => [
                    d.class,
                    d.score.toFixed(3),
                    ...d.bbox.map(val => val.toFixed(1))
                ]);
                
                return [headers, ...rows].map(row => row.join(',')).join('\n');
                
            default:
                return data;
        }
    }
}