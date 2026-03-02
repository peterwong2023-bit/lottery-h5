// ===================================
// 帮助中心 - JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    updateStatusTime();
    setInterval(updateStatusTime, 60000);
});

// ==================== 状态栏时间 ====================
function updateStatusTime() {
    var now = new Date();
    var h = now.getHours().toString().padStart(2, '0');
    var m = now.getMinutes().toString().padStart(2, '0');
    var el = document.getElementById('statusTime');
    if (el) el.textContent = h + ':' + m;
}

// ==================== FAQ手风琴 ====================
function toggleFaq(questionEl) {
    var item = questionEl.closest('.faq-item');
    if (!item) return;

    var isOpen = item.classList.contains('open');

    // 关闭同分类下其他已展开的
    var category = item.closest('.faq-category');
    if (category) {
        var siblings = category.querySelectorAll('.faq-item.open');
        siblings.forEach(function(sib) {
            if (sib !== item) {
                sib.classList.remove('open');
            }
        });
    }

    // 切换当前项
    item.classList.toggle('open');

    // 滚动到可视区域
    if (!isOpen) {
        setTimeout(function() {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// ==================== 搜索过滤 ====================
var searchTimer = null;

function filterQuestions() {
    var input = document.getElementById('searchInput');
    var clearBtn = document.getElementById('searchClear');
    var keyword = input.value.trim().toLowerCase();

    // 显示/隐藏清除按钮
    if (clearBtn) {
        clearBtn.classList.toggle('show', keyword.length > 0);
    }

    // 防抖
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function() {
        doFilter(keyword);
    }, 200);
}

function doFilter(keyword) {
    var categories = document.querySelectorAll('.faq-category');
    var emptyEl = document.getElementById('helpEmpty');
    var quickEl = document.querySelector('.help-quick');
    var disclaimerEl = document.querySelector('.help-disclaimer');
    var contactEl = document.querySelector('.help-contact');
    var totalVisible = 0;

    if (!keyword) {
        // 清空搜索，显示全部
        categories.forEach(function(cat) {
            cat.classList.remove('hidden');
            var items = cat.querySelectorAll('.faq-item');
            items.forEach(function(item) {
                item.classList.remove('hidden', 'highlight', 'open');
            });
        });
        if (emptyEl) emptyEl.style.display = 'none';
        if (quickEl) quickEl.style.display = '';
        if (disclaimerEl) disclaimerEl.style.display = '';
        if (contactEl) contactEl.style.display = '';
        return;
    }

    // 隐藏快捷入口
    if (quickEl) quickEl.style.display = 'none';

    categories.forEach(function(cat) {
        var catVisible = 0;
        var items = cat.querySelectorAll('.faq-item');

        items.forEach(function(item) {
            var questionText = item.querySelector('.faq-question span').textContent.toLowerCase();
            var answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();
            var keywords = (item.dataset.keywords || '').toLowerCase();
            var allText = questionText + ' ' + answerText + ' ' + keywords;

            if (allText.indexOf(keyword) !== -1) {
                item.classList.remove('hidden');
                item.classList.add('highlight');
                catVisible++;
                totalVisible++;
            } else {
                item.classList.add('hidden');
                item.classList.remove('highlight', 'open');
            }
        });

        if (catVisible === 0) {
            cat.classList.add('hidden');
        } else {
            cat.classList.remove('hidden');
        }
    });

    // 显示/隐藏空状态
    if (emptyEl) {
        emptyEl.style.display = totalVisible === 0 ? '' : 'none';
    }
    if (disclaimerEl) {
        disclaimerEl.style.display = totalVisible === 0 ? 'none' : '';
    }
    if (contactEl) {
        contactEl.style.display = '';
    }
}

function clearSearch() {
    var input = document.getElementById('searchInput');
    if (input) {
        input.value = '';
        input.focus();
    }
    filterQuestions();
}

// ==================== 快捷跳转 ====================
function scrollToCategory(catId) {
    var el = document.getElementById('cat-' + catId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 闪烁高亮效果
        var header = el.querySelector('.faq-cat-header');
        if (header) {
            header.style.transition = 'background 0.3s';
            header.style.background = 'rgba(59, 130, 246, 0.08)';
            header.style.borderRadius = '10px';
            setTimeout(function() {
                header.style.background = '';
            }, 1500);
        }
    }
}

// ==================== 联系客服 ====================
function goContact() {
    // 跳转到我的页面并触发联络我们
    location.href = 'me.html';
    // 存一个标记，进入me页面后自动打开联络弹窗
    try {
        sessionStorage.setItem('open_contact', '1');
    } catch (e) {}
}

// ==================== Toast ====================
function showToast(msg) {
    var toast = document.getElementById('helpToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2000);
}
