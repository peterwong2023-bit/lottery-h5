/**
 * 浏览记录页面
 * 支持：按日期分组显示、分类筛选、单条删除、全部清空
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'h5_browse_history';
    let allRecords = [];
    let currentFilter = 'all';

    // 页面类型配置
    const PAGE_TYPES = {
        lottery: {
            label: '开奖',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>`,
            link: 'index.html'
        },
        trend: {
            label: '走势',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
            link: 'trend.html'
        },
        roadmap: {
            label: '路子图',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
            link: 'roadmap.html'
        },
        killplan: {
            label: '杀号计划',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            link: 'killplan.html'
        },
        news: {
            label: '彩民新闻',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
            link: 'news.html'
        },
        goodroad: {
            label: '好路推荐',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>`,
            link: 'goodroad.html'
        },
        dragon: {
            label: '长龙排行',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`,
            link: 'dragon.html'
        }
    };

    // 彩种名称
    const LOTTERY_NAMES = [
        '快三', '重庆时时彩', '北京PK10', '幸运飞艇', '加拿大PC28',
        '广东11选5', '江苏快三', '安徽快三', '双色球', '大乐透',
        '天津时时彩', '六合彩', '广东快乐十分', '百家乐', '龙虎'
    ];

    // 新闻标题
    const NEWS_TITLES = [
        '双色球第2026042期开奖：头奖8注',
        '大乐透奖池累积至22.5亿元',
        '专家解读：快三走势规律分析',
        '彩民心得：如何理性购彩',
        'PK10赛车最新投注技巧分享',
        '福彩3D选号策略大全',
        '时时彩新手入门指南',
        '11选5高频玩法深度解析'
    ];

    document.addEventListener('DOMContentLoaded', function() {
        initStatusBar();
        loadHistory();
        renderHistory();
        initFilterTabs();
        initClearAll();
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
    //   数据
    // ===================================
    function loadHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            allRecords = data ? JSON.parse(data) : generateDefaultHistory();
            if (!data) saveHistory();
        } catch(e) {
            allRecords = generateDefaultHistory();
        }
    }

    function saveHistory() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    }

    function generateDefaultHistory() {
        const records = [];
        const now = Date.now();
        const types = Object.keys(PAGE_TYPES);

        // 今天的记录（6-8条）
        for (let i = 0; i < 7; i++) {
            records.push(generateRecord(types, now - i * 1000 * 60 * Math.floor(Math.random() * 60 + 5)));
        }

        // 昨天的记录（4-6条）
        const yesterday = now - 86400000;
        for (let i = 0; i < 5; i++) {
            records.push(generateRecord(types, yesterday - i * 1000 * 60 * Math.floor(Math.random() * 120 + 10)));
        }

        // 前天的记录（3-4条）
        const dayBefore = now - 86400000 * 2;
        for (let i = 0; i < 4; i++) {
            records.push(generateRecord(types, dayBefore - i * 1000 * 60 * Math.floor(Math.random() * 120 + 10)));
        }

        // 更早的记录
        for (let d = 3; d < 7; d++) {
            const day = now - 86400000 * d;
            const count = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < count; i++) {
                records.push(generateRecord(types, day - i * 1000 * 60 * Math.floor(Math.random() * 180 + 10)));
            }
        }

        records.sort((a, b) => b.timestamp - a.timestamp);
        return records;
    }

    function generateRecord(types, timestamp) {
        const type = types[Math.floor(Math.random() * types.length)];
        const lottery = LOTTERY_NAMES[Math.floor(Math.random() * LOTTERY_NAMES.length)];
        let title = '';
        let subtitle = '';

        switch (type) {
            case 'lottery':
                title = `${lottery} 开奖记录`;
                subtitle = `第 ${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 90 + 10)} 期`;
                break;
            case 'trend':
                const trends = ['开奖记录', '综合分析', '位置走势', '号码路珠', '和值路珠', '基本走势', '大小走势', '单双走势'];
                title = `${lottery} - ${trends[Math.floor(Math.random() * trends.length)]}`;
                subtitle = '走势分析';
                break;
            case 'roadmap':
                title = `${lottery} 路子图`;
                subtitle = '大路 · 珠盘路 · 下三路';
                break;
            case 'killplan':
                title = `${lottery} 杀号计划`;
                subtitle = '5位专家推荐';
                break;
            case 'news':
                title = NEWS_TITLES[Math.floor(Math.random() * NEWS_TITLES.length)];
                subtitle = '彩民新闻';
                break;
            case 'goodroad':
                title = `${lottery} 好路推荐`;
                subtitle = '大小路 · 单双路';
                break;
            case 'dragon':
                title = `${lottery} 长龙排行`;
                subtitle = '连续期数排行';
                break;
        }

        return {
            id: `${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
            type,
            title,
            subtitle,
            timestamp
        };
    }

    // ===================================
    //   渲染
    // ===================================
    function renderHistory() {
        const list = document.getElementById('historyList');
        const empty = document.getElementById('emptyState');

        const filtered = currentFilter === 'all'
            ? allRecords
            : allRecords.filter(r => r.type === currentFilter);

        if (filtered.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        list.style.display = 'flex';
        empty.style.display = 'none';

        // 按日期分组
        const groups = groupByDate(filtered);
        let html = '';

        for (const [label, records] of groups) {
            html += `<div class="date-group">`;
            html += `<div class="date-label">${label}</div>`;
            records.forEach(record => {
                const config = PAGE_TYPES[record.type] || PAGE_TYPES.lottery;
                const time = formatTime(record.timestamp);
                html += `
                    <div class="history-card" data-id="${record.id}" data-link="${config.link}" onclick="handleCardClick(this)">
                        <div class="hist-icon ${record.type}">${config.icon}</div>
                        <div class="hist-info">
                            <div class="hist-title">${record.title}</div>
                            <div class="hist-subtitle">
                                <span class="hist-tag ${record.type}">${config.label}</span>
                                <span>${record.subtitle}</span>
                            </div>
                        </div>
                        <div class="hist-time">${time}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        list.innerHTML = html;
    }

    function groupByDate(records) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 86400000;

        const map = new Map();

        records.forEach(r => {
            const d = new Date(r.timestamp);
            const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            let label = '';

            if (dayStart >= today) {
                label = '今天';
            } else if (dayStart >= yesterday) {
                label = '昨天';
            } else {
                label = `${d.getMonth() + 1}月${d.getDate()}日`;
            }

            if (!map.has(label)) map.set(label, []);
            map.get(label).push(r);
        });

        return map;
    }

    function formatTime(ts) {
        const d = new Date(ts);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    // ===================================
    //   卡片点击
    // ===================================
    window.handleCardClick = function(el) {
        const link = el.dataset.link;
        if (link) window.location.href = link;
    };

    // ===================================
    //   分类筛选
    // ===================================
    function initFilterTabs() {
        const container = document.getElementById('filterTabs');
        if (!container) return;

        container.addEventListener('click', function(e) {
            const tab = e.target.closest('.filter-tab');
            if (!tab) return;

            container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            currentFilter = tab.dataset.filter;
            renderHistory();
        });
    }

    // ===================================
    //   清空记录
    // ===================================
    function initClearAll() {
        const clearBtn = document.getElementById('clearAllBtn');
        const modal = document.getElementById('confirmModal');
        const cancelBtn = document.getElementById('cancelClear');
        const confirmBtn = document.getElementById('confirmClear');
        const mask = modal?.querySelector('.confirm-mask');

        function openModal() {
            if (allRecords.length === 0) {
                showToast('暂无记录可清空');
                return;
            }
            modal.classList.add('show');
        }

        function closeModal() {
            modal.classList.remove('show');
        }

        clearBtn?.addEventListener('click', openModal);
        cancelBtn?.addEventListener('click', closeModal);
        mask?.addEventListener('click', closeModal);

        confirmBtn?.addEventListener('click', function() {
            allRecords = [];
            saveHistory();
            renderHistory();
            closeModal();
            showToast('已清空全部浏览记录');
        });
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

    // ===================================
    //   公共API：记录浏览（其他页面调用）
    // ===================================
    window.H5BrowseHistory = {
        add: function(type, title, subtitle) {
            try {
                let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                data.unshift({
                    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    type: type,
                    title: title,
                    subtitle: subtitle || '',
                    timestamp: Date.now()
                });
                // 最多保存200条
                if (data.length > 200) data = data.slice(0, 200);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch(e) {}
        }
    };

})();
