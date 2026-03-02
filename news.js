// 彩民新闻 - H5版本(参照PC版)

(function() {
    'use strict';

    // 分类名称映射
    const CATEGORY_MAP = {
        'news': '行业资讯',
        'analysis': '数据分析',
        'tips': '投注技巧',
        'winners': '中奖故事',
        'rules': '玩法规则'
    };

    // 背景色配置
    const BG_COLORS = [
        'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
        'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)'
    ];

    // 头条新闻
    const headlineData = {
        category: 'news',
        title: '2026年彩票行业年度报告发布：数字化转型加速推进',
        summary: '根据最新发布的行业报告显示，2025年全国彩票销售额突破6000亿元大关，同比增长12.5%。数字化渠道占比首次超过传统渠道...',
        author: '彩讯编辑部',
        time: '2小时前',
        views: 125000,
        emoji: '📊',
        bg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
    };

    // 热门排行数据
    const rankingData = [
        { title: '福彩双色球第2026015期开奖：头奖8注 单注奖金685万', time: '3小时前' },
        { title: '体彩大乐透奖池累积突破30亿，创历史新高', time: '5小时前' },
        { title: '快三玩法技巧全解析：如何提高中奖概率', time: '6小时前' },
        { title: '北京彩民守号3年终中头奖：坚持是最大的技巧', time: '8小时前' },
        { title: '2026年春节期间彩票销售安排公告', time: '昨天' }
    ];

    // 新闻数据
    const newsData = [
        {
            category: 'analysis',
            title: '深度解析：双色球近50期蓝球走势规律',
            summary: '通过对近50期双色球开奖数据的深度分析，我们发现蓝球存在明显的周期性规律...',
            author: '走势大师',
            time: '30分钟前',
            views: 8562,
            emoji: '📈',
            bgIndex: 0
        },
        {
            category: 'winners',
            title: '广州彩民复式投注斩获大乐透一等奖2000万',
            summary: '近日，广州市天河区一位彩民通过复式投注方式，成功中得大乐透一等奖...',
            author: '彩讯快报',
            time: '1小时前',
            views: 12453,
            emoji: '🎉',
            bgIndex: 1,
            type: 'big' // 大图模式
        },
        {
            category: 'tips',
            title: '快三投注技巧：如何利用和值分析提高命中率',
            summary: '和值分析是快三投注中最常用的方法之一...',
            author: '彩神在线',
            time: '2小时前',
            views: 6234,
            emoji: '💡',
            bgIndex: 2
        },
        {
            category: 'news',
            title: '体彩中心发布2026年首季度销售数据报告',
            summary: '据体彩中心最新发布的数据显示，2026年第一季度全国体育彩票销售额达...',
            author: '官方发布',
            time: '3小时前',
            views: 4521,
            emoji: '📋',
            bgIndex: 3
        },
        {
            category: 'rules',
            title: 'PK10新手入门指南：全面解读游戏规则',
            summary: 'PK10是一款非常受欢迎的高频彩票游戏...',
            author: '规则讲堂',
            time: '4小时前',
            views: 3245,
            emoji: '📖',
            bgIndex: 4
        },
        {
            category: 'analysis',
            title: '11选5前三直选号码出现频率统计分析',
            summary: '通过大数据分析11选5历史开奖记录，统计前三直选号码的出现频率和规律...',
            author: '数据分析师',
            time: '5小时前',
            views: 2876,
            emoji: '🔢',
            bgIndex: 5
        },
        {
            category: 'winners',
            title: '退休老人坚持守号5年终中双色球头奖',
            summary: '来自山东济南的李大爷，5年来始终坚持同一组号码投注...',
            author: '故事专栏',
            time: '6小时前',
            views: 9876,
            emoji: '🏆',
            bgIndex: 1
        },
        {
            category: 'tips',
            title: '时时彩杀号技巧：三招教你排除冷门号码',
            summary: '杀号是时时彩投注中的重要技巧...',
            author: '技巧达人',
            time: '7小时前',
            views: 5432,
            emoji: '🎯',
            bgIndex: 0,
            type: 'images' // 三图模式
        },
        {
            category: 'news',
            title: '多地彩票中心推出便民服务新举措',
            summary: '为提升彩民购彩体验，多地彩票中心推出一系列便民措施...',
            author: '彩票资讯',
            time: '8小时前',
            views: 1856,
            emoji: '🏛️',
            bgIndex: 3
        },
        {
            category: 'winners',
            title: '北京彩民守号5年终中七乐彩头奖500万',
            summary: '坚持就是胜利，北京一位彩民用5年时间证明了这一点...',
            author: '中奖快报',
            time: '10小时前',
            views: 7654,
            emoji: '💰',
            bgIndex: 2
        }
    ];

    let currentCategory = 'all';

    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        updateStatusTime();
        initTabs();
        initSearch();
        initLoadMore();
        renderHeadline();
        renderRanking();
        renderNewsList();
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

    // 初始化标签
    function initTabs() {
        const tabs = document.querySelectorAll('.news-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.dataset.category;
                renderNewsList();
            });
        });
    }

    // 初始化搜索
    function initSearch() {
        const searchBtn = document.getElementById('searchBtn');
        const searchBar = document.getElementById('searchBar');
        const searchCancel = document.getElementById('searchCancel');
        const searchInput = document.getElementById('searchInput');

        searchBtn.addEventListener('click', () => {
            searchBar.classList.add('show');
            searchInput.focus();
        });

        searchCancel.addEventListener('click', () => {
            searchBar.classList.remove('show');
            searchInput.value = '';
        });
    }

    // 初始化加载更多
    function initLoadMore() {
        const btn = document.getElementById('loadMore');
        if (btn) {
            btn.addEventListener('click', function() {
                this.innerHTML = '<span>加载中...</span>';
                setTimeout(() => {
                    this.innerHTML = `
                        <span>加载更多</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    `;
                }, 1000);
            });
        }
    }

    // 渲染头条
    function renderHeadline() {
        const container = document.getElementById('headlineCard');
        if (!container) return;

        container.innerHTML = `
            <div class="headline-image">
                <div class="img-placeholder" style="background: ${headlineData.bg}; color: white; font-size: 60px;">
                    ${headlineData.emoji}
                </div>
                <span class="headline-tag">热门</span>
            </div>
            <div class="headline-body">
                <span class="headline-category">${CATEGORY_MAP[headlineData.category]}</span>
                <h2 class="headline-title">${headlineData.title}</h2>
                <p class="headline-summary">${headlineData.summary}</p>
                <div class="headline-meta">
                    <span class="author">
                        <span class="author-avatar">${headlineData.author.charAt(0)}</span>
                        ${headlineData.author}
                    </span>
                    <span class="time">${headlineData.time}</span>
                    <span class="views">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        ${formatNumber(headlineData.views)}
                    </span>
                </div>
            </div>
        `;
    }

    // 渲染热门排行
    function renderRanking() {
        const container = document.getElementById('rankingList');
        if (!container) return;

        container.innerHTML = rankingData.map((item, index) => {
            let rankClass = '';
            if (index === 0) rankClass = 'top1';
            else if (index === 1) rankClass = 'top2';
            else if (index === 2) rankClass = 'top3';

            return `
                <div class="ranking-item">
                    <span class="rank-num ${rankClass}">${index + 1}</span>
                    <div class="rank-content">
                        <h4 class="rank-title">${item.title}</h4>
                        <span class="rank-time">${item.time}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 渲染新闻列表
    function renderNewsList() {
        const container = document.getElementById('newsList');
        if (!container) return;

        // 切换分类时，隐藏/显示头条和热门排行
        const headline = document.getElementById('headlineCard');
        const ranking = document.querySelector('.hot-ranking');
        const flashBar = document.querySelector('.flash-bar');
        if (currentCategory === 'all') {
            if (headline) headline.style.display = '';
            if (ranking) ranking.style.display = '';
            if (flashBar) flashBar.style.display = '';
        } else {
            if (headline) headline.style.display = 'none';
            if (ranking) ranking.style.display = 'none';
            if (flashBar) flashBar.style.display = 'none';
        }

        let filteredNews = currentCategory === 'all' 
            ? newsData 
            : newsData.filter(n => n.category === currentCategory);

        if (filteredNews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-text">暂无相关新闻</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredNews.map(news => {
            const catName = CATEGORY_MAP[news.category] || '';
            const bg = BG_COLORS[news.bgIndex || 0];

            if (news.type === 'big') {
                // 大图模式
                return `
                    <article class="news-card big">
                        <div class="news-thumb" style="background: ${bg}">
                            ${news.emoji}
                        </div>
                        <div class="news-body">
                            <h3 class="news-title">
                                <span class="title-tag">【${catName}】</span>${news.title}
                            </h3>
                            <div class="news-footer">
                                <span class="news-category-tag">${catName}</span>
                                <span class="news-time">${news.time}</span>
                                <span class="news-views">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    ${formatNumber(news.views)}
                                </span>
                            </div>
                        </div>
                    </article>
                `;
            } else if (news.type === 'images') {
                // 三图模式
                return `
                    <article class="news-card" style="flex-direction: column">
                        <div class="news-body">
                            <h3 class="news-title">
                                <span class="title-tag">【${catName}】</span>${news.title}
                            </h3>
                            <div class="news-images">
                                <div class="img-item" style="background: ${BG_COLORS[0]}">${news.emoji}</div>
                                <div class="img-item" style="background: ${BG_COLORS[2]}">📊</div>
                                <div class="img-item" style="background: ${BG_COLORS[4]}">📈</div>
                            </div>
                            <div class="news-footer">
                                <span class="news-category-tag">${catName}</span>
                                <span class="news-time">${news.time}</span>
                                <span class="news-views">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    ${formatNumber(news.views)}
                                </span>
                            </div>
                        </div>
                    </article>
                `;
            } else {
                // 标准模式(左图右文)
                return `
                    <article class="news-card">
                        <div class="news-thumb" style="background: ${bg}">
                            ${news.emoji}
                        </div>
                        <div class="news-body">
                            <h3 class="news-title">${news.title}</h3>
                            <div class="news-footer">
                                <span class="news-category-tag">${catName}</span>
                                <span class="news-time">${news.time}</span>
                                <span class="news-views">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    ${formatNumber(news.views)}
                                </span>
                            </div>
                        </div>
                    </article>
                `;
            }
        }).join('');
    }

    // 格式化数字
    function formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toLocaleString();
    }

})();
