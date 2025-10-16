// --- Konami Code Easter Egg ---
const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let input = [];

const spamtonAudio = new Audio('https://www.myinstants.com/media/sounds/spamton-theme.mp3');
spamtonAudio.loop = true;

function activateBigShot() {
    if (document.body.classList.contains('big-shot')) return;

    document.body.classList.add('big-shot');
    spamtonAudio.play();

    const refreshBtn = document.getElementById('refreshPoemBtn');
    const skipBtn = document.getElementById('skipTypingBtn');
    if (refreshBtn) refreshBtn.disabled = true;
    if (skipBtn) skipBtn.disabled = true;

    const textElements = document.querySelectorAll('#main article p, #main article h1, #main article h2, #main article h3, #main article a, #main article strong, #main article pre');
    textElements.forEach(el => {
        if (!el.classList.contains('tenna-link') && !el.closest('.copyright')) {
            el.textContent = '[HYPERLINK BLOCKED]';
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