/* ===================================
   开奖日历页面 - 仅低频彩
   只展示每日/每周开奖的彩种，高频彩不在日历范围
   =================================== */

// 低频彩数据 - 包含开奖日和开奖时间
const LOTTERY_DATA = [
    // 福利彩票
    { id: 'ssq',   name: '双色球',     emoji: '🔴', type: 'fc',  drawTime: '21:15', closeTime: '20:00', days: [0, 2, 4],     desc: '福彩 · 6+1' },
    { id: 'fc3d',  name: '福彩3D',     emoji: '🎰', type: 'fc',  drawTime: '21:15', closeTime: '20:00', days: [0,1,2,3,4,5,6], desc: '福彩 · 直选/组选' },
    { id: 'qlc',   name: '七乐彩',     emoji: '🎯', type: 'fc',  drawTime: '21:25', closeTime: '20:00', days: [1, 3, 5],     desc: '福彩 · 7选' },
    { id: 'kl8',   name: '快乐8',      emoji: '😄', type: 'fc',  drawTime: '21:30', closeTime: '20:00', days: [0,1,2,3,4,5,6], desc: '福彩 · 80选20' },

    // 体育彩票
    { id: 'dlt',   name: '大乐透',     emoji: '🏆', type: 'tc',  drawTime: '20:30', closeTime: '20:00', days: [1, 3, 6],     desc: '体彩 · 5+2' },
    { id: 'pl3',   name: '排列3',      emoji: '🔢', type: 'tc',  drawTime: '20:30', closeTime: '20:00', days: [0,1,2,3,4,5,6], desc: '体彩 · 3位数' },
    { id: 'pl5',   name: '排列5',      emoji: '🔢', type: 'tc',  drawTime: '20:30', closeTime: '20:00', days: [0,1,2,3,4,5,6], desc: '体彩 · 5位数' },
    { id: 'qxc',   name: '七星彩',     emoji: '⭐', type: 'tc',  drawTime: '20:30', closeTime: '20:00', days: [2, 5],         desc: '体彩 · 7位数' },

    // 特色彩票
    { id: 'hklhc', name: '香港六合彩', emoji: '🎱', type: 'lhc', drawTime: '21:30', closeTime: '21:15', days: [2, 4, 6],     desc: '特码49选' },
    { id: 'twbg',  name: '台湾宾果',   emoji: '🎪', type: 'tw',  drawTime: '21:00', closeTime: '20:30', days: [0,1,2,3,4,5,6], desc: '台彩 · 20选' },
];

// 提醒系统 - 与 reminder.js 共用 localStorage
const REMINDER_STORAGE_KEY = 'h5_smart_reminders';

// 星期名称映射
const WEEK_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const WEEK_FULL = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// 状态
let currentYear = 2026;
let currentMonth = 2; // 1-based
let selectedDate = new Date();

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
    selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    updateStatusTime();
    setInterval(updateStatusTime, 60000);
    
    renderCalendar();
    renderDayDetail();
});

// 更新状态栏时间
function updateStatusTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const el = document.getElementById('statusTime');
    if (el) el.textContent = h + ':' + m;
}

// 获取某天的开奖彩种
function getDrawsForDay(dayOfWeek) {
    return LOTTERY_DATA.filter(function(lottery) {
        return lottery.days.includes(dayOfWeek);
    });
}

// 获取某天的开奖数量
function getDrawCountForDay(dayOfWeek) {
    return getDrawsForDay(dayOfWeek).length;
}

