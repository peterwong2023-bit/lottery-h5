/**
 * 走势分析页面脚本 - 深度优化版
 * 与新闻、好路、杀号等页面风格统一
 */

document.addEventListener('DOMContentLoaded', function() {
    initStatusBar();
    initLotterySelector();
    initTrendTabs();
    initCountdown();
    initScrollIndicator();
    initDragonTabs();
    initRoadFilters();
    initFavButton();
    initDateFilters();
    renderDice();
    
    // 生成所有面板数据
    generateAllData();
});

// ===================================
//   状态栏
// ===================================
function initStatusBar() {
    const el = document.getElementById('statusTime');
    if (!el) return;
    function update() {
        const now = new Date();
        el.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    update();
    setInterval(update, 30000);
}

// ===================================
//   骰子渲染（点阵3x3网格）
// ===================================
function renderDice() {
    document.querySelectorAll('.dice-cube').forEach(cube => {
        const value = parseInt(cube.dataset.value);
        cube.innerHTML = '';
        
        const patterns = {
            1: [0,0,0, 0,1,0, 0,0,0],
            2: [0,0,1, 0,0,0, 1,0,0],
            3: [0,0,1, 0,1,0, 1,0,0],
            4: [1,0,1, 0,0,0, 1,0,1],
            5: [1,0,1, 0,1,0, 1,0,1],
            6: [1,0,1, 1,0,1, 1,0,1]
        };
        
        const pattern = patterns[value] || patterns[1];
        pattern.forEach(dot => {
            const el = document.createElement('div');
            el.className = 'dice-dot' + (dot ? ' visible' : '');
            cube.appendChild(el);
        });
    });
}

// ===================================
//   收藏按钮
// ===================================
function initFavButton() {
    const btn = document.getElementById('favBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        this.classList.toggle('favorited');
        showToast(this.classList.contains('favorited') ? '已收藏此彩种' : '已取消收藏');
    });
}

// ===================================
//   彩种选择弹窗
// ===================================
function initLotterySelector() {
    const picker = document.getElementById('lotteryPicker');
    const modal = document.getElementById('lotteryModal');
    const closeBtn = document.getElementById('modalClose');
    const mask = modal.querySelector('.modal-mask');
    const options = modal.querySelectorAll('.lottery-option');
    
    picker.addEventListener('click', () => modal.classList.add('show'));
    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    mask.addEventListener('click', () => modal.classList.remove('show'));
    
    options.forEach(opt => {
        opt.addEventListener('click', function() {
            options.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            const name = this.textContent;
            const icon = this.dataset.icon;
            document.getElementById('currentLotteryName').textContent = name;
            document.querySelector('.picker-icon').textContent = icon;
            
            modal.classList.remove('show');
            showToast(`已切换到 ${name}`);
            generateAllData();
        });
    });
}

// ===================================
//   走势类型切换
// ===================================
function initTrendTabs() {
    const typeBtns = document.querySelectorAll('.trend-type');
    const panels = document.querySelectorAll('.trend-panel');
    
    typeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            typeBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            const type = this.dataset.type;
            const panel = document.getElementById(`${type}Panel`);
            if (panel) panel.classList.add('active');
            
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });
}

// ===================================
//   日期筛选按钮
// ===================================
function initDateFilters() {
    document.querySelectorAll('.date-filter').forEach(filter => {
        filter.querySelectorAll('.date-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.parentElement.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                showToast(`已切换到 ${this.textContent}`);
            });
        });
    });
}

// ===================================
//   倒计时环
// ===================================
function initCountdown() {
    let seconds = 45;
    const el = document.getElementById('countdown');
    const ring = document.getElementById('countdownRing');
    if (!el) return;
    
    const circumference = 2 * Math.PI * 16;
    if (ring) {
        ring.style.strokeDasharray = circumference;
    }
    
    function updateRing() {
        if (!ring) return;
        const ratio = seconds / 60;
        ring.style.strokeDashoffset = circumference * (1 - ratio);
    }
    updateRing();
    
    setInterval(() => {
        seconds = seconds > 0 ? seconds - 1 : 60;
        el.textContent = seconds;
        updateRing();
    }, 1000);
}

