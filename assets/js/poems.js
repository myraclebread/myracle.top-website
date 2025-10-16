// assets/js/poems.js

let currentPoemContent = '';
let typingInterval = null;

async function loadRandomPoem() {
    const titleEl = document.getElementById('poemTitle');
    const contentEl = document.getElementById('poemContent');
    const refreshButton = document.getElementById('refreshPoemBtn');
    const skipButton = document.getElementById('skipTypingBtn');

    refreshButton.disabled = true;
    skipButton.disabled = false;

    if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
    }

    titleEl.textContent = "Finding a poem...";
    contentEl.textContent = "";

    try {
        const response = await fetch('https://poetrydb.org/random', { mode: 'cors' });
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const poem = data[0];

        if (poem) {
            titleEl.textContent = `${poem.title} by ${poem.author}`;
            currentPoemContent = poem.lines.join('\n');
            contentEl.classList.add('typing');
            typeWriterEffect(currentPoemContent, contentEl, () => {
                refreshButton.disabled = false;
                contentEl.classList.remove('typing');
            });
        } else {
            throw new Error('No poem found in API response');
        }

    } catch (error) {
        console.error('Error loading poem:', error);
        titleEl.textContent = "Error";
        contentEl.textContent = "Could not load a poem from the internet. Please try again.";
        refreshButton.disabled = false; 
    }
}

function typeWriterEffect(text, element, callback, speed = 30) {
    element.textContent = "";
    let i = 0;

    if (typingInterval) {
        clearInterval(typingInterval);
    }

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
            if (typeof callback === 'function') callback();
        }
    }

    typingInterval = setInterval(type, speed);
}

function skipTypewriter() {
    if (!currentPoemContent) return;
    
    if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
    }
    
    const poemContent = document.getElementById('poemContent');
    poemContent.classList.remove('typing');
    poemContent.textContent = currentPoemContent;
    
    document.getElementById('refreshPoemBtn').disabled = false;
}

document.addEventListener("DOMContentLoaded", () => {
    loadRandomPoem();

    const refreshBtn = document.getElementById('refreshPoemBtn');
    const skipBtn = document.getElementById('skipTypingBtn');

    if (refreshBtn) {
        // UPDATED: Removed the line that was disabling the button too early
        refreshBtn.addEventListener('click', loadRandomPoem);
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', skipTypewriter);
    }

    const poemsArticle = document.getElementById('poems');
    if (poemsArticle) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && poemsArticle.classList.contains('active')) {
                    loadRandomPoem();
                }
            });
        });
        observer.observe(poemsArticle, { attributes: true });
    }
});