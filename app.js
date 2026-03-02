// 开奖网 H5专业版
document.addEventListener('DOMContentLoaded', function() {
    initStatusTime();
    initBanner();
    initTabs();
    initCountdowns();
    initDice();
    initCardClick();
});

// 状态栏时间
function initStatusTime() {
    const timeEl = document.getElementById('statusTime');
    if (!timeEl) return;
    
    function update() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${h}:${m}`;
    }
    
    update();
    setInterval(update, 1000);
}

// Banner轮播
function initBanner() {
    const wrapper = document.getElementById('bannerWrapper');
    const dots = document.querySelectorAll('.swiper-pagination .dot');
    if (!wrapper || !dots.length) return;
    
    const slides = wrapper.querySelectorAll('.swiper-slide');
    let currentIndex = 0;
    let autoPlayTimer;
    
    function goTo(index) {
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === index);
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
        currentIndex = index;
    }
    
    function next() {
        goTo((currentIndex + 1) % slides.length);
    }
    
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(next, 4000);
    }
    
    function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }
    
    // 点击指示点
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            goTo(i);
            startAutoPlay();
        });
    });
    
    // 触摸滑动
    let startX = 0;
    let isDragging = false;
    
    wrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoPlay();
    });
    
    wrapper.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                goTo((currentIndex + 1) % slides.length);
            } else {
                goTo((currentIndex - 1 + slides.length) % slides.length);
            }
        }
        
        isDragging = false;
        startAutoPlay();
    });
    
    startAutoPlay();
}

// 分类Tab切换
function initTabs() {
    const tabs = document.querySelectorAll('.tab-item');
    const cards = document.querySelectorAll('.lottery-card');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 激活状态
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.dataset.tab;
            
            // 筛选卡片
            cards.forEach(card => {
                if (type === 'all' || type === 'favorite') {
                    card.style.display = '';
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    const match = card.dataset.type === type;
                    card.style.display = match ? '' : 'none';
                    if (match) {
                        card.style.animation = 'fadeIn 0.3s ease';
                    }
                }
            });
        });
    });
}

// 倒计时
function initCountdowns() {
    const rings = document.querySelectorAll('.countdown-ring');
    
    rings.forEach(ring => {
        let seconds = parseInt(ring.dataset.seconds) || 60;
        const maxSeconds = seconds;
        const timeEl = ring.querySelector('.time');
        const progress = ring.querySelector('.progress');
        const circumference = 2 * Math.PI * 16;
        
        progress.style.strokeDasharray = circumference;
        
        function update() {
            // 更新时间显示
            if (seconds >= 60) {
                const m = Math.floor(seconds / 60);
                const s = seconds % 60;
                timeEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
            } else {
                timeEl.textContent = seconds;
            }
            
            // 更新进度环
            const offset = circumference * (1 - seconds / maxSeconds);
            progress.style.strokeDashoffset = offset;
            
            // 紧急状态
            if (seconds <= 10) {
                progress.style.stroke = '#ef4444';
                timeEl.style.color = '#ef4444';
                ring.style.animation = 'pulse 0.5s ease-in-out';
            } else {
                progress.style.stroke = '';
                timeEl.style.color = '';
                ring.style.animation = '';
            }
            
            seconds--;
            
            if (seconds < 0) {
                // 模拟开奖
                const card = ring.closest('.lottery-card');
                if (card) {
                    showLotteryAnimation(card);
                }
                seconds = maxSeconds;
            }
        }
        
        update();
        setInterval(update, 1000);
    });
}

// 开奖动画
function showLotteryAnimation(card) {
    // 闪烁效果
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'lotteryFlash 0.8s ease';
    
    // 更新骰子（如果有）
    const dices = card.querySelectorAll('.dice');
    dices.forEach(dice => {
        const value = Math.floor(Math.random() * 6) + 1;
        dice.dataset.value = value;
        renderSingleDice(dice, value);
    });
    
    // 更新属性
    if (dices.length === 3) {
        const sum = Array.from(dices).reduce((a, d) => a + parseInt(d.dataset.value), 0);
        const attrs = card.querySelectorAll('.attr');
        if (attrs[0]) {
            attrs[0].textContent = sum > 10 ? '大' : '小';
            attrs[0].className = `attr ${sum > 10 ? 'big' : 'small'}`;
        }
        if (attrs[1]) {
            attrs[1].textContent = sum % 2 ? '单' : '双';
            attrs[1].className = `attr ${sum % 2 ? 'odd' : 'even'}`;
        }
        if (attrs[2]) {
            attrs[2].textContent = sum;
        }
    }
    
}

// 渲染骰子
function initDice() {
    const dices = document.querySelectorAll('.dice');
    dices.forEach(dice => {
        const value = parseInt(dice.dataset.value) || 1;
        renderSingleDice(dice, value);
    });
}

function renderSingleDice(dice, value) {
    const positions = {
        1: [[1, 1]],
        2: [[0, 0], [2, 2]],
        3: [[0, 0], [1, 1], [2, 2]],
        4: [[0, 0], [0, 2], [2, 0], [2, 2]],
        5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
        6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]]
    };
    
    const dots = positions[value] || [];
    let html = '';
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            html += `<span class="dice-dot${hasDot ? ' visible' : ''}"></span>`;
        }
    }
    
    dice.innerHTML = html;
}

// 卡片点击
function initCardClick() {
    const cards = document.querySelectorAll('.lottery-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 不处理按钮点击
            if (e.target.closest('.btn-action')) return;
            
            const type = this.dataset.type;
            // 跳转到走势页
            window.location.href = `trend.html?lottery=${type}`;
        });
    });
}

// Toast提示
function showToast(message, duration = 2000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 16px 28px;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        font-size: 15px;
        font-weight: 500;
        border-radius: 12px;
        z-index: 9999;
        animation: toastIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// 注入动画CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes lotteryFlash {
        0%, 100% { background: white; }
        25% { background: #fef3c7; }
        50% { background: #fde68a; }
        75% { background: #fef3c7; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes toastIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes toastOut {
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// ===================================
//   全部彩种弹窗
// ===================================

function openAllLottery() {
    var overlay = document.getElementById('allLotteryOverlay');
    if (!overlay) return;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAllLottery() {
    var overlay = document.getElementById('allLotteryOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    // 清空搜索
    var input = document.getElementById('lotterySearchInput');
    if (input) input.value = '';
    resetAllLotteryView();
}

function switchAllLotteryTab(tabEl) {
    if (!tabEl) return;
    // 清空搜索
    var input = document.getElementById('lotterySearchInput');
    if (input) input.value = '';
    resetAllLotteryView();

    var tabType = tabEl.dataset.tab;

    // 切tab样式
    document.querySelectorAll('.al-tab').forEach(function(t) {
        t.classList.remove('active');
    });
    tabEl.classList.add('active');

    // 切内容
    document.querySelectorAll('.al-section').forEach(function(s) {
        s.classList.remove('active');
    });
    var target = document.querySelector('.al-section[data-tab="' + tabType + '"]');
    if (target) target.classList.add('active');

    // 滚回顶部
    var body = document.getElementById('allLotteryBody');
    if (body) body.scrollTop = 0;
}

function filterAllLottery() {
    var input = document.getElementById('lotterySearchInput');
    var keyword = (input ? input.value : '').trim().toLowerCase();
    var emptyEl = document.getElementById('alEmpty');
    var bodyEl = document.getElementById('allLotteryBody');

    if (!keyword) {
        resetAllLotteryView();
        return;
    }

    // 搜索时显示所有section
    var sections = document.querySelectorAll('.al-section');
    sections.forEach(function(s) { s.style.display = 'block'; s.classList.remove('active'); });

    var allGroups = document.querySelectorAll('.al-group');
    var totalMatch = 0;

    allGroups.forEach(function(group) {
        var items = group.querySelectorAll('.al-item');
        var groupMatch = 0;
        items.forEach(function(item) {
            var name = item.textContent.replace(/热|新/g, '').trim().toLowerCase();
            if (name.includes(keyword)) {
                item.style.display = '';
                item.classList.add('match-highlight');
                groupMatch++;
            } else {
                item.style.display = 'none';
                item.classList.remove('match-highlight');
            }
        });
        group.style.display = groupMatch > 0 ? '' : 'none';
        totalMatch += groupMatch;
    });

    if (totalMatch === 0) {
        if (bodyEl) bodyEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = '';
    } else {
        if (bodyEl) bodyEl.style.display = '';
        if (emptyEl) emptyEl.style.display = 'none';
    }
}

function resetAllLotteryView() {
    var emptyEl = document.getElementById('alEmpty');
    var bodyEl = document.getElementById('allLotteryBody');
    if (emptyEl) emptyEl.style.display = 'none';
    if (bodyEl) bodyEl.style.display = '';

    // 恢复所有项目显示
    document.querySelectorAll('.al-group').forEach(function(g) { g.style.display = ''; });
    document.querySelectorAll('.al-item').forEach(function(i) {
        i.style.display = '';
        i.classList.remove('match-highlight');
    });

    // 恢复section显示
    var activeTab = document.querySelector('.al-tab.active');
    var activeTabType = activeTab ? activeTab.dataset.tab : 'hot';
    document.querySelectorAll('.al-section').forEach(function(s) {
        s.style.display = '';
        s.classList.remove('active');
        if (s.dataset.tab === activeTabType) {
            s.classList.add('active');
        }
    });
}

// 彩种项点击事件 — 选中并跳转
document.addEventListener('click', function(e) {
    var item = e.target.closest('.al-item');
    if (!item) return;
    var id = item.dataset.id;
    if (!id) return;

    // 高亮选中
    document.querySelectorAll('.al-item').forEach(function(i) { i.classList.remove('selected'); });
    item.classList.add('selected');

    // 模拟选中后短暂延迟关闭
    setTimeout(function() {
        closeAllLottery();
        showToast('已选择: ' + item.textContent.replace(/热|新/g, '').trim());
    }, 200);
});
