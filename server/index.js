<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 小木云传 - 高速文件上传器</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 90%;
        }

        .header-section {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
        }

        .title {
            color: #333;
            margin-bottom: 15px;
            font-size: 2.8em;
            font-weight: 700;
            background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        .rocket-icon {
            font-size: 1.2em;
            background: linear-gradient(45deg, #ff6b6b, #ffa500, #ff1744, #ff9800);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: rocketPulse 2s ease-in-out infinite, rocketFloat 3s ease-in-out infinite;
            filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.5));
            transform-origin: center;
        }

        @keyframes rocketPulse {
            0%, 100% { 
                transform: scale(1);
                filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.5));
            }
            50% { 
                transform: scale(1.1);
                filter: drop-shadow(0 0 20px rgba(255, 107, 107, 0.8));
            }
        }

        @keyframes rocketFloat {
            0%, 100% { 
                transform: translateY(0px) rotate(-5deg);
            }
            50% { 
                transform: translateY(-5px) rotate(5deg);
            }
        }

        .rocket-icon-small {
            background: linear-gradient(45deg, #ff6b6b, #ffa500, #ff1744);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: rocketPulse 2s ease-in-out infinite;
            filter: drop-shadow(0 0 5px rgba(255, 107, 107, 0.4));
            display: inline-block;
            margin-right: 8px;
        }

        .subtitle {
            color: #666;
            margin-bottom: 25px;
            font-size: 1.2em;
            font-weight: 500;
        }

        .speed-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
            50% { box-shadow: 0 4px 25px rgba(102, 126, 234, 0.5); }
            100% { box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
        }

        .badge-label {
            font-size: 0.9em;
            opacity: 0.9;
        }

        .badge-value {
            font-size: 1.3em;
            font-weight: 700;
        }

        .drop-zone {
            border: 3px dashed #667eea;
            border-radius: 15px;
            padding: 60px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f8f9ff;
            margin-bottom: 30px;
        }

        .drop-zone:hover, .drop-zone.dragover {
            border-color: #764ba2;
            background: #f0f2ff;
            transform: translateY(-2px);
        }

        .drop-zone-text {
            font-size: 1.2em;
            color: #667eea;
            margin-bottom: 10px;
        }

        .drop-zone-subtext {
            color: #999;
            font-size: 0.9em;
        }

        .file-input {
            display: none;
        }

        .progress-container {
            display: none;
            margin-top: 30px;
            background: #f8f9ff;
            padding: 25px;
            border-radius: 15px;
            border: 2px solid #e0e0e0;
        }

        .upload-controls {
            margin-bottom: 20px;
        }

        .upload-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .cancel-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background-color 0.3s;
        }

        .cancel-btn:hover {
            background: #c82333;
        }

        .cancel-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e0e0e0;
            border-radius: 15px;
            overflow: visible;
            margin-bottom: 20px;
            position: relative;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 15px;
            position: relative;
        }

        .progress-percentage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #333;
            font-weight: 700;
            font-size: 14px;
            text-shadow: 0 1px 2px rgba(255,255,255,0.8);
        }

        .upload-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            background: white;
            border-radius: 8px;
            font-size: 0.9em;
        }

        .detail-label {
            color: #666;
            font-weight: 500;
        }

        .speed-info {
            color: #667eea;
            font-weight: 700;
            font-size: 1.1em;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
        }

        .file-info {
            background: #f8f9ff;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
        }

        .file-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }

        .file-size {
            color: #666;
            font-size: 0.9em;
        }

        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            display: none;
            margin-top: 20px;
        }

        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            display: none;
            margin-top: 20px;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }

        .feature {
            text-align: center;
            padding: 20px;
            background: #f8f9ff;
            border-radius: 10px;
        }

        .feature-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .feature-text {
            color: #666;
            font-size: 0.9em;
        }

        .file-manager {
            margin-top: 40px;
            background: #f8f9ff;
            border-radius: 15px;
            padding: 30px;
        }

        .manager-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .manager-header h3 {
            color: #333;
            margin: 0;
        }

        .stats {
            color: #666;
            font-size: 0.9em;
        }

        .search-box {
            margin-bottom: 20px;
        }

        .search-box input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }

        .search-box input:focus {
            border-color: #667eea;
        }

        .files-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .file-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px;
            background: white;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }

        .file-item:hover {
            transform: translateY(-2px);
        }

        .file-info-item {
            flex: 1;
        }

        .file-name-item {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }

        .file-meta {
            color: #666;
            font-size: 0.8em;
        }

        .file-actions {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.3s;
        }

        .btn-download {
            background: #28a745;
            color: white;
        }

        .btn-download:hover {
            background: #218838;
        }

        .btn-share {
            background: #17a2b8;
            color: white;
        }

        .btn-share:hover {
            background: #138496;
        }

        .btn-delete {
            background: #dc3545;
            color: white;
        }

        .btn-delete:hover {
            background: #c82333;
        }

        .toggle-manager {
            text-align: center;
            margin-top: 20px;
        }

        .toggle-btn {
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }

        .toggle-btn:hover {
            background: #5a6fd8;
        }

        .empty-state {
            text-align: center;
            color: #999;
            padding: 40px;
        }

        .account-info {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
        }

        .account-details {
            color: #2e7d32;
            font-size: 0.9em;
        }

        .dropbox-progress {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
        }

        .status-message {
            background: #fff3cd;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            text-align: center;
            display: none;
        }

        .login-section {
            margin-bottom: 30px;
        }

        .login-card {
            background: #f8f9ff;
            border: 2px solid #667eea;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
        }

        .login-card h3 {
            color: #333;
            margin-bottom: 15px;
        }

        .login-card p {
            color: #666;
            margin-bottom: 25px;
        }

        .token-input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }

        .token-input-group input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
        }

        .token-input-group input:focus {
            border-color: #667eea;
        }

        .login-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 20px;
        }

        .input-group {
            width: 100%;
        }

        .input-group input {
            width: 100%;
            padding: 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }

        .input-group input:focus {
            border-color: #0061ff;
        }

        .password-group {
            position: relative;
        }

        .password-group input {
            padding-right: 50px;
        }

        .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            padding: 5px;
            border-radius: 4px;
            transition: background-color 0.3s;
        }

        .password-toggle:hover {
            background-color: #f0f0f0;
        }

        .password-toggle:active {
            background-color: #e0e0e0;
        }

        .login-btn {
            width: 100%;
            background: #0061ff;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.3s;
        }

        .login-btn:hover {
            background: #0051d5;
        }

        .login-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .divider {
            text-align: center;
            position: relative;
            margin: 20px 0;
        }

        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #e0e0e0;
        }

        .divider span {
            position: relative;
            background: #f8f9ff;
            padding: 0 15px;
            color: #666;
            font-size: 0.9em;
        }

        .advanced-login {
            margin-bottom: 15px;
        }

        .token-input-group {
            display: flex;
            gap: 10px;
        }

        .token-input-group input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
        }

        .connect-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }

        .connect-btn:hover {
            background: #5a6fd8;
        }

        .help-links {
            text-align: center;
            margin-top: 15px;
        }

        .help-links a {
            color: #667eea;
            text-decoration: none;
            font-size: 0.9em;
        }

        .help-links a:hover {
            text-decoration: underline;
        }

        .help-links span {
            color: #ccc;
        }

        .transfer-settings {
            background: linear-gradient(135deg, #f8f9ff, #e8f0ff);
            border: 2px solid #667eea;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .settings-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .setting-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .setting-item label {
            font-weight: 600;
            color: #333;
            font-size: 0.9em;
        }

        .setting-item select {
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            background: white;
            font-size: 14px;
            cursor: pointer;
            transition: border-color 0.3s;
        }

        .setting-item select:focus {
            border-color: #667eea;
            outline: none;
        }

        .drop-zone-stats {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
            font-size: 0.9em;
            color: #666;
        }

        .login-status {
            margin-top: 15px;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            display: none;
        }

        .login-status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .login-status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .login-status.loading {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }

        .disconnect-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            margin-left: 15px;
        }

        .disconnect-btn:hover {
            background: #c82333;
        }

        .help-text {
            margin-top: 15px;
        }

        .help-text a {
            color: #667eea;
            text-decoration: none;
            font-size: 0.9em;
        }

        .help-text a:hover {
            text-decoration: underline;
        }

        .help-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }

        .help-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }

        .help-content h3 {
            color: #333;
            margin-bottom: 20px;
        }

        .help-content ol {
            text-align: left;
            line-height: 1.6;
        }

        .help-content li {
            margin-bottom: 10px;
        }

        .close-help {
            float: right;
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
        }

        /* 批量上传样式 */
        .batch-files-container {
            background: #f8f9ff;
            border: 2px solid #667eea;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
        }

        .batch-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .batch-header h3 {
            color: #333;
            margin: 0;
        }

        .batch-files-list {
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 15px;
        }

        .batch-file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: white;
            border-radius: 8px;
            margin-bottom: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .batch-file-info {
            flex: 1;
        }

        .batch-file-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 3px;
        }

        .batch-file-size {
            color: #666;
            font-size: 0.9em;
        }

        .batch-file-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
        }

        .batch-file-status.pending {
            background: #fff3cd;
            color: #856404;
        }

        .batch-file-status.uploading {
            background: #cce5ff;
            color: #0066cc;
        }

        .batch-file-status.completed {
            background: #d4edda;
            color: #155724;
        }

        .batch-file-status.error {
            background: #f8d7da;
            color: #721c24;
        }

        .batch-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
        }

        .batch-progress-container {
            margin-top: 20px;
            background: #f8f9ff;
            padding: 20px;
            border-radius: 15px;
            border: 2px solid #e0e0e0;
            display: none;
        }

        .batch-overall-progress {
            margin-bottom: 15px;
        }

        .batch-current-file {
            margin-bottom: 10px;
            font-weight: 600;
            color: #333;
        }

        .remove-batch-file {
            background: #dc3545;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8em;
            margin-left: 10px;
        }

        .remove-batch-file:hover {
            background: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-section">
            <h1 class="title">
                <span class="rocket-icon">🚀</span>
                小木云传
            </h1>
            <p class="subtitle">高速文件上传器 • 安全传输 • 断点续传 • 多线程加速</p>
            <div class="speed-badge" id="speedBadge">
                <span class="rocket-icon-small">🚀</span>
                <span class="badge-label">实时速度</span>
                <span class="badge-value" id="realtimeSpeed">0 MB/s</span>
            </div>
        </div>
        
        <!-- Dropbox 登录/账户信息 -->
        <div class="login-section" id="loginSection">
            <div class="login-card">
                <h3><span class="rocket-icon-small">🚀</span> 登录小木云传</h3>
                <p>输入你的账号和密码开始高速传输（文件将安全存储在本地服务器）</p>
                
                <div class="login-form">
                    <div class="input-group">
                        <input type="email" id="emailInput" placeholder="邮箱地址" />
                    </div>
                    <div class="input-group password-group">
                        <input type="password" id="passwordInput" placeholder="密码" />
                        <button type="button" class="password-toggle" id="passwordToggle">
                            👁️
                        </button>
                    </div>
                    <div class="input-group">
                        <input type="text" id="targetAccountInput" placeholder="目标账户 (可选，默认为当前账户)" />
                    </div>
                    <button id="loginBtn" class="login-btn">
                        🔐 登录小木云传
                    </button>
                </div>
                
                <div class="divider">
                    <span>或</span>
                </div>
                
                <!-- 高级用户选项 -->
                <div class="advanced-login" id="advancedLogin" style="display: none;">
                    <div class="token-input-group">
                        <input type="password" id="tokenInput" placeholder="已有访问令牌？直接输入..." />
                        <button id="connectBtn" class="connect-btn">连接</button>
                    </div>
                </div>
                
                <div class="help-links">
                    <a href="#" id="showAdvanced">🔧 高级用户：使用访问令牌</a>
                    <span> | </span>
                    <a href="#" id="showDemo">🎯 使用演示账户</a>
                    <span> | </span>
                    <a href="#" id="showUserAccount">👤 使用测试账户</a>
                </div>
                
                <div class="login-status" id="loginStatus"></div>
            </div>
        </div>

        <!-- Dropbox 账户信息 -->
        <div class="account-info" id="accountInfo" style="display: none;">
            <div class="account-details" id="accountDetails"></div>
            <button id="disconnectBtn" class="disconnect-btn">断开连接</button>
        </div>
        
        <!-- 传输设置 -->
        <div class="transfer-settings" id="transferSettings" style="display: none;">
            <div class="settings-row">
                <div class="setting-item">
                    <label>📁 上传模式:</label>
                    <select id="uploadMode">
                        <option value="single">单文件上传</option>
                        <option value="batch">批量上传</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>🚀 并发线程:</label>
                    <select id="threadCount">
                        <option value="4">4 线程</option>
                        <option value="6" selected>6 线程 (推荐)</option>
                        <option value="8">8 线程</option>
                        <option value="12">12 线程 (极速)</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>📦 块大小:</label>
                    <select id="chunkSize">
                        <option value="10">10 MB</option>
                        <option value="20" selected>20 MB (推荐)</option>
                        <option value="50">50 MB</option>
                        <option value="100">100 MB (大文件)</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>⚡ 传输模式:</label>
                    <select id="transferMode">
                        <option value="normal">标准模式</option>
                        <option value="turbo" selected>极速模式</option>
                        <option value="stable">稳定模式</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="drop-zone" id="dropZone" style="display: none;">
            <div class="drop-zone-text" id="dropZoneText">⚡ 拖拽文件到这里或点击选择</div>
            <div class="drop-zone-subtext" id="dropZoneSubtext">小木云传 • 多线程加速 • 断点续传</div>
            <div class="drop-zone-stats">
                <span>📊 今日传输: <span id="todayStats">0 文件 / 0 MB</span></span>
            </div>
        </div>
        
        <input type="file" id="fileInput" class="file-input" multiple>
        
        <div class="file-info" id="fileInfo">
            <div class="file-name" id="fileName"></div>
            <div class="file-size" id="fileSize"></div>
        </div>

        <!-- 批量上传文件列表 -->
        <div class="batch-files-container" id="batchFilesContainer" style="display: none;">
            <div class="batch-header">
                <h3>📁 待上传文件列表</h3>
                <button id="clearBatchBtn" class="btn btn-delete">🗑️ 清空列表</button>
            </div>
            <div class="batch-files-list" id="batchFilesList"></div>
            <div class="batch-summary" id="batchSummary">
                <span>📊 总计: <span id="batchCount">0</span> 个文件 • <span id="batchTotalSize">0 MB</span></span>
                <button id="startBatchUploadBtn" class="btn btn-download">🚀 开始批量上传</button>
            </div>
        </div>
        
        <div class="progress-container" id="progressContainer">
            <!-- 上传控制区域 -->
            <div class="upload-controls">
                <div class="upload-status">
                    <span id="progressText">准备上传...</span>
                    <button id="cancelBtn" class="cancel-btn">❌ 终止上传</button>
                </div>
            </div>
            
            <!-- 主进度条 -->
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
                <div class="progress-percentage" id="progressPercentage">0%</div>
            </div>
            
            <!-- 详细信息 -->
            <div class="upload-details">
                <div class="detail-row">
                    <span class="detail-label">📊 进度:</span>
                    <span id="chunkInfo">0 / 0 块</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⚡ 速度:</span>
                    <span class="speed-info" id="speedText">0 MB/s</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏱️ 剩余:</span>
                    <span id="timeInfo">计算中...</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📤 已传:</span>
                    <span id="uploadedInfo">0 MB / 0 MB</span>
                </div>
            </div>
            
            <!-- Dropbox 上传进度 -->
            <div class="dropbox-progress" id="dropboxProgress" style="display: none;">
                <div class="progress-info">
                    <span>🌳 上传到小木云传...</span>
                    <span id="dropboxProgressText">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="dropboxProgressFill"></div>
                </div>
            </div>
        </div>

        <!-- 批量上传进度 -->
        <div class="batch-progress-container" id="batchProgressContainer">
            <div class="batch-current-file" id="batchCurrentFile">正在上传: 文件名.txt</div>
            
            <div class="batch-overall-progress">
                <div class="progress-info">
                    <span>总体进度</span>
                    <span id="batchOverallText">0 / 0 文件</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="batchOverallFill"></div>
                    <div class="progress-percentage" id="batchOverallPercentage">0%</div>
                </div>
            </div>

            <div class="upload-controls">
                <div class="upload-status">
                    <span id="batchProgressText">准备批量上传...</span>
                    <button id="cancelBatchBtn" class="cancel-btn">❌ 终止批量上传</button>
                </div>
            </div>
            
            <!-- 当前文件进度条 -->
            <div class="progress-bar">
                <div class="progress-fill" id="batchCurrentFill"></div>
                <div class="progress-percentage" id="batchCurrentPercentage">0%</div>
            </div>
            
            <!-- 详细信息 -->
            <div class="upload-details">
                <div class="detail-row">
                    <span class="detail-label">📊 当前文件:</span>
                    <span id="batchCurrentChunkInfo">0 / 0 块</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⚡ 速度:</span>
                    <span class="speed-info" id="batchSpeedText">0 MB/s</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏱️ 剩余:</span>
                    <span id="batchTimeInfo">计算中...</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📤 已传:</span>
                    <span id="batchUploadedInfo">0 MB / 0 MB</span>
                </div>
            </div>
        </div>
        
        <div class="success-message" id="successMessage"></div>
        <div class="error-message" id="errorMessage"></div>
        
        <!-- 文件管理区域 -->
        <div class="file-manager" id="fileManager" style="display: none;">
            <div class="manager-header">
                <h3>📂 我的文件</h3>
                <div class="stats" id="stats"></div>
            </div>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="🔍 搜索文件..." />
            </div>
            <div class="files-list" id="filesList"></div>
        </div>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🔐</div>
                <div class="feature-text">端到端加密</div>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <div class="feature-text">超高速传输</div>
            </div>
            <div class="feature">
                <div class="feature-icon">📦</div>
                <div class="feature-text">大文件支持</div>
            </div>
            <div class="feature">
                <div class="feature-icon">🎯</div>
                <div class="feature-text">断点续传</div>
            </div>
        </div>
        
        <div class="toggle-manager" id="toggleManagerSection" style="display: none;">
            <button class="toggle-btn" id="toggleManager">📂 查看我的文件</button>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
    <script src="main.js"></script>
</body>
</html>
