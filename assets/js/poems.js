let isTyping = false;

async function loadRandomPoem() {
  const button = document.getElementById('refreshPoemBtn');
  if (isTyping) return; // Prevent glitch from fast clicking

  button.disabled = true;
  isTyping = true;

  try {
    const res = await fetch(`poems/poems.json?v=${Date.now()}`);
    const poems = await res.json();
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];

    const titleEl = document.getElementById('poemTitle');
    const contentEl = document.getElementById('poemContent');

    titleEl.textContent = '';
    contentEl.textContent = '';

    titleEl.textContent = randomPoem.title;
    typeWriterEffect(randomPoem.content, contentEl, () => {
      button.disabled = false;
      isTyping = false;
    });

  } catch (error) {
    console.error('Error loading poem:', error);
    document.getElementById('poemTitle').textContent = "Error";
    document.getElementById('poemContent').textContent = "Could not load poem.";
    button.disabled = false;
    isTyping = false;
  }
}

function typeWriterEffect(text, element, callback, speed = 30) {
  element.textContent = "";
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      if (typeof callback === 'function') callback();
    }
  }
  type();
}

document.addEventListener("DOMContentLoaded", () => {
  loadRandomPoem();

  const refreshBtn = document.getElementById('refreshPoemBtn');
  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    loadRandomPoem();
  });
});