// ===================================
//   滚动提示指示器
// ===================================
function initScrollIndicator() {
    const container = document.getElementById('trendTypes');
    if (!container) return;
    const scroll = container.querySelector('.types-scroll');
    if (!scroll) return;
    
    scroll.addEventListener('scroll', function() {
        const isEnd = this.scrollLeft + this.clientWidth >= this.scrollWidth - 10;
        container.classList.toggle('scrolled-end', isEnd);
    });
}

// ===================================
//   长龙标签切换
// ===================================
function initDragonTabs() {
    const tabs = document.querySelectorAll('.dragon-tab');
    const label = document.getElementById('dragonTypeLabel');
    const typeMap = { odd: '单', even: '双', big: '大', small: '小' };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const type = this.dataset.type;
            if (label) label.textContent = typeMap[type] || '单';
            generateDragonTable();
        });
    });
}

// ===================================
//   号码路珠筛选
// ===================================
function initRoadFilters() {
    const checks = document.querySelectorAll('.road-check input');
    checks.forEach(check => {
        check.addEventListener('change', generateRoadGrids);
    });
    
    const selectAll = document.getElementById('selectAllRoad');
    const clearAll = document.getElementById('clearAllRoad');
    
    if (selectAll) {
        selectAll.addEventListener('click', () => {
            checks.forEach(c => c.checked = true);
            generateRoadGrids();
        });
    }
    if (clearAll) {
        clearAll.addEventListener('click', () => {
            checks.forEach(c => c.checked = false);
            generateRoadGrids();
        });
    }
}

// ===================================
//   生成所有数据
// ===================================
function generateAllData() {
    generateHistoryTable();
    generateAnalysisPanel();
    generatePositionTable();
    generateRoadGrids();
    generateSumRoadGrids();
    generateBasicTable();
    generateDragonTable();
    generateSizeTable();
    generateOddEvenTable();
    generateSumHistoryTable();
}

// ===================================
//   工具函数
// ===================================
function randDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 创建骰子HTML（用于表格内）
function makeDiceHTML(val) {
    return `<span class="dice">${val}</span>`;
}

