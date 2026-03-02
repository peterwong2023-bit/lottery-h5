// 好路推荐 - H5版本

(function() {
    'use strict';

    const LOTTERY_GROUPS = [
        {
            name: '东方彩票',
            items: [
                { name: '快三', icon: '🎲' },
                { name: '鱼虾蟹', icon: '🦀' },
                { name: '赛车', icon: '🏁' },
                { name: '六合彩', icon: '🎱' },
                { name: '时时彩', icon: '🎰' },
                { name: 'PC28', icon: '💻' },
                { name: '百人牛牛', icon: '🐂' },
                { name: '龙虎', icon: '🐲' },
                { name: '百家乐', icon: '🃏' },
                { name: '三公', icon: '🀄' },
                { name: '轮盘', icon: '🎡' }
            ]
        },
        {
            name: 'PK系列',
            items: [
                { name: '极速赛车', icon: '🚗' },
                { name: '幸运飞艇', icon: '🚀' },
                { name: 'SG飞艇', icon: '✈️' }
            ]
        },
        {
            name: '快三系列',
            items: [
                { name: '极速快3', icon: '🎯' },
                { name: 'SG快3', icon: '🎪' }
            ]
        },
        {
            name: '时时彩系列',
            items: [
                { name: '幸运时时彩', icon: '⏱️' },
                { name: '澳洲幸运5', icon: '🦘' },
                { name: '澳洲幸运10', icon: '🏎️' }
            ]
        }
    ];

    const TYPE_CONFIG = {
        oddeven:  { values: ['单', '双'], classes: ['odd', 'even'] },
        bigsmall: { values: ['大', '小'], classes: ['big', 'small'] },
        color:    { values: ['红', '蓝', '绿'], classes: ['red', 'blue', 'green'] },
        redblack: { values: ['红', '黑', '绿'], classes: ['red', 'black', 'green'] },
        baccarat: { values: ['庄', '闲', '和'], classes: ['banker', 'player', 'tie'] }
    };

    const PATTERNS = ['长龙', '单跳', '两房两厅', '两房一厅', '连续长连', '不过三', '常连', '常跳'];
    const PLAY_NAMES = ['总和-单双', '总和-大小', '冠亚和-单双', '冠军-大小', '第一球-大小', '第二球-单双', '胜负-大小', '胜负-单双', '庄闲-大小', '正码-单双', '正码-红黑', '特码-色波'];
    const PLAY_TYPE_KEYS = ['oddeven', 'bigsmall', 'oddeven', 'bigsmall', 'bigsmall', 'oddeven', 'bigsmall', 'oddeven', 'bigsmall', 'oddeven', 'redblack', 'color'];

    let allLotteries = [];
    let selectedLotteries = new Set();
    let activeFilters = ['dragon'];
    let roadConfigs = [];

    const MAX_ROWS = 6;
    const MAX_COLS = 20;

    document.addEventListener('DOMContentLoaded', function() {
        updateStatusTime();
        initLotteries();
        renderFilterPanel();
        generateRoadConfigs();
        initFilters();
        initLotteryFilter();
        initHelpModal();
        renderCards();
        startCountdown();
    });

    function updateStatusTime() {
        const el = document.getElementById('statusTime');
        if (el) {
            const now = new Date();
            el.textContent = now.getHours().toString().padStart(2, '0') + ':' +
                             now.getMinutes().toString().padStart(2, '0');
        }
    }

    function initLotteries() {
        allLotteries = [];
        LOTTERY_GROUPS.forEach(group => {
            group.items.forEach(item => {
                allLotteries.push(item);
                selectedLotteries.add(item.name);
            });
        });
    }

    function renderFilterPanel() {
        const body = document.getElementById('lotteryFilterBody');
        if (!body) return;
        body.innerHTML = LOTTERY_GROUPS.map(group => `
            <div class="h5-filter-group">
                <div class="h5-filter-group-title">${group.name}</div>
                <div class="h5-filter-group-items">
                    ${group.items.map(item => `
                        <button class="h5-lottery-check active" data-name="${item.name}">
                            ${item.icon} ${item.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
        updateFilterLabel();
    }

    function generateRoadConfigs() {
        roadConfigs = [];
        allLotteries.forEach(lottery => {
            const count = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                const playIdx = Math.floor(Math.random() * PLAY_NAMES.length);
                roadConfigs.push({
                    lottery: lottery.name,
                    play: PLAY_NAMES[playIdx],
                    type: PLAY_TYPE_KEYS[playIdx],
                    pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
                });
            }
        });
    }

    function initFilters() {
        const chips = document.querySelectorAll('.filter-chip[data-type]');
        chips.forEach(chip => {
            chip.addEventListener('click', function() {
                this.classList.toggle('active');
                const type = this.dataset.type;
                if (this.classList.contains('active')) {
                    if (!activeFilters.includes(type)) activeFilters.push(type);
                } else {
                    activeFilters = activeFilters.filter(f => f !== type);
                }
                renderCards();
            });
        });
    }

    function initLotteryFilter() {
        const modal = document.getElementById('lotteryFilterModal');
        const overlay = modal.querySelector('.lottery-filter-overlay');
        const closeBtn = document.getElementById('btnFilterClose');
        const confirmBtn = document.getElementById('btnFilterConfirm');
        const openBtn = document.getElementById('btnLotteryFilter');

        openBtn.addEventListener('click', () => modal.classList.add('show'));
        overlay.addEventListener('click', () => modal.classList.remove('show'));
        closeBtn.addEventListener('click', () => modal.classList.remove('show'));
        confirmBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            renderCards();
        });

        document.getElementById('lotteryFilterBody').addEventListener('click', (e) => {
            const btn = e.target.closest('.h5-lottery-check');
            if (!btn) return;
            const name = btn.dataset.name;
            if (selectedLotteries.has(name)) {
                selectedLotteries.delete(name);
                btn.classList.remove('active');
            } else {
                selectedLotteries.add(name);
                btn.classList.add('active');
            }
            updateFilterLabel();
        });

        document.getElementById('btnH5SelectAll').addEventListener('click', () => {
            allLotteries.forEach(l => selectedLotteries.add(l.name));
            document.querySelectorAll('.h5-lottery-check').forEach(b => b.classList.add('active'));
            updateFilterLabel();
        });

        document.getElementById('btnH5ClearAll').addEventListener('click', () => {
            selectedLotteries.clear();
            document.querySelectorAll('.h5-lottery-check').forEach(b => b.classList.remove('active'));
            updateFilterLabel();
        });
    }

    function updateFilterLabel() {
        const el = document.getElementById('lotteryFilterLabel');
        if (!el) return;
        if (selectedLotteries.size === allLotteries.length) {
            el.textContent = '彩种筛选';
        } else {
            el.textContent = '已选 ' + selectedLotteries.size + '/' + allLotteries.length;
        }
    }

    function initHelpModal() {
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const helpClose = document.getElementById('helpClose');
        const helpOverlay = helpModal.querySelector('.help-overlay');

        helpBtn.addEventListener('click', () => helpModal.classList.add('show'));
        helpClose.addEventListener('click', () => helpModal.classList.remove('show'));
        helpOverlay.addEventListener('click', () => helpModal.classList.remove('show'));
    }

    function generateWaterfallData(type, periods) {
        const config = TYPE_CONFIG[type];
        if (!config) return [];
        const data = [];
        for (let i = 0; i < periods; i++) {
            const idx = Math.floor(Math.random() * config.values.length);
            data.push({ value: config.values[idx], class: config.classes[idx] });
        }
        return data;
    }

    function generateWaterfallGrid(data) {
        const grid = [];
        for (let i = 0; i < MAX_ROWS; i++) grid.push(new Array(MAX_COLS).fill(null));

        let col = 0, row = 0, lastValue = null, isDragonTurning = false;

        for (let i = 0; i < data.length && col < MAX_COLS; i++) {
            const item = data[i];
            if (lastValue === null) {
                grid[row][col] = item;
                lastValue = item.value;
            } else if (item.value === lastValue) {
                if (!isDragonTurning) {
                    if (row < MAX_ROWS - 1) { row++; grid[row][col] = item; }
                    else { isDragonTurning = true; col++; if (col < MAX_COLS) grid[row][col] = item; }
                } else {
                    col++;
                    if (col < MAX_COLS) grid[row][col] = item;
                }
            } else {
                col++; row = 0; isDragonTurning = false;
                if (col < MAX_COLS) grid[row][col] = item;
                lastValue = item.value;
            }
        }

        let usedCols = 0;
        for (let c = 0; c < MAX_COLS; c++) {
            for (let r = 0; r < MAX_ROWS; r++) {
                if (grid[r][c]) { usedCols = c + 1; break; }
            }
        }

        return { grid, usedCols };
    }

    function renderCards() {
        const container = document.getElementById('goodroadList');
        if (!container) return;

        const patternMap = {
            dragon: '长龙', jump: '单跳', '2room2hall': '两房两厅',
            '2room1hall': '两房一厅', longchain: '连续长连',
            max3: '不过三', chain: '常连', frequent: '常跳'
        };
        const activePatterns = activeFilters.map(f => patternMap[f]);

        let filtered = roadConfigs.filter(c => selectedLotteries.has(c.lottery));
        if (activeFilters.length > 0) {
            filtered = filtered.filter(c => activePatterns.includes(c.pattern));
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">暂无符合条件的好路</div>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(config => {
            const data = generateWaterfallData(config.type, 40);
            const { grid, usedCols } = generateWaterfallGrid(data);
            const countdown = Math.floor(Math.random() * 300) + 10;
            const typeConfig = TYPE_CONFIG[config.type];

            let streak = 0, lastValue = null;
            for (let c = usedCols - 1; c >= 0 && streak === 0; c--) {
                for (let r = MAX_ROWS - 1; r >= 0; r--) {
                    if (grid[r][c]) {
                        lastValue = grid[r][c].value;
                        for (let cc = c; cc >= 0; cc--) {
                            for (let rr = MAX_ROWS - 1; rr >= 0; rr--) {
                                if (grid[rr][cc] && grid[rr][cc].value === lastValue) streak++;
                            }
                        }
                        break;
                    }
                }
            }

            let gridHtml = '';
            for (let c = 0; c < usedCols; c++) {
                let colHtml = '';
                for (let r = 0; r < MAX_ROWS; r++) {
                    const cell = grid[r][c];
                    colHtml += cell
                        ? `<div class="waterfall-cell ${cell.class}">${cell.value}</div>`
                        : `<div class="waterfall-cell empty"></div>`;
                }
                gridHtml += `<div class="waterfall-column">${colHtml}</div>`;
            }

            return `
                <div class="goodroad-card" data-pattern="${config.pattern}">
                    <div class="card-header">
                        <div class="card-info">
                            <span class="card-lottery">${config.lottery}</span>
                            <span class="card-play">${config.play}</span>
                        </div>
                        <div class="card-right">
                            <div class="card-countdown">
                                <span class="time" data-seconds="${countdown}">${formatTime(countdown)}</span>
                            </div>
                            <span class="card-pattern">${config.pattern}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="waterfall-trend">${gridHtml}</div>
                    </div>
                    <div class="trend-hint">
                        ${typeConfig.values.map((v, i) => `
                            <span class="hint-item">
                                <span class="hint-dot ${typeConfig.classes[i]}"></span>
                                ${v}
                            </span>
                        `).join('')}
                        <span class="hint-item streak">
                            当前连${streak > 10 ? '10+' : streak}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function startCountdown() {
        setInterval(() => {
            document.querySelectorAll('.card-countdown .time').forEach(el => {
                let seconds = parseInt(el.dataset.seconds);
                if (seconds > 0) {
                    seconds--;
                    el.dataset.seconds = seconds;
                    el.textContent = formatTime(seconds);
                }
            });
        }, 1000);
    }

})();
