async function loadRandomPoem() {
  const button = document.getElementById('refreshPoemBtn');
  button.disabled = true;

  try {
    const res = await fetch('poems/poems.json');
    const poems = await res.json();
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];

    document.getElementById('poemTitle').textContent = randomPoem.title;
    typeWriterEffect(randomPoem.content, document.getElementById('poemContent'), () => {
      button.disabled = false; // Enable only after typing finishes
    });

  } catch (error) {
    console.error('Error loading poem:', error);
    document.getElementById('poemTitle').textContent = "Error";
    document.getElementById('poemContent').textContent = "Could not load poem.";
    button.disabled = false;
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
