// 长龙排行 - H5版本（参考PC版）

// 彩票数据配置
const lotteryData = [
    { name: '幸运时时彩', icon: '🎰', type: 'ssc', types: ['总和', '大小', '单双'] },
    { name: '澳洲幸运10', icon: '🏎️', type: 'au', types: ['冠军特殊', '大小', '单双'] },
    { name: '赛车', icon: '🏁', type: 'pk', types: ['冠军特殊', '冠亚和两面'] },
    { name: '极速赛车', icon: '🚗', type: 'pk', types: ['冠军特殊', '冠亚和两面'] },
    { name: '快三', icon: '🎲', type: 'k3', types: ['单双', '大小', '总和'] },
    { name: '百人牛牛', icon: '🐂', type: 'nn', types: ['龙虎', '大小'] },
    { name: '澳洲幸运5', icon: '🦘', type: 'au', types: ['总和', '大小', '单双'] },
    { name: 'SG飞艇', icon: '✈️', type: 'sg', types: ['冠军特殊', '大小'] },
    { name: '六合彩', icon: '🎱', type: 'lhc', types: ['特码两面', '大小', '单双'] },
    { name: '极速快3', icon: '🎯', type: 'k3', types: ['大小', '单双'] },
    { name: 'SG快3', icon: '🎪', type: 'sg', types: ['单双', '大小'] },
    { name: '幸运飞艇', icon: '🚀', type: 'pk', types: ['冠军特殊', '冠亚和两面'] },
    { name: '极速飞艇', icon: '🛩️', type: 'pk', types: ['冠亚和两面', '大小'] },
    { name: 'PC28', icon: '💻', type: 'pc28', types: ['大小', '单双'] },
    { name: '龙虎', icon: '🐲', type: 'lh', types: ['龙虎', '大小'] },
    { name: '百家乐', icon: '🃏', type: 'bjl', types: ['庄闲', '大小'] }
];

// 结果值配置
const resultValues = {
    '总和': ['大', '小'],
    '大小': ['大', '小'],
    '单双': ['单', '双'],
    '冠军特殊': ['大', '小', '单', '双'],
    '冠亚和两面': ['大', '小', '单', '双', '和大', '和小', '和单', '和双'],
    '龙虎': ['龙', '虎'],
    '特码两面': ['大', '小', '单', '双'],
    '庄闲': ['庄', '闲']
};

// 结果样式
const valueStyles = {
    '大': '', '龙': '', '庄': '', '单': 'green',
    '小': 'blue', '虎': 'blue', '闲': 'blue', '双': 'blue',
    '和大': '', '和小': 'blue', '和单': 'green', '和双': 'blue'
};

// 当前筛选状态
let currentPeriod = 2;
let selectedLotteries = new Set(lotteryData.map(l => l.name));

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateStatusTime();
    initPeriodFilter();
    initFilterModal();
    generateDragons();
    startCountdowns();
});

// 更新状态栏时间
function updateStatusTime() {
    const el = document.getElementById('statusTime');
    if (el) {
        const now = new Date();
        el.textContent = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');
    }
}

// 期数筛选
function initPeriodFilter() {
    const tabs = document.querySelectorAll('.period-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentPeriod = parseInt(this.dataset.value);
            generateDragons();
        });
    });
}

// 筛选弹窗
function initFilterModal() {
    const filterBtn = document.getElementById('filterBtn');
    const filterModal = document.getElementById('filterModal');
    const overlay = filterModal.querySelector('.filter-overlay');
    const confirmBtn = document.getElementById('confirmFilter');
    const selectAllBtn = document.getElementById('selectAll');
    const clearAllBtn = document.getElementById('clearAll');

    filterBtn.addEventListener('click', () => {
        filterModal.classList.add('show');
    });

    overlay.addEventListener('click', () => {
        filterModal.classList.remove('show');
    });

    confirmBtn.addEventListener('click', () => {
        // 收集选中的彩种
        selectedLotteries.clear();
        filterModal.querySelectorAll('.lottery-check input:checked').forEach(input => {
            selectedLotteries.add(input.value);
        });
        filterModal.classList.remove('show');
        generateDragons();
    });

    selectAllBtn.addEventListener('click', () => {
        filterModal.querySelectorAll('.lottery-check input').forEach(input => {
            input.checked = true;
        });
    });

    clearAllBtn.addEventListener('click', () => {
        filterModal.querySelectorAll('.lottery-check input').forEach(input => {
            input.checked = false;
        });
    });
}

// 生成长龙数据
function generateDragons() {
    const list = document.getElementById('dragonList');
    
    // 生成随机长龙数据
    let dragons = [];
    
    lotteryData.forEach(lottery => {
        if (!selectedLotteries.has(lottery.name)) return;
        
        // 随机生成1-2个长龙
        const count = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
            const type = lottery.types[Math.floor(Math.random() * lottery.types.length)];
            const values = resultValues[type] || ['大', '小'];
            const value = values[Math.floor(Math.random() * values.length)];
            const streak = currentPeriod + Math.floor(Math.random() * 4);
            
            // 只显示符合期数筛选的
            if (streak >= currentPeriod) {
                dragons.push({
                    ...lottery,
                    dragonType: type,
                    dragonValue: value,
                    streak: streak,
                    countdown: Math.floor(Math.random() * 600),
                    period: generatePeriod()
                });
            }
        }
    });

    // 按连续期数排序
    dragons.sort((a, b) => b.streak - a.streak);

    if (dragons.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-text">暂无符合条件的长龙数据</div>
            </div>
        `;
        return;
    }

    list.innerHTML = dragons.map((dragon, index) => {
        const isHot = dragon.streak >= 5;
        const valueStyle = valueStyles[dragon.dragonValue] || '';
        
        return `
            <div class="dragon-card">
                <div class="lottery-icon ${dragon.type}">
                    ${dragon.icon}
                </div>
                <div class="dragon-info">
                    <div class="lottery-name">
                        ${dragon.name}
                        ${isHot ? '<span class="hot-badge">热</span>' : ''}
                    </div>
                    <div class="dragon-detail">
                        连开<span class="streak">${dragon.streak}</span>期 
                        (${dragon.dragonType} - <span class="type-value ${valueStyle}">${dragon.dragonValue}</span>)
                    </div>
                </div>
                <div class="dragon-right">
                    <div class="countdown" data-seconds="${dragon.countdown}">
                        ${formatCountdown(dragon.countdown)}
                    </div>
                    <div class="period-num">${dragon.period} <span class="suffix">期</span></div>
                </div>
            </div>
        `;
    }).join('');
}

// 生成期号
function generatePeriod() {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');
    const seq = Math.floor(Math.random() * 200 + 1).toString().padStart(3, '0');
    return dateStr + seq;
}

// 格式化倒计时
function formatCountdown(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}<span class="colon">:</span>${m}<span class="colon">:</span>${s}`;
}

// 启动倒计时
function startCountdowns() {
    setInterval(() => {
        document.querySelectorAll('.countdown').forEach(el => {
            let seconds = parseInt(el.dataset.seconds);
            if (seconds > 0) {
                seconds--;
                el.dataset.seconds = seconds;
                el.innerHTML = formatCountdown(seconds);
            }
        });
    }, 1000);
}
