// inject.js
// 이 안에는 어제 쓰셨던 탬퍼몽키 코드가 그대로 들어갑니다!

(function() {
    'use strict';

    if (!document.getElementById('tm-running-check')) {
        const checkMsg = document.createElement('div');
        checkMsg.id = 'tm-running-check';
        checkMsg.textContent = '🟢 SOOP 확장앱(V2.0) 정상 작동중!';
        checkMsg.style.cssText = 'position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: #00ff00; padding: 10px 15px; border-radius: 8px; font-size: 14px; font-weight: bold; z-index: 999999; pointer-events: none;';
        document.body.appendChild(checkMsg);
        setTimeout(() => {
            checkMsg.style.transition = 'opacity 1s';
            checkMsg.style.opacity = '0';
            setTimeout(() => checkMsg.remove(), 1000);
        }, 4000);
    }

    function getCommentIdFromEngine(element) {
        let current = element;
        while (current && current !== document.body) {
            const reactKey = Object.keys(current).find(k => k.startsWith('__reactFiber$'));
            if (reactKey) {
                let fiber = current[reactKey];
                for (let i = 0; i < 20; i++) {
                    if (!fiber) break;
                    if (fiber.memoizedProps) {
                        const p = fiber.memoizedProps;
                        if (p.commentNo) return p.commentNo;
                        if (p.commentId) return p.commentId;
                        if (p.comment && p.comment.comment_no) return p.comment.comment_no;
                        if (p.comment && p.comment.id) return p.comment.id;
                        if (p.data && p.data.comment_no) return p.data.comment_no;
                        if (p.item && p.item.comment_no) return p.item.comment_no;
                    }
                    fiber = fiber.return;
                }
            }
            current = current.parentElement;
        }
        return null;
    }

    function highlightCommentFromHash() {
        const hash = window.location.hash;
        if (!hash || !hash.includes('comment_noti')) return;

        const targetId = hash.replace('#comment_noti', '');

        const findInterval = setInterval(() => {
            const dotButtons = document.querySelectorAll('[class*="dotButton" i], [class*="DotButton" i]');

            for (let dotBtn of dotButtons) {
                const commentItem = dotBtn.closest('li') || dotBtn.parentElement.parentElement;
                const hiddenId = String(getCommentIdFromEngine(commentItem));

                if (hiddenId === targetId) {
                    clearInterval(findInterval);

                    const wrapper = dotBtn.parentElement;
                    const commentBox = dotBtn.closest('div[class*="CommentItem_commentContentWrapper__"]') || commentItem;

                    const headerText = wrapper.innerText || commentItem.innerText || "";
                    if (!headerText.includes('하이라이트 댓글') && !wrapper.querySelector('.custom-highlight-badge')) {
                        const badge = document.createElement('span');
                        badge.className = 'custom-highlight-badge';
                        badge.textContent = '하이라이트 댓글';
                        badge.style.cssText = `
                            display: inline-block;
                            color: #1a73e8;
                            border: 1px solid #1a73e8;
                            border-radius: 4px;
                            padding: 2px 6px;
                            font-size: 11px;
                            font-weight: bold;
                            margin-bottom: 5px;
                            background-color: #ffffff;
                        `;
                        wrapper.insertBefore(badge, wrapper.firstChild);
                    }

                    commentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const originalBg = commentBox.style.backgroundColor;

                    commentBox.style.backgroundColor = '#fff9c4';

                    commentBox.style.transition = 'background-color 0.5s ease';
                    setTimeout(() => { commentBox.style.backgroundColor = originalBg; }, 2000);

                    return;
                }
            }
        }, 500);

        setTimeout(() => clearInterval(findInterval), 10000);
    }

    highlightCommentFromHash();
    window.addEventListener('hashchange', highlightCommentFromHash);

    setInterval(() => {
        const dotButtons = document.querySelectorAll('[class*="dotButton" i], [class*="DotButton" i]');

        dotButtons.forEach(dotBtn => {
            const wrapper = dotBtn.parentElement;
            if (!wrapper || wrapper.querySelector('.custom-copy-btn')) return;

            const copyBtn = document.createElement('button');
            copyBtn.className = 'custom-copy-btn';
            copyBtn.innerHTML = '🔗';
            copyBtn.title = '이 댓글 하이라이트 링크 복사';

            copyBtn.style.cssText = `
                background: transparent !important;
                border: none !important;
                cursor: pointer !important;
                font-size: 18px !important;
                opacity: 0.6 !important;
                margin-right: 8px !important;
                padding: 0 !important;
                display: inline-block !important;
                line-height: 1 !important;
                z-index: 999 !important;
            `;

            copyBtn.onmouseover = () => copyBtn.style.opacity = '1';
            copyBtn.onmouseout = () => copyBtn.style.opacity = '0.6';

            copyBtn.onclick = (e) => {
                e.preventDefault();

                const commentItem = copyBtn.closest('li') || wrapper;
                const hiddenId = getCommentIdFromEngine(commentItem);

                if (hiddenId) {
                    const baseUrl = window.location.href.split('#')[0];
                    const highlightUrl = baseUrl + '#comment_noti' + hiddenId;

                    navigator.clipboard.writeText(highlightUrl).then(() => {
                        copyBtn.innerHTML = '✅';
                        setTimeout(() => copyBtn.innerHTML = '🔗', 1500);
                    });
                } else {
                    alert("이런! 엔진을 뒤졌는데도 번호가 안 나옵니다 ㅠㅠ");
                }
            };

            wrapper.insertBefore(copyBtn, dotBtn);
        });
    }, 1000);

})();