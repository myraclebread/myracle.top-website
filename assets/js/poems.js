//A variable to store the full content of the current poem, for the skip function.
let currentPoemContent = '';
let typingInterval = null; // Store the interval ID for the typing effect

//This function now fetches a single random poem from the PoetryDB API.
async function loadRandomPoem() {
    const titleEl = document.getElementById('poemTitle');
    const contentEl = document.getElementById('poemContent');
    const refreshButton = document.getElementById('refreshPoemBtn');
    const skipButton = document.getElementById('skipTypingBtn');

    refreshButton.disabled = true;
    skipButton.disabled = false;

    // Clear any existing typing effect
    if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
    }

    // Show a loading message while fetching
    titleEl.textContent = "Finding a poem...";
    contentEl.textContent = "";

    try {
        // Call the free PoetryDB API for a random poem
        const response = await fetch('https://poetrydb.org/random');
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const poem = data[0]; // The API returns an array with one poem

        if (poem) {
            // Format the title and author
            titleEl.textContent = `${poem.title} by ${poem.author}`;
            
            // The API gives lines as an array, so we join them with newlines
            currentPoemContent = poem.lines.join('\n');

            // Start the typewriter effect
            contentEl.classList.add('typing');
            typeWriterEffect(currentPoemContent, contentEl, () => {
                refreshButton.disabled = false; // Re-enable button when typing is done
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

// This function works perfectly as is.
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

//This function now uses the 'currentPoemContent' variable instead of searching an array.
function skipTypewriter() {
    if (!currentPoemContent) return;
    
    if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
    }
    
    const poemContent = document.getElementById('poemContent');
    poemContent.classList.remove('typing');
    poemContent.textContent = currentPoemContent; // Display the full poem instantly
    
    document.getElementById('refreshPoemBtn').disabled = false;
}

//The event listeners are still valid.
document.addEventListener("DOMContentLoaded", () => {
    // Load the first poem when the page is ready
    loadRandomPoem();

    const refreshBtn = document.getElementById('refreshPoemBtn');
    const skipBtn = document.getElementById('skipTypingBtn');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadRandomPoem);
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', skipTypewriter);
    }

    // Automatically fetch a new poem when the 'poems' section is opened
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