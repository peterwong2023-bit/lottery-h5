/**
 * 全局智能通知组件
 * 支持三种提醒类型：开奖提醒、长龙提醒、好路提醒 + 开奖结果
 * 
 * 用法：
 *   SmartNotification.draw({ ... })
 *   SmartNotification.dragon({ ... })
 *   SmartNotification.goodroad({ ... })
 *   SmartNotification.result({ ... })
 */
var SmartNotification = (function() {
    'use strict';

    var DURATION_DEFAULT = 5000; // 默认5秒
    var currentNotif = null;
    var dismissTimer = null;

    // ===================================
    //   工具函数
    // ===================================
    function removeExisting() {
        if (dismissTimer) {
            clearTimeout(dismissTimer);
            dismissTimer = null;
        }
        if (currentNotif && currentNotif.parentNode) {
            currentNotif.remove();
        }
        currentNotif = null;
    }

    function showNotif(el, duration) {
        removeExisting();
        currentNotif = el;
        document.body.appendChild(el);

        // 设置进度条动画时长
        el.style.setProperty('--notif-duration', (duration / 1000) + 's');

        // 触发动画
        requestAnimationFrame(function() {
            el.classList.add('show');
        });

        // 点击关闭
        el.addEventListener('click', function() {
            dismiss();
        });

        // 自动消失
        dismissTimer = setTimeout(function() {
            dismiss();
        }, duration);
    }

    function dismiss() {
        if (dismissTimer) {
            clearTimeout(dismissTimer);
            dismissTimer = null;
        }
        if (currentNotif) {
            currentNotif.classList.remove('show');
            currentNotif.classList.add('hide');
            var ref = currentNotif;
            setTimeout(function() {
                if (ref.parentNode) ref.remove();
            }, 400);
            currentNotif = null;
        }
    }

    function getTimeStr() {
        var now = new Date();
        return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    }

    function getValueClass(value) {
        var map = {
            '大': 'val-big', '小': 'val-small',
            '单': 'val-odd', '双': 'val-even',
            '龙': 'val-dragon', '虎': 'val-tiger',
            '庄': 'val-zhuang', '闲': 'val-xian'
        };
        return map[value] || 'val-big';
    }

    function getDotClass(value) {
        var map = {
            '大': 'dot-big', '小': 'dot-small',
            '单': 'dot-odd', '双': 'dot-even'
        };
        return map[value] || 'dot-default';
    }

    // ===================================
    //   1. 开奖提醒通知
    // ===================================
    // options: { icon, name, period, minutes, drawTime }
    function drawNotif(options) {
        var opts = options || {};
        var icon = opts.icon || '🔔';
        var name = opts.name || '未知彩票';
        var period = opts.period || '';
        var minutes = opts.minutes || 5;
        var drawTime = opts.drawTime || '--:--';
        var duration = opts.duration || DURATION_DEFAULT;

        var el = document.createElement('div');
        el.className = 'smart-notif type-draw';
        el.innerHTML =
            '<div class="notif-glow"></div>' +
            '<div class="notif-header">' +
                '<div class="notif-type-badge">🔔 开奖提醒</div>' +
                '<span class="notif-time">' + getTimeStr() + '</span>' +
            '</div>' +
            '<div class="notif-title-row">' +
                '<span class="notif-lottery-icon">' + icon + '</span>' +
                '<span class="notif-lottery-name">' + name + '</span>' +
                (period ? '<span class="notif-period">第' + period + '期</span>' : '') +
            '</div>' +
            '<div class="notif-draw-body">' +
                '<div class="notif-countdown-icon">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                        '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
                        '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="notif-draw-info">' +
                    '<div class="notif-draw-main">将在 <span class="notif-minutes">' + minutes + '</span> 分钟后开奖</div>' +
                    '<div class="notif-draw-sub">开奖时间 <span class="notif-draw-time">' + drawTime + '</span></div>' +
                '</div>' +
            '</div>' +
            '<div class="notif-progress"><div class="notif-progress-bar"></div></div>';

        showNotif(el, duration);
    }

    // ===================================
    //   2. 长龙提醒通知
    // ===================================
    // options: { icon, name, period, streak, value, threshold }
    function dragonNotif(options) {
        var opts = options || {};
        var icon = opts.icon || '🎲';
        var name = opts.name || '未知彩票';
        var period = opts.period || '';
        var streak = opts.streak || 4;
        var value = opts.value || '大';
        var threshold = opts.threshold || 4;
        var duration = opts.duration || DURATION_DEFAULT;

        // 生成连续圆点
        var dotsHtml = '';
        var dotClass = getDotClass(value);
        var maxDots = Math.min(streak, 10); // 最多显示10个
        for (var i = 0; i < maxDots; i++) {
            dotsHtml += '<div class="notif-streak-dot ' + dotClass + '">' + value + '</div>';
        }
        if (streak > 10) {
            dotsHtml += '<span style="color:rgba(255,255,255,0.4);font-size:12px;margin-left:2px">+' + (streak - 10) + '</span>';
        }

        var el = document.createElement('div');
        el.className = 'smart-notif type-dragon';
        el.innerHTML =
            '<div class="notif-glow"></div>' +
            '<div class="notif-header">' +
                '<div class="notif-type-badge">🐉 长龙提醒</div>' +
                '<span class="notif-time">' + getTimeStr() + '</span>' +
            '</div>' +
            '<div class="notif-title-row">' +
                '<span class="notif-lottery-icon">' + icon + '</span>' +
                '<span class="notif-lottery-name">' + name + '</span>' +
                (period ? '<span class="notif-period">第' + period + '期</span>' : '') +
            '</div>' +
            '<div class="notif-dragon-body">' +
                '<div class="notif-dragon-main">' +
                    '连续 <span class="notif-keyword">' + streak + '</span> 期开出 ' +
                    '<span class="notif-value ' + getValueClass(value) + '">【' + value + '】</span>' +
                '</div>' +
                '<div class="notif-streak-dots">' + dotsHtml + '</div>' +
                '<div class="notif-dragon-tip">' +
                    '<span class="tip-warn">⚠</span> 已超过阈值（' + threshold + '期），请注意走势变化' +
                '</div>' +
            '</div>' +
            '<div class="notif-progress"><div class="notif-progress-bar"></div></div>';

        showNotif(el, duration);
    }

    // ===================================
    //   3. 好路提醒通知
    // ===================================
    // options: { icon, name, play, pattern, count, preview }
    function goodroadNotif(options) {
        var opts = options || {};
        var icon = opts.icon || '🎲';
        var name = opts.name || '未知彩票';
        var play = opts.play || '大小';
        var pattern = opts.pattern || '长龙';
        var count = opts.count || 5;
        var preview = opts.preview || [];
        var duration = opts.duration || DURATION_DEFAULT;

        // 生成路型预览圆点
        var previewHtml = '';
        for (var i = 0; i < preview.length; i++) {
            var rdClass = preview[i] === 'a' ? 'rd-a' : 'rd-b';
            previewHtml += '<div class="notif-road-dot ' + rdClass + '"></div>';
        }

        var el = document.createElement('div');
        el.className = 'smart-notif type-goodroad';
        el.innerHTML =
            '<div class="notif-glow"></div>' +
            '<div class="notif-header">' +
                '<div class="notif-type-badge">🛤️ 好路提醒</div>' +
                '<span class="notif-time">' + getTimeStr() + '</span>' +
            '</div>' +
            '<div class="notif-title-row">' +
                '<span class="notif-lottery-icon">' + icon + '</span>' +
                '<span class="notif-lottery-name">' + name + '</span>' +
                '<span class="notif-period">' + play + '</span>' +
            '</div>' +
            '<div class="notif-road-body">' +
                '<div class="notif-road-main">' +
                    '出现 <span class="notif-pattern">【' + pattern + '】</span> 好路' +
                '</div>' +
                (previewHtml ? '<div class="notif-road-preview">' + previewHtml + '</div>' : '') +
                '<div class="notif-road-count">已持续 ' + count + ' 期</div>' +
            '</div>' +
            '<div class="notif-progress"><div class="notif-progress-bar"></div></div>';

        showNotif(el, duration);
    }

    // ===================================
    //   4. 开奖结果通知（路子图等页面用）
    // ===================================
    // options: { icon, name, period, dice, sum, size, oddEven }
    function resultNotif(options) {
        var opts = options || {};
        var icon = opts.icon || '🎲';
        var name = opts.name || '快三';
        var period = opts.period || '';
        var dice = opts.dice || [1, 1, 1];
        var sum = opts.sum || 3;
        var sizeText = opts.size === 'big' ? '大' : '小';
        var sizeClass = opts.size || 'small';
        var oeText = opts.oddEven === 'odd' ? '单' : '双';
        var oeClass = opts.oddEven || 'even';
        var duration = opts.duration || 4000;

        var el = document.createElement('div');
        el.className = 'smart-notif type-draw';
        el.innerHTML =
            '<div class="notif-glow"></div>' +
            '<div class="notif-header">' +
                '<div class="notif-type-badge">🎲 已开奖</div>' +
                '<span class="notif-time">刚刚</span>' +
            '</div>' +
            '<div class="notif-title-row">' +
                '<span class="notif-lottery-icon">' + icon + '</span>' +
                '<span class="notif-lottery-name">' + name + '</span>' +
                (period ? '<span class="notif-period">第' + period + '期</span>' : '') +
            '</div>' +
            '<div class="notif-dice-body">' +
                '<div class="notif-dice-row">' +
                    '<div class="notif-dice">' + dice[0] + '</div>' +
                    '<div class="notif-dice">' + dice[1] + '</div>' +
                    '<div class="notif-dice">' + dice[2] + '</div>' +
                    '<span class="notif-sum">= ' + sum + '</span>' +
                '</div>' +
                '<div class="notif-attrs">' +
                    '<span class="notif-attr a-' + sizeClass + '">' + sizeText + '</span>' +
                    '<span class="notif-attr a-' + oeClass + '">' + oeText + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="notif-progress"><div class="notif-progress-bar"></div></div>';

        showNotif(el, duration);
    }

    // ===================================
    //   公开 API
    // ===================================
    return {
        draw: drawNotif,
        dragon: dragonNotif,
        goodroad: goodroadNotif,
        result: resultNotif,
        dismiss: dismiss
    };

})();
