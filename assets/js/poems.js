async function loadRandomPoem() {
    try {
      const res = await fetch('poems/poems.json');
      const poems = await res.json();
      const randomPoem = poems[Math.floor(Math.random() * poems.length)];
  
      document.getElementById('poemTitle').textContent = randomPoem.title;
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
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }
  
  document.addEventListener("DOMContentLoaded", loadRandomPoem);

let currentTypewriterTimeouts = [];

function clearTypewriter() {
  // Cancel all running timeouts
  currentTypewriterTimeouts.forEach(timeout => clearTimeout(timeout));
  currentTypewriterTimeouts = [];
}

function typeWriterEffect(text, element, speed = 30) {
  clearTypewriter(); // Stop previous typewriter

  element.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      const timeout = setTimeout(type, speed);
      currentTypewriterTimeouts.push(timeout);
      i++;
    }
  }

  type();
}
