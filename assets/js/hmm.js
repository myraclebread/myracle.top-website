(function() {
    "use strict";

    const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let input = [];

    const spamtonAudio = new Audio('https://www.myinstants.com/media/sounds/spamton-theme.mp3');
    spamtonAudio.loop = true;

    // We create this to inject our new CSS rules
    const styleTag = document.createElement('style');
    document.head.appendChild(styleTag);

    function activateBigShot() {
        if (document.body.classList.contains('big-shot')) return;

        document.body.classList.add('big-shot');
        spamtonAudio.play();

        // === NEW CSS FIX ===
        // This injects new styles to fix the overlapping icons
        styleTag.innerHTML = `
            .big-shot .icons a {
                /* Remove the tiny circle styling */
                width: auto !important;
                height: auto !important;
                line-height: inherit !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                
                /* Make it look like the other blocked text */
                color: #ff69b4 !important; /* Spamton pink */
                font-family: 'VT323', monospace;
                font-size: 1.1rem;
                letter-spacing: 1px;
            }
            /* Clean up the list spacing */
            .big-shot .icons li {
                padding: 0 0.5em 0 0 !important;
            }
        `;
        // === END OF NEW CSS FIX ===

        const refreshBtn = document.getElementById('refreshPoemBtn');
        const skipBtn = document.getElementById('skipTypingBtn');
        if (refreshBtn) refreshBtn.disabled = true;
        if (skipBtn) skipBtn.disabled = true;

        const textElements = document.querySelectorAll('#main article p, #main article h1, #main article h2, #main article h3, #main article strong, #main article pre');
        textElements.forEach(el => {
            if (!el.closest('.copyright')) {
                el.textContent = '[HYPERLINK BLOCKED]';
            }
        });

        const allLinksInArticles = document.querySelectorAll('#main article a');
        allLinksInArticles.forEach(el => {
            const href = el.getAttribute('href');

            if (href && href.startsWith('#')) {
                // This is an internal link, leave it alone!
            } else {
                // This is an EXTERNAL link
                el.href = 'javascript:void(0)';
                el.style.pointerEvents = 'none';
                el.style.cursor = 'not-allowed';
                el.style.borderBottom = 'none';

                // This removes the icon and replaces it with text
                el.innerHTML = '[HYPERLINK BLOCKED]';
            }
        });

        const articleImages = document.querySelectorAll('#main article .image.main img');
        const spamtonShopGif = 'https://static.wikia.nocookie.net/deltarune/images/c/c3/KeyGen_item.gif';
        
        articleImages.forEach(img => {
            img.src = spamtonShopGif;
            img.classList.add('spamton-image');
        });
    }

    document.addEventListener('keydown', (e) => {
        input.push(e.key);
        input.splice(-secretCode.length - 1, input.length - secretCode.length);
        if (input.join('') === secretCode.join('')) {
            activateBigShot();
        }
    });

})();