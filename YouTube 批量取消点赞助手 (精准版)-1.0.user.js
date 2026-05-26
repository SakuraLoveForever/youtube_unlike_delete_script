// ==UserScript==
// @name         YouTube 批量取消点赞助手 (精准版)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在点赞视频列表页添加速度可选的清理面板，解决菜单位移问题
// @author       He Chujie
// @match        *://www.youtube.com/playlist?list=LL*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // 核心逻辑（来自你的原始文件 ）
    function runTask(speedDelay, menuWait) {
        function getMenus() {
            return Array.from(document.querySelectorAll('ytd-playlist-video-renderer yt-icon-button'));
        }

        let menus = getMenus();
        if (menus.length === 0) {
            window.scrollBy(0, 1000);
            setTimeout(() => runTask(speedDelay, menuWait), 2000);
            return;
        }

        let i = 0;
        function next() {
            if (i >= menus.length) {
                window.scrollBy(0, 1000);
                setTimeout(() => runTask(speedDelay, menuWait), 2000);
                return;
            }

            // 关键：点击前先点一下 body，清理可能飘移到左上角的菜单
            document.body.click();
            menus[i].click();

            setTimeout(() => {
                let items = Array.from(document.querySelectorAll('ytd-menu-service-item-renderer'));
                let removeBtn = items.find(el =>
                    el.innerText.includes("移除") || el.innerText.includes("Remove") || el.innerText.includes("削除")
                );

                if (removeBtn) {
                    removeBtn.click();
                    console.log(`已处理第 ${i + 1} 个`);
                }
                i++;
                setTimeout(next, speedDelay);
            }, menuWait);
        }
        next();
    }

    // 强制 UI 注入（不使用 innerHTML 绕过安全检查 ）
    function createUI() {
        if (document.getElementById('my-fixed-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'my-fixed-panel';
        panel.style.cssText = "position:fixed;top:100px;left:20px;z-index:999999;background:#000;border:2px solid #fff;padding:10px;display:flex;flex-direction:column;gap:10px;border-radius:8px;";

        const title = document.createElement('div');
        title.textContent = "清理控制台";
        title.style.color = "#fff";
        title.style.fontSize = "14px";
        panel.appendChild(title);

        const btnSlow = document.createElement('button');
        btnSlow.textContent = "🐢 慢速模式 (稳)";
        btnSlow.onclick = () => runTask(3000, 1200);
        panel.appendChild(btnSlow);

        const btnFast = document.createElement('button');
        btnFast.textContent = "⚡ 快速模式";
        btnFast.onclick = () => runTask(1500, 700);
        panel.appendChild(btnFast);

        (document.body || document.documentElement).appendChild(panel);
    }

    // 每秒强制检查一次，保证面板不消失 [cite: 3]
    setInterval(createUI, 1000);
})();