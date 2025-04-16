let poems = [];
let displayedPoems = [];
let typingInterval; // Store the interval ID for the typing effect

async function loadPoems() {
  try {
    const res = await fetch('poems/poems.json');
    if (!res.ok) throw new Error('Failed to fetch poems');
    poems = await res.json();
  } catch (error) {
    console.error('Error loading poems:', error);
    document.getElementById('poemTitle').textContent = "Error";
    document.getElementById('poemContent').textContent = "Could not load poems.";
  }
}

async function loadRandomPoem() {
  const button = document.getElementById('refreshPoemBtn');
  const skipButton = document.getElementById('skipTypingBtn');
  button.disabled = true;
  skipButton.disabled = false;

  if (poems.length === 0) {
    await loadPoems(); // Load poems if not already loaded
  }

  // Ensure poem is not repeated
  let randomPoem;
  do {
    randomPoem = poems[Math.floor(Math.random() * poems.length)];
  } while (displayedPoems.includes(randomPoem.title) && displayedPoems.length < poems.length);

  // Add the poem to the displayed list
  displayedPoems.push(randomPoem.title);

  // Reset displayed poems when all have been shown
  if (displayedPoems.length === poems.length) {
    displayedPoems = [];
  }

  document.getElementById('poemTitle').textContent = randomPoem.title;
  typeWriterEffect(randomPoem.content, document.getElementById('poemContent'), () => {
    button.disabled = false; // Enable button after typing effect finishes
  });
}

function typeWriterEffect(text, element, callback, speed = 30) {
  element.textContent = "";
  let i = 0;
  
  // Clear any existing interval if the typing effect is already running
  if (typingInterval) {
    clearInterval(typingInterval);
  }

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(typingInterval); // Ensure to stop typing when done
      if (typeof callback === 'function') callback();
    }
  }
  
  typingInterval = setInterval(type, speed);
}

// Skip the typewriter effect
function skipTypewriter() {
  const poemContent = document.getElementById('poemContent');
  const randomPoem = poems.find(poem => poem.title === document.getElementById('poemTitle').textContent);
  
  // Stop the typewriter effect immediately
  clearInterval(typingInterval);
  
  // Directly show the full poem content
  poemContent.textContent = randomPoem.content;
  document.getElementById('refreshPoemBtn').disabled = false; // Enable the button after skipping
}

// Event listeners for the buttons
document.addEventListener("DOMContentLoaded", () => {
  loadRandomPoem(); // Load the first poem on page load

  const refreshBtn = document.getElementById('refreshPoemBtn');
  const skipBtn = document.getElementById('skipTypingBtn');

  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    loadRandomPoem();
  });

  skipBtn.addEventListener('click', () => {
    skipTypewriter();
  });
});
