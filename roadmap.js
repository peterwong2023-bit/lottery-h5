/**
 * 路子图页面脚本 - 修正版
 * 修复：下三路算法(逐条目生成)、统计bug、期号更新
 */

(function() {
    'use strict';

    const CONFIG = {
        periods: 60,
        bigRoadRows: 6,
        bigRoadCols: 30,
        derivedRows: 6,
        derivedCols: 20
    };

    let rawData = [];
    let currentPeriodNum = 350; // 当前期号

    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        initStatusBar();
        generateRawData();
        renderAllRoads();
        initLotterySelector();
        initRoadTabs();
        initCountdown();
        initRefreshButton();
        initFilterBar();
        updateCurrentResult();
    });

    // ===================================
    //   状态栏
    // ===================================
    function initStatusBar() {
        const el = document.getElementById('statusTime');
        if (!el) return;
        function update() {
            const now = new Date();
            el.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        }
        update();
        setInterval(update, 30000);
    }

    // ===================================
    //   原始数据
    // ===================================
    function generateRawData() {
        rawData = [];
        for (let i = 0; i < CONFIG.periods; i++) {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const d3 = Math.floor(Math.random() * 6) + 1;
            const sum = d1 + d2 + d3;
            rawData.push({
                dice: [d1, d2, d3],
                sum: sum,
                size: sum >= 11 ? 'big' : 'small',
                oddEven: sum % 2 === 1 ? 'odd' : 'even'
            });
        }
    }

    // ===================================
    //   更新当前开奖结果显示
    // ===================================
    function updateCurrentResult() {
        if (rawData.length === 0) return;
        const latest = rawData[rawData.length - 1];

        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');
        const dice3 = document.getElementById('dice3');
        const sumText = document.getElementById('sumText');
        const sizeAttr = document.getElementById('sizeAttr');
        const oddEvenAttr = document.getElementById('oddEvenAttr');
        const periodEl = document.getElementById('currentPeriod');

        if (dice1) dice1.textContent = latest.dice[0];
        if (dice2) dice2.textContent = latest.dice[1];
        if (dice3) dice3.textContent = latest.dice[2];
        if (sumText) sumText.textContent = '= ' + latest.sum;
        if (periodEl) periodEl.textContent = String(currentPeriodNum).padStart(4, '0');

        if (sizeAttr) {
            sizeAttr.textContent = latest.size === 'big' ? '大' : '小';
            sizeAttr.className = 'attr ' + latest.size;
        }
        if (oddEvenAttr) {
            oddEvenAttr.textContent = latest.oddEven === 'odd' ? '单' : '双';
            oddEvenAttr.className = 'attr ' + latest.oddEven;
        }
    }

    // ===================================
    //   渲染所有路子图
    // ===================================
    function renderAllRoads() {
        // 大小路
        const sizeResult = generateBigRoadData('size');
        renderBeadPlate('sizeBeadPlate', 'size');
        renderBigRoad('sizeBigRoad', sizeResult.grid, 'size');
        renderDerivedRoads('sizeBigEye', 'sizeSmallRoad', 'sizeCockroach', sizeResult.columns);
        updateSizeStats();

        // 单双路
        const oddEvenResult = generateBigRoadData('oddEven');
        renderBeadPlate('oddEvenBeadPlate', 'oddEven');
        renderBigRoad('oddEvenBigRoad', oddEvenResult.grid, 'oddEven');
        renderDerivedRoads('oddEvenBigEye', 'oddEvenSmallRoad', 'oddEvenCockroach', oddEvenResult.columns);
        updateOddEvenStats();
    }

    // ===================================
    //   珠盘路
    // ===================================
    function renderBeadPlate(containerId, dataKey) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = rawData.map(function(item, index) {
            const value = item[dataKey];
            const isLatest = index === rawData.length - 1;
            var label, colorClass;
            if (dataKey === 'size') {
                label = value === 'big' ? '大' : '小';
                colorClass = value === 'big' ? 'big' : 'small';
            } else {
                label = value === 'odd' ? '单' : '双';
                colorClass = value === 'odd' ? 'odd' : 'even';
            }
            return '<div class="bead ' + colorClass + (isLatest ? ' latest' : '') + '">' + label + '</div>';
        }).join('');

        container.innerHTML = html;
    }

    // ===================================
    //   大路（标准算法）
    //   返回 grid 和 columns（供下三路使用）
    // ===================================
    function generateBigRoadData(dataKey) {
        var grid = [];
        for (var r = 0; r < CONFIG.bigRoadRows; r++) {
            grid.push(new Array(CONFIG.bigRoadCols).fill(null));
        }

        // columns: 记录每个逻辑列的条目数（含龙转弯产生的新列）
        var columns = [];
        var col = 0, row = 0, lastValue = null;
        var currentColEntries = 0;

        rawData.forEach(function(item, index) {
            var value = item[dataKey];
            var isLatest = index === rawData.length - 1;

            if (lastValue === null) {
                // 第一条数据
                grid[row][col] = { value: value, isLatest: isLatest };
                currentColEntries = 1;
            } else if (value === lastValue) {
                // 与上一条相同 → 向下或龙转弯
                if (row < CONFIG.bigRoadRows - 1 && !grid[row + 1][col]) {
                    row++;
                    grid[row][col] = { value: value, isLatest: isLatest };
                    currentColEntries++;
                } else {
                    // 龙转弯 → 保存当前列，开新列
                    columns.push(currentColEntries);
                    col++;
                    if (col >= CONFIG.bigRoadCols) {
                        shiftGrid(grid);
                        col = CONFIG.bigRoadCols - 1;
                    }
                    grid[row][col] = { value: value, isLatest: isLatest };
                    currentColEntries = 1;
                }
            } else {
                // 值变了 → 新列
                columns.push(currentColEntries);
                col++;
                row = 0;
                if (col >= CONFIG.bigRoadCols) {
                    shiftGrid(grid);
                    col = CONFIG.bigRoadCols - 1;
                }
                grid[row][col] = { value: value, isLatest: isLatest };
                currentColEntries = 1;
            }
            lastValue = value;
        });

        // 最后一列
        if (currentColEntries > 0) {
            columns.push(currentColEntries);
        }

        return { grid: grid, columns: columns };
    }

    function shiftGrid(grid) {
        for (var r = 0; r < CONFIG.bigRoadRows; r++) {
            grid[r].shift();
            grid[r].push(null);
        }
    }

    function renderBigRoad(containerId, grid, dataKey) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var html = '';
        for (var r = 0; r < CONFIG.bigRoadRows; r++) {
            for (var c = 0; c < CONFIG.bigRoadCols; c++) {
                var cell = grid[r][c];
                if (cell) {
                    var colorClass;
                    if (dataKey === 'size') {
                        colorClass = cell.value === 'big' ? 'big' : 'small';
                    } else {
                        colorClass = cell.value === 'odd' ? 'odd' : 'even';
                    }
                    html += '<div class="road-dot filled ' + colorClass + (cell.isLatest ? ' latest' : '') +
                            '" style="grid-column: ' + (c + 1) + '; grid-row: ' + (r + 1) + ';"></div>';
                }
            }
        }

        container.innerHTML = html;

        setTimeout(function() {
            var wrapper = container.parentElement;
            if (wrapper) wrapper.scrollLeft = wrapper.scrollWidth;
        }, 50);
    }

    // ===================================
    //   下三路（标准算法 - 逐条目生成）
    //
    //   大眼仔路 skipCount=1: 从第2列第2条开始
    //   小路     skipCount=2: 从第3列第2条开始
    //   曱甴路   skipCount=3: 从第4列第2条开始
    //
    //   判定规则:
    //   · 新列(rowIdx==0): 比较 columns[colIdx-1] 与 columns[colIdx-1-skip] 的长度
    //     相等→红(齐)  不等→蓝(不齐)
    //   · 续列(rowIdx>0): 检查 columns[colIdx-skip] 在同深度是否有条目
    //     有→红(齐)  无→蓝(不齐)
    // ===================================
    function generateDerivedResults(bigRoadColumns, skipCount) {
        var results = [];

        // 逐列、逐行遍历大路数据
        var colIdx = 0;
        for (var c = 0; c < bigRoadColumns.length; c++) {
            for (var rowIdx = 0; rowIdx < bigRoadColumns[c]; rowIdx++) {
                // 跳过起始点之前的条目
                // skip=1 → 从(col=1, row=1)开始
                // skip=2 → 从(col=2, row=1)开始
                // skip=3 → 从(col=3, row=1)开始
                if (c < skipCount) continue;
                if (c === skipCount && rowIdx === 0) continue;

                if (rowIdx === 0) {
                    // 新列开始: 比较前一列长度与参照列长度
                    var prevLen = bigRoadColumns[c - 1];
                    var refIdx = c - 1 - skipCount;
                    var refLen = refIdx >= 0 ? bigRoadColumns[refIdx] : -1;
                    results.push(prevLen === refLen ? 'red' : 'blue');
                } else {
                    // 列内延续: 检查参照列是否有同深度条目
                    var refCol = c - skipCount;
                    if (refCol >= 0 && bigRoadColumns[refCol] > rowIdx) {
                        results.push('red');
                    } else {
                        results.push('blue');
                    }
                }
            }
        }

        return results;
    }

    function layoutDerivedGrid(derivedResults) {
        var grid = [];
        for (var r = 0; r < CONFIG.derivedRows; r++) {
            grid.push(new Array(CONFIG.derivedCols).fill(null));
        }

        var col = 0, row = 0, lastValue = null;

        derivedResults.forEach(function(value) {
            if (lastValue === null) {
                grid[row][col] = value;
            } else if (value === lastValue) {
                if (row < CONFIG.derivedRows - 1 && !grid[row + 1][col]) {
                    row++;
                } else {
                    col++;
                    if (col >= CONFIG.derivedCols) {
                        for (var r = 0; r < CONFIG.derivedRows; r++) {
                            grid[r].shift();
                            grid[r].push(null);
                        }
                        col = CONFIG.derivedCols - 1;
                    }
                }
                grid[row][col] = value;
            } else {
                col++;
                row = 0;
                if (col >= CONFIG.derivedCols) {
                    for (var r = 0; r < CONFIG.derivedRows; r++) {
                        grid[r].shift();
                        grid[r].push(null);
                    }
                    col = CONFIG.derivedCols - 1;
                }
                grid[row][col] = value;
            }
            lastValue = value;
        });

        return grid;
    }

    function renderDerivedRoads(bigEyeId, smallRoadId, cockroachId, bigRoadColumns) {
        var containers = [
            { el: document.getElementById(bigEyeId), skip: 1 },
            { el: document.getElementById(smallRoadId), skip: 2 },
            { el: document.getElementById(cockroachId), skip: 3 }
        ];

        containers.forEach(function(item) {
            if (!item.el) return;

            var results = generateDerivedResults(bigRoadColumns, item.skip);
            var grid = layoutDerivedGrid(results);

            var html = '';
            var maxCol = 0;
            for (var c = 0; c < CONFIG.derivedCols; c++) {
                for (var r = 0; r < CONFIG.derivedRows; r++) {
                    if (grid[r][c]) maxCol = c + 1;
                }
            }

            for (var c = 0; c < maxCol; c++) {
                for (var r = 0; r < CONFIG.derivedRows; r++) {
                    var cell = grid[r][c];
                    if (cell) {
                        html += '<div class="derived-dot ' + cell +
                                '" style="grid-column: ' + (c + 1) + '; grid-row: ' + (r + 1) + ';"></div>';
                    }
                }
            }
            item.el.innerHTML = html;
        });
    }

    // ===================================
    //   统计计算
    // ===================================
    function calcStats(dataKey, val1, val2) {
        var data = rawData.map(function(d) { return d[dataKey]; });
        var count1 = data.filter(function(v) { return v === val1; }).length;
        var count2 = data.filter(function(v) { return v === val2; }).length;
        var total = data.length;
        var percent1 = Math.round(count1 / total * 100);
        var percent2 = 100 - percent1;

        // 当前连续
        var currentStreak = 1;
        var lastValue = data[data.length - 1];
        for (var i = data.length - 2; i >= 0; i--) {
            if (data[i] === lastValue) currentStreak++;
            else break;
        }

        // 最长连续（初始值=1，修复交替时显示0的bug）
        var maxStreak = 1;
        var maxStreakValue = data[0];
        var streak = 1;
        for (var i = 1; i < data.length; i++) {
            if (data[i] === data[i - 1]) {
                streak++;
                if (streak > maxStreak) {
                    maxStreak = streak;
                    maxStreakValue = data[i];
                }
            } else {
                streak = 1;
            }
        }

        return {
            count1: count1,
            count2: count2,
            percent1: percent1,
            percent2: percent2,
            currentStreak: currentStreak,
            lastValue: lastValue,
            maxStreak: maxStreak,
            maxStreakValue: maxStreakValue
        };
    }

    function updateSizeStats() {
        var stats = calcStats('size', 'big', 'small');

        setTextById('sizeBigCount', stats.count1);
        setTextById('sizeSmallCount', stats.count2);
        setTextById('sizeBigPercent', stats.percent1 + '%');
        setTextById('sizeSmallPercent', stats.percent2 + '%');
        setTextById('sizeRatio', stats.count1 + ':' + stats.count2);

        var isLastBig = stats.lastValue === 'big';
        var streakLabel = isLastBig ? '大' : '小';
        setTextById('sizeStreakBadge', streakLabel + stats.currentStreak + '连');
        setClassById('sizeStreakBadge', 'streak-badge ' + (isLastBig ? 'big' : 'small'));
        setTextById('sizeStreakTag', streakLabel + ' × ' + stats.currentStreak);
        setClassById('sizeStreakTag', 'streak-tag ' + (isLastBig ? 'red' : 'blue'));

        var maxLabel = stats.maxStreakValue === 'big' ? '大' : '小';
        var maxColor = stats.maxStreakValue === 'big' ? 'red' : 'blue';
        setTextById('sizeMaxStreak', maxLabel + ' × ' + stats.maxStreak);
        setClassById('sizeMaxStreak', 'stats-value ' + maxColor);
    }

    function updateOddEvenStats() {
        var stats = calcStats('oddEven', 'odd', 'even');

        setTextById('oddCount', stats.count1);
        setTextById('evenCount', stats.count2);
        setTextById('oddPercent', stats.percent1 + '%');
        setTextById('evenPercent', stats.percent2 + '%');
        setTextById('oddEvenRatio', stats.count1 + ':' + stats.count2);

        var isLastOdd = stats.lastValue === 'odd';
        var streakLabel = isLastOdd ? '单' : '双';
        setTextById('oddEvenStreakBadge', streakLabel + stats.currentStreak + '连');
        setClassById('oddEvenStreakBadge', 'streak-badge ' + (isLastOdd ? 'odd' : 'even'));
        setTextById('oddEvenStreakTag', streakLabel + ' × ' + stats.currentStreak);
        setClassById('oddEvenStreakTag', 'streak-tag ' + (isLastOdd ? 'red' : 'blue'));

        var maxLabel = stats.maxStreakValue === 'odd' ? '单' : '双';
        var maxColor = stats.maxStreakValue === 'odd' ? 'red' : 'blue';
        setTextById('oddEvenMaxStreak', maxLabel + ' × ' + stats.maxStreak);
        setClassById('oddEvenMaxStreak', 'stats-value ' + maxColor);
    }

    function setTextById(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function setClassById(id, cls) {
        var el = document.getElementById(id);
        if (el) el.className = cls;
    }

    // ===================================
    //   筛选条件
    // ===================================
    function initFilterBar() {
        var filterSize = document.getElementById('filterSize');
        var filterOddEven = document.getElementById('filterOddEven');
        var tabs = document.querySelectorAll('.road-tab');

        function updateVisibility() {
            var sizeTab = tabs[0];
            var oddevenTab = tabs[1];
            if (filterSize && sizeTab) {
                sizeTab.style.display = filterSize.checked ? '' : 'none';
            }
            if (filterOddEven && oddevenTab) {
                oddevenTab.style.display = filterOddEven.checked ? '' : 'none';
            }
            var activeTabs = document.querySelectorAll('.road-tab:not([style*="display: none"])');
            var currentActive = document.querySelector('.road-tab.active');
            if (currentActive && currentActive.style.display === 'none' && activeTabs.length > 0) {
                activeTabs[0].click();
            }
        }

        if (filterSize) filterSize.addEventListener('change', updateVisibility);
        if (filterOddEven) filterOddEven.addEventListener('change', updateVisibility);
    }

    // ===================================
    //   UI 交互
    // ===================================
    function initLotterySelector() {
        var picker = document.getElementById('lotteryPicker');
        var modal = document.getElementById('lotteryModal');
        var closeBtn = document.getElementById('modalClose');
        var mask = modal ? modal.querySelector('.modal-mask') : null;
        var options = modal ? modal.querySelectorAll('.lottery-option') : [];

        if (picker) picker.addEventListener('click', function() { if (modal) modal.classList.add('show'); });
        if (closeBtn) closeBtn.addEventListener('click', function() { if (modal) modal.classList.remove('show'); });
        if (mask) mask.addEventListener('click', function() { if (modal) modal.classList.remove('show'); });

        options.forEach(function(opt) {
            opt.addEventListener('click', function() {
                options.forEach(function(o) { o.classList.remove('active'); });
                this.classList.add('active');

                var name = this.textContent;
                var icon = this.dataset.icon;
                document.getElementById('currentLotteryName').textContent = name;
                document.querySelector('.lottery-picker .picker-icon').textContent = icon;

                modal.classList.remove('show');
                showToast('已切换到 ' + name);

                // 切换彩种时重置期号
                currentPeriodNum = Math.floor(Math.random() * 900) + 100;
                generateRawData();
                renderAllRoads();
                updateCurrentResult();
            });
        });
    }

    function initRoadTabs() {
        var tabs = document.querySelectorAll('.road-tab');
        var panels = document.querySelectorAll('.road-panel');

        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                tabs.forEach(function(t) { t.classList.remove('active'); });
                panels.forEach(function(p) { p.classList.remove('active'); });

                this.classList.add('active');
                var type = this.dataset.type;
                var panel = document.getElementById(type + 'Panel');
                if (panel) panel.classList.add('active');
            });
        });
    }

    function initCountdown() {
        var seconds = 45;
        var el = document.getElementById('countdown');
        if (!el) return;

        setInterval(function() {
            seconds = seconds > 0 ? seconds - 1 : 60;

            if (seconds === 60) {
                // 新一期开奖
                currentPeriodNum++;
                // 保留最后59条，加1条新数据
                var d1 = Math.floor(Math.random() * 6) + 1;
                var d2 = Math.floor(Math.random() * 6) + 1;
                var d3 = Math.floor(Math.random() * 6) + 1;
                var sum = d1 + d2 + d3;
                rawData.push({
                    dice: [d1, d2, d3],
                    sum: sum,
                    size: sum >= 11 ? 'big' : 'small',
                    oddEven: sum % 2 === 1 ? 'odd' : 'even'
                });
                if (rawData.length > CONFIG.periods) {
                    rawData.shift();
                }
                renderAllRoads();
                updateCurrentResult();

                // 使用全局通知组件
                var latest = rawData[rawData.length - 1];
                var lotteryName = document.getElementById('currentLotteryName');
                if (latest && typeof SmartNotification !== 'undefined') {
                    SmartNotification.result({
                        icon: document.querySelector('.lottery-picker .picker-icon')?.textContent || '🎲',
                        name: lotteryName ? lotteryName.textContent : '快三',
                        period: String(currentPeriodNum).padStart(4, '0'),
                        dice: latest.dice,
                        sum: latest.sum,
                        size: latest.size,
                        oddEven: latest.oddEven
                    });
                }
            }

            var m = String(Math.floor(seconds / 60)).padStart(2, '0');
            var s = String(seconds % 60).padStart(2, '0');
            el.textContent = m + ':' + s;

            if (seconds <= 10) {
                el.style.color = '#fbbf24';
                el.parentElement.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            } else {
                el.style.color = '';
                el.parentElement.style.background = '';
            }
        }, 1000);
    }

    function initRefreshButton() {
        var btn = document.getElementById('refreshBtn');
        if (!btn) return;
        btn.addEventListener('click', function() {
            generateRawData();
            renderAllRoads();
            updateCurrentResult();
            showToast('数据已刷新');
        });
    }

    function showToast(message) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:10px 24px;border-radius:24px;font-size:14px;font-weight:500;z-index:1000;backdrop-filter:blur(10px);box-shadow:0 4px 20px rgba(0,0,0,0.2);animation:toastIn 0.3s ease;white-space:nowrap;';

        if (!document.getElementById('toastStyle')) {
            var style = document.createElement('style');
            style.id = 'toastStyle';
            style.textContent = '@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }';
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function() { toast.remove(); }, 300);
        }, 2000);
    }

})();

