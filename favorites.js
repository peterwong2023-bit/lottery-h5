/**
 * 我的收藏页面
 * 支持：添加/删除收藏、编辑模式、开奖数据展示、快捷入口
 */
(function() {
    'use strict';

    // 全部可收藏彩种
    const ALL_LOTTERIES = [
        { group: '东方彩票', icon: 'star', items: [
            { id: 'kuaisan', name: '快三', badge: 'kuaisan', short: '快三', type: 'dice' },
            { id: 'yuxiaxie', name: '鱼虾蟹', badge: 'kuaisan', short: '鱼蟹', type: 'dice' },
            { id: 'saiche', name: '赛车', badge: 'pk10', short: '赛车', type: 'nums10' },
            { id: 'liuhecai', name: '六合彩', badge: 'lhc', short: '六合', type: 'nums7' },
            { id: 'shishicai', name: '时时彩', badge: 'ssc', short: '时彩', type: 'nums5' },
            { id: 'niuniu', name: '百人牛牛', badge: 'default', short: '牛牛', type: 'nums3' },
            { id: 'longhu', name: '龙虎', badge: 'default', short: '龙虎', type: 'nums2' },
            { id: 'sangong', name: '三公', badge: 'default', short: '三公', type: 'nums3' },
            { id: 'baijiale', name: '百家乐', badge: 'bjl', short: '百家', type: 'nums2' },
            { id: 'lunpan', name: '轮盘', badge: 'default', short: '轮盘', type: 'nums1' },
        ]},
        { group: '快三', icon: 'rect', items: [
            { id: 'jsk3', name: '江苏快三', badge: 'kuaisan', short: '快三', type: 'dice' },
            { id: 'ahk3', name: '安徽快三', badge: 'kuaisan', short: '快三', type: 'dice' },
            { id: 'hbk3', name: '湖北快三', badge: 'kuaisan', short: '快三', type: 'dice' },
        ]},
        { group: '时时彩系列', icon: 'circle', items: [
            { id: 'cqssc', name: '重庆时时彩', badge: 'ssc', short: '时彩', type: 'nums5' },
            { id: 'xjssc', name: '新疆时时彩', badge: 'ssc', short: '时彩', type: 'nums5' },
            { id: 'tjssc', name: '天津时时彩', badge: 'ssc', short: '时彩', type: 'nums5' },
        ]},
        { group: 'PK系列', icon: 'rect', items: [
            { id: 'pk10', name: '北京PK10', badge: 'pk10', short: 'PK10', type: 'nums10' },
            { id: 'xyft', name: '幸运飞艇', badge: 'xyft', short: '飞艇', type: 'nums10' },
        ]},
        { group: 'PC28', icon: 'circle', items: [
            { id: 'jndpc28', name: '加拿大PC28', badge: 'pc28', short: 'PC28', type: 'nums3' },
            { id: 'bjpc28', name: '北京PC28', badge: 'pc28', short: 'PC28', type: 'nums3' },
        ]},
        { group: '11选5系列', icon: 'circle', items: [
            { id: 'gd11x5', name: '广东11选5', badge: 'x11', short: '11选5', type: 'nums5' },
            { id: 'sh11x5', name: '上海11选5', badge: 'x11', short: '11选5', type: 'nums5' },
        ]},
        { group: '乐透彩', icon: 'circle', items: [
            { id: 'ssq', name: '双色球', badge: 'lhc', short: '双色', type: 'nums7' },
            { id: 'dlt', name: '大乐透', badge: 'lhc', short: '乐透', type: 'nums7' },
        ]},
        { group: '快乐十分', icon: 'circle', items: [
            { id: 'gdklsf', name: '广东快乐十分', badge: 'klsf', short: '快十', type: 'nums8' },
            { id: 'tjklsf', name: '天津快乐十分', badge: 'klsf', short: '快十', type: 'nums8' },
        ]},
        { group: '其他', icon: 'dots', items: [
            { id: 'kl8', name: '快乐8', badge: 'default', short: '快8', type: 'nums5' },
            { id: '3d', name: '福彩3D', badge: 'default', short: '3D', type: 'nums3' },
        ]},
    ];

    const STORAGE_KEY = 'h5_lottery_favorites';
    let favorites = [];
    let isEditing = false;
    let countdownTimers = {};

    document.addEventListener('DOMContentLoaded', function() {
        initStatusBar();
        loadFavorites();
        renderList();
        initEditMode();
        initAddModal();
        startCountdowns();
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
    //   数据持久化
    // ===================================
    function loadFavorites() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            favorites = data ? JSON.parse(data) : getDefaultFavorites();
        } catch (e) {
            favorites = getDefaultFavorites();
        }
    }

    function saveFavorites() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }

    function getDefaultFavorites() {
        return ['kuaisan', 'pk10', 'cqssc', 'jndpc28', 'xyft'];
    }

    function findLottery(id) {
        for (const group of ALL_LOTTERIES) {
            const item = group.items.find(i => i.id === id);
            if (item) return item;
        }
        return null;
    }

    // ===================================
    //   生成模拟开奖数据
    // ===================================
    function generateResult(type) {
        const r = () => Math.floor(Math.random() * 10);
        const rd = () => Math.floor(Math.random() * 6) + 1;

        switch (type) {
            case 'dice': {
                const d = [rd(), rd(), rd()];
                const sum = d[0] + d[1] + d[2];
                return { nums: d, sum, size: sum >= 11 ? '大' : '小', oddEven: sum % 2 ? '单' : '双', isDice: true };
            }
            case 'nums10': {
                const nums = [];
                while (nums.length < 10) {
                    const n = Math.floor(Math.random() * 10) + 1;
                    if (!nums.includes(n)) nums.push(n);
                }
                return { nums: nums.map(n => String(n).padStart(2, '0')) };
            }
            case 'nums8': {
                const nums = Array.from({ length: 8 }, () => String(Math.floor(Math.random() * 20) + 1).padStart(2, '0'));
                return { nums };
            }
            case 'nums7': {
                const nums = Array.from({ length: 7 }, () => String(Math.floor(Math.random() * 49) + 1).padStart(2, '0'));
                return { nums, special: nums[6] };
            }
            case 'nums5': {
                const nums = Array.from({ length: 5 }, () => r());
                return { nums };
            }
            case 'nums3': {
                const nums = Array.from({ length: 3 }, () => r());
                const sum = nums.reduce((a, b) => a + b, 0);
                return { nums, sum, size: sum >= 14 ? '大' : '小', oddEven: sum % 2 ? '单' : '双' };
            }
            case 'nums2': {
                const nums = Array.from({ length: 2 }, () => r());
                return { nums };
            }
            case 'nums1': {
                return { nums: [Math.floor(Math.random() * 37)] };
            }
            default:
                return { nums: [r(), r(), r()] };
        }
    }

    // ===================================
    //   渲染收藏列表
    // ===================================
    function renderList() {
        const list = document.getElementById('favList');
        const empty = document.getElementById('emptyState');
        const total = document.getElementById('favTotal');

        total.textContent = favorites.length;

        if (favorites.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        list.style.display = 'flex';
        empty.style.display = 'none';

        const period = String(Math.floor(Math.random() * 900) + 100);

        list.innerHTML = favorites.map(id => {
            const lottery = findLottery(id);
            if (!lottery) return '';

            const result = generateResult(lottery.type);
            const numbersHtml = renderNumbers(result, lottery.type);

            return `
                <div class="fav-card${isEditing ? ' editing' : ''}" data-id="${id}">
                    <div class="fav-card-header">
                        <div class="fav-card-left">
                            <div class="fav-badge ${lottery.badge}">${lottery.short}</div>
                            <div>
                                <div class="fav-name">${lottery.name}</div>
                                <div class="fav-period">第 ${period}${Math.floor(Math.random() * 90 + 10)} 期</div>
                            </div>
                        </div>
                        <div class="fav-card-right">
                            <div class="fav-countdown" data-cd="${id}">
                                <span class="cd-time" id="cd_${id}">--:--</span>
                                <span class="cd-label">后开奖</span>
                            </div>
                            <button class="fav-delete" onclick="removeFav('${id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="fav-numbers">${numbersHtml}</div>
                    <div class="fav-actions">
                        <button class="fav-action-btn" onclick="location.href='trend.html'">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            走势
                        </button>
                        <button class="fav-action-btn" onclick="location.href='roadmap.html'">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            路子图
                        </button>
                        <button class="fav-action-btn" onclick="location.href='killplan.html'">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            杀号
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        startCountdowns();
    }

    function renderNumbers(result, type) {
        let html = '';

        if (result.isDice) {
            result.nums.forEach(n => {
                html += `<div class="fav-num dice">${n}</div>`;
            });
            html += `<span class="fav-sum">= ${result.sum}</span>`;
            html += `<div class="fav-attrs">`;
            html += `<span class="fav-attr ${result.size === '大' ? 'big' : 'small'}">${result.size}</span>`;
            html += `<span class="fav-attr ${result.oddEven === '单' ? 'odd' : 'even'}">${result.oddEven}</span>`;
            html += `</div>`;
        } else if (type === 'nums7' && result.special) {
            result.nums.slice(0, 6).forEach(n => {
                html += `<div class="fav-num red">${n}</div>`;
            });
            html += `<div class="fav-num blue">${result.special}</div>`;
        } else if (type === 'nums10') {
            const colors = ['red', 'red', 'red', 'blue', 'blue', 'blue', 'green', 'green', 'purple', 'purple'];
            result.nums.forEach((n, i) => {
                html += `<div class="fav-num ${colors[i]}">${n}</div>`;
            });
        } else {
            result.nums.forEach(n => {
                html += `<div class="fav-num">${n}</div>`;
            });
            if (result.sum !== undefined) {
                html += `<span class="fav-sum">= ${result.sum}</span>`;
                html += `<div class="fav-attrs">`;
                html += `<span class="fav-attr ${result.size === '大' ? 'big' : 'small'}">${result.size}</span>`;
                html += `<span class="fav-attr ${result.oddEven === '单' ? 'odd' : 'even'}">${result.oddEven}</span>`;
                html += `</div>`;
            }
        }

        return html;
    }

    // ===================================
    //   倒计时
    // ===================================
    function startCountdowns() {
        Object.values(countdownTimers).forEach(t => clearInterval(t));
        countdownTimers = {};

        favorites.forEach(id => {
            let seconds = Math.floor(Math.random() * 120) + 10;
            const el = document.getElementById(`cd_${id}`);
            if (!el) return;

            function update() {
                if (seconds <= 0) {
                    seconds = Math.floor(Math.random() * 120) + 30;
                    // 刷新这个卡片的数据
                    renderList();
                    return;
                }
                const m = String(Math.floor(seconds / 60)).padStart(2, '0');
                const s = String(seconds % 60).padStart(2, '0');
                el.textContent = `${m}:${s}`;

                if (seconds <= 10) {
                    el.style.color = '#fbbf24';
                }
                seconds--;
            }

            update();
            countdownTimers[id] = setInterval(update, 1000);
        });
    }

    // ===================================
    //   编辑模式
    // ===================================
    function initEditMode() {
        const btn = document.getElementById('editBtn');
        if (!btn) return;

        btn.addEventListener('click', function() {
            isEditing = !isEditing;
            this.classList.toggle('active', isEditing);
            this.querySelector('.edit-text').textContent = isEditing ? '完成' : '编辑';

            const cards = document.querySelectorAll('.fav-card');
            cards.forEach(card => card.classList.toggle('editing', isEditing));
        });
    }

    // 删除收藏（挂到window上供onclick调用）
    window.removeFav = function(id) {
        const card = document.querySelector(`.fav-card[data-id="${id}"]`);
        if (card) {
            card.style.transition = 'all 0.3s ease';
            card.style.transform = 'translateX(100%)';
            card.style.opacity = '0';
            setTimeout(() => {
                favorites = favorites.filter(f => f !== id);
                saveFavorites();
                renderList();
                showToast('已取消收藏');
            }, 300);
        }
    };

    // ===================================
    //   添加收藏弹窗
    // ===================================
    function initAddModal() {
        const modal = document.getElementById('addModal');
        const addBtn = document.getElementById('addFavBtn');
        const emptyAddBtn = document.getElementById('emptyAddBtn');
        const closeBtn = document.getElementById('modalClose');
        const mask = modal?.querySelector('.modal-mask');
        const confirmBtn = document.getElementById('confirmAdd');

        function openModal() {
            renderModalBody();
            modal.classList.add('show');
        }

        function closeModal() {
            modal.classList.remove('show');
        }

        addBtn?.addEventListener('click', openModal);
        emptyAddBtn?.addEventListener('click', openModal);
        closeBtn?.addEventListener('click', closeModal);
        mask?.addEventListener('click', closeModal);

        confirmBtn?.addEventListener('click', function() {
            const checked = document.querySelectorAll('.lottery-check.checked');
            favorites = [];
            checked.forEach(el => favorites.push(el.dataset.id));
            saveFavorites();
            renderList();
            closeModal();
            showToast(`已保存 ${favorites.length} 个收藏`);
        });
    }

    function renderModalBody() {
        const body = document.getElementById('modalBody');
        if (!body) return;

        const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        body.innerHTML = ALL_LOTTERIES.map(group => `
            <div class="lottery-group">
                <div class="group-title">${group.group}</div>
                <div class="group-items">
                    ${group.items.map(item => `
                        <div class="lottery-check${favorites.includes(item.id) ? ' checked' : ''}" data-id="${item.id}">
                            <span class="check-icon">${checkSvg}</span>
                            <span>${item.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // 绑定点击事件
        body.querySelectorAll('.lottery-check').forEach(el => {
            el.addEventListener('click', function() {
                this.classList.toggle('checked');
            });
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

})();
