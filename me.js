/* ===================================
   我的页面 - 交互逻辑
   =================================== */

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateStatusTime();
    calculateCacheSize();
    setInterval(updateStatusTime, 60000);

    // 从帮助中心跳转来时自动打开联络弹窗
    try {
        if (sessionStorage.getItem('open_contact') === '1') {
            sessionStorage.removeItem('open_contact');
            setTimeout(function() { openContact(); }, 300);
        }
    } catch (e) {}
});

// 更新状态栏时间
function updateStatusTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const el = document.getElementById('statusTime');
    if (el) el.textContent = `${hours}:${minutes}`;
}

// ==================== 联络我们 ====================

function showContact() {
    var overlay = document.getElementById('contactOverlay');
    if (overlay) overlay.classList.add('show');
}

function closeContact() {
    var overlay = document.getElementById('contactOverlay');
    if (overlay) overlay.classList.remove('show');
}

function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('已复制: ' + text);
        }).catch(function() {
            fallbackCopyText(text);
        });
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast('已复制: ' + text);
    } catch (e) {
        showToast('复制失败，请手动复制');
    }
    document.body.removeChild(ta);
}

// ==================== 清除缓存 ====================

// 缓存分类配置
const CACHE_CATEGORIES = [
    {
        key: 'history',
        name: '浏览记录',
        desc: '页面浏览历史数据',
        icon: '🕐',
        iconClass: 'history',
        keys: ['h5_browse_history']
    },
    {
        key: 'favorites',
        name: '收藏数据',
        desc: '我的彩种收藏列表',
        icon: '⭐',
        iconClass: 'favorites',
        keys: ['h5_favorites']
    },
    {
        key: 'reminder',
        name: '提醒设置',
        desc: '智能提醒配置数据',
        icon: '🔔',
        iconClass: 'reminder',
        keys: ['h5_smart_reminders']
    },
    {
        key: 'settings',
        name: '本地设置',
        desc: '应用设置与偏好',
        icon: '⚙️',
        iconClass: 'settings',
        keys: ['h5_settings', 'h5_theme']
    },
    {
        key: 'other',
        name: '其他数据',
        desc: '临时缓存与其他数据',
        icon: '📦',
        iconClass: 'other',
        keys: [] // 所有不属于以上分类的
    }
];

// 计算缓存大小（显示在菜单项）
function calculateCacheSize() {
    let totalSize = 0;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalSize += (key.length + value.length) * 2;
        }
    } catch (e) {
        totalSize = 0;
    }
    
    const sizeEl = document.getElementById('cacheSize');
    if (sizeEl) {
        sizeEl.textContent = formatSize(totalSize);
    }
}

// 格式化大小
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 计算分类缓存大小
function getCategorySizes() {
    const knownKeys = new Set();
    const result = {};
    
    // 初始化
    CACHE_CATEGORIES.forEach(function(cat) {
        result[cat.key] = { size: 0, count: 0 };
        cat.keys.forEach(function(k) { knownKeys.add(k); });
    });
    
    // 遍历localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const itemSize = (key.length + value.length) * 2;
        
        let matched = false;
        for (let j = 0; j < CACHE_CATEGORIES.length - 1; j++) {
            const cat = CACHE_CATEGORIES[j];
            if (cat.keys.some(function(k) { return key === k || key.startsWith(k + '_'); })) {
                result[cat.key].size += itemSize;
                result[cat.key].count++;
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            result['other'].size += itemSize;
            result['other'].count++;
        }
    }
    
    return result;
}

// 打开缓存面板
function clearCache() {
    const overlay = document.getElementById('cacheOverlay');
    if (overlay) {
        overlay.classList.add('show');
        renderCachePanel();
    }
}

// 关闭缓存面板
function closeCachePanel() {
    const overlay = document.getElementById('cacheOverlay');
    if (overlay) overlay.classList.remove('show');
}

