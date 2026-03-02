/**
 * 智能提醒页面
 * 三大功能：开奖提醒(低频彩) / 长龙提醒(高频彩) / 好路提醒(高频彩)
 */
(function() {
    'use strict';

    // ===================================
    //   彩种数据 - 按频率分级
    // ===================================

    // 低频彩 → 开奖提醒
    const LOW_FREQ_LOTTERIES = [
        { group: '福利彩票', items: [
            { id: 'ssq',  name: '双色球',  icon: '🔴', freq: '每周二四日', drawTime: '21:15' },
            { id: 'fc3d', name: '福彩3D',  icon: '🎰', freq: '每日一期',   drawTime: '21:15' },
            { id: 'qlc',  name: '七乐彩',  icon: '🎯', freq: '每周一三五', drawTime: '21:25' },
            { id: 'kl8',  name: '快乐8',   icon: '😄', freq: '每日一期',   drawTime: '21:30' },
        ]},
        { group: '体育彩票', items: [
            { id: 'dlt',  name: '大乐透',  icon: '🏆', freq: '每周一三六', drawTime: '20:30' },
            { id: 'pl3',  name: '排列3',   icon: '🔢', freq: '每日一期',   drawTime: '20:30' },
            { id: 'pl5',  name: '排列5',   icon: '🔢', freq: '每日一期',   drawTime: '20:30' },
            { id: 'qxc',  name: '七星彩',  icon: '⭐', freq: '每周二五',   drawTime: '20:30' },
        ]},
        { group: '特色彩票', items: [
            { id: 'hklhc',  name: '六合彩',   icon: '🎱', freq: '每周二四六', drawTime: '21:30' },
            { id: 'fslhc',  name: '福彩六合彩', icon: '🎱', freq: '每周二四六', drawTime: '21:30' },
            { id: 'twbg',   name: '台湾宾果',  icon: '🎪', freq: '每日一期',   drawTime: '21:00' },
        ]},
    ];

    // 高频/极速彩 → 长龙提醒 & 好路提醒
    const HIGH_FREQ_LOTTERIES = [
        { group: '极速系列 (30秒~1分钟)', items: [
            { id: 'jsk3n',   name: '极速快3',     icon: '⚡', freq: '30秒/期',  interval: 30, types: ['大小', '单双', '总和'] },
            { id: 'jssc',    name: '极速赛车',     icon: '⚡', freq: '30秒/期',  interval: 30, types: ['冠军大小', '冠军单双', '冠亚和大小'] },
            { id: 'jsft',    name: '极速飞艇',     icon: '⚡', freq: '30秒/期',  interval: 30, types: ['冠军大小', '冠军单双'] },
            { id: 'jsssc',   name: '极速时时彩',   icon: '⚡', freq: '30秒/期',  interval: 30, types: ['总和大小', '总和单双'] },
            { id: 'jsdd',    name: '极速蛋蛋',     icon: '⚡', freq: '30秒/期',  interval: 30, types: ['大小', '单双'] },
        ]},
        { group: '经典高频 (3~5分钟)', items: [
            { id: 'kuaisan',  name: '快三',     icon: '🎲', freq: '5分钟/期',  interval: 300, types: ['大小', '单双', '总和'] },
            { id: 'saiche',   name: '赛车',     icon: '🏎️', freq: '5分钟/期',  interval: 300, types: ['冠军大小', '冠军单双', '冠亚和大小'] },
            { id: 'pk10',     name: 'PK10',     icon: '🏁', freq: '5分钟/期',  interval: 300, types: ['冠军大小', '冠军单双'] },
            { id: 'xyft',     name: '幸运飞艇', icon: '✈️', freq: '5分钟/期',  interval: 300, types: ['冠军大小', '冠军单双'] },
            { id: 'yuxiaxie', name: '鱼虾蟹',   icon: '🦐', freq: '5分钟/期',  interval: 300, types: ['大小', '单双'] },
            { id: 'baijiale', name: '百家乐',   icon: '♠️', freq: '5分钟/期',  interval: 300, types: ['庄闲', '大小'] },
            { id: 'niuniu',   name: '百人牛牛', icon: '🐂', freq: '5分钟/期',  interval: 300, types: ['龙虎', '大小'] },
            { id: 'longhu',   name: '龙虎',     icon: '🐉', freq: '5分钟/期',  interval: 300, types: ['龙虎', '大小'] },
            { id: 'jndpc28',  name: '加拿大PC28',icon: '🍁', freq: '3.5分钟/期',interval: 210, types: ['大小', '单双'] },
            { id: 'bjpc28',   name: '北京PC28', icon: '💻', freq: '5分钟/期',  interval: 300, types: ['大小', '单双'] },
        ]},
        { group: '中频彩 (10分钟)', items: [
            { id: 'cqssc',   name: '重庆时时彩', icon: '⏱️', freq: '10分钟/期', interval: 600, types: ['总和大小', '总和单双'] },
            { id: 'xjssc',   name: '新疆时时彩', icon: '⏱️', freq: '10分钟/期', interval: 600, types: ['总和大小', '总和单双'] },
            { id: 'gd11x5',  name: '广东11选5',  icon: '🎯', freq: '10分钟/期', interval: 600, types: ['大小', '单双'] },
            { id: 'sh11x5',  name: '上海11选5',  icon: '🎯', freq: '10分钟/期', interval: 600, types: ['大小', '单双'] },
            { id: 'gdklsf',  name: '广东快乐十分', icon: '😄', freq: '10分钟/期', interval: 600, types: ['总和大小', '总和单双'] },
        ]},
    ];

    // ===================================
    //   存储 & 状态
    // ===================================
    const STORAGE_KEY = 'h5_smart_reminders';

    let state = {
        activeTab: 'draw',
        // 开奖提醒
        draw: {
            enabled: true,
            remindMinutes: 5,
            methods: ['push', 'sound'],
            items: [
                { id: 'ssq', enabled: true },
                { id: 'dlt', enabled: true },
                { id: 'hklhc', enabled: true },
                { id: 'fc3d', enabled: false },
            ]
        },
        // 长龙提醒
        dragon: {
            enabled: true,
            threshold: 4,
            monitorTypes: ['bigsmall', 'oddeven'],
            items: [
                { id: 'kuaisan', enabled: true },
                { id: 'saiche', enabled: true },
                { id: 'jsk3n', enabled: true },
                { id: 'pk10', enabled: true },
                { id: 'cqssc', enabled: false },
            ]
        },
        // 好路提醒
        goodroad: {
            enabled: true,
            patterns: ['dragon', 'max3', 'longchain'],
            items: [
                { id: 'kuaisan', enabled: true, play: '大小' },
                { id: 'saiche', enabled: true, play: '冠亚和大小' },
                { id: 'baijiale', enabled: true, play: '庄闲' },
                { id: 'jsk3n', enabled: false, play: '单双' },
            ]
        }
    };

    // 模拟的长龙历史提醒
    const dragonHistoryData = [
        { time: '16:32', lottery: '快三', detail: '连开<span class="hl">6期【小】</span>', ago: '28分钟前' },
        { time: '16:15', lottery: '极速赛车', detail: '冠军连开<span class="hl">5期【大】</span>', ago: '45分钟前' },
        { time: '15:48', lottery: 'PK10', detail: '连开<span class="hl">4期【双】</span>', ago: '1小时前' },
        { time: '15:20', lottery: '百家乐', detail: '连开<span class="hl">5期【庄】</span>', ago: '1小时前' },
        { time: '14:55', lottery: '极速快3', detail: '连开<span class="hl">4期【大】</span>', ago: '2小时前' },
    ];

    // 模拟的好路历史提醒
    const roadHistoryData = [
        { time: '16:28', lottery: '赛车·冠亚和单双', detail: '出现<span class="hl-road">【不过三】</span>好路', ago: '32分钟前' },
        { time: '16:05', lottery: '快三·大小', detail: '出现<span class="hl-road">【单跳】</span>好路', ago: '55分钟前' },
        { time: '15:40', lottery: '百家乐·庄闲', detail: '出现<span class="hl-road">【长龙】</span>好路', ago: '1小时前' },
        { time: '15:12', lottery: '极速赛车·冠军大小', detail: '出现<span class="hl-road">【连续长连】</span>好路', ago: '1小时前' },
    ];

    // 模拟当前长龙数据
    function generateDragonStatus(lotteryId) {
        const values = ['大', '小', '单', '双'];
        const value = values[Math.floor(Math.random() * values.length)];
        const streak = Math.floor(Math.random() * 6) + 2;
        return { value, streak };
    }

    // 模拟当前好路数据
    function generateRoadStatus(lotteryId, play) {
        const patterns = ['长龙', '单跳', '不过三', '两房两厅', '连续长连'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const count = Math.floor(Math.random() * 8) + 3;
        // 生成路型预览
        const preview = [];
        for (let i = 0; i < Math.min(count, 12); i++) {
            if (pattern === '单跳') {
                preview.push(i % 2 === 0 ? 'a' : 'b');
            } else if (pattern === '不过三') {
                const block = Math.floor(i / 2);
                preview.push(block % 2 === 0 ? 'a' : 'b');
            } else if (pattern === '长龙') {
                preview.push('a');
            } else {
                preview.push(Math.random() > 0.5 ? 'a' : 'b');
            }
        }
        return { pattern, count, preview };
    }

    // ===================================
    //   初始化
    // ===================================
    document.addEventListener('DOMContentLoaded', function() {
        initStatusBar();
        loadState();
        initTabs();
        initToggles();
        initSettingTags();
        initAddModal();
        initPickerModal();
        renderActiveTab();
    });

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
    //   数据持久化
    // ===================================
    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // 合并(保留默认值用于新字段)
                state = { ...state, ...parsed };
                state.draw = { ...state.draw, ...(parsed.draw || {}) };
                state.dragon = { ...state.dragon, ...(parsed.dragon || {}) };
                state.goodroad = { ...state.goodroad, ...(parsed.goodroad || {}) };
            }
        } catch(e) { /* use defaults */ }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch(e) {}
    }

    // ===================================
    //   Tab 切换
    // ===================================
    function initTabs() {
        const tabs = document.querySelectorAll('.remind-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                state.activeTab = this.dataset.tab;
                
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                const panelId = {
                    draw: 'panelDraw',
                    dragon: 'panelDragon',
                    goodroad: 'panelGoodroad'
                }[state.activeTab];
                const panel = document.getElementById(panelId);
                if (panel) panel.classList.add('active');
                
                renderActiveTab();
            });
        });
    }

    function renderActiveTab() {
        switch (state.activeTab) {
            case 'draw': renderDrawTab(); break;
            case 'dragon': renderDragonTab(); break;
            case 'goodroad': renderGoodRoadTab(); break;
        }
    }

    // ===================================
    //   全局开关
    // ===================================
    function initToggles() {
        // 开奖提醒
        const drawToggle = document.getElementById('drawToggle');
        if (drawToggle) {
            drawToggle.checked = state.draw.enabled;
            drawToggle.addEventListener('change', function() {
                state.draw.enabled = this.checked;
                saveState();
                renderDrawTab();
                showToast(this.checked ? '已开启开奖提醒' : '已关闭开奖提醒');
            });
        }

        // 长龙提醒
        const dragonToggle = document.getElementById('dragonToggle');
        if (dragonToggle) {
            dragonToggle.checked = state.dragon.enabled;
            dragonToggle.addEventListener('change', function() {
                state.dragon.enabled = this.checked;
                saveState();
                renderDragonTab();
                showToast(this.checked ? '已开启长龙提醒' : '已关闭长龙提醒');
            });
        }

        // 好路提醒
        const roadToggle = document.getElementById('goodroadToggle');
        if (roadToggle) {
            roadToggle.checked = state.goodroad.enabled;
            roadToggle.addEventListener('change', function() {
                state.goodroad.enabled = this.checked;
                saveState();
                renderGoodRoadTab();
                showToast(this.checked ? '已开启好路提醒' : '已关闭好路提醒');
            });
        }
    }

    // ===================================
    //   设置标签
    // ===================================
    function initSettingTags() {
        // 长龙阈值（单选）
        initSingleSelect('dragonThresholdTags', function(value) {
            state.dragon.threshold = parseInt(value);
            saveState();
            showToast('长龙阈值设为 ≥' + value + '期');
        });

        // 长龙监控类型（多选）
        initMultiSelect('dragonTypeTags', state.dragon.monitorTypes, function(values) {
            state.dragon.monitorTypes = values;
            saveState();
        });

        // 好路路型（多选）
        initMultiSelect('roadPatternTags', state.goodroad.patterns, function(values) {
            state.goodroad.patterns = values;
            saveState();
        });

        // 提醒方式（多选）
        initMultiSelect('drawMethodTags', state.draw.methods, function(values) {
            state.draw.methods = values;
            saveState();
        });
    }

    function initSingleSelect(containerId, onChange) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.querySelectorAll('.setting-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                container.querySelectorAll('.setting-tag').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                onChange(this.dataset.value);
            });
        });
    }

    function initMultiSelect(containerId, initialValues, onChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 初始化已选状态
        container.querySelectorAll('.setting-tag').forEach(tag => {
            const val = tag.dataset.value || tag.dataset.method;
            if (initialValues.includes(val)) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
            tag.addEventListener('click', function() {
                this.classList.toggle('active');
                const values = [];
                container.querySelectorAll('.setting-tag.active').forEach(t => {
                    values.push(t.dataset.value || t.dataset.method);
                });
                onChange(values);
            });
        });
    }

    // ===================================
    //   Tab 1: 开奖提醒渲染
    // ===================================
    function renderDrawTab() {
        const list = document.getElementById('drawList');
        const empty = document.getElementById('drawEmpty');
        const section = document.querySelector('#panelDraw .reminder-section');
        const countEl = document.getElementById('drawCount');

        const items = state.draw.items;
        const enabledCount = items.filter(r => r.enabled).length;
        countEl.textContent = enabledCount;

        if (items.length === 0) {
            section.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        section.style.display = 'block';
        empty.style.display = 'none';

        list.innerHTML = items.map(r => {
            const lottery = findLowFreq(r.id);
            if (!lottery) return '';
            const globalOff = !state.draw.enabled;

            return `
                <div class="reminder-card${(!r.enabled || globalOff) ? ' disabled' : ''}" data-id="${r.id}" data-tab="draw">
                    <div class="reminder-top">
                        <div class="reminder-info">
                            <div class="reminder-badge default">${lottery.icon}</div>
                            <div class="reminder-text">
                                <span class="reminder-name">${lottery.name}</span>
                                <span class="reminder-schedule">${lottery.freq}</span>
                            </div>
                        </div>
                        <label class="reminder-toggle">
                            <input type="checkbox" ${r.enabled ? 'checked' : ''} ${globalOff ? 'disabled' : ''} 
                                   onchange="window._toggleItem('draw','${r.id}',this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="reminder-bottom">
                        <div class="reminder-meta">
                            <div class="meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <span>开奖 <span class="next-time">${lottery.drawTime}</span></span>
                            </div>
                            <div class="meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                <span>提前${state.draw.remindMinutes}分钟</span>
                            </div>
                        </div>
                        <button class="reminder-delete" onclick="window._deleteItem('draw','${r.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===================================
    //   Tab 2: 长龙提醒渲染
    // ===================================
    function renderDragonTab() {
        const list = document.getElementById('dragonList');
        const countEl = document.getElementById('dragonCount');
        const historyEl = document.getElementById('dragonHistory');

        const items = state.dragon.items;
        const enabledCount = items.filter(r => r.enabled).length;
        countEl.textContent = enabledCount;

        const globalOff = !state.dragon.enabled;

        list.innerHTML = items.map(r => {
            const lottery = findHighFreq(r.id);
            if (!lottery) return '';
            const ds = generateDragonStatus(r.id);
            const isHot = ds.streak >= state.dragon.threshold;
            const streakClass = ds.streak >= 5 ? 'hot' : (ds.streak >= state.dragon.threshold ? 'warm' : 'normal');

            return `
                <div class="reminder-card${(!r.enabled || globalOff) ? ' disabled' : ''}" data-id="${r.id}" data-tab="dragon">
                    <div class="reminder-top">
                        <div class="reminder-info">
                            <div class="reminder-badge default">${lottery.icon}</div>
                            <div class="reminder-text">
                                <span class="reminder-name">${lottery.name}</span>
                                <span class="reminder-schedule">${lottery.freq}</span>
                            </div>
                        </div>
                        <label class="reminder-toggle">
                            <input type="checkbox" ${r.enabled ? 'checked' : ''} ${globalOff ? 'disabled' : ''} 
                                   onchange="window._toggleItem('dragon','${r.id}',this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="dragon-status">
                        <span class="status-label">当前：连开</span>
                        <span class="status-streak ${streakClass}">${ds.streak}期【${ds.value}】</span>
                        ${isHot ? '<span class="fire-icon">🔥</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        // 渲染历史记录
        if (dragonHistoryData.length === 0) {
            historyEl.innerHTML = '<div class="history-empty">暂无提醒记录</div>';
        } else {
            historyEl.innerHTML = dragonHistoryData.map(item => `
                <div class="history-item">
                    <div class="history-dot dragon"></div>
                    <div class="history-content">
                        <div class="history-title">${item.lottery} ${item.detail}</div>
                        <div class="history-time">${item.time} · ${item.ago}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // ===================================
    //   Tab 3: 好路提醒渲染
    // ===================================
    function renderGoodRoadTab() {
        const list = document.getElementById('roadList');
        const countEl = document.getElementById('roadCount');
        const historyEl = document.getElementById('roadHistory');

        const items = state.goodroad.items;
        const enabledCount = items.filter(r => r.enabled).length;
        countEl.textContent = enabledCount;

        const globalOff = !state.goodroad.enabled;

        list.innerHTML = items.map(r => {
            const lottery = findHighFreq(r.id);
            if (!lottery) return '';
            const rs = generateRoadStatus(r.id, r.play);
            const previewDots = rs.preview.map(c => `<div class="road-dot ${c}">${c === 'a' ? '大' : '小'}</div>`).join('');

            return `
                <div class="reminder-card${(!r.enabled || globalOff) ? ' disabled' : ''}" data-id="${r.id}" data-tab="goodroad">
                    <div class="reminder-top">
                        <div class="reminder-info">
                            <div class="reminder-badge default">${lottery.icon}</div>
                            <div class="reminder-text">
                                <span class="reminder-name">${lottery.name} · ${r.play || ''}</span>
                                <span class="reminder-schedule">${lottery.freq}</span>
                            </div>
                        </div>
                        <label class="reminder-toggle">
                            <input type="checkbox" ${r.enabled ? 'checked' : ''} ${globalOff ? 'disabled' : ''} 
                                   onchange="window._toggleItem('goodroad','${r.id}',this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="road-status">
                        <div class="status-line">
                            <span class="status-label">当前：</span>
                            <span class="pattern-name">【${rs.pattern}】</span>
                            <span class="pattern-count">已${rs.count}期</span>
                        </div>
                        <div class="road-preview">${previewDots}</div>
                    </div>
                </div>
            `;
        }).join('');

        // 渲染历史记录
        if (roadHistoryData.length === 0) {
            historyEl.innerHTML = '<div class="history-empty">暂无提醒记录</div>';
        } else {
            historyEl.innerHTML = roadHistoryData.map(item => `
                <div class="history-item">
                    <div class="history-dot road"></div>
                    <div class="history-content">
                        <div class="history-title">${item.lottery} ${item.detail}</div>
                        <div class="history-time">${item.time} · ${item.ago}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // ===================================
    //   查找彩种
    // ===================================
    function findLowFreq(id) {
        for (const group of LOW_FREQ_LOTTERIES) {
            const item = group.items.find(i => i.id === id);
            if (item) return item;
        }
        return null;
    }

    function findHighFreq(id) {
        for (const group of HIGH_FREQ_LOTTERIES) {
            const item = group.items.find(i => i.id === id);
            if (item) return item;
        }
        return null;
    }

    // ===================================
    //   单个开关 & 删除
    // ===================================
    window._toggleItem = function(tab, id, checked) {
        const items = state[tab].items;
        const r = items.find(i => i.id === id);
        if (r) {
            r.enabled = checked;
            saveState();
            renderActiveTab();
        }
    };

    window._deleteItem = function(tab, id) {
        const card = document.querySelector(`.reminder-card[data-id="${id}"][data-tab="${tab}"]`);
        if (card) {
            card.style.transition = 'all 0.3s ease';
            card.style.transform = 'translateX(100%)';
            card.style.opacity = '0';
            card.style.maxHeight = card.offsetHeight + 'px';
            setTimeout(() => {
                card.style.maxHeight = '0';
                card.style.padding = '0';
                card.style.margin = '0';
            }, 200);
            setTimeout(() => {
                state[tab].items = state[tab].items.filter(r => r.id !== id);
                saveState();
                renderActiveTab();
                showToast('已删除');
            }, 400);
        }
    };

    // ===================================
    //   添加弹窗
    // ===================================
    let currentModalTab = 'draw';

    function initAddModal() {
        const modal = document.getElementById('addModal');
        const closeBtn = document.getElementById('modalClose');
        const mask = modal?.querySelector('.modal-mask');
        const confirmBtn = document.getElementById('confirmAdd');

        function closeModal() { modal.classList.remove('show'); }

        closeBtn?.addEventListener('click', closeModal);
        mask?.addEventListener('click', closeModal);

        // 开奖提醒 - 添加
        bindAddBtn('drawAddBtn', 'draw');
        bindAddBtn('drawEmptyAdd', 'draw');
        bindAddBtn('dragonAddBtn', 'dragon');
        bindAddBtn('roadAddBtn', 'goodroad');

        // 确认
        confirmBtn?.addEventListener('click', function() {
            const checked = document.querySelectorAll('.lottery-check.checked');
            const newIds = [];
            checked.forEach(el => {
                newIds.push({ id: el.dataset.id, play: el.dataset.play || '' });
            });

            const items = state[currentModalTab].items;
            const existing = new Map(items.map(r => [r.id + (r.play || ''), r]));
            const newItems = [];

            newIds.forEach(n => {
                const key = n.id + n.play;
                if (existing.has(key)) {
                    newItems.push(existing.get(key));
                } else {
                    newItems.push({ id: n.id, enabled: true, play: n.play });
                }
            });

            state[currentModalTab].items = newItems;
            saveState();
            renderActiveTab();
            closeModal();
            showToast('已更新' + newItems.length + '个监控项');
        });
    }

    function bindAddBtn(btnId, tab) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', function() {
            currentModalTab = tab;
            openAddModal(tab);
        });
    }

    function openAddModal(tab) {
        const modal = document.getElementById('addModal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');

        const titles = {
            draw: '添加开奖提醒',
            dragon: '添加长龙监控',
            goodroad: '添加好路监控'
        };
        title.textContent = titles[tab] || '添加提醒';

        const lotteries = tab === 'draw' ? LOW_FREQ_LOTTERIES : HIGH_FREQ_LOTTERIES;
        const existingIds = new Set(state[tab].items.map(r => r.id + (r.play || '')));

        const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';

        if (tab === 'goodroad') {
            // 好路要选彩种+玩法组合
            body.innerHTML = lotteries.map(group => `
                <div class="lottery-group">
                    <div class="group-title">${group.group}</div>
                    <div class="group-items">
                        ${group.items.map(item => {
                            return (item.types || []).map(play => {
                                const key = item.id + play;
                                const isChecked = existingIds.has(key);
                                return `
                                    <div class="lottery-check${isChecked ? ' checked' : ''}" data-id="${item.id}" data-play="${play}">
                                        <span class="check-icon">${checkSvg}</span>
                                        <span>${item.icon} ${item.name}·${play}</span>
                                    </div>
                                `;
                            }).join('');
                        }).join('')}
                    </div>
                </div>
            `).join('');
        } else {
            body.innerHTML = lotteries.map(group => `
                <div class="lottery-group">
                    <div class="group-title">${group.group}</div>
                    <div class="group-items">
                        ${group.items.map(item => {
                            const isChecked = existingIds.has(item.id);
                            return `
                                <div class="lottery-check${isChecked ? ' checked' : ''}" data-id="${item.id}">
                                    <span class="check-icon">${checkSvg}</span>
                                    <span>${item.icon} ${item.name}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('');
        }

        // 绑定点击
        body.querySelectorAll('.lottery-check').forEach(el => {
            el.addEventListener('click', function() {
                this.classList.toggle('checked');
            });
        });

        modal.classList.add('show');
    }

    // ===================================
    //   Picker弹窗
    // ===================================
    function initPickerModal() {
        const trigger = document.getElementById('drawTimeSelect');
        const modal = document.getElementById('pickerModal');
        const cancel = document.getElementById('pickerCancel');
        const confirm = document.getElementById('pickerConfirm');
        const mask = modal?.querySelector('.picker-mask');

        function open() { modal.classList.add('show'); }
        function close() { modal.classList.remove('show'); }

        trigger?.addEventListener('click', open);
        cancel?.addEventListener('click', close);
        mask?.addEventListener('click', close);

        // 选项点击
        modal?.querySelectorAll('.picker-option').forEach(opt => {
            opt.addEventListener('click', function() {
                modal.querySelectorAll('.picker-option').forEach(o => o.classList.remove('active'));
                this.classList.add('active');
            });
        });

        confirm?.addEventListener('click', function() {
            const active = modal.querySelector('.picker-option.active');
            if (active) {
                const value = parseInt(active.dataset.value);
                state.draw.remindMinutes = value;
                saveState();
                document.getElementById('drawTimeValue').textContent = value + '分钟';
                renderDrawTab();
                showToast('已设置提前' + value + '分钟提醒');
            }
            close();
        });

        // 初始化显示值
        const timeValEl = document.getElementById('drawTimeValue');
        if (timeValEl) timeValEl.textContent = state.draw.remindMinutes + '分钟';
    }

    // ===================================
    //   Toast
    // ===================================
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

})();

// ===================================
//   模拟测试通知（全局函数）
// ===================================

function testDrawNotif() {
    var lotteries = [
        { icon: '🔴', name: '双色球', period: '2026058', drawTime: '21:15', minutes: 5 },
        { icon: '🏆', name: '大乐透', period: '2026032', drawTime: '20:30', minutes: 10 },
        { icon: '🎱', name: '六合彩', period: '2026024', drawTime: '21:30', minutes: 3 },
        { icon: '🎯', name: '七乐彩', period: '2026035', drawTime: '21:25', minutes: 15 },
    ];
    var r = lotteries[Math.floor(Math.random() * lotteries.length)];
    SmartNotification.draw(r);
}

function testDragonNotif() {
    var cases = [
        { icon: '🎲', name: '快三', period: '30521', streak: 6, value: '小', threshold: 4 },
        { icon: '🏎️', name: '极速赛车', period: '85432', streak: 5, value: '大', threshold: 4 },
        { icon: '🎲', name: 'PK10', period: '12087', streak: 7, value: '双', threshold: 4 },
        { icon: '🃏', name: '百家乐', period: '6653', streak: 4, value: '庄', threshold: 4 },
    ];
    var r = cases[Math.floor(Math.random() * cases.length)];
    SmartNotification.dragon(r);
}

function testRoadNotif() {
    var patterns = [
        { pattern: '不过三', preview: ['a','b','a','b','a','a','b','b','a','b'] },
        { pattern: '单跳',   preview: ['a','b','a','b','a','b','a','b','a','b'] },
        { pattern: '长龙',   preview: ['a','a','a','a','a','a','a','a'] },
        { pattern: '两房两厅', preview: ['a','a','b','b','a','a','b','b','a','a'] },
    ];
    var lotteries = [
        { icon: '🏎️', name: '极速赛车', play: '冠亚和大小' },
        { icon: '🎲', name: '快三', play: '大小' },
        { icon: '♠️', name: '百家乐', play: '庄闲' },
    ];
    var p = patterns[Math.floor(Math.random() * patterns.length)];
    var l = lotteries[Math.floor(Math.random() * lotteries.length)];
    SmartNotification.goodroad({
        icon: l.icon,
        name: l.name,
        play: l.play,
        pattern: p.pattern,
        count: p.preview.length,
        preview: p.preview
    });
}
