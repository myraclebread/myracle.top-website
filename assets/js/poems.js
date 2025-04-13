let currentTypewriterTimeouts = [];
const refreshButton = document.getElementById("refreshPoemBtn");

// Clear typewriter effect in case it's interrupted
function clearTypewriter() {
  currentTypewriterTimeouts.forEach(timeout => clearTimeout(timeout));
  currentTypewriterTimeouts = [];
}

// Typewriter effect with "onDone" callback
function typeWriterEffect(text, element, speed = 30, onDone = () => {}) {
  clearTypewriter();
  element.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      const timeout = setTimeout(type, speed);
      currentTypewriterTimeouts.push(timeout);
      i++;
    } else {
      onDone(); // Enable refresh when done
    }
  }

  type();
}

// Load a random poem
async function loadRandomPoem() {
  try {
    refreshButton.disabled = true; // Disable button during load

    const res = await fetch('poems/poems.json');
    const poems = await res.json();
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];

    if (!randomPoem || !randomPoem.content) {
      throw new Error("Poem content missing");
    }

    document.getElementById('poemTitle').textContent = randomPoem.title || "Untitled";

    typeWriterEffect(randomPoem.content, document.getElementById('poemContent'), 30, () => {
      refreshButton.disabled = false; // Re-enable button after typing
    });

  } catch (error) {
    console.error('Error loading poem:', error);
    document.getElementById('poemTitle').textContent = "Error";
    document.getElementById('poemContent').textContent = "Could not load poem.";
  }
}

// Refresh on button click
refreshButton.addEventListener('click', () => {
  refreshButton.disabled = true; // Disable button immediately on click
  loadRandomPoem();
});

// Load initial poem
document.addEventListener("DOMContentLoaded", loadRandomPoem);