// 生成模拟期号
function generatePeriodNum(lottery, date) {
    const year = date.getFullYear();
    // 计算当年第几天
    const start = new Date(year, 0, 1);
    const diff = Math.floor((date - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (lottery.days.length === 7) {
        // 每日开奖
        return year + '' + String(diff).padStart(3, '0');
    } else {
        // 每周N期，需要计算实际期数
        let count = 0;
        for (let d = 0; d < diff; d++) {
            const checkDate = new Date(year, 0, 1 + d);
            if (lottery.days.includes(checkDate.getDay())) {
                count++;
            }
        }
        return year + '' + String(count).padStart(3, '0');
    }
}

// 判断某日期是否已过
function isDatePassed(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(date);
    check.setHours(0, 0, 0, 0);
    return check < today;
}

// 判断是否是今天
function isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
}

// ===================================
//   渲染日历
// ===================================
function renderCalendar() {
    document.getElementById('monthTitle').textContent = currentYear + '年' + currentMonth + '月';
    
    const grid = document.getElementById('datesGrid');
    grid.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const selStr = selectedDate.getFullYear() + '-' + (selectedDate.getMonth() + 1) + '-' + selectedDate.getDate();
    
    // 上月填充
    const prevMonthLast = new Date(currentYear, currentMonth - 1, 0);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        var day = prevMonthLast.getDate() - i;
        grid.appendChild(createDateCell(day, true, false, false, false, 0, null));
    }
    
    // 本月日期
    for (let d = 1; d <= totalDays; d++) {
        var dateObj = new Date(currentYear, currentMonth - 1, d);
        var dateStr = currentYear + '-' + currentMonth + '-' + d;
        var isTodayFlag = dateStr === todayStr;
        var isSelectedFlag = dateStr === selStr;
        var isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        var drawCount = getDrawCountForDay(dateObj.getDay());
        
        grid.appendChild(createDateCell(d, false, isTodayFlag, isSelectedFlag, isWeekend, drawCount, dateObj));
    }
    
    // 下月填充
    var totalCells = grid.children.length;
    var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remaining; d++) {
        grid.appendChild(createDateCell(d, true, false, false, false, 0, null));
    }
}

// 创建日期单元格
function createDateCell(day, isOtherMonth, isTodayFlag, isSelectedFlag, isWeekend, drawCount, dateObj) {
    var cell = document.createElement('div');
    cell.className = 'date-cell';
    
    if (isOtherMonth) cell.classList.add('other-month');
    if (isTodayFlag) cell.classList.add('today');
    if (isSelectedFlag) cell.classList.add('selected');
    if (isWeekend) cell.classList.add('weekend');
    
    var numDiv = document.createElement('div');
    numDiv.className = 'date-num';
    numDiv.textContent = day;
    cell.appendChild(numDiv);
    
    // 开奖数量指示
    if (!isOtherMonth && drawCount > 0) {
        var indicator = document.createElement('div');
        indicator.className = 'date-indicator';
        
        if (drawCount >= 6) {
            indicator.classList.add('many');
            indicator.textContent = drawCount;
        } else if (drawCount >= 3) {
            indicator.classList.add('some');
            indicator.textContent = drawCount;
        } else {
            indicator.classList.add('few');
            indicator.textContent = drawCount;
        }
        
        cell.appendChild(indicator);
    }
    
    if (!isOtherMonth && dateObj) {
        cell.onclick = function() {
            selectedDate = dateObj;
            renderCalendar();
            renderDayDetail();
        };
    }
    
    return cell;
}