// ===================================
//   路子图看图指南（全局函数）
// ===================================

// 路子图tab与说明tab的映射
var roadGuideTabMap = {
    'size': 'bead',
    'oddeven': 'bead'
};

function openRoadGuide() {
    var overlay = document.getElementById('roadGuideOverlay');
    if (!overlay) return;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // 根据当前活跃的路子图tab自动切换指南tab
    var activeRoadTab = document.querySelector('.road-tab.active');
    if (activeRoadTab) {
        var roadType = activeRoadTab.dataset.road;
        var guideType = roadGuideTabMap[roadType] || 'bead';
        var targetTab = overlay.querySelector('.guide-tab[data-guide="' + guideType + '"]');
        if (targetTab) {
            switchRoadGuideTab(targetTab);
        }
    }
}

function closeRoadGuide() {
    var overlay = document.getElementById('roadGuideOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

function switchRoadGuideTab(tabEl) {
    if (!tabEl) return;
    var guideType = tabEl.dataset.guide;
    var overlay = document.getElementById('roadGuideOverlay');
    if (!overlay) return;

    // 切换tab样式
    overlay.querySelectorAll('.guide-tab').forEach(function(t) {
        t.classList.remove('active');
    });
    tabEl.classList.add('active');

    // 切换内容
    overlay.querySelectorAll('.guide-section').forEach(function(s) {
        s.classList.remove('active');
    });
    var target = overlay.querySelector('.guide-section[data-guide="' + guideType + '"]');
    if (target) {
        target.classList.add('active');
    }

    // 滚动tab到可见
    tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}
