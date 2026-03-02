// ===================================
// 设置页面 - JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    updateStatusTime();
    setInterval(updateStatusTime, 60000);
    loadSettings();
});

// ==================== 状态栏时间 ====================
function updateStatusTime() {
    var now = new Date();
    var h = now.getHours().toString().padStart(2, '0');
    var m = now.getMinutes().toString().padStart(2, '0');
    var el = document.getElementById('statusTime');
    if (el) el.textContent = h + ':' + m;
}

// ==================== 数据存储 ====================
var SETTINGS_KEY = 'lottery_settings';

function getSettings() {
    try {
        var data = localStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
}

function saveSetting(key, value) {
    var settings = getSettings();
    settings[key] = value;
    saveSettings(settings);
}

// ==================== 加载设置 ====================
function loadSettings() {
    var settings = getSettings();

    // 昵称
    var nicknameEl = document.getElementById('currentNickname');
    if (nicknameEl) {
        nicknameEl.textContent = settings.nickname || '未设置';
    }

    // 推送通知
    var pushEl = document.getElementById('pushToggle');
    if (pushEl) {
        pushEl.checked = settings.push !== false;
    }

    // 声音
    var soundEl = document.getElementById('soundToggle');
    if (soundEl) {
        soundEl.checked = settings.sound !== false;
    }

    // 字体大小
    var fontSize = settings.fontSize || 'standard';
    setFontSize(fontSize, true);

    // 默认彩种
    var lotteryEl = document.getElementById('defaultLottery');
    if (lotteryEl && settings.defaultLottery) {
        lotteryEl.textContent = settings.defaultLottery;
    }

    // 自动刷新
    var refreshEl = document.getElementById('autoRefreshToggle');
    if (refreshEl) {
        refreshEl.checked = settings.autoRefresh !== false;
    }

    // 昵称输入事件
    var nicknameInput = document.getElementById('nicknameInput');
    if (nicknameInput) {
        nicknameInput.addEventListener('input', function() {
            var count = this.value.length;
            document.getElementById('nickCount').textContent = count;
        });
    }
}

// ==================== 修改昵称 ====================
function openNicknameEdit() {
    var modal = document.getElementById('nicknameModal');
    if (!modal) return;

    var settings = getSettings();
    var input = document.getElementById('nicknameInput');
    if (input) {
        input.value = settings.nickname || '';
        document.getElementById('nickCount').textContent = input.value.length;
    }

    modal.classList.add('show');
    setTimeout(function() {
        if (input) input.focus();
    }, 300);
}

function closeNicknameEdit() {
    var modal = document.getElementById('nicknameModal');
    if (modal) modal.classList.remove('show');
}

function saveNickname() {
    var input = document.getElementById('nicknameInput');
    if (!input) return;

    var nickname = input.value.trim();
    if (nickname.length < 2) {
        showToast('昵称至少需要2个字符');
        return;
    }
    if (nickname.length > 12) {
        showToast('昵称最多12个字符');
        return;
    }

    saveSetting('nickname', nickname);
    document.getElementById('currentNickname').textContent = nickname;
    closeNicknameEdit();
    showToast('昵称已修改');
}

// ==================== 注销账号 ====================
function confirmDeactivate() {
    var modal = document.getElementById('deactivateConfirm');
    if (modal) modal.classList.add('show');
}

function closeDeactivate() {
    var modal = document.getElementById('deactivateConfirm');
    if (modal) modal.classList.remove('show');
}

function doDeactivate() {
    closeDeactivate();
    // 清除所有本地数据
    localStorage.clear();
    showToast('账号已注销');
    setTimeout(function() {
        location.href = 'login.html';
    }, 1200);
}

// ==================== 字体大小 ====================
function setFontSize(size, isInit) {
    var btns = document.querySelectorAll('.st-font-btn');
    var trackFill = document.getElementById('fontTrackFill');

    btns.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.dataset.size === size) {
            btn.classList.add('active');
        }
    });

    // 进度条
    var widthMap = { small: '17%', standard: '50%', large: '83%' };
    if (trackFill) {
        trackFill.style.width = widthMap[size] || '50%';
    }

    // 应用字体大小到 body
    var sizeMap = { small: '14px', standard: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizeMap[size] || '16px';

    if (!isInit) {
        saveSetting('fontSize', size);
        showToast('字体已设为「' + (size === 'small' ? '小' : size === 'standard' ? '标准' : '大') + '」');
    }
}

// ==================== 默认彩种选择 ====================
var lotteryOptions = [
    { value: 'dongfang', label: '东方彩票' },
    { value: 'kuaisan', label: '快三' },
    { value: 'ssc', label: '时时彩系列' },
    { value: 'pk', label: 'PK系列' },
    { value: 'pc28', label: 'PC28' },
    { value: '11x5', label: '11选5系列' },
    { value: 'letou', label: '乐透彩' },
    { value: 'kuaile', label: '快乐十分' },
    { value: 'other', label: '其他' }
];

var selectedLottery = '';

function openLotteryPicker() {
    var picker = document.getElementById('lotteryPicker');
    if (!picker) return;

    var settings = getSettings();
    var currentLabel = settings.defaultLottery || '东方彩票';

    // 渲染选项
    var body = document.getElementById('lotteryPickerBody');
    if (body) {
        body.innerHTML = lotteryOptions.map(function(opt) {
            var isActive = opt.label === currentLabel;
            selectedLottery = isActive ? opt.label : selectedLottery;
            return '<div class="st-picker-option' + (isActive ? ' active' : '') + '" data-label="' + opt.label + '" onclick="selectLottery(this)">' + opt.label + '</div>';
        }).join('');
        if (!selectedLottery) selectedLottery = currentLabel;
    }

    picker.classList.add('show');
}

function closeLotteryPicker() {
    var picker = document.getElementById('lotteryPicker');
    if (picker) picker.classList.remove('show');
}

function selectLottery(el) {
    var options = document.querySelectorAll('.st-picker-option');
    options.forEach(function(opt) { opt.classList.remove('active'); });
    el.classList.add('active');
    selectedLottery = el.dataset.label;
}

function confirmLottery() {
    if (selectedLottery) {
        saveSetting('defaultLottery', selectedLottery);
        document.getElementById('defaultLottery').textContent = selectedLottery;
        showToast('默认彩种已设为「' + selectedLottery + '」');
    }
    closeLotteryPicker();
}

// ==================== 退出登录 ====================
function confirmLogout() {
    var modal = document.getElementById('logoutConfirm');
    if (modal) modal.classList.add('show');
}

function closeLogout() {
    var modal = document.getElementById('logoutConfirm');
    if (modal) modal.classList.remove('show');
}

function doLogout() {
    closeLogout();
    // 清除登录状态但保留设置
    localStorage.removeItem('lottery_user');
    localStorage.removeItem('lottery_token');
    showToast('已退出登录');
    setTimeout(function() {
        location.href = 'login.html';
    }, 1200);
}

// ==================== Toast ====================
function showToast(msg) {
    var toast = document.getElementById('stToast');
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.add('show');

    setTimeout(function() {
        toast.classList.remove('show');
    }, 2000);
}