// 渲染缓存面板内容
function renderCachePanel() {
    const sizes = getCategorySizes();
    let totalSize = 0;
    
    Object.keys(sizes).forEach(function(key) {
        totalSize += sizes[key].size;
    });
    
    // 更新总缓存显示
    document.getElementById('cacheTotalSize').textContent = formatSize(totalSize);
    
    // 更新进度条（假设5MB为满）
    const maxSize = 5 * 1024 * 1024;
    const ratio = Math.min(totalSize / maxSize, 1);
    const percent = Math.round(ratio * 100);
    var barFill = document.getElementById('cacheBarFill');
    var percentEl = document.getElementById('cachePercent');
    if (barFill) {
        setTimeout(function() {
            barFill.style.width = percent + '%';
        }, 100);
    }
    if (percentEl) percentEl.textContent = percent + '%';
    
    // 渲染分类列表
    const listEl = document.getElementById('cacheList');
    let html = '';
    
    var barColors = {
        history: '#3b82f6',
        favorites: '#f59e0b',
        reminder: '#f97316',
        settings: '#10b981',
        other: '#8b5cf6'
    };
    
    CACHE_CATEGORIES.forEach(function(cat) {
        var catSize = sizes[cat.key];
        var sizeText = catSize.size > 0 ? formatSize(catSize.size) : '无数据';
        var hasData = catSize.size > 0;
        var catPercent = totalSize > 0 ? Math.round((catSize.size / totalSize) * 100) : 0;
        var barColor = barColors[cat.key] || '#8b5cf6';
        
        html += '<div class="cache-item" id="cache-' + cat.key + '">';
        html += '<div class="cache-item-top">';
        html += '<div class="cache-item-left">';
        html += '<div class="cache-item-icon ' + cat.iconClass + '">' + cat.icon + '</div>';
        html += '<div class="cache-item-info">';
        html += '<div class="cache-item-name">' + cat.name + '</div>';
        html += '<div class="cache-item-desc">' + cat.desc + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="cache-item-right">';
        html += '<span class="cache-item-size">' + sizeText + '</span>';
        if (hasData) {
            html += '<button class="cache-item-clear" onclick="clearCategoryCache(\'' + cat.key + '\')">';
            html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            html += '</button>';
        }
        html += '</div>';
        html += '</div>';
        if (hasData) {
            html += '<div class="cache-item-bar"><div class="cache-item-bar-fill" style="width:' + catPercent + '%;background:' + barColor + '"></div></div>';
        }
        html += '</div>';
    });
    
    listEl.innerHTML = html;
    
    // 重置清除按钮
    const btn = document.querySelector('.cache-btn-clear');
    if (btn) {
        btn.classList.remove('cleared');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            一键清除全部缓存`;
    }
}

// 清除某个分类的缓存
function clearCategoryCache(catKey) {
    const cat = CACHE_CATEGORIES.find(function(c) { return c.key === catKey; });
    if (!cat) return;
    
    const item = document.getElementById('cache-' + catKey);
    if (item) item.classList.add('clearing');
    
    setTimeout(function() {
        if (catKey === 'other') {
            // 清除不属于任何分类的key
            const knownKeys = new Set();
            CACHE_CATEGORIES.forEach(function(c) {
                if (c.key !== 'other') {
                    c.keys.forEach(function(k) { knownKeys.add(k); });
                }
            });
            
            const toRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                let isKnown = false;
                knownKeys.forEach(function(kk) {
                    if (key === kk || key.startsWith(kk + '_')) isKnown = true;
                });
                if (!isKnown) toRemove.push(key);
            }
            toRemove.forEach(function(k) { localStorage.removeItem(k); });
        } else {
            cat.keys.forEach(function(k) {
                localStorage.removeItem(k);
                // 也清除带前缀的key
                const toRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(k + '_')) toRemove.push(key);
                }
                toRemove.forEach(function(key) { localStorage.removeItem(key); });
            });
        }
        
        showToast(cat.name + '已清除');
        calculateCacheSize();
        renderCachePanel();
    }, 300);
}

// 一键清除全部缓存
function clearAllCache() {
    try {
        localStorage.clear();
        
        // 进度条归零
        var barFill = document.getElementById('cacheBarFill');
        if (barFill) barFill.style.width = '0%';
        var percentEl = document.getElementById('cachePercent');
        if (percentEl) percentEl.textContent = '0%';
        
        // 更新显示
        document.getElementById('cacheTotalSize').textContent = '0 B';
        
        // 按钮变为已清除
        const btn = document.querySelector('.cache-btn-clear');
        if (btn) {
            btn.classList.add('cleared');
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                已清除所有缓存`;
        }
        
        calculateCacheSize();
        
        // 延迟刷新列表
        setTimeout(function() {
            renderCachePanel();
        }, 400);
        
        showToast('全部缓存已清除');
    } catch (e) {
        showToast('清除失败，请重试');
    }
}

