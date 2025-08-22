/**
 * Grid Manager - YOLO Grid Sistemi Yönetimi
 * 
 * Bu modül YOLO'nun grid mantığını simüle eder:
 * - Grid oluşturma ve yönetimi
 * - Hücre durumlarını güncelleme
 * - Detection sonuçlarını grid'e mapping
 * - Grid görselleştirme
 */

export class GridManager {
    constructor(options = {}) {
        this.gridSize = options.gridSize || 13;
        this.overlayCanvas = options.overlayCanvas;
        this.showConfidence = options.showConfidence !== false;
        
        // Grid state
        this.cells = [];
        this.activeCells = new Set();
        this.detections = [];
        this.isRunning = false;
        
        // Canvas context
        this.ctx = null;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        
        // Performance tracking
        this.lastUpdate = 0;
        this.updateCount = 0;
        
        // Animation frame
        this.animationFrame = null;
        
        this.init();
    }
    
    /**
     * Grid Manager'ı başlatır
     */
    init() {
        this.setupCanvas();
        this.createGrid();
        this.bindEvents();
        
        console.log(`🔳 Grid Manager başlatıldı (${this.gridSize}x${this.gridSize})`);
    }
    
    /**
     * Canvas'ı setup eder
     */
    setupCanvas() {
        if (!this.overlayCanvas) {
            console.error('❌ Grid overlay canvas bulunamadı');
            return;
        }
        
        this.ctx = this.overlayCanvas.getContext('2d');
        this.resize();
    }
    
    /**
     * Grid'i oluşturur
     */
    createGrid() {
        this.cells = [];
        
        const cellCount = this.gridSize * this.gridSize;
        
        for (let i = 0; i < cellCount; i++) {
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            
            this.cells.push({
                id: i,
                row: row,
                col: col,
                x: 0, // Canvas koordinatlarında hesaplanacak
                y: 0,
                width: 0,
                height: 0,
                state: 'inactive', // inactive, active, detecting, detected, confident
                confidence: 0,
                detection: null,
                lastUpdate: 0
            });
        }
        
        this.calculateCellPositions();
        console.log(`📐 ${cellCount} grid hücresi oluşturuldu`);
    }
    
    /**
     * Hücre konumlarını hesaplar
     */
    calculateCellPositions() {
        const cellWidth = this.canvasWidth / this.gridSize;
        const cellHeight = this.canvasHeight / this.gridSize;
        
        this.cells.forEach(cell => {
            cell.x = cell.col * cellWidth;
            cell.y = cell.row * cellHeight;
            cell.width = cellWidth;
            cell.height = cellHeight;
        });
    }
    
    /**
     * Event listener'ları bağlar
     */
    bindEvents() {
        // Resize event
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Mouse events (debugging için)
        if (this.overlayCanvas) {
            this.overlayCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
            this.overlayCanvas.addEventListener('click', this.handleClick.bind(this));
        }
    }
    
    /**
     * Grid sistemini başlatır
     */
    start() {
        this.isRunning = true;
        this.startRenderLoop();
        console.log('▶️ Grid sistemi başlatıldı');
    }
    
    /**
     * Grid sistemini durdurur
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.clearCanvas();
        console.log('⏹️ Grid sistemi durduruldu');
    }
    
    /**
     * Render loop'unu başlatır
     */
    startRenderLoop() {
        const render = () => {
            if (!this.isRunning) return;
            
            this.render();
            this.animationFrame = requestAnimationFrame(render);
        };
        
        render();
    }
    
    /**
     * Grid'i render eder
     */
    render() {
        if (!this.ctx) return;
        
        this.clearCanvas();
        this.drawGrid();
        this.drawDetections();
        this.drawProcessingIndicator();
        
        this.updateCount++;
    }
    
    /**
     * Canvas'ı temizler
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    /**
     * Grid'i çizer
     */
    drawGrid() {
        this.cells.forEach(cell => {
            this.drawCell(cell);
        });
    }
    
    /**
     * Tek bir hücreyi çizer
     */
    drawCell(cell) {
        const { x, y, width, height, state, confidence } = cell;
        
        // Hücre durumuna göre renk belirle
        const colors = this.getCellColors(state, confidence);
        
        // Hücre arkaplanı
        if (colors.background) {
            this.ctx.fillStyle = colors.background;
            this.ctx.fillRect(x, y, width, height);
        }
        
        // Hücre kenarlığı
        this.ctx.strokeStyle = colors.border;
        this.ctx.lineWidth = colors.borderWidth;
        this.ctx.strokeRect(x, y, width, height);
        
        // Confidence skoru
        if (this.showConfidence && confidence > 0) {
            this.drawConfidenceScore(cell);
        }
        
        // Hücre indexi (debug mode)
        if (this.debugMode) {
            this.drawCellIndex(cell);
        }
    }
    
    /**
     * Hücre durumuna göre renkleri döndürür
     */
    getCellColors(state, confidence) {
        switch (state) {
            case 'inactive':
                return {
                    background: 'rgba(0, 0, 0, 0.1)',
                    border: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 1
                };
                
            case 'active':
                return {
                    background: 'rgba(102, 126, 234, 0.3)',
                    border: 'rgba(102, 126, 234, 0.8)',
                    borderWidth: 1
                };
                
            case 'detecting':
                return {
                    background: 'rgba(255, 193, 7, 0.4)',
                    border: 'rgba(255, 193, 7, 0.8)',
                    borderWidth: 2
                };
                
            case 'detected':
                return {
                    background: 'rgba(40, 167, 69, 0.4)',
                    border: 'rgba(40, 167, 69, 0.8)',
                    borderWidth: 2
                };
                
            case 'confident':
                const alpha = 0.4 + (confidence * 0.4); // 0.4 - 0.8
                return {
                    background: `rgba(220, 53, 69, ${alpha})`,
                    border: 'rgba(220, 53, 69, 1)',
                    borderWidth: 3
                };
                
            default:
                return {
                    background: null,
                    border: 'rgba(102, 126, 234, 0.3)',
                    borderWidth: 1
                };
        }
    }
    
    /**
     * Confidence skorunu çizer
     */
    drawConfidenceScore(cell) {
        const { x, y, width, height, confidence } = cell;
        
        if (confidence < 0.1) return;
        
        const fontSize = Math.max(8, Math.min(width / 4, 12));
        const score = Math.round(confidence * 100);
        
        // Confidence background
        const bgWidth = 20;
        const bgHeight = 14;
        const bgX = x + width - bgWidth - 2;
        const bgY = y + 2;
        
        // Background color based on confidence
        let bgColor;
        if (confidence > 0.7) {
            bgColor = 'rgba(220, 53, 69, 0.9)'; // High confidence - red
        } else if (confidence > 0.4) {
            bgColor = 'rgba(255, 193, 7, 0.9)'; // Medium confidence - yellow
        } else {
            bgColor = 'rgba(108, 117, 125, 0.9)'; // Low confidence - gray
        }
        
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
        
        // Score text
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(score, bgX + bgWidth / 2, bgY + bgHeight / 2);
    }
    
    /**
     * Hücre indexini çizer (debug)
     */
    drawCellIndex(cell) {
        const { x, y, width, height, id } = cell;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(id, x + 2, y + 2);
    }
    
    /**
     * Detection'ları çizer
     */
    drawDetections() {
        this.detections.forEach(detection => {
            this.drawDetectionBox(detection);
        });
    }
    
    /**
     * Detection box çizer
     */
    drawDetectionBox(detection) {
        const { bbox, class: className, score } = detection;
        const [x, y, width, height] = bbox;
        
        // Detection box
        const color = this.getDetectionColor(className);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([]);
        this.ctx.strokeRect(x, y, width, height);
        
        // Semi-transparent fill
        this.ctx.fillStyle = color.replace('1)', '0.1)');
        this.ctx.fillRect(x, y, width, height);
        
        // Label background
        const labelText = `${className} ${Math.round(score * 100)}%`;
        const labelWidth = this.ctx.measureText(labelText).width + 10;
        const labelHeight = 20;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
        
        // Label text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(labelText, x + 5, y - labelHeight / 2);
    }
    
    /**
     * Detection sınıfına göre renk döndürür
     */
    getDetectionColor(className) {
        const colors = {
            'person': 'rgba(40, 167, 69, 1)',
            'car': 'rgba(0, 123, 255, 1)',
            'cat': 'rgba(255, 193, 7, 1)',
            'dog': 'rgba(253, 126, 20, 1)',
            'bottle': 'rgba(111, 66, 193, 1)',
            'cell phone': 'rgba(232, 62, 140, 1)',
            'laptop': 'rgba(32, 201, 151, 1)',
            'book': 'rgba(108, 117, 125, 1)',
            'cup': 'rgba(23, 162, 184, 1)',
            'default': 'rgba(108, 117, 125, 1)'
        };
        
        return colors[className] || colors['default'];
    }
    
    /**
     * Processing indicator çizer
     */
    drawProcessingIndicator() {
        if (!this.isProcessing) return;
        
        const size = 40;
        const x = this.canvasWidth - size - 10;
        const y = 10;
        
        // Background circle
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Spinning indicator
        const angle = (Date.now() / 10) % 360;
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 1)';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, y + size / 2, size / 2 - 5, 
                    angle * Math.PI / 180, 
                    (angle + 90) * Math.PI / 180);
        this.ctx.stroke();
        
        // Brain emoji
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🧠', x + size / 2, y + size / 2);
    }
    
    /**
     * Frame güncellemesini işler
     */
    updateFrame(frameData) {
        if (!this.isRunning) return;
        
        this.lastUpdate = Date.now();
        
        // Simulated grid activation based on frame
        this.simulateGridActivation(frameData);
    }
    
    /**
     * Grid aktivasyonunu simüle eder
     */
    simulateGridActivation(frameData) {
        // Her frame'de rastgele hücreleri aktive et
        const activationProbability = 0.1;
        
        this.cells.forEach(cell => {
            const shouldActivate = Math.random() < activationProbability;
            
            if (shouldActivate && cell.state === 'inactive') {
                this.activateCell(cell.id);
                
                // Belirli bir süre sonra deaktive et
                setTimeout(() => {
                    this.deactivateCell(cell.id);
                }, 1000 + Math.random() * 2000);
            }
        });
    }
    
    /**
     * Hücreyi aktive eder
     */
    activateCell(cellId) {
        const cell = this.cells[cellId];
        if (!cell) return;
        
        cell.state = 'active';
        cell.lastUpdate = Date.now();
        this.activeCells.add(cellId);
        
        // Animation class ekle
        this.addCellAnimation(cell, 'animate-cell-activation');
    }
    
    /**
     * Hücreyi deaktive eder
     */
    deactivateCell(cellId) {
        const cell = this.cells[cellId];
        if (!cell) return;
        
        cell.state = 'inactive';
        cell.confidence = 0;
        cell.detection = null;
        this.activeCells.delete(cellId);
    }
    
    /**
     * Detection'ları günceller
     */
    updateDetections(detections) {
        this.detections = detections;
        
        // Tüm hücreleri temizle
        this.cells.forEach(cell => {
            if (cell.state !== 'inactive') {
                cell.state = 'active';
                cell.confidence = 0;
                cell.detection = null;
            }
        });
        
        // Detection'ları grid hücrelerine map et
        detections.forEach(detection => {
            this.mapDetectionToGrid(detection);
        });
    }
    
    /**
     * Detection'ı grid hücrelerine map eder
     */
    mapDetectionToGrid(detection) {
        const { bbox, score } = detection;
        const [x, y, width, height] = bbox;
        
        // Detection'ın hangi hücreleri kapsadığını bul
        const affectedCells = this.getCellsInBoundingBox(x, y, width, height);
        
        affectedCells.forEach(cellId => {
            const cell = this.cells[cellId];
            if (!cell) return;
            
            // Hücrenin detection ile kesişim oranını hesapla
            const intersection = this.calculateIntersection(cell, {x, y, width, height});
            const intersectionRatio = intersection / (cell.width * cell.height);
            
            // Confidence'ı intersection ratio ile ağırlıklandır
            const adjustedConfidence = score * intersectionRatio;
            
            if (adjustedConfidence > cell.confidence) {
                cell.confidence = adjustedConfidence;
                cell.detection = detection;
                
                // Cell state'ini confidence'a göre belirle
                if (adjustedConfidence > 0.7) {
                    cell.state = 'confident';
                } else if (adjustedConfidence > 0.4) {
                    cell.state = 'detected';
                } else if (adjustedConfidence > 0.1) {
                    cell.state = 'detecting';
                }
            }
        });
    }
    
    /**
     * Bounding box içindeki hücreleri bulur
     */
    getCellsInBoundingBox(x, y, width, height) {
        const affectedCells = [];
        
        const startCol = Math.floor((x / this.canvasWidth) * this.gridSize);
        const endCol = Math.floor(((x + width) / this.canvasWidth) * this.gridSize);
        const startRow = Math.floor((y / this.canvasHeight) * this.gridSize);
        const endRow = Math.floor(((y + height) / this.canvasHeight) * this.gridSize);
        
        for (let row = Math.max(0, startRow); row <= Math.min(this.gridSize - 1, endRow); row++) {
            for (let col = Math.max(0, startCol); col <= Math.min(this.gridSize - 1, endCol); col++) {
                const cellId = row * this.gridSize + col;
                affectedCells.push(cellId);
            }
        }
        
        return affectedCells;
    }
    
    /**
     * İki rectangle'ın kesişim alanını hesaplar
     */
    calculateIntersection(cell, bbox) {
        const left = Math.max(cell.x, bbox.x);
        const top = Math.max(cell.y, bbox.y);
        const right = Math.min(cell.x + cell.width, bbox.x + bbox.width);
        const bottom = Math.min(cell.y + cell.height, bbox.y + bbox.height);
        
        if (left < right && top < bottom) {
            return (right - left) * (bottom - top);
        }
        
        return 0;
    }
    
    /**
     * Processing indicator'ı günceller
     */
    updateProcessingIndicator(isProcessing) {
        this.isProcessing = isProcessing;
    }
    
    /**
     * Grid boyutunu değiştirir
     */
    setGridSize(newSize) {
        this.gridSize = newSize;
        this.createGrid();
        console.log(`📏 Grid boyutu güncellendi: ${newSize}x${newSize}`);
    }
    
    /**
     * Confidence gösterimini toggle eder
     */
    setShowConfidence(show) {
        this.showConfidence = show;
    }
    
    /**
     * Canvas boyutunu günceller
     */
    resize() {
        if (!this.overlayCanvas) return;
        
        const rect = this.overlayCanvas.getBoundingClientRect();
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
        
        this.overlayCanvas.width = this.canvasWidth;
        this.overlayCanvas.height = this.canvasHeight;
        
        this.calculateCellPositions();
    }
    
    /**
     * Detection'ları temizler
     */
    clearDetections() {
        this.detections = [];
        this.cells.forEach(cell => {
            this.deactivateCell(cell.id);
        });
    }
    
    /**
     * Aktif hücre sayısını döndürür
     */
    getActiveCellCount() {
        return this.activeCells.size;
    }
    
    /**
     * Grid istatistiklerini döndürür
     */
    getGridStats() {
        const stats = {
            totalCells: this.cells.length,
            activeCells: this.activeCells.size,
            detectionCells: this.cells.filter(cell => cell.state === 'detected' || cell.state === 'confident').length,
            averageConfidence: 0,
            maxConfidence: 0
        };
        
        const confidences = this.cells
            .filter(cell => cell.confidence > 0)
            .map(cell => cell.confidence);
            
        if (confidences.length > 0) {
            stats.averageConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
            stats.maxConfidence = Math.max(...confidences);
        }
        
        return stats;
    }
    
    /**
     * Event handlers
     */
    handleResize() {
        this.resize();
    }
    
    handleMouseMove(event) {
        if (!this.debugMode) return;
        
        const rect = this.overlayCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Hangi hücrenin üzerinde olduğunu bul
        const cellCol = Math.floor((x / this.canvasWidth) * this.gridSize);
        const cellRow = Math.floor((y / this.canvasHeight) * this.gridSize);
        const cellId = cellRow * this.gridSize + cellCol;
        
        const cell = this.cells[cellId];
        if (cell) {
            console.log(`Cell ${cellId}: (${cellRow}, ${cellCol}) - State: ${cell.state}, Confidence: ${cell.confidence.toFixed(2)}`);
        }
    }
    
    handleClick(event) {
        if (!this.debugMode) return;
        
        const rect = this.overlayCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Debug için hücreyi toggle et
        const cellCol = Math.floor((x / this.canvasWidth) * this.gridSize);
        const cellRow = Math.floor((y / this.canvasHeight) * this.gridSize);
        const cellId = cellRow * this.gridSize + cellCol;
        
        const cell = this.cells[cellId];
        if (cell) {
            if (cell.state === 'inactive') {
                this.activateCell(cellId);
            } else {
                this.deactivateCell(cellId);
            }
        }
    }
    
    /**
     * Animation helper
     */
    addCellAnimation(cell, animationClass) {
        // Canvas-based animation (CSS animasyonları için DOM element gerekli)
        // Burada sadece state değişikliği yapıyoruz
        cell.animationStartTime = Date.now();
    }
    
    /**
     * Debug modunu toggle eder
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        console.log(`🐛 Debug mode: ${this.debugMode ? 'açık' : 'kapalı'}`);
    }
}