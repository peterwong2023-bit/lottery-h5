// 杀号计划 - H5版本

(function() {
    'use strict';

    // 彩种配置
    const LOTTERY_CONFIG = {
        kuaisan: { name: '快三', experts: 5, icon: '快三', type: 'dice' },
        pk10: { name: 'PK10', experts: 8, icon: 'PK10', type: 'number' },
        ssc: { name: '时时彩', experts: 6, icon: '时时彩', type: 'number' },
        '11x5': { name: '11选5', experts: 4, icon: '11选5', type: 'number' },
        pc28: { name: 'PC28', experts: 5, icon: 'PC28', type: 'number' },
        xyft: { name: '幸运飞艇', experts: 6, icon: '飞艇', type: 'number' }
    };

    // 专家数据（写实职业头像）
    const EXPERTS = [
        { name: '木木心', title: '金牌分析师', correct: 18, wrong: 2, streak: 8, isHot: true, avatar: 'https://i.pravatar.cc/160?img=12' },
        { name: '夜心灵', title: '资深预测师', correct: 16, wrong: 4, streak: 3, isHot: false, avatar: 'https://i.pravatar.cc/160?img=47' },
        { name: '木顺子', title: '数据分析师', correct: 14, wrong: 6, streak: 2, isHot: false, avatar: 'https://i.pravatar.cc/160?img=33' },
        { name: '霸王爷', title: '趋势分析师', correct: 12, wrong: 8, streak: -2, isHot: false, avatar: 'https://i.pravatar.cc/160?img=60' },
        { name: '醉王子', title: '彩票研究员', correct: 10, wrong: 10, streak: -1, isHot: false, avatar: 'https://i.pravatar.cc/160?img=68' }
    ];

    let currentLottery = 'kuaisan';
    let currentFilter = 'all';
    let countdownTimer = 45;

    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        updateStatusTime();
        initLotteryModal();
        initFilterTabs();
        renderLotteryGrid();
        renderExperts();
        renderTable();
        startCountdown();
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

    // 初始化彩种选择弹窗
    function initLotteryModal() {
        const btn = document.getElementById('lotterySelectBtn');
        const modal = document.getElementById('lotteryModal');
        const close = document.getElementById('modalClose');
        const overlay = modal.querySelector('.modal-overlay');

        btn.addEventListener('click', () => modal.classList.add('show'));
        close.addEventListener('click', () => modal.classList.remove('show'));
        overlay.addEventListener('click', () => modal.classList.remove('show'));
    }

    // 初始化筛选标签
    function initFilterTabs() {
        const tabs = document.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.type;
                renderTable();
            });
        });
    }

    // 渲染彩种选择网格
    function renderLotteryGrid() {
        const grid = document.getElementById('lotteryGrid');
        if (!grid) return;

        grid.innerHTML = Object.entries(LOTTERY_CONFIG).map(([key, config]) => `
            <div class="lottery-option ${key === currentLottery ? 'active' : ''}" data-lottery="${key}">
                <div class="option-icon ${key}">${config.icon}</div>
                <span class="option-name">${config.name}</span>
                <span class="option-experts">${config.experts}位专家</span>
            </div>
        `).join('');

        // 绑定点击事件
        grid.querySelectorAll('.lottery-option').forEach(option => {
            option.addEventListener('click', function() {
                const lottery = this.dataset.lottery;
                selectLottery(lottery);
            });
        });
    }

    // 选择彩种
    function selectLottery(lottery) {
        currentLottery = lottery;
        const config = LOTTERY_CONFIG[lottery];
        
        // 更新UI
        document.getElementById('currentLotteryName').textContent = config.name;
        document.getElementById('periodTitle').textContent = `${config.name} · 杀号计划`;
        
        const badge = document.getElementById('lotteryBadge');
        badge.textContent = config.icon;
        badge.className = 'lottery-badge';

        // 更新选中状态
        document.querySelectorAll('.lottery-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lottery === lottery);
        });

        // 关闭弹窗
        document.getElementById('lotteryModal').classList.remove('show');

        // 重新渲染
        renderExperts();
        renderTable();
    }

    // 渲染专家卡片 - 列表式
    function renderExperts() {
        const list = document.getElementById('expertsList');
        if (!list) return;

        list.innerHTML = EXPERTS.map((expert, index) => {
            const rate = Math.round((expert.correct / (expert.correct + expert.wrong)) * 100);
            const streakText = expert.streak > 0 
                ? `🔥 连对${expert.streak}期` 
                : `连错${Math.abs(expert.streak)}期`;
            const streakClass = expert.streak > 0 ? (expert.streak >= 5 ? 'hot' : '') : 'cold';
            
            // 排名样式
            let rankClass = '';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';

            return `
                <div class="expert-card ${expert.isHot ? 'hot' : ''}">
                    <div class="expert-rank ${rankClass}">${index + 1}</div>
                    <div class="expert-avatar">
                        <img src="${expert.avatar}" alt="${expert.name}" loading="lazy"
                             onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=2563eb&color=fff&bold=true';">
                    </div>
                    <div class="expert-info">
                        <div class="expert-name">${expert.name}</div>
                        <div class="expert-title">${expert.title}</div>
                    </div>
                    <div class="expert-stats">
                        <div class="stat-item">
                            <span class="stat-value success">${expert.correct}</span>
                            <span class="stat-label">杀对</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value error">${expert.wrong}</span>
                            <span class="stat-label">杀错</span>
                        </div>
                    </div>
                    <div class="expert-rate-box">
                        <div class="rate-circle" style="--rate: ${rate}">
                            <span class="rate-text">${rate}%</span>
                        </div>
                    </div>
                    <span class="expert-streak ${streakClass}">${streakText}</span>
                </div>
            `;
        }).join('');
    }

    // 渲染表格
    function renderTable() {
        const headerRow = document.getElementById('tableHeader');
        const tbody = document.getElementById('tableBody');
        if (!headerRow || !tbody) return;

        const config = LOTTERY_CONFIG[currentLottery];

        // 根据筛选类型设置不同的表头和列
        if (currentFilter === 'all') {
            // 综合：显示全部专家杀号
            const expertCols = EXPERTS.map(e => 
                `<th class="col-expert">${e.name}</th>`
            ).join('');
            headerRow.innerHTML = `
                <th class="col-period">期号</th>
                <th class="col-result">开奖</th>
                ${expertCols}
            `;
        } else if (currentFilter === 'bigsmall') {
            // 大小
            headerRow.innerHTML = `
                <th class="col-period">期号</th>
                <th class="col-result">开奖</th>
                <th class="col-expert">和值</th>
                <th class="col-expert">大小</th>
                <th class="col-expert">预测</th>
                <th class="col-expert">结果</th>
            `;
        } else if (currentFilter === 'oddeven') {
            // 单双
            headerRow.innerHTML = `
                <th class="col-period">期号</th>
                <th class="col-result">开奖</th>
                <th class="col-expert">和值</th>
                <th class="col-expert">单双</th>
                <th class="col-expert">预测</th>
                <th class="col-expert">结果</th>
            `;
        } else if (currentFilter === 'sum') {
            // 和值
            headerRow.innerHTML = `
                <th class="col-period">期号</th>
                <th class="col-result">开奖</th>
                <th class="col-expert">和值</th>
                <th class="col-expert">范围</th>
                <th class="col-expert">预测</th>
                <th class="col-expert">结果</th>
            `;
        }

        // 渲染表格数据
        const rows = [];
        
        for (let i = 0; i < 15; i++) {
            const period = 30350 - i;
            const isPending = i === 0;
            
            // 生成开奖号码
            let nums = [];
            let resultHtml = '';
            if (isPending) {
                resultHtml = '<span class="result-pending">待开奖</span>';
            } else if (config.type === 'dice') {
                nums = [
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1
                ];
                resultHtml = `<div class="result-dice">${nums.map(n => renderDice(n)).join('')}</div>`;
            } else {
                for (let j = 0; j < 3; j++) {
                    nums.push(Math.floor(Math.random() * 10));
                }
                resultHtml = `<div class="result-numbers">${nums.map(n => 
                    `<span class="num">${n}</span>`
                ).join('')}</div>`;
            }

            // 根据类型生成不同的列
            let dataCols = '';
            const sum = nums.reduce((a, b) => a + b, 0);

            if (currentFilter === 'all') {
                // 综合：专家杀号
                dataCols = EXPERTS.map(expert => {
                    if (isPending) {
                        const killNum = Math.floor(Math.random() * 10);
                        return `<td><span class="kill-result pending">杀${killNum}</span></td>`;
                    } else {
                        const isCorrect = Math.random() > 0.3;
                        const killNum = Math.floor(Math.random() * 10);
                        const icon = isCorrect 
                            ? '<svg class="kill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                            : '<svg class="kill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                        return `<td><span class="kill-result ${isCorrect ? 'success' : 'error'}">杀${killNum}${icon}</span></td>`;
                    }
                }).join('');
            } else if (currentFilter === 'bigsmall') {
                // 大小分析
                if (isPending) {
                    const predict = Math.random() > 0.5 ? '大' : '小';
                    dataCols = `
                        <td>-</td>
                        <td>-</td>
                        <td><span class="predict-tag ${predict === '大' ? 'big' : 'small'}">${predict}</span></td>
                        <td><span class="kill-result pending">待开</span></td>
                    `;
                } else {
                    const isBig = sum >= 11;
                    const actual = isBig ? '大' : '小';
                    const predict = Math.random() > 0.35 ? actual : (isBig ? '小' : '大');
                    const isCorrect = predict === actual;
                    dataCols = `
                        <td class="sum-cell">${sum}</td>
                        <td><span class="bs-tag ${isBig ? 'big' : 'small'}">${actual}</span></td>
                        <td><span class="predict-tag ${predict === '大' ? 'big' : 'small'}">${predict}</span></td>
                        <td><span class="kill-result ${isCorrect ? 'success' : 'error'}">${isCorrect ? '✓' : '✗'}</span></td>
                    `;
                }
            } else if (currentFilter === 'oddeven') {
                // 单双分析
                if (isPending) {
                    const predict = Math.random() > 0.5 ? '单' : '双';
                    dataCols = `
                        <td>-</td>
                        <td>-</td>
                        <td><span class="predict-tag ${predict === '单' ? 'odd' : 'even'}">${predict}</span></td>
                        <td><span class="kill-result pending">待开</span></td>
                    `;
                } else {
                    const isOdd = sum % 2 !== 0;
                    const actual = isOdd ? '单' : '双';
                    const predict = Math.random() > 0.35 ? actual : (isOdd ? '双' : '单');
                    const isCorrect = predict === actual;
                    dataCols = `
                        <td class="sum-cell">${sum}</td>
                        <td><span class="oe-tag ${isOdd ? 'odd' : 'even'}">${actual}</span></td>
                        <td><span class="predict-tag ${predict === '单' ? 'odd' : 'even'}">${predict}</span></td>
                        <td><span class="kill-result ${isCorrect ? 'success' : 'error'}">${isCorrect ? '✓' : '✗'}</span></td>
                    `;
                }
            } else if (currentFilter === 'sum') {
                // 和值分析
                if (isPending) {
                    const ranges = ['3-7', '8-14', '15-18'];
                    const predictRange = ranges[Math.floor(Math.random() * 3)];
                    dataCols = `
                        <td>-</td>
                        <td>-</td>
                        <td><span class="predict-tag range">${predictRange}</span></td>
                        <td><span class="kill-result pending">待开</span></td>
                    `;
                } else {
                    let range = '';
                    if (sum <= 7) range = '3-7';
                    else if (sum <= 14) range = '8-14';
                    else range = '15-18';
                    
                    const ranges = ['3-7', '8-14', '15-18'];
                    const predictRange = Math.random() > 0.35 ? range : ranges[Math.floor(Math.random() * 3)];
                    const isCorrect = predictRange === range;
                    dataCols = `
                        <td class="sum-cell">${sum}</td>
                        <td><span class="range-tag">${range}</span></td>
                        <td><span class="predict-tag range">${predictRange}</span></td>
                        <td><span class="kill-result ${isCorrect ? 'success' : 'error'}">${isCorrect ? '✓' : '✗'}</span></td>
                    `;
                }
            }

            rows.push(`
                <tr>
                    <td class="period-cell">${period}</td>
                    <td>${resultHtml}</td>
                    ${dataCols}
                </tr>
            `);
        }

        tbody.innerHTML = rows.join('');
    }

    // 渲染骰子
    function renderDice(num) {
        const patterns = {
            1: [0,0,0,0,1,0,0,0,0],
            2: [1,0,0,0,0,0,0,0,1],
            3: [1,0,0,0,1,0,0,0,1],
            4: [1,0,1,0,0,0,1,0,1],
            5: [1,0,1,0,1,0,1,0,1],
            6: [1,0,1,1,0,1,1,0,1]
        };
        const dots = patterns[num] || patterns[1];
        return `
            <div class="dice-mini">
                ${dots.map(d => `<div class="dice-dot ${d ? 'visible' : ''}"></div>`).join('')}
            </div>
        `;
    }

    // 倒计时
    function startCountdown() {
        setInterval(() => {
            countdownTimer--;
            if (countdownTimer <= 0) countdownTimer = 300;
            
            const m = Math.floor(countdownTimer / 60).toString().padStart(2, '0');
            const s = (countdownTimer % 60).toString().padStart(2, '0');
            
            const el = document.getElementById('countdown');
            if (el) el.textContent = `${m}:${s}`;
        }, 1000);
    }

})();
