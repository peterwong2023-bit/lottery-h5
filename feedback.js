/* ===================================
   意见反馈页面 - 交互逻辑
   =================================== */

const STORAGE_KEY = 'h5_feedback_list';

// 反馈类型配置
const FB_TYPES = {
    bug:     { name: '功能异常', icon: '🐛' },
    suggest: { name: '功能建议', icon: '💡' },
    ui:      { name: '界面优化', icon: '🎨' },
    data:    { name: '数据问题', icon: '📊' },
    other:   { name: '其他',     icon: '📝' }
};

// 状态
let currentType = 'bug';
let uploadedImages = []; // base64 数组
let showingHistory = false;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateStatusTime();
    setInterval(updateStatusTime, 60000);
});

// 更新状态栏时间
function updateStatusTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const el = document.getElementById('statusTime');
    if (el) el.textContent = h + ':' + m;
}

// ==================== 类型选择 ====================

function selectType(el) {
    document.querySelectorAll('.fb-type').forEach(function(t) {
        t.classList.remove('active');
    });
    el.classList.add('active');
    currentType = el.getAttribute('data-type');
}

// ==================== 字数统计 ====================

function updateCharCount() {
    const textarea = document.getElementById('fbContent');
    const countEl = document.getElementById('charCount');
    const wrapEl = document.querySelector('.fb-char-count');
    const len = textarea.value.length;
    
    countEl.textContent = len;
    
    if (len >= 500) {
        wrapEl.className = 'fb-char-count at-limit';
    } else if (len >= 400) {
        wrapEl.className = 'fb-char-count near-limit';
    } else {
        wrapEl.className = 'fb-char-count';
    }
}

// ==================== 图片上传 ====================

function addImage() {
    if (uploadedImages.length >= 3) {
        showToast('最多上传3张图片');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 检查大小（5MB限制）
        if (file.size > 5 * 1024 * 1024) {
            showToast('图片大小不能超过5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(ev) {
            // 压缩图片
            compressImage(ev.target.result, function(compressed) {
                uploadedImages.push(compressed);
                renderImages();
            });
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// 压缩图片
function compressImage(dataUrl, callback) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const maxW = 800;
        const maxH = 800;
        let w = img.width;
        let h = img.height;
        
        if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.floor(w * ratio);
            h = Math.floor(h * ratio);
        }
        
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
}

// 渲染图片列表
function renderImages() {
    const container = document.getElementById('fbImages');
    let html = '';
    
    uploadedImages.forEach(function(src, idx) {
        html += '<div class="fb-image-item">';
        html += '<img src="' + src + '" onclick="previewImage(' + idx + ')">';
        html += '<button class="fb-image-remove" onclick="removeImage(' + idx + ')">✕</button>';
        html += '</div>';
    });
    
    if (uploadedImages.length < 3) {
        html += '<div class="fb-image-add" onclick="addImage()">';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
        html += '<line x1="12" y1="5" x2="12" y2="19"/>';
        html += '<line x1="5" y1="12" x2="19" y2="12"/>';
        html += '</svg>';
        html += '<span>添加图片</span>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// 删除图片
function removeImage(idx) {
    uploadedImages.splice(idx, 1);
    renderImages();
}

// 预览图片
function previewImage(idx) {
    const overlay = document.getElementById('previewOverlay');
    const img = document.getElementById('previewImg');
    img.src = uploadedImages[idx];
    overlay.classList.add('show');
}

function closePreview() {
    document.getElementById('previewOverlay').classList.remove('show');
}

// ==================== 提交反馈 ====================

function submitFeedback() {
    const content = document.getElementById('fbContent').value.trim();
    
    if (!content) {
        showToast('请填写问题描述');
        document.getElementById('fbContent').focus();
        return;
    }
    
    if (content.length < 10) {
        showToast('描述至少10个字');
        return;
    }
    
    const btn = document.getElementById('fbSubmitBtn');
    btn.classList.add('submitting');
    btn.textContent = '提交中';
    
    // 模拟网络请求
    setTimeout(function() {
        const feedback = {
            id: Date.now().toString(),
            type: currentType,
            content: content,
            images: uploadedImages.slice(),
            status: 'pending',
            createTime: new Date().toISOString()
        };
        
        // 保存
        saveFeedback(feedback);
        
        // 重置表单
        document.getElementById('fbContent').value = '';
        uploadedImages = [];
        renderImages();
        updateCharCount();
        
        // 按钮反馈
        btn.classList.remove('submitting');
        btn.classList.add('success');
        btn.textContent = '✓ 提交成功';
        
        setTimeout(function() {
            btn.classList.remove('success');
            btn.textContent = '提交反馈';
        }, 2000);
        
        showToast('反馈提交成功，感谢您的反馈！');
    }, 1500);
}

// ==================== 数据持久化 ====================

function saveFeedback(fb) {
    const list = loadFeedbackList();
    list.unshift(fb);
    // 最多保存20条
    if (list.length > 20) list.length = 20;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        // 如果存储满了（图片太大），尝试不存图片
        fb.images = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
}

function loadFeedbackList() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function deleteFeedback(id) {
    let list = loadFeedbackList();
    list = list.filter(function(f) { return f.id !== id; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderHistory();
}

// ==================== 历史记录 ====================

function toggleHistory() {
    showingHistory = !showingHistory;
    
    const historyBtn = document.querySelector('.history-btn');
    const formView = document.getElementById('fbFormView');
    const historyView = document.getElementById('fbHistoryView');
    
    if (showingHistory) {
        historyBtn.classList.add('active');
        formView.style.display = 'none';
        historyView.style.display = 'block';
        renderHistory();
    } else {
        historyBtn.classList.remove('active');
        formView.style.display = 'block';
        historyView.style.display = 'none';
    }
}

function renderHistory() {
    const list = loadFeedbackList();
    const listEl = document.getElementById('fbHistoryList');
    const emptyEl = document.getElementById('fbEmptyState');
    
    if (list.length === 0) {
        listEl.style.display = 'none';
        emptyEl.style.display = 'block';
        return;
    }
    
    listEl.style.display = 'flex';
    emptyEl.style.display = 'none';
    
    let html = '';
    list.forEach(function(fb) {
        const typeInfo = FB_TYPES[fb.type] || FB_TYPES.other;
        const statusText = getStatusText(fb.status);
        const timeStr = formatTime(fb.createTime);
        
        html += '<div class="fb-history-card">';
        
        // 顶部：类型 + 状态
        html += '<div class="fb-history-top">';
        html += '<div class="fb-history-type">';
        html += '<span class="fb-history-type-icon">' + typeInfo.icon + '</span>';
        html += typeInfo.name;
        html += '</div>';
        html += '<span class="fb-history-status ' + fb.status + '">' + statusText + '</span>';
        html += '</div>';
        
        // 内容
        html += '<div class="fb-history-text">' + escapeHtml(fb.content) + '</div>';
        
        // 图片
        if (fb.images && fb.images.length > 0) {
            html += '<div class="fb-history-images">';
            fb.images.forEach(function(src, idx) {
                html += '<div class="fb-history-thumb" onclick="previewHistoryImage(\'' + fb.id + '\',' + idx + ')">';
                html += '<img src="' + src + '">';
                html += '</div>';
            });
            html += '</div>';
        }
        
        // 底部
        html += '<div class="fb-history-bottom">';
        html += '<span class="fb-history-time">' + timeStr + '</span>';
        html += '<button class="fb-history-delete" onclick="deleteFeedback(\'' + fb.id + '\')">删除</button>';
        html += '</div>';
        
        html += '</div>';
    });
    
    listEl.innerHTML = html;
}

// 预览历史图片
function previewHistoryImage(fbId, imgIdx) {
    const list = loadFeedbackList();
    const fb = list.find(function(f) { return f.id === fbId; });
    if (fb && fb.images && fb.images[imgIdx]) {
        const overlay = document.getElementById('previewOverlay');
        const img = document.getElementById('previewImg');
        img.src = fb.images[imgIdx];
        overlay.classList.add('show');
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return '待处理';
        case 'processing': return '处理中';
        case 'resolved': return '已解决';
        default: return '待处理';
    }
}

function formatTime(isoStr) {
    try {
        const d = new Date(isoStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);
        
        if (diffMin < 1) return '刚刚';
        if (diffMin < 60) return diffMin + '分钟前';
        if (diffHr < 24) return diffHr + '小时前';
        if (diffDay < 7) return diffDay + '天前';
        
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hour = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        return month + '-' + day + ' ' + hour + ':' + min;
    } catch (e) {
        return '';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== Toast 提示 ====================

function showToast(msg) {
    const toast = document.getElementById('fbToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2000);
}