// ===================================
//   渲染选中日期详情
// ===================================
function renderDayDetail() {
    var dayOfWeek = selectedDate.getDay();
    var draws = getDrawsForDay(dayOfWeek);
    var passed = isDatePassed(selectedDate);
    var todayFlag = isToday(selectedDate);
    
    // 更新标题
    var dateLabel = (selectedDate.getMonth() + 1) + '月' + selectedDate.getDate() + '日 ' + WEEK_FULL[dayOfWeek];
    document.getElementById('detailDate').textContent = dateLabel;
    document.getElementById('detailCount').textContent = '共 ' + draws.length + ' 场开奖';
    
    var timeline = document.getElementById('drawTimeline');
    
    if (draws.length === 0) {
        timeline.innerHTML = '<div class="draw-empty"><div class="draw-empty-icon">📅</div><div class="draw-empty-text">当日无开奖安排</div></div>';
        return;
    }
    
    // 按开奖时间排序
    draws.sort(function(a, b) {
        return a.drawTime.localeCompare(b.drawTime);
    });
    
    // 按类型分组
    var groups = {};
    var groupOrder = [];
    var typeNames = {
        fc: '🏛️ 福利彩票',
        tc: '⚽ 体育彩票',
        lhc: '🎱 特色彩票',
        tw: '🎪 海外彩票'
    };
    
    draws.forEach(function(lottery) {
        var groupName = typeNames[lottery.type] || '其他';
        if (!groups[groupName]) {
            groups[groupName] = [];
            groupOrder.push(groupName);
        }
        groups[groupName].push(lottery);
    });
    
    var html = '';
    
    groupOrder.forEach(function(groupName) {
        var items = groups[groupName];
        
        html += '<div class="timeline-group">';
        html += '<div class="timeline-time">' + groupName + '</div>';
        html += '<div class="timeline-items">';
        
        items.forEach(function(lottery) {
            var periodNum = generatePeriodNum(lottery, selectedDate);
            
            // 根据日期状态显示不同信息
            var statusHtml = '';
            if (passed) {
                // 已过的日期 - 显示"已开奖"
                statusHtml = '<span class="draw-status done">已开奖</span>';
            } else if (todayFlag) {
                // 今天 - 判断当前时间与开奖时间
                var now = new Date();
                var drawParts = lottery.drawTime.split(':');
                var drawDate = new Date();
                drawDate.setHours(parseInt(drawParts[0]), parseInt(drawParts[1]), 0);
                
                if (now >= drawDate) {
                    statusHtml = '<span class="draw-status done">已开奖</span>';
                } else {
                    var diffMs = drawDate - now;
                    var diffH = Math.floor(diffMs / 3600000);
                    var diffM = Math.floor((diffMs % 3600000) / 60000);
                    var countdown = diffH > 0 ? (diffH + '小时' + diffM + '分') : (diffM + '分钟');
                    statusHtml = '<span class="draw-status upcoming">距开奖 ' + countdown + '</span>';
                }
            } else {
                // 未来日期
                statusHtml = '<span class="draw-status future">未开奖</span>';
            }
            
            // 开奖日说明
            var dayLabels = lottery.days.map(function(d) { return WEEK_NAMES[d]; });
            var daysText = lottery.days.length === 7 ? '每日开奖' : dayLabels.join(' ');
            
            var reminded = isInReminder(lottery.id);
            var bellClass = reminded ? 'remind-btn active' : 'remind-btn';
            var bellSvg = reminded 
                ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';

            html += '<div class="draw-card">';
            html += '  <div class="draw-left">';
            html += '    <div class="draw-emoji ' + lottery.type + '">' + lottery.emoji + '</div>';
            html += '    <div class="draw-info">';
            html += '      <div class="draw-name">' + lottery.name + '</div>';
            html += '      <div class="draw-desc">' + lottery.desc + '</div>';
            html += '    </div>';
            html += '  </div>';
            html += '  <div class="draw-right">';
            html += '    <div class="draw-detail-right">';
            html += '      <div class="draw-time-info">';
            html += '        <span class="draw-time-label">开奖</span>';
            html += '        <span class="draw-time-value">' + lottery.drawTime + '</span>';
            html += '      </div>';
            html += '      <div class="draw-period-info">第 ' + periodNum + ' 期</div>';
            html += '      ' + statusHtml;
            html += '    </div>';
            html += '    <button class="' + bellClass + '" onclick="event.stopPropagation();toggleReminder(\'' + lottery.id + '\')" title="' + (reminded ? '取消提醒' : '添加提醒') + '">';
            html += '      ' + bellSvg;
            html += '    </button>';
            html += '  </div>';
            html += '</div>';
        });
        
        html += '</div></div>';
    });
    
    timeline.innerHTML = html;
}

// ===================================
//   提醒功能
// ===================================
function getReminders() {
    try {
        var saved = localStorage.getItem(REMINDER_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
}

function isInReminder(lotteryId) {
    var data = getReminders();
    if (!data || !data.draw || !data.draw.items) return false;
    return data.draw.items.some(function(r) { return r.id === lotteryId; });
}

function toggleReminder(lotteryId) {
    var data = getReminders();
    
    // 初始化默认结构
    if (!data) {
        data = {
            activeTab: 'draw',
            draw: { enabled: true, remindMinutes: 5, methods: ['push', 'sound'], items: [] },
            dragon: { enabled: true, threshold: 4, monitorTypes: ['bigsmall', 'oddeven'], items: [] },
            goodroad: { enabled: true, patterns: ['dragon', 'max3', 'longchain'], items: [] }
        };
    }
    if (!data.draw) {
        data.draw = { enabled: true, remindMinutes: 5, methods: ['push', 'sound'], items: [] };
    }
    if (!data.draw.items) data.draw.items = [];

    var idx = -1;
    for (var i = 0; i < data.draw.items.length; i++) {
        if (data.draw.items[i].id === lotteryId) { idx = i; break; }
    }

    if (idx >= 0) {
        // 已存在 → 删除
        data.draw.items.splice(idx, 1);
        try { localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
        showToast('已取消提醒');
    } else {
        // 不存在 → 添加
        data.draw.items.push({ id: lotteryId, enabled: true });
        try { localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
        showToast('已添加到开奖提醒');
    }

    // 刷新卡片状态
    renderDayDetail();
}

function showToast(message) {
    var existing = document.querySelector('.cal-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'cal-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(function() { toast.remove(); }, 300);
    }, 2000);
}

// 全局函数
function prevMonth() {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    renderCalendar();
}

function goToday() {
    var now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
    selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    renderCalendar();
    renderDayDetail();
}