// ==================== 开奖记录 ====================
function generateHistoryTable() {
    const tbody = document.getElementById('historyTable');
    if (!tbody) return;
    
    let html = '';
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
        const d1 = randDice(), d2 = randDice(), d3 = randDice();
        const sum = d1 + d2 + d3;
        const isBig = sum > 10;
        const isOdd = sum % 2 === 1;
        const period = 350 - i;
        const h = now.getHours();
        const m = (now.getMinutes() - i + 60) % 60;
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        
        html += `
            <tr${i === 0 ? ' class="latest-row"' : ''}>
                <td>${time}</td>
                <td>0228-${String(period).padStart(4, '0')}</td>
                <td>
                    <div class="dice-nums">
                        ${makeDiceHTML(d1)}${makeDiceHTML(d2)}${makeDiceHTML(d3)}
                    </div>
                </td>
                <td><strong>${sum}</strong></td>
                <td class="${isBig ? 'big' : 'small'}">${isBig ? '大' : '小'}</td>
                <td class="${isOdd ? 'odd' : 'even'}">${isOdd ? '单' : '双'}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

// ==================== 综合分析 ====================
function generateAnalysisPanel() {
    // 豹子遗漏
    const baoziStats = document.getElementById('baoziStats');
    if (baoziStats) {
        let html = '';
        for (let i = 1; i <= 6; i++) {
            const val = randInt(20, 55);
            html += `<div class="stat-cell${val > 40 ? ' highlight' : ''}"><span class="label">${i}${i}${i}</span><span class="value">${val}</span></div>`;
        }
        baoziStats.innerHTML = html;
    }
    
    // 对子遗漏
    const duiziStats = document.getElementById('duiziStats');
    if (duiziStats) {
        let html = '';
        for (let i = 1; i <= 6; i++) {
            const val = randInt(5, 25);
            html += `<div class="stat-cell${val < 8 ? ' highlight' : ''}"><span class="label">${i}${i}X</span><span class="value">${val}</span></div>`;
        }
        duiziStats.innerHTML = html;
    }
    
    // 和值遗漏
    const hezhiStats = document.getElementById('hezhiStats');
    if (hezhiStats) {
        let html = '';
        for (let i = 3; i <= 18; i++) {
            const val = randInt(3, 40);
            const isHighlight = val <= 5;
            html += `<div class="stat-cell${isHighlight ? ' highlight' : ''}"><span class="label">${i}</span><span class="value">${val}</span></div>`;
        }
        hezhiStats.innerHTML = html;
    }
    
    // 期数统计
    const qishuStats = document.getElementById('qishuStats');
    if (qishuStats) {
        const items = [
            { label: '大', value: randInt(12, 20), color: '#dc2626' },
            { label: '小', value: randInt(10, 18), color: '#2563eb' },
            { label: '单', value: randInt(12, 20), color: '#f59e0b' },
            { label: '双', value: randInt(10, 18), color: '#8b5cf6' },
            { label: '1', value: randInt(8, 18) },
            { label: '2', value: randInt(8, 18) },
            { label: '3', value: randInt(8, 18) },
            { label: '4', value: randInt(8, 18) },
            { label: '5', value: randInt(8, 18) },
            { label: '6', value: randInt(8, 18) }
        ];
        let html = '';
        items.forEach(item => {
            const style = item.color ? `style="color:${item.color}"` : '';
            html += `<div class="stat-cell"><span class="label">${item.label}</span><span class="value" ${style}>${item.value}</span></div>`;
        });
        qishuStats.innerHTML = html;
    }
    
    // 综合详细表格
    const analysisTable = document.getElementById('analysisTable');
    if (analysisTable) {
        let html = '';
        for (let i = 0; i < 15; i++) {
            const d1 = randDice(), d2 = randDice(), d3 = randDice();
            const sum = d1 + d2 + d3;
            const isBig = sum > 10;
            const isOdd = sum % 2 === 1;
            const isDuizi = d1 === d2 || d2 === d3 || d1 === d3;
            const isBaozi = d1 === d2 && d2 === d3;
            
            html += `
                <tr${i === 0 ? ' class="latest-row"' : ''}>
                    <td>${d1}-${d2}-${d3}</td>
                    <td><strong>${sum}</strong></td>
                    <td><span class="${isBig ? 'big-tag' : 'small-tag'}">${isBig ? '大' : '小'}</span></td>
                    <td class="${isOdd ? 'odd' : 'even'}">${isOdd ? '单' : '双'}</td>
                    <td>${isDuizi && !isBaozi ? '✓' : '-'}</td>
                    <td>${isBaozi ? '✓' : '-'}</td>
                </tr>
            `;
        }
        analysisTable.innerHTML = html;
    }
}

// ==================== 定位走势 ====================
function generatePositionTable() {
    const tbody = document.getElementById('positionTable');
    if (!tbody) return;
    
    let html = '';
    for (let i = 0; i < 25; i++) {
        const d1 = randDice(), d2 = randDice(), d3 = randDice();
        const period = 350 - i;
        
        html += `<tr${i === 0 ? ' class="latest-row"' : ''}><td>0228-${String(period).padStart(4, '0')}</td>`;
        
        [d1, d2, d3].forEach(num => {
            const isBig = num > 3;
            const isOdd = num % 2 === 1;
            
            for (let j = 1; j <= 6; j++) {
                if (j === num) {
                    html += `<td><span class="num-circle">${j}</span></td>`;
                } else {
                    html += `<td>${randInt(1, 8)}</td>`;
                }
            }
            html += `<td class="${isBig ? 'big' : ''}">${isBig ? '大' : ''}</td>`;
            html += `<td class="${!isBig ? 'small' : ''}">${!isBig ? '小' : ''}</td>`;
            html += `<td class="${isOdd ? 'odd' : ''}">${isOdd ? '单' : ''}</td>`;
            html += `<td class="${!isOdd ? 'even' : ''}">${!isOdd ? '双' : ''}</td>`;
        });
        
        html += `<td>${d1}-${d2}-${d3}</td></tr>`;
    }
    tbody.innerHTML = html;
}

// ==================== 号码路珠 ====================
function generateRoadGrids() {
    const container = document.getElementById('roadGrids');
    if (!container) return;
    
    const checkedNums = [];
    document.querySelectorAll('.road-check input:checked').forEach(check => {
        checkedNums.push(parseInt(check.dataset.num));
    });
    
    let html = '';
    checkedNums.forEach(num => {
        html += `
            <div class="road-grid-item">
                <div class="road-grid-title">号码 ${num}</div>
                <div class="road-grid">
        `;
        for (let i = 0; i < 60; i++) {
            const value = randDice();
            if (value === num) {
                html += `<div class="road-cell n${num}">${num}</div>`;
            } else {
                html += `<div class="road-cell" style="background: var(--gray-200);"></div>`;
            }
        }
        html += '</div></div>';
    });
    container.innerHTML = html;
}

// ==================== 总和路珠 ====================
function generateSumRoadGrids() {
    const container = document.getElementById('sumRoadGrids');
    if (!container) return;
    
    const types = [
        { name: '大', tag: 'red', color: '#ef4444', check: s => s > 10 },
        { name: '小', tag: 'blue', color: '#3b82f6', check: s => s <= 10 },
        { name: '单', tag: 'purple', color: '#8b5cf6', check: s => s % 2 === 1 },
        { name: '双', tag: 'green', color: '#10b981', check: s => s % 2 === 0 }
    ];
    
    let html = '';
    types.forEach(type => {
        html += `
            <div class="sum-road-item">
                <div class="sum-road-title">
                    <span class="tag ${type.tag}">${type.name[0]}</span>
                    ${type.name}走势
                </div>
                <div class="sum-road-grid">
        `;
        for (let i = 0; i < 30; i++) {
            const sum = randInt(3, 18);
            const isMatch = type.check(sum);
            html += `<div class="sum-road-cell" style="background: ${isMatch ? type.color : 'var(--gray-200)'}"></div>`;
        }
        html += '</div></div>';
    });
    container.innerHTML = html;
}

// ==================== 基本走势 ====================
function generateBasicTable() {
    const tbody = document.getElementById('basicTable');
    if (!tbody) return;
    
    let html = '';
    for (let i = 0; i < 25; i++) {
        const d1 = randDice(), d2 = randDice(), d3 = randDice();
        const sum = d1 + d2 + d3;
        const period = 350 - i;
        const isBaozi = d1 === d2 && d2 === d3;
        const isDuizi = !isBaozi && (d1 === d2 || d2 === d3 || d1 === d3);
        const isSanbutong = !isBaozi && !isDuizi;
        
        html += `<tr${i === 0 ? ' class="latest-row"' : ''}><td>0228-${String(period).padStart(4, '0')}</td>`;
        
        // 号码分布 1-6
        for (let j = 1; j <= 6; j++) {
            const count = [d1, d2, d3].filter(d => d === j).length;
            html += count > 0 ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 8)}</td>`;
        }
        
        // 号码形态
        html += `<td class="${isBaozi ? 'big' : ''}">${isBaozi ? '豹' : ''}</td>`;
        html += `<td class="${isSanbutong ? 'even' : ''}">${isSanbutong ? '三' : ''}</td>`;
        html += `<td class="${isDuizi ? 'odd' : ''}">${isDuizi ? '对' : ''}</td>`;
        
        // 和值走势 3-18
        for (let j = 3; j <= 18; j++) {
            html += j === sum ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 12)}</td>`;
        }
        
        html += `<td>${d1}-${d2}-${d3}</td></tr>`;
    }
    tbody.innerHTML = html;
}

// ==================== 每日长龙统计 ====================
function generateDragonTable() {
    const tbody = document.getElementById('dragonTable');
    if (!tbody) return;
    
    const dates = ['02-28', '02-27', '02-26', '02-25', '02-24', '02-23', '02-22'];
    let html = '';
    
    dates.forEach((date, idx) => {
        const total = randInt(20, 50);
        html += `<tr${idx === 0 ? ' class="latest-row"' : ''}><td>${date}</td><td>${total}</td>`;
        
        for (let i = 2; i <= 17; i++) {
            const count = Math.max(0, randInt(0, 10) - Math.floor(i * 0.6));
            if (count > 0) {
                const isHot = count >= 5;
                const isWarm = count >= 3 && count < 5;
                let cls = '';
                if (isHot) cls = ' class="hot-value"';
                else if (isWarm) cls = ' class="warm-value"';
                html += `<td${cls}>${count}</td>`;
            } else {
                html += `<td>-</td>`;
            }
        }
        html += '</tr>';
    });
    tbody.innerHTML = html;
}

// ==================== 大小走势 ====================
function generateSizeTable() {
    const tbody = document.getElementById('sizeTable');
    if (!tbody) return;
    
    let html = '';
    for (let i = 0; i < 25; i++) {
        const d1 = randDice(), d2 = randDice(), d3 = randDice();
        const period = 350 - i;
        
        const bigCount = [d1, d2, d3].filter(d => d > 3).length;
        const smallCount = 3 - bigCount;
        const ratios = ['0:3', '1:2', '2:1', '3:0'];
        
        html += `<tr${i === 0 ? ' class="latest-row"' : ''}><td>0228-${String(period).padStart(4, '0')}</td>`;
        
        // 号码分布 1-6
        for (let j = 1; j <= 6; j++) {
            const count = [d1, d2, d3].filter(d => d === j).length;
            html += count > 0 ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 8)}</td>`;
        }
        
        // 百位十位个位
        html += `<td class="${d1 > 3 ? 'big' : 'small'}">${d1 > 3 ? '大' : '小'}</td>`;
        html += `<td class="${d2 > 3 ? 'big' : 'small'}">${d2 > 3 ? '大' : '小'}</td>`;
        html += `<td class="${d3 > 3 ? 'big' : 'small'}">${d3 > 3 ? '大' : '小'}</td>`;
        
        // 大小比走势
        for (let j = 0; j < 4; j++) {
            html += j === (3 - bigCount) ? `<td><span class="num-circle">${ratios[3-j]}</span></td>` : `<td>${randInt(1, 6)}</td>`;
        }
        
        // 大数个数
        for (let j = 0; j <= 3; j++) {
            html += j === bigCount ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 6)}</td>`;
        }
        
        // 小数个数
        for (let j = 0; j <= 3; j++) {
            html += j === smallCount ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 6)}</td>`;
        }
        
        html += `<td>${d1}-${d2}-${d3}</td></tr>`;
    }
    tbody.innerHTML = html;
}

