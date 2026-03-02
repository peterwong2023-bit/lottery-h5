/**
 * 消息中心
 * 展示开奖提醒、长龙提醒、好路提醒、开奖结果四类推送
 */
(function() {
    'use strict';

    var STORAGE_KEY = 'h5_messages';
    var currentFilter = 'all';

    var DEMO_MESSAGES = [
        {
            id: 1, type: 'draw', unread: true,
            time: '2分钟前', fullTime: '16:48',
            icon: '🔴', name: '双色球', period: '2026058',
            detail: '将在 <em class="orange">5 分钟</em>后开奖',
            drawTime: '21:15', minutes: 5
        },
        {
            id: 2, type: 'dragon', unread: true,
            time: '8分钟前', fullTime: '16:42',
            icon: '🎲', name: '快三', period: '30521',
            detail: '连续 <em class="red">6</em> 期开出 <em class="red">【小】</em>，已超过阈值',
            streak: 6, value: '小', dotClass: 'blue'
        },
        {
            id: 3, type: 'result', unread: true,
            time: '15分钟前', fullTime: '16:35',
            icon: '🎲', name: '快三', period: '30520',
            dice: [4, 5, 6], sum: 15, size: 'big', oddEven: 'odd'
        },
        {
            id: 4, type: 'goodroad', unread: true,
            time: '22分钟前', fullTime: '16:28',
            icon: '🏎️', name: '赛车', play: '冠亚和大小',
            detail: '出现 <em class="purple">【不过三】</em> 好路，已持续 8 期',
            pattern: '不过三', count: 8,
            preview: ['a','b','a','b','a','a','b','b']
        },
        {
            id: 5, type: 'dragon', unread: true,
            time: '35分钟前', fullTime: '16:15',
            icon: '⚡', name: '极速赛车', period: '85432',
            detail: '冠军连续 <em class="red">5</em> 期开出 <em class="red">【大】</em>',
            streak: 5, value: '大', dotClass: 'red'
        },
        {
            id: 6, type: 'goodroad', unread: false,
            time: '55分钟前', fullTime: '15:55',
            icon: '♠️', name: '百家乐', play: '庄闲',
            detail: '出现 <em class="purple">【长龙】</em> 好路，已持续 7 期',
            pattern: '长龙', count: 7,
            preview: ['a','a','a','a','a','a','a']
        },
        {
            id: 7, type: 'result', unread: false,
            time: '1小时前', fullTime: '15:40',
            icon: '🏁', name: 'PK10', period: '12086',
            dice: [3, 1, 2], sum: 6, size: 'small', oddEven: 'even'
        },
        {
            id: 8, type: 'draw', unread: false,
            time: '2小时前', fullTime: '14:50',
            icon: '🏆', name: '大乐透', period: '2026032',
            detail: '将在 <em class="orange">10 分钟</em>后开奖',
            drawTime: '20:30', minutes: 10
        },
        {
            id: 9, type: 'dragon', unread: false,
            time: '3小时前', fullTime: '13:42',
            icon: '🃏', name: '百家乐', period: '6653',
            detail: '连续 <em class="red">4</em> 期开出 <em class="red">【庄】</em>',
            streak: 4, value: '庄', dotClass: 'red'
        },
        {
            id: 10, type: 'goodroad', unread: false,
            time: '3小时前', fullTime: '13:20',
            icon: '🎲', name: '快三', play: '大小',
            detail: '出现 <em class="purple">【单跳】</em> 好路，已持续 10 期',
            pattern: '单跳', count: 10,
            preview: ['a','b','a','b','a','b','a','b','a','b']
        },
        {
            id: 11, type: 'result', unread: false,
            time: '昨天 21:15', fullTime: '21:15',
            icon: '🔴', name: '双色球', period: '2026057',
            dice: [2, 5, 3], sum: 10, size: 'small', oddEven: 'even'
        },
        {
            id: 12, type: 'draw', unread: false,
            time: '昨天 21:00', fullTime: '21:00',
            icon: '🎱', name: '六合彩', period: '2026024',
            detail: '将在 <em class="orange">3 分钟</em>后开奖',
            drawTime: '21:30', minutes: 3
        }
    ];

    document.addEventListener('DOMContentLoaded', function() {
        initStatusBar();
        initTabs();
        initClearAll();
        renderMessages();
    });

    function initStatusBar() {
        var el = document.getElementById('statusTime');
        if (!el) return;
        function update() {
            var now = new Date();
            el.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        }
        update();
        setInterval(update, 30000);
    }

    function initTabs() {
        document.querySelectorAll('.msg-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.msg-tab').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                currentFilter = this.dataset.type;
                renderMessages();
            });
        });
    }

    function initClearAll() {
        var btn = document.getElementById('clearAllBtn');
        if (btn) {
            btn.addEventListener('click', function() {
                DEMO_MESSAGES.forEach(function(m) { m.unread = false; });
                renderMessages();
                showToast('已全部标为已读');
                updateBadge();
            });
        }
    }

    function getMessages() {
        if (currentFilter === 'all') return DEMO_MESSAGES;
        return DEMO_MESSAGES.filter(function(m) { return m.type === currentFilter; });
    }

    function renderMessages() {
        var list = document.getElementById('msgList');
        var empty = document.getElementById('msgEmpty');
        var messages = getMessages();

        if (messages.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        list.style.display = 'flex';
        empty.style.display = 'none';

        var html = '';
        var lastGroup = '';

        messages.forEach(function(msg) {
            var group = msg.time.indexOf('昨天') >= 0 ? '昨天' : '今天';
            if (group !== lastGroup) {
                html += '<div class="msg-date-divider">' + group + '</div>';
                lastGroup = group;
            }
            html += renderCard(msg);
        });

        list.innerHTML = html;

        list.querySelectorAll('.msg-card.unread').forEach(function(card) {
            card.addEventListener('click', function() {
                var id = parseInt(this.dataset.id);
                var msg = DEMO_MESSAGES.find(function(m) { return m.id === id; });
                if (msg) {
                    msg.unread = false;
                    updateBadge();
                }
                this.classList.remove('unread');
                var dot = this.querySelector('.msg-unread-dot');
                if (dot) dot.remove();
            });
        });
    }

    function renderCard(msg) {
        var typeLabels = {
            draw: '🔔 开奖提醒',
            dragon: '🐉 长龙提醒',
            goodroad: '🛤️ 好路提醒',
            result: '🎲 开奖结果'
        };

        var unreadDot = msg.unread ? '<span class="msg-unread-dot"></span>' : '';

        var html = '<div class="msg-card' + (msg.unread ? ' unread' : '') + '" data-id="' + msg.id + '">' +
            '<div class="msg-card-header">' +
            '<span class="msg-type-badge ' + msg.type + '">' + typeLabels[msg.type] + '</span>' +
            unreadDot +
            '<span class="msg-time">' + msg.time + '</span>' +
            '</div>' +
            '<div class="msg-card-body">' +
            '<div class="msg-lottery-icon">' + msg.icon + '</div>' +
            '<div class="msg-content">' +
            '<div class="msg-lottery-name">' + msg.name +
            (msg.period ? '<span class="msg-period">第' + msg.period + '期</span>' : '') +
            (msg.play ? '<span class="msg-period">' + msg.play + '</span>' : '') +
            '</div>';

        if (msg.type === 'draw') {
            html += '<div class="msg-detail">' + msg.detail + '</div>' +
                '<div class="msg-draw-info">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>' +
                '<span>开奖时间 ' + msg.drawTime + '</span></div>';
        } else if (msg.type === 'dragon') {
            html += '<div class="msg-detail">' + msg.detail + '</div>';
            var dotsHtml = '';
            for (var i = 0; i < Math.min(msg.streak, 8); i++) {
                dotsHtml += '<span class="msg-streak-dot ' + msg.dotClass + '">' + msg.value + '</span>';
            }
            if (msg.streak > 8) dotsHtml += '<span style="font-size:11px;color:#9ca3af;margin-left:2px">+' + (msg.streak - 8) + '</span>';
            html += '<div class="msg-streak-dots">' + dotsHtml + '</div>';
        } else if (msg.type === 'goodroad') {
            html += '<div class="msg-detail">' + msg.detail + '</div>';
            if (msg.preview) {
                var preview = msg.preview.map(function(c) {
                    return '<span class="msg-road-dot ' + c + '">' + (c === 'a' ? '大' : '小') + '</span>';
                }).join('');
                html += '<div class="msg-road-preview">' + preview + '</div>';
            }
        } else if (msg.type === 'result') {
            var sizeLabel = msg.size === 'big' ? '大' : '小';
            var oeLabel = msg.oddEven === 'odd' ? '单' : '双';
            html += '<div class="msg-result-row">';
            msg.dice.forEach(function(d) {
                html += '<span class="msg-dice">' + d + '</span>';
            });
            html += '<span class="msg-sum">= ' + msg.sum + '</span>' +
                '<div class="msg-attrs"><span class="msg-attr ' + msg.size + '">' + sizeLabel + '</span>' +
                '<span class="msg-attr ' + (msg.oddEven === 'odd' ? 'odd' : 'even') + '">' + oeLabel + '</span></div></div>';
        }

        html += '</div></div></div>';
        return html;
    }

    function updateBadge() {
        var unreadCount = DEMO_MESSAGES.filter(function(m) { return m.unread; }).length;
        try {
            if (window.opener && window.opener.updateMsgBadge) {
                window.opener.updateMsgBadge(unreadCount);
            }
        } catch(e) {}
    }

    function showToast(message) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function() { toast.remove(); }, 300);
        }, 2000);
    }

})();