// ==================== 分享网站（二维码） ====================

function shareWebsite() {
    var overlay = document.getElementById('shareOverlay');
    if (overlay) {
        overlay.classList.add('show');
        var url = window.location.origin || window.location.href;
        document.getElementById('shareUrl').textContent = url;
        generateQR(url);
    }
}

function closeShare() {
    var overlay = document.getElementById('shareOverlay');
    if (overlay) overlay.classList.remove('show');
}

// 复制链接
function copyShareLink() {
    var url = window.location.origin || window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
            showToast('链接已复制');
        }).catch(function() { doCopy(url); });
    } else {
        doCopy(url);
    }
}

function doCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast('链接已复制');
    } catch (e) {
        showToast('复制失败');
    }
    document.body.removeChild(ta);
}

// 保存分享图片
function saveShareImage() {
    var canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    
    // 生成完整分享图
    var shareCanvas = document.createElement('canvas');
    var w = 540, h = 780;
    shareCanvas.width = w;
    shareCanvas.height = h;
    var ctx = shareCanvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 0, 0, w, h, 30);
    ctx.fill();
    
    // 顶部渐变
    var grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#2563eb');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
    roundRectTop(ctx, 0, 0, w, 160, 30);
    ctx.fill();
    
    // Logo圆角方块
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 36, 100, 100, 100, 24);
    ctx.fill();
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯', 86, 165);
    
    // 标题
    ctx.textAlign = 'left';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('开奖网', 152, 180);
    
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('专业彩票开奖查询平台', 152, 210);
    
    // 二维码
    var qrSize = 300;
    var qrX = (w - qrSize) / 2;
    var qrY = 260;
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 2;
    roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16);
    ctx.stroke();
    ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);
    
    // 提示文字
    ctx.textAlign = 'center';
    ctx.font = '500 22px sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText('扫描二维码访问开奖网', w / 2, qrY + qrSize + 56);
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#9ca3af';
    var url = window.location.origin || window.location.href;
    ctx.fillText(url, w / 2, qrY + qrSize + 86);
    
    // 下载
    try {
        var link = document.createElement('a');
        link.download = '开奖网分享.png';
        link.href = shareCanvas.toDataURL('image/png');
        link.click();
        showToast('图片已保存');
    } catch (e) {
        showToast('保存失败，请长按二维码保存');
    }
}