// ==================== 奇偶走势 ====================
function generateOddEvenTable() {
    const tbody = document.getElementById('oddevenTable');
    if (!tbody) return;
    
    let html = '';
    for (let i = 0; i < 25; i++) {
        const d1 = randDice(), d2 = randDice(), d3 = randDice();
        const period = 350 - i;
        
        const oddCount = [d1, d2, d3].filter(d => d % 2 === 1).length;
        const evenCount = 3 - oddCount;
        const ratios = ['0:3', '1:2', '2:1', '3:0'];
        
        html += `<tr${i === 0 ? ' class="latest-row"' : ''}><td>0228-${String(period).padStart(4, '0')}</td>`;
        
        // 号码分布 1-6
        for (let j = 1; j <= 6; j++) {
            const count = [d1, d2, d3].filter(d => d === j).length;
            html += count > 0 ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 8)}</td>`;
        }
        
        // 百位十位个位
        html += `<td class="${d1 % 2 === 1 ? 'odd' : 'even'}">${d1 % 2 === 1 ? '奇' : '偶'}</td>`;
        html += `<td class="${d2 % 2 === 1 ? 'odd' : 'even'}">${d2 % 2 === 1 ? '奇' : '偶'}</td>`;
        html += `<td class="${d3 % 2 === 1 ? 'odd' : 'even'}">${d3 % 2 === 1 ? '奇' : '偶'}</td>`;
        
        // 奇偶比走势
        for (let j = 0; j < 4; j++) {
            html += j === (3 - oddCount) ? `<td><span class="num-circle">${ratios[3-j]}</span></td>` : `<td>${randInt(1, 6)}</td>`;
        }
        
        // 奇数个数
        for (let j = 0; j <= 3; j++) {
            html += j === oddCount ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 6)}</td>`;
        }
        
        // 偶数个数
        for (let j = 0; j <= 3; j++) {
            html += j === evenCount ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 6)}</td>`;
        }
        
        html += `<td>${d1}-${d2}-${d3}</td></tr>`;
    }
    tbody.innerHTML = html;
}

// ==================== 和值历史号码 ====================
function generateSumHistoryTable() {
    const tbody = document.getElementById('sumhistoryTable');
    if (!tbody) return;
    
    let html = '';
    for (let i = 0; i < 25; i++) {
        const d1 = randDice(), d2 = randDice(), d3 = randDice();
        const sum = d1 + d2 + d3;
        const isBig = sum > 10;
        const isOdd = sum % 2 === 1;
        const period = 350 - i;
        
        html += `<tr${i === 0 ? ' class="latest-row"' : ''}><td>0228-${String(period).padStart(4, '0')}</td>`;
        
        // 和值
        html += `<td><strong>${sum}</strong></td>`;
        
        // 和值走势 3-18
        for (let j = 3; j <= 18; j++) {
            html += j === sum ? `<td><span class="num-circle">${j}</span></td>` : `<td>${randInt(1, 12)}</td>`;
        }
        
        // 和值形态
        html += `<td class="${isBig ? 'big' : ''}">${isBig ? '大' : ''}</td>`;
        html += `<td class="${!isBig ? 'small' : ''}">${!isBig ? '小' : ''}</td>`;
        html += `<td class="${isOdd ? 'odd' : ''}">${isOdd ? '单' : ''}</td>`;
        html += `<td class="${!isOdd ? 'even' : ''}">${!isOdd ? '双' : ''}</td>`;
        
        html += `<td>${d1}-${d2}-${d3}</td></tr>`;
    }
    tbody.innerHTML = html;
}

// ===================================
//   Toast 提示
// ===================================
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 24px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        animation: toastIn 0.3s ease;
    `;
    
    if (!document.getElementById('toastStyle')) {
        const style = document.createElement('style');
        style.id = 'toastStyle';
        style.textContent = `@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===================================
//   走势说明指南
// ===================================

// 走势tab与说明tab的映射
var guideTabMap = {
    'history': 'history',
    'analysis': 'analysis',
    'position': 'position',
    'numbeads': 'numbeads',
    'sumbeads': 'numbeads',
    'basic': 'basic',
    'dragon': 'dragon',
    'size': 'size',
    'oddeven': 'size',
    'sumhistory': 'history',
    'rules': 'history'
};

function openTrendGuide() {
    var overlay = document.getElementById('trendGuideOverlay');
    if (!overlay) return;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // 自动切换到当前走势tab对应的说明
    var activeTrendTab = document.querySelector('.trend-type.active');
    if (activeTrendTab) {
        var trendType = activeTrendTab.dataset.type;
        var guideType = guideTabMap[trendType] || 'history';
        var targetTab = document.querySelector('.guide-tab[data-guide="' + guideType + '"]');
        if (targetTab) {
            switchGuideTab(targetTab);
        }
    }
}

function closeTrendGuide() {
    var overlay = document.getElementById('trendGuideOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

function switchGuideTab(tabEl) {
    if (!tabEl) return;
    var guideType = tabEl.dataset.guide;

    // 切换tab样式
    document.querySelectorAll('.guide-tab').forEach(function(t) {
        t.classList.remove('active');
    });
    tabEl.classList.add('active');

    // 切换内容
    document.querySelectorAll('.guide-section').forEach(function(s) {
        s.classList.remove('active');
    });
    var target = document.querySelector('.guide-section[data-guide="' + guideType + '"]');
    if (target) {
        target.classList.add('active');
    }

    // 滚动tab到可见
    tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}
