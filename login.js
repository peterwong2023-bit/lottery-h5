/**
 * 登录页面交互 - 仅短信验证码登录
 * 新用户自动注册
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initStatusBar();
        initSendSms();
        initLoginForm();
    });

    // 状态栏时间
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

    // 发送验证码
    function initSendSms() {
        const btn = document.getElementById('sendSms');
        if (!btn) return;

        btn.addEventListener('click', function() {
            if (this.classList.contains('disabled')) return;

            const phone = document.getElementById('phone').value.trim();
            if (!phone) {
                showToast('请输入手机号');
                shakeInput(document.getElementById('phone'));
                return;
            }
            if (!/^1\d{10}$/.test(phone)) {
                showToast('手机号格式不正确');
                shakeInput(document.getElementById('phone'));
                return;
            }

            // 开始倒计时
            this.classList.add('disabled');
            let seconds = 60;
            this.textContent = `${seconds}s`;

            const timer = setInterval(() => {
                seconds--;
                this.textContent = `${seconds}s`;
                if (seconds <= 0) {
                    clearInterval(timer);
                    this.textContent = '获取验证码';
                    this.classList.remove('disabled');
                }
            }, 1000);

            showToast('验证码已发送');
        });
    }

    // 登录表单
    function initLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const phone = document.getElementById('phone').value.trim();
            const code = document.getElementById('smsCode').value.trim();
            const agreed = document.getElementById('agreeTerms')?.checked;

            if (!agreed) {
                showToast('请先同意用户协议');
                return;
            }
            if (!phone) {
                showToast('请输入手机号');
                shakeInput(document.getElementById('phone'));
                return;
            }
            if (!/^1\d{10}$/.test(phone)) {
                showToast('手机号格式不正确');
                shakeInput(document.getElementById('phone'));
                return;
            }
            if (!code || code.length < 4) {
                showToast('请输入正确的验证码');
                shakeInput(document.getElementById('smsCode'));
                return;
            }

            // 模拟登录
            const btn = document.getElementById('loginBtn');
            const text = btn.querySelector('.btn-text');
            const loader = btn.querySelector('.btn-loading');

            text.style.display = 'none';
            loader.style.display = 'flex';
            btn.disabled = true;

            setTimeout(() => {
                text.style.display = '';
                loader.style.display = 'none';
                btn.disabled = false;

                showToast('✅ 登录成功');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            }, 1500);
        });
    }

    // 输入框抖动
    function shakeInput(input) {
        const wrapper = input.closest('.input-wrapper');
        if (!wrapper) return;

        if (!document.getElementById('shakeStyle')) {
            const style = document.createElement('style');
            style.id = 'shakeStyle';
            style.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }`;
            document.head.appendChild(style);
        }

        wrapper.style.animation = 'shake 0.4s ease';
        wrapper.addEventListener('animationend', () => {
            wrapper.style.animation = '';
        }, { once: true });
        input.focus();
    }

    // Toast
    function showToast(message) {
        const existing = document.querySelector('.auth-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'auth-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

})();