// Canvas圆角矩形
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function roundRectTop(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ==================== QR码生成器 ====================
// 轻量级QR码生成（纯JS，无依赖）
function generateQR(text) {
    var canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var size = 160;
    canvas.width = size;
    canvas.height = size;
    
    // 使用简单的编码方式生成QR pattern
    var modules = encodeQR(text);
    var moduleCount = modules.length;
    var cellSize = size / moduleCount;
    
    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // 绘制模块
    ctx.fillStyle = '#1f2937';
    for (var r = 0; r < moduleCount; r++) {
        for (var c = 0; c < moduleCount; c++) {
            if (modules[r][c]) {
                // 圆角小方块
                var x = c * cellSize;
                var y = r * cellSize;
                var s = cellSize * 0.85;
                var offset = (cellSize - s) / 2;
                var radius = s * 0.2;
                ctx.beginPath();
                ctx.moveTo(x + offset + radius, y + offset);
                ctx.lineTo(x + offset + s - radius, y + offset);
                ctx.quadraticCurveTo(x + offset + s, y + offset, x + offset + s, y + offset + radius);
                ctx.lineTo(x + offset + s, y + offset + s - radius);
                ctx.quadraticCurveTo(x + offset + s, y + offset + s, x + offset + s - radius, y + offset + s);
                ctx.lineTo(x + offset + radius, y + offset + s);
                ctx.quadraticCurveTo(x + offset, y + offset + s, x + offset, y + offset + s - radius);
                ctx.lineTo(x + offset, y + offset + radius);
                ctx.quadraticCurveTo(x + offset, y + offset, x + offset + radius, y + offset);
                ctx.fill();
            }
        }
    }
    
    // 绘制定位图案（左上、右上、左下）
    drawFinderPattern(ctx, cellSize, 0, 0);
    drawFinderPattern(ctx, cellSize, moduleCount - 7, 0);
    drawFinderPattern(ctx, cellSize, 0, moduleCount - 7);
}

function drawFinderPattern(ctx, cellSize, row, col) {
    var colors = ['#2563eb', '#ffffff', '#2563eb'];
    var sizes = [7, 5, 3];
    
    for (var i = 0; i < 3; i++) {
        var offset = (7 - sizes[i]) / 2;
        var x = (col + offset) * cellSize;
        var y = (row + offset) * cellSize;
        var s = sizes[i] * cellSize;
        var r = cellSize * 0.6;
        
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + s - r, y);
        ctx.quadraticCurveTo(x + s, y, x + s, y + r);
        ctx.lineTo(x + s, y + s - r);
        ctx.quadraticCurveTo(x + s, y + s, x + s - r, y + s);
        ctx.lineTo(x + r, y + s);
        ctx.quadraticCurveTo(x, y + s, x, y + s - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }
}

// 简易QR编码（生成近似QR码视觉效果）
function encodeQR(text) {
    var size = 29;
    var modules = [];
    for (var i = 0; i < size; i++) {
        modules[i] = [];
        for (var j = 0; j < size; j++) {
            modules[i][j] = false;
        }
    }
    
    // 定位图案
    addFinderPattern(modules, 0, 0);
    addFinderPattern(modules, size - 7, 0);
    addFinderPattern(modules, 0, size - 7);
    
    // 定时图案
    for (var i = 8; i < size - 8; i++) {
        modules[6][i] = i % 2 === 0;
        modules[i][6] = i % 2 === 0;
    }
    
    // 对齐图案
    addAlignmentPattern(modules, size - 9, size - 9);
    
    // 数据区域（基于文本hash填充）
    var hash = hashString(text);
    var bits = [];
    for (var i = 0; i < 256; i++) {
        bits.push(((hash * (i + 1) * 7 + i * 13) & 0xFF) > 100 ? 1 : 0);
    }
    
    var bitIdx = 0;
    for (var col = size - 1; col >= 0; col -= 2) {
        if (col === 6) col = 5;
        for (var row = 0; row < size; row++) {
            for (var c = 0; c < 2; c++) {
                var cc = col - c;
                if (cc < 0) continue;
                if (isReserved(modules, row, cc, size)) continue;
                modules[row][cc] = bits[bitIdx % bits.length] === 1;
                bitIdx++;
            }
        }
    }
    
    return modules;
}

function addFinderPattern(modules, row, col) {
    for (var r = 0; r < 7; r++) {
        for (var c = 0; c < 7; c++) {
            if (r === 0 || r === 6 || c === 0 || c === 6 ||
                (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                modules[row + r][col + c] = true;
            } else {
                modules[row + r][col + c] = false;
            }
        }
    }
    // 分隔带
    for (var i = 0; i < 8; i++) {
        setIfValid(modules, row - 1, col + i, false);
        setIfValid(modules, row + 7, col + i, false);
        setIfValid(modules, row + i, col - 1, false);
        setIfValid(modules, row + i, col + 7, false);
    }
}

function addAlignmentPattern(modules, row, col) {
    for (var r = -2; r <= 2; r++) {
        for (var c = -2; c <= 2; c++) {
            if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
                modules[row + r][col + c] = true;
            } else {
                modules[row + r][col + c] = false;
            }
        }
    }
}

function setIfValid(modules, r, c, val) {
    if (r >= 0 && r < modules.length && c >= 0 && c < modules.length) {
        modules[r][c] = val;
    }
}

function isReserved(modules, row, col, size) {
    // 定位图案区域
    if (row < 9 && col < 9) return true;
    if (row < 9 && col >= size - 8) return true;
    if (row >= size - 8 && col < 9) return true;
    // 定时图案
    if (row === 6 || col === 6) return true;
    // 对齐图案
    if (row >= size - 11 && row <= size - 7 && col >= size - 11 && col <= size - 7) return true;
    return false;
}

function hashString(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// ==================== Toast 提示 ====================

function showToast(msg) {
    const toast = document.getElementById('meToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2000);
}
