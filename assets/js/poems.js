let currentTyping = null;
let skipTyping = false;

async function loadRandomPoem() {
  try {
    const res = await fetch('poems/poems.json');
    const poems = await res.json();
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];

    document.getElementById('poemTitle').textContent = randomPoem.title;

    // Stop ongoing typing
    if (currentTyping) {
      clearTimeout(currentTyping);
      currentTyping = null;
    }

    skipTyping = false;
    typeWriterEffect(randomPoem.content, document.getElementById('poemContent'));

  } catch (error) {
    console.error('Error loading poem:', error);
    document.getElementById('poemTitle').textContent = "Error";
    document.getElementById('poemContent').textContent = "Could not load poem.";
  }
}

function typeWriterEffect(text, element, speed = 30) {
  element.textContent = "";
  let i = 0;

  function type() {
    if (skipTyping) {
      element.textContent = text;
      currentTyping = null;
      return;
    }

    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      currentTyping = setTimeout(type, speed);
    } else {
      currentTyping = null;
    }
  }

  type();
}

document.addEventListener("DOMContentLoaded", () => {
  loadRandomPoem();

  const refreshBtn = document.getElementById('refreshPoemBtn');
  refreshBtn.addEventListener('click', () => {
    if (currentTyping) {
      clearTimeout(currentTyping);
      currentTyping = null;
    }
    loadRandomPoem();
  });

  const skipBtn = document.getElementById('skipTypingBtn');
  skipBtn.addEventListener('click', () => {
    skipTyping = true;
  });
});
