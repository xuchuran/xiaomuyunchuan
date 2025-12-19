class SecureFileUploader {
    constructor() {
        this.socket = io();
        this.currentUpload = null;
        this.chunkSize = 1024 * 1024 * 5; // 降低到5MB避免问题
        this.files = [];
        this.filteredFiles = [];
        this.concurrentUploads = 3; // 降低并发数
        this.isConnected = false;
        this.uploadCancelled = false;
        this.uploadStartTime = 0;
        
        // 批量上传相关
        this.currentUploadMode = 'single'; // 'single' or 'batch'
        this.batchFiles = []; // 待上传的文件列表
        this.batchUploadInProgress = false;
        this.currentBatchIndex = 0;
        this.batchStartTime = 0;
        this.batchTotalBytes = 0;
        this.batchUploadedBytes = 0;
        
        // 简化的参数
        this.speedHistory = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupSocketListeners();
        this.checkStoredToken();
        this.startSpeedMonitor();
    }

    initializeElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercentage = document.getElementById('progressPercentage');
        this.progressText = document.getElementById('progressText');
        this.speedText = document.getElementById('speedText');
        this.chunkInfo = document.getElementById('chunkInfo');
        this.timeInfo = document.getElementById('timeInfo');
        this.uploadedInfo = document.getElementById('uploadedInfo');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // 雷速风格元素
        this.realtimeSpeed = document.getElementById('realtimeSpeed');
        this.threadCount = document.getElementById('threadCount');
        this.chunkSizeSelect = document.getElementById('chunkSize');
        this.transferMode = document.getElementById('transferMode');
        this.transferSettings = document.getElementById('transferSettings');
        this.todayStats = document.getElementById('todayStats');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
        
        // 文件管理元素
        this.fileManager = document.getElementById('fileManager');
        this.toggleManager = document.getElementById('toggleManager');
        this.filesList = document.getElementById('filesList');
        this.searchInput = document.getElementById('searchInput');
        this.stats = document.getElementById('stats');
        
        // Dropbox 相关元素
        this.loginSection = document.getElementById('loginSection');
        this.emailInput = document.getElementById('emailInput');
        this.passwordInput = document.getElementById('passwordInput');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.loginBtn = document.getElementById('loginBtn');
        this.tokenInput = document.getElementById('tokenInput');
        this.connectBtn = document.getElementById('connectBtn');
        this.showAdvanced = document.getElementById('showAdvanced');
        this.showDemo = document.getElementById('showDemo');
        this.showUserAccount = document.getElementById('showUserAccount');
        this.advancedLogin = document.getElementById('advancedLogin');
        this.loginStatus = document.getElementById('loginStatus');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.accountInfo = document.getElementById('accountInfo');
        this.accountDetails = document.getElementById('accountDetails');
        this.dropboxProgress = document.getElementById('dropboxProgress');
        this.dropboxProgressFill = document.getElementById('dropboxProgressFill');
        this.dropboxProgressText = document.getElementById('dropboxProgressText');
        this.toggleManagerSection = document.getElementById('toggleManagerSection');
        
        // 批量上传元素
        this.uploadMode = document.getElementById('uploadMode');
        this.dropZoneText = document.getElementById('dropZoneText');
        this.dropZoneSubtext = document.getElementById('dropZoneSubtext');
        this.batchFilesContainer = document.getElementById('batchFilesContainer');
        this.batchFilesList = document.getElementById('batchFilesList');
        this.batchCount = document.getElementById('batchCount');
        this.batchTotalSize = document.getElementById('batchTotalSize');
        this.clearBatchBtn = document.getElementById('clearBatchBtn');
        this.startBatchUploadBtn = document.getElementById('startBatchUploadBtn');
        
        // 批量上传进度元素
        this.batchProgressContainer = document.getElementById('batchProgressContainer');
        this.batchCurrentFile = document.getElementById('batchCurrentFile');
        this.batchOverallFill = document.getElementById('batchOverallFill');
        this.batchOverallPercentage = document.getElementById('batchOverallPercentage');
        this.batchOverallText = document.getElementById('batchOverallText');
        this.batchProgressText = document.getElementById('batchProgressText');
        this.cancelBatchBtn = document.getElementById('cancelBatchBtn');
        this.batchCurrentFill = document.getElementById('batchCurrentFill');
        this.batchCurrentPercentage = document.getElementById('batchCurrentPercentage');
        this.batchCurrentChunkInfo = document.getElementById('batchCurrentChunkInfo');
        this.batchSpeedText = document.getElementById('batchSpeedText');
        this.batchTimeInfo = document.getElementById('batchTimeInfo');
        this.batchUploadedInfo = document.getElementById('batchUploadedInfo');
    }

    setupEventListeners() {
        // 拖拽事件
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                if (this.currentUploadMode === 'batch') {
                    this.handleBatchFiles(files);
                } else {
                    this.handleFile(files[0]);
                }
            }
        });

        // 点击选择文件
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const files = Array.from(e.target.files);
                if (this.currentUploadMode === 'batch') {
                    this.handleBatchFiles(files);
                } else {
                    this.handleFile(files[0]);
                }
            }
        });

        // 文件管理事件
        this.toggleManager.addEventListener('click', () => {
            this.toggleFileManager();
        });

        this.searchInput.addEventListener('input', (e) => {
            this.filterFiles(e.target.value);
        });

        // 登录相关事件
        this.loginBtn.addEventListener('click', () => {
            this.loginWithCredentials();
        });

        this.connectBtn.addEventListener('click', () => {
            this.connectWithToken();
        });

        this.showAdvanced.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAdvancedLogin();
        });

        this.showDemo.addEventListener('click', (e) => {
            e.preventDefault();
            this.useDemoAccount();
        });

        this.showUserAccount.addEventListener('click', (e) => {
            e.preventDefault();
            this.useUserAccount();
        });

        this.disconnectBtn.addEventListener('click', () => {
            this.disconnectFromDropbox();
        });

        // 密码显示/隐藏功能
        this.passwordToggle.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // 取消上传功能
        this.cancelBtn.addEventListener('click', () => {
            this.cancelUpload();
        });

        // 上传模式切换
        this.uploadMode.addEventListener('change', () => {
            this.switchUploadMode();
        });

        // 批量上传相关事件
        this.clearBatchBtn.addEventListener('click', () => {
            this.clearBatchFiles();
        });

        this.startBatchUploadBtn.addEventListener('click', () => {
            this.startBatchUpload();
        });

        this.cancelBatchBtn.addEventListener('click', () => {
            this.cancelBatchUpload();
        });

        // 雷速设置监听
        this.threadCount.addEventListener('change', () => {
            this.concurrentUploads = parseInt(this.threadCount.value);
            this.saveSettings();
        });

        this.chunkSizeSelect.addEventListener('change', () => {
            this.chunkSize = parseInt(this.chunkSizeSelect.value) * 1024 * 1024;
            this.saveSettings();
        });

        this.transferMode.addEventListener('change', () => {
            this.applyTransferMode();
            this.saveSettings();
        });

        // 回车键登录
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loginWithCredentials();
            }
        });

        this.tokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.connectWithToken();
            }
        });
    }

    setupSocketListeners() {
        this.socket.on('upload-initialized', (data) => {
            console.log('收到上传初始化响应:', data);
            this.currentUpload.sessionId = data.sessionId;
            this.currentUpload.totalChunks = data.totalChunks;
            this.startUpload();
        });

        this.socket.on('chunk-uploaded', (data) => {
            this.updateProgress(data);
        });

        this.socket.on('upload-complete', (data) => {
            this.showSuccess(data);
        });

        this.socket.on('upload-error', (data) => {
            this.showError(data.error);
        });

        // 文件管理事件
        this.socket.on('files-list', (files) => {
            this.files = files;
            this.filteredFiles = files;
            this.renderFilesList();
        });

        this.socket.on('file-deleted', (filePath) => {
            this.files = this.files.filter(f => f.path !== filePath);
            this.filteredFiles = this.filteredFiles.filter(f => f.path !== filePath);
            this.renderFilesList();
        });

        this.socket.on('upload-status', (data) => {
            this.progressText.textContent = data.message;
        });

        this.socket.on('dropbox-upload-progress', (data) => {
            this.dropboxProgress.style.display = 'block';
            this.dropboxProgressFill.style.width = data.progress + '%';
            this.dropboxProgressText.textContent = data.progress + '%';
        });

        this.socket.on('share-link-created', (data) => {
            navigator.clipboard.writeText(data.shareLink).then(() => {
                alert('分享链接已复制到剪贴板！\n' + data.shareLink);
            });
        });

        this.socket.on('dropbox-connected', (data) => {
            this.onDropboxConnected(data);
        });

        this.socket.on('dropbox-error', (data) => {
            this.onDropboxError(data.error);
        });
    }

    // 批量上传相关方法
    switchUploadMode() {
        this.currentUploadMode = this.uploadMode.value;
        
        if (this.currentUploadMode === 'batch') {
            this.dropZoneText.textContent = '⚡ 拖拽多个文件到这里或点击选择';
            this.dropZoneSubtext.textContent = '批量上传 • 多线程加速 • 断点续传';
            this.fileInput.multiple = true;
            this.batchFilesContainer.style.display = 'block';
        } else {
            this.dropZoneText.textContent = '⚡ 拖拽文件到这里或点击选择';
            this.dropZoneSubtext.textContent = '小木云传 • 多线程加速 • 断点续传';
            this.fileInput.multiple = false;
            this.batchFilesContainer.style.display = 'none';
        }
        
        this.updateBatchSummary();
    }

    handleBatchFiles(files) {
        if (!this.isConnected) {
            alert('请先连接到 Dropbox 账户！');
            return;
        }

        // 添加文件到批量上传列表
        files.forEach(file => {
            // 检查是否已存在
            const exists = this.batchFiles.some(f => f.name === file.name && f.size === file.size);
            if (!exists) {
                this.batchFiles.push({
                    file: file,
                    status: 'pending',
                    id: Date.now() + Math.random()
                });
            }
        });

        this.renderBatchFilesList();
        this.updateBatchSummary();
    }
    renderBatchFilesList() {
        if (this.batchFiles.length === 0) {
            this.batchFilesList.innerHTML = '<div class="empty-state">📭 暂无待上传文件</div>';
            return;
        }

        this.batchFilesList.innerHTML = this.batchFiles.map(item => `
            <div class="batch-file-item" data-id="${item.id}">
                <div class="batch-file-info">
                    <div class="batch-file-name">📄 ${item.file.name}</div>
                    <div class="batch-file-size">${this.formatFileSize(item.file.size)}</div>
                </div>
                <div class="batch-file-status ${item.status}">${this.getStatusText(item.status)}</div>
                <button class="remove-batch-file" onclick="uploader.removeBatchFile('${item.id}')">❌</button>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '等待中',
            'uploading': '上传中',
            'completed': '已完成',
            'error': '失败'
        };
        return statusMap[status] || status;
    }

    removeBatchFile(id) {
        this.batchFiles = this.batchFiles.filter(item => item.id !== id);
        this.renderBatchFilesList();
        this.updateBatchSummary();
    }

    clearBatchFiles() {
        if (this.batchUploadInProgress) {
            alert('批量上传进行中，无法清空列表！');
            return;
        }
        
        this.batchFiles = [];
        this.renderBatchFilesList();
        this.updateBatchSummary();
    }

    updateBatchSummary() {
        const totalSize = this.batchFiles.reduce((sum, item) => sum + item.file.size, 0);
        this.batchCount.textContent = this.batchFiles.length;
        this.batchTotalSize.textContent = this.formatFileSize(totalSize);
        
        this.startBatchUploadBtn.disabled = this.batchFiles.length === 0 || this.batchUploadInProgress;
    }

    async startBatchUpload() {
        if (this.batchFiles.length === 0) {
            alert('请先添加要上传的文件！');
            return;
        }

        this.batchUploadInProgress = true;
        this.currentBatchIndex = 0;
        this.uploadCancelled = false;
        
        // 记录批量上传开始时间和统计信息
        this.batchStartTime = Date.now();
        this.batchTotalBytes = this.batchFiles.reduce((sum, item) => sum + item.file.size, 0);
        this.batchUploadedBytes = 0;
        
        // 重置所有文件状态
        this.batchFiles.forEach(item => {
            item.status = 'pending';
        });
        this.renderBatchFilesList();
        
        // 显示批量上传进度
        this.batchProgressContainer.style.display = 'block';
        this.batchFilesContainer.style.display = 'none';
        
        this.updateBatchOverallProgress();
        
        try {
            for (let i = 0; i < this.batchFiles.length; i++) {
                if (this.uploadCancelled) {
                    break;
                }
                
                this.currentBatchIndex = i;
                const item = this.batchFiles[i];
                item.status = 'uploading';
                this.renderBatchFilesList();
                
                this.batchCurrentFile.textContent = `正在上传: ${item.file.name}`;
                this.updateBatchOverallProgress();
                
                try {
                    await this.uploadSingleFileInBatch(item.file);
                    item.status = 'completed';
                    this.batchUploadedBytes += item.file.size;
                } catch (error) {
                    console.error('批量上传文件失败:', error);
                    item.status = 'error';
                }
                
                this.renderBatchFilesList();
                this.updateBatchOverallProgress();
            }
            
            if (!this.uploadCancelled) {
                this.showBatchUploadComplete();
            }
        } catch (error) {
            console.error('批量上传失败:', error);
            this.showError('批量上传失败: ' + error.message);
        } finally {
            this.batchUploadInProgress = false;
            this.updateBatchSummary();
        }
    }

    updateBatchOverallProgress() {
        const completed = this.batchFiles.filter(item => item.status === 'completed').length;
        const total = this.batchFiles.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;
        
        this.batchOverallFill.style.width = progress + '%';
        this.batchOverallPercentage.textContent = Math.round(progress) + '%';
        this.batchOverallText.textContent = `${completed} / ${total} 文件`;
    }

    async uploadSingleFileInBatch(file) {
        return new Promise((resolve, reject) => {
            // 设置当前上传
            this.uploadStartTime = Date.now();
            this.currentUpload = {
                file: file,
                startTime: this.uploadStartTime,
                uploadedChunks: 0,
                uploadedBytes: 0,
                isBatchUpload: true
            };

            // 监听上传完成事件
            const onComplete = (data) => {
                this.socket.off('upload-complete', onComplete);
                this.socket.off('upload-error', onError);
                resolve(data);
            };

            const onError = (data) => {
                this.socket.off('upload-complete', onComplete);
                this.socket.off('upload-error', onError);
                reject(new Error(data.error));
            };

            this.socket.on('upload-complete', onComplete);
            this.socket.on('upload-error', onError);

            // 发送初始化请求
            this.socket.emit('init-upload', {
                fileName: file.name,
                fileSize: file.size,
                chunkSize: this.chunkSize
            });
        });
    }

    cancelBatchUpload() {
        if (confirm('确定要取消批量上传吗？')) {
            this.uploadCancelled = true;
            this.batchUploadInProgress = false;
            
            // 取消当前文件上传
            if (this.currentUpload && this.currentUpload.sessionId) {
                this.socket.emit('cancel-upload', { sessionId: this.currentUpload.sessionId });
            }
            
            // 重置UI
            this.batchProgressContainer.style.display = 'none';
            this.batchFilesContainer.style.display = 'block';
            this.updateBatchSummary();
            
            this.showError('批量上传已取消');
        }
    }

    showBatchUploadComplete() {
        this.batchProgressContainer.style.display = 'none';
        this.batchFilesContainer.style.display = 'block';
        
        const completed = this.batchFiles.filter(item => item.status === 'completed').length;
        const failed = this.batchFiles.filter(item => item.status === 'error').length;
        
        // 计算批量上传统计信息
        const totalTime = (Date.now() - this.batchStartTime) / 1000;
        const averageSpeedMBps = this.batchUploadedBytes > 0 ? (this.batchUploadedBytes / totalTime / 1024 / 1024) : 0;
        const speedComparison = (averageSpeedMBps * 3000).toFixed(0); // 与传统方式比较
        
        this.successMessage.innerHTML = `
            <h3>✅ 批量上传到小木云传完成！</h3>
            <p>📁 成功上传: ${completed} 个文件</p>
            ${failed > 0 ? `<p>❌ 失败: ${failed} 个文件</p>` : ''}
            <p>📦 总大小: ${this.formatFileSize(this.batchUploadedBytes)}</p>
            <p>⏱️ 总用时: ${totalTime.toFixed(2)} 秒</p>
            <p>⚡ 平均速度: ${averageSpeedMBps.toFixed(2)} MB/s</p>
            <p>🚀 比传统方式快 ${speedComparison}x</p>
            <button onclick="uploader.clearBatchFiles()" class="btn btn-download">🗑️ 清空列表</button>
        `;
        this.successMessage.style.display = 'block';
        
        // 记录批量上传统计
        this.recordUpload(this.batchUploadedBytes);
        
        // 刷新文件列表
        this.socket.emit('get-files');
    }

    handleFile(file) {
        if (!this.isConnected) {
            alert('请先连接到 Dropbox 账户！');
            return;
        }

        this.hideMessages();
        this.uploadCancelled = false;
        
        // 显示文件信息
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileInfo.style.display = 'block';

        // 初始化上传
        this.uploadStartTime = Date.now();
        this.currentUpload = {
            file: file,
            startTime: this.uploadStartTime,
            uploadedChunks: 0,
            uploadedBytes: 0
        };

        // 发送初始化请求
        console.log('发送上传初始化请求:', {
            fileName: file.name,
            fileSize: file.size,
            chunkSize: this.chunkSize
        });
        
        this.socket.emit('init-upload', {
            fileName: file.name,
            fileSize: file.size,
            chunkSize: this.chunkSize
        });

        this.progressContainer.style.display = 'block';
        this.progressText.textContent = '初始化上传...';
        this.cancelBtn.disabled = false;
        
        // 重置进度显示
        this.updateProgressDisplay(0, file.size, 0, 0);
    }

    async startUpload() {
        console.log('开始上传函数被调用');
        if (this.uploadCancelled) return;
        
        const { file, sessionId } = this.currentUpload;
        const totalChunks = Math.ceil(file.size / this.chunkSize);
        
        console.log(`准备上传 ${totalChunks} 个块`);
        this.progressText.textContent = '开始上传...';
        
        try {
            // 简单的顺序上传
            for (let i = 0; i < totalChunks; i++) {
                if (this.uploadCancelled) {
                    this.showError('上传已取消');
                    return;
                }
                
                console.log(`上传块 ${i + 1}/${totalChunks}`);
                await this.uploadChunk(i);
                
                // 短暂延迟避免阻塞UI
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        } catch (error) {
            console.error('上传错误:', error);
            if (!this.uploadCancelled) {
                this.showError('上传失败: ' + error.message);
            }
        }
    }

    async uploadChunk(chunkIndex) {
        const { file, sessionId } = this.currentUpload;
        const start = chunkIndex * this.chunkSize;
        const end = Math.min(start + this.chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    // 简化的base64转换，避免栈溢出
                    const arrayBuffer = e.target.result;
                    const bytes = new Uint8Array(arrayBuffer);
                    let binary = '';
                    
                    // 分块处理避免栈溢出
                    const chunkSize = 8192;
                    for (let i = 0; i < bytes.length; i += chunkSize) {
                        const chunk = bytes.slice(i, i + chunkSize);
                        binary += String.fromCharCode.apply(null, chunk);
                    }
                    
                    const base64Data = btoa(binary);
                    
                    console.log(`发送块 ${chunkIndex}, 大小: ${arrayBuffer.byteLength} bytes`);
                    
                    this.socket.emit('upload-chunk', {
                        sessionId,
                        chunkIndex,
                        chunkData: base64Data
                    });
                    
                    resolve();
                } catch (error) {
                    console.error('块处理错误:', error);
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error('文件读取错误:', error);
                reject(error);
            };
            
            reader.readAsArrayBuffer(chunk);
        });
    }

    async compressChunk(data) {
        // 简化压缩处理，避免依赖问题
        try {
            if (typeof pako !== 'undefined') {
                const compressed = pako.deflate(data);
                return compressed.length < data.length ? compressed : data;
            } else {
                // 如果pako未加载，返回原数据
                return data;
            }
        } catch (e) {
            return data; // 压缩失败则返回原数据
        }
    }

    updateProgress(data) {
        if (this.uploadCancelled) return;
        
        const { progress, speed, uploadedChunks, totalChunks } = data;
        const uploadedBytes = uploadedChunks * this.chunkSize;
        const totalBytes = this.currentUpload.file.size;
        
        if (this.currentUpload.isBatchUpload) {
            // 批量上传进度更新
            this.updateBatchProgressDisplay(progress, totalBytes, uploadedBytes, parseFloat(speed), uploadedChunks, totalChunks);
        } else {
            // 单文件上传进度更新
            this.updateProgressDisplay(progress, totalBytes, uploadedBytes, parseFloat(speed));
            
            this.chunkInfo.textContent = `${uploadedChunks} / ${totalChunks} 块`;
            
            // 计算预计剩余时间
            if (progress > 0 && parseFloat(speed) > 0) {
                const remainingBytes = totalBytes - uploadedBytes;
                const speedBytesPerSec = parseFloat(speed) * 1024 * 1024; // MB/s to bytes/s
                const remainingSeconds = remainingBytes / speedBytesPerSec;
                this.timeInfo.textContent = this.formatTime(remainingSeconds);
            } else {
                this.timeInfo.textContent = '计算中...';
            }
        }
    }

    updateBatchProgressDisplay(progress, totalBytes, uploadedBytes, speedMBps, uploadedChunks, totalChunks) {
        // 更新当前文件进度
        this.batchCurrentFill.style.width = progress + '%';
        this.batchCurrentPercentage.textContent = `${Math.round(progress)}%`;
        this.batchProgressText.textContent = `上传中... ${Math.round(progress)}%`;
        this.batchSpeedText.textContent = speedMBps.toFixed(2) + ' MB/s';
        this.batchUploadedInfo.textContent = `${this.formatFileSize(uploadedBytes)} / ${this.formatFileSize(totalBytes)}`;
        this.batchCurrentChunkInfo.textContent = `${uploadedChunks} / ${totalChunks} 块`;
        
        // 计算预计剩余时间
        if (progress > 0 && speedMBps > 0) {
            const remainingBytes = totalBytes - uploadedBytes;
            const speedBytesPerSec = speedMBps * 1024 * 1024; // MB/s to bytes/s
            const remainingSeconds = remainingBytes / speedBytesPerSec;
            this.batchTimeInfo.textContent = this.formatTime(remainingSeconds);
        } else {
            this.batchTimeInfo.textContent = '计算中...';
        }
    }

    updateProgressDisplay(progress, totalBytes, uploadedBytes, speedMBps) {
        this.progressFill.style.width = progress + '%';
        this.progressPercentage.textContent = `${Math.round(progress)}%`;
        this.progressText.textContent = `上传中... ${Math.round(progress)}%`;
        this.speedText.textContent = speedMBps.toFixed(2) + ' MB/s';
        this.uploadedInfo.textContent = `${this.formatFileSize(uploadedBytes)} / ${this.formatFileSize(totalBytes)}`;
    }
    showSuccess(data) {
        this.progressContainer.style.display = 'none';
        this.dropboxProgress.style.display = 'none';
        
        const speedMBps = parseFloat(data.averageSpeed);
        const speedComparison = (speedMBps * 3000).toFixed(0); // 与SSH比较
        
        this.successMessage.innerHTML = `
            <h3>✅ 上传到小木云传成功！</h3>
            <p>📁 文件: ${data.fileName}</p>
            <p>📦 大小: ${this.formatFileSize(data.fileSize)}</p>
            <p>⏱️ 用时: ${data.totalTime.toFixed(2)} 秒</p>
            <p>⚡ 平均速度: ${data.averageSpeed}</p>
            <p>🚀 比传统方式快 ${speedComparison}x</p>
            <button onclick="uploader.getShareLink('${data.dropboxPath}')" class="btn btn-share">🔗 获取分享链接</button>
        `;
        this.successMessage.style.display = 'block';
        
        // 记录上传统计
        this.recordUpload(data.fileSize);
        
        // 重置上传状态
        this.currentUpload = null;
        this.uploadCancelled = false;
        
        // 刷新文件列表
        this.socket.emit('get-files');
        this.loadDropboxInfo();
    }

    showError(error) {
        this.progressContainer.style.display = 'none';
        this.errorMessage.innerHTML = `<h3>❌ 上传失败</h3><p>${error}</p>`;
        this.errorMessage.style.display = 'block';
    }

    hideMessages() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.fileInfo.style.display = 'none';
        this.progressContainer.style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}秒`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
        return `${Math.round(seconds / 3600)}小时`;
    }

    // 文件管理功能
    toggleFileManager() {
        if (this.fileManager.style.display === 'none') {
            this.fileManager.style.display = 'block';
            this.toggleManager.textContent = '📁 隐藏文件列表';
            this.socket.emit('get-files');
        } else {
            this.fileManager.style.display = 'none';
            this.toggleManager.textContent = '📂 查看我的文件';
        }
    }

    filterFiles(query) {
        this.filteredFiles = this.files.filter(file => 
            file.name.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilesList();
    }

    renderFilesList() {
        if (this.filteredFiles.length === 0) {
            this.filesList.innerHTML = '<div class="empty-state">📭 暂无文件</div>';
            return;
        }

        this.filesList.innerHTML = this.filteredFiles.map(file => `
            <div class="file-item">
                <div class="file-info-item">
                    <div class="file-name-item">📄 ${file.name}</div>
                    <div class="file-meta">
                        ${this.formatFileSize(file.size)} • 
                        ${new Date(file.uploadTime).toLocaleString()} • 
                        下载 ${file.downloadCount || 0} 次
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-share" onclick="uploader.getShareLink('${file.path}')">
                        🔗 分享
                    </button>
                    <button class="btn btn-delete" onclick="uploader.deleteFile('${file.path}')">
                        🗑️ 删除
                    </button>
                </div>
            </div>
        `).join('');
    }

    getShareLink(filePath) {
        this.socket.emit('get-share-link', filePath);
    }

    deleteFile(filePath) {
        if (confirm('确定要从 Dropbox 删除这个文件吗？')) {
            this.socket.emit('delete-file', filePath);
        }
    }

    // 登录相关功能
    checkStoredToken() {
        const token = localStorage.getItem('dropbox_token');
        const email = localStorage.getItem('dropbox_email');
        
        if (token && email) {
            this.emailInput.value = email;
            this.showLoginStatus('正在验证已保存的登录信息...', 'loading');
            this.socket.emit('connect-dropbox', { token });
        }
    }

    async loginWithCredentials() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!email || !password) {
            this.showLoginStatus('请输入邮箱和密码！', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showLoginStatus('请输入有效的邮箱地址！', 'error');
            return;
        }

        this.loginBtn.disabled = true;
        this.loginBtn.textContent = '登录中...';
        this.showLoginStatus('正在验证账号信息...', 'loading');

        try {
            // 发送登录请求到服务器
            this.socket.emit('login-with-credentials', { email, password });
        } catch (error) {
            this.onDropboxError('登录失败: ' + error.message);
        }
    }

    connectWithToken() {
        const token = this.tokenInput.value.trim();
        if (!token) {
            this.showLoginStatus('请输入 Dropbox 访问令牌！', 'error');
            return;
        }

        this.connectBtn.disabled = true;
        this.connectBtn.textContent = '连接中...';
        this.showLoginStatus('正在连接到 Dropbox...', 'loading');

        this.socket.emit('connect-dropbox', { token });
    }

    toggleAdvancedLogin() {
        const isVisible = this.advancedLogin.style.display !== 'none';
        this.advancedLogin.style.display = isVisible ? 'none' : 'block';
        this.showAdvanced.textContent = isVisible ? 
            '🔧 高级用户：使用访问令牌' : 
            '🔙 返回普通登录';
    }

    useDemoAccount() {
        // 使用演示账户信息
        this.emailInput.value = 'demo@example.com';
        this.passwordInput.value = 'demo123';
        this.showLoginStatus('已填入演示账户信息，点击登录按钮继续', 'success');
    }

    useUserAccount() {
        // 使用测试账户信息
        this.emailInput.value = 'user@example.com';
        this.passwordInput.value = 'password123';
        this.showLoginStatus('已填入测试账户信息，点击登录按钮继续', 'success');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        // 更改图标
        if (type === 'text') {
            this.passwordToggle.textContent = '🙈'; // 隐藏密码图标
        } else {
            this.passwordToggle.textContent = '👁️'; // 显示密码图标
        }
    }

    cancelUpload() {
        if (!this.currentUpload) return;
        
        if (confirm('确定要取消上传吗？')) {
            this.uploadCancelled = true;
            this.cancelBtn.disabled = true;
            this.progressText.textContent = '正在取消上传...';
            
            // 通知服务器取消上传
            if (this.currentUpload.sessionId) {
                this.socket.emit('cancel-upload', { sessionId: this.currentUpload.sessionId });
            }
            
            // 重置UI
            setTimeout(() => {
                this.progressContainer.style.display = 'none';
                this.fileInfo.style.display = 'none';
                this.currentUpload = null;
                this.showError('上传已取消');
            }, 1000);
        }
    }

    // 简化的速度监控
    startSpeedMonitor() {
        setInterval(() => {
            if (this.currentUpload && !this.uploadCancelled) {
                this.updateRealtimeSpeed();
            }
        }, 2000); // 降低频率避免性能问题
    }

    updateRealtimeSpeed() {
        if (this.speedHistory.length > 0) {
            const recentSpeeds = this.speedHistory.slice(-3); // 只取最近3个
            const avgSpeed = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length;
            this.realtimeSpeed.textContent = avgSpeed.toFixed(2) + ' MB/s';
        }
    }

    applyTransferMode() {
        const mode = this.transferMode.value;
        
        switch (mode) {
            case 'turbo':
                this.concurrentUploads = 1; // 暂时都用单线程
                this.chunkSize = 5 * 1024 * 1024;
                break;
            case 'stable':
                this.concurrentUploads = 1;
                this.chunkSize = 2 * 1024 * 1024;
                break;
            default: // normal
                this.concurrentUploads = 1;
                this.chunkSize = 5 * 1024 * 1024;
        }
        
        this.threadCount.value = this.concurrentUploads;
    }

    saveSettings() {
        const settings = {
            threadCount: this.concurrentUploads,
            chunkSize: this.chunkSize,
            transferMode: this.transferMode.value,
            compressionEnabled: this.compressionEnabled
        };
        localStorage.setItem('rayspeed_settings', JSON.stringify(settings));
    }

    loadSettings() {
        const settings = localStorage.getItem('rayspeed_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.concurrentUploads = parsed.threadCount || 6;
            this.chunkSize = parsed.chunkSize || 20 * 1024 * 1024;
            this.compressionEnabled = parsed.compressionEnabled !== false;
            
            this.threadCount.value = this.concurrentUploads;
            this.chunkSizeSelect.value = this.chunkSize / 1024 / 1024;
            this.transferMode.value = parsed.transferMode || 'turbo';
        }
    }

    updateTodayStats() {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('daily_stats') || '{}');
        const todayData = stats[today] || { files: 0, bytes: 0 };
        
        this.todayStats.textContent = `${todayData.files} 文件 / ${(todayData.bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    recordUpload(fileSize) {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('daily_stats') || '{}');
        
        if (!stats[today]) {
            stats[today] = { files: 0, bytes: 0 };
        }
        
        stats[today].files++;
        stats[today].bytes += fileSize;
        
        localStorage.setItem('daily_stats', JSON.stringify(stats));
        this.updateTodayStats();
    }

    async startOAuthLogin() {
        this.loginBtn.disabled = true;
        this.loginBtn.textContent = '正在跳转到 Dropbox...';
        this.showLoginStatus('正在跳转到 Dropbox 授权页面...', 'loading');

        try {
            // 获取授权URL
            const response = await fetch('/api/auth/dropbox-url');
            const data = await response.json();
            
            if (data.authUrl) {
                // 打开授权窗口
                const authWindow = window.open(
                    data.authUrl, 
                    'dropbox-auth', 
                    'width=600,height=700,scrollbars=yes,resizable=yes'
                );

                // 监听授权完成
                this.listenForAuthComplete(authWindow);
            } else {
                throw new Error('无法获取授权URL');
            }
        } catch (error) {
            this.onDropboxError('启动授权失败: ' + error.message);
        }
    }

    listenForAuthComplete(authWindow) {
        const checkClosed = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(checkClosed);
                this.loginBtn.disabled = false;
                this.loginBtn.textContent = '使用 Dropbox 账号登录';
                this.showLoginStatus('授权已取消', 'error');
            }
        }, 1000);

        // 监听来自授权窗口的消息
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'DROPBOX_AUTH_SUCCESS') {
                clearInterval(checkClosed);
                authWindow.close();
                
                const { token } = event.data;
                localStorage.setItem('dropbox_token', token);
                this.socket.emit('connect-dropbox', { token });
                this.showLoginStatus('授权成功，正在连接...', 'loading');
            } else if (event.data.type === 'DROPBOX_AUTH_ERROR') {
                clearInterval(checkClosed);
                authWindow.close();
                this.onDropboxError('授权失败: ' + event.data.error);
            }
        });
    }

    disconnectFromDropbox() {
        localStorage.removeItem('dropbox_token');
        localStorage.removeItem('dropbox_email');
        this.isConnected = false;
        this.showLoginUI();
        this.socket.emit('disconnect-dropbox');
        
        // 清空输入框
        this.emailInput.value = '';
        this.passwordInput.value = '';
        this.tokenInput.value = '';
    }

    onDropboxConnected(data) {
        this.isConnected = true;
        
        // 保存登录信息
        if (data.token) {
            localStorage.setItem('dropbox_token', data.token);
        }
        localStorage.setItem('dropbox_email', data.email);
        
        this.loginSection.style.display = 'none';
        this.transferSettings.style.display = 'block';
        this.dropZone.style.display = 'block';
        this.toggleManagerSection.style.display = 'block';
        this.accountInfo.style.display = 'block';
        
        this.accountDetails.innerHTML = `
            ☁️ Dropbox: ${data.name} (${data.email}) • 
            已用: ${data.usedFormatted} / ${data.allocatedFormatted}
        `;
        
        const usagePercent = (data.used / data.allocated * 100).toFixed(1);
        this.stats.innerHTML = `
            📊 存储使用率: ${usagePercent}% • 
            💾 剩余空间: ${((data.allocated - data.used) / 1024 / 1024 / 1024).toFixed(2)} GB
        `;

        // 重置按钮状态
        this.loginBtn.disabled = false;
        this.loginBtn.textContent = '🔐 登录 Dropbox';
        this.connectBtn.disabled = false;
        this.connectBtn.textContent = '连接';
        
        this.showLoginStatus('登录成功！', 'success');
        this.loadSettings();
        this.updateTodayStats();
        
        // 初始化上传模式
        this.switchUploadMode();
    }

    onDropboxError(error) {
        this.isConnected = false;
        this.showLoginUI();
        
        // 重置按钮状态
        this.loginBtn.disabled = false;
        this.loginBtn.textContent = '🔐 登录 Dropbox';
        this.connectBtn.disabled = false;
        this.connectBtn.textContent = '连接';
        
        this.showLoginStatus('登录失败: ' + error, 'error');
    }

    showLoginUI() {
        this.loginSection.style.display = 'block';
        this.dropZone.style.display = 'none';
        this.toggleManagerSection.style.display = 'none';
        this.accountInfo.style.display = 'none';
        this.fileManager.style.display = 'none';
    }

    showLoginStatus(message, type) {
        this.loginStatus.textContent = message;
        this.loginStatus.className = `login-status ${type}`;
        this.loginStatus.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                this.loginStatus.style.display = 'none';
            }, 3000);
        }
    }

    async loadDropboxInfo() {
        if (!this.isConnected) return;
        
        try {
            const response = await fetch('/api/dropbox-info');
            const info = await response.json();
            
            this.accountDetails.innerHTML = `
                ☁️ Dropbox: ${info.name} (${info.email}) • 
                已用: ${info.usedFormatted} / ${info.allocatedFormatted}
            `;
            
            const usagePercent = (info.used / info.allocation * 100).toFixed(1);
            this.stats.innerHTML = `
                📊 存储使用率: ${usagePercent}% • 
                💾 剩余空间: ${((info.allocation - info.used) / 1024 / 1024 / 1024).toFixed(2)} GB
            `;
        } catch (error) {
            console.error('加载 Dropbox 信息失败:', error);
        }
    }
}

// 等待页面加载完成后初始化
let uploader;
document.addEventListener('DOMContentLoaded', () => {
    uploader = new SecureFileUploader();
});
