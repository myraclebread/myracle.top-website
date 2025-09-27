let poems = [];
let displayedPoems = [];
let typingInterval = null; // Store the interval ID for the typing effect

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

  // Clear any existing typing effect
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
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
  
  // Add typing cursor class
  document.getElementById('poemContent').classList.add('typing');
  
  typeWriterEffect(randomPoem.content, document.getElementById('poemContent'), () => {
    button.disabled = false; // Enable button after typing effect finishes
    // Remove typing cursor when done
    document.getElementById('poemContent').classList.remove('typing');
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
      typingInterval = null;
      if (typeof callback === 'function') callback();
    }
  }
  
  typingInterval = setInterval(type, speed);
}

// Skip the typewriter effect
function skipTypewriter() {
  const poemContent = document.getElementById('poemContent');
  const currentTitle = document.getElementById('poemTitle').textContent;
  const randomPoem = poems.find(poem => poem.title === currentTitle);
  
  if (!randomPoem) return;
  
  // Stop the typewriter effect immediately
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  
  // Remove typing cursor
  poemContent.classList.remove('typing');
  
  // Directly show the full poem content
  poemContent.textContent = randomPoem.content;
  document.getElementById('refreshPoemBtn').disabled = false; // Enable the button after skipping
}

// Reset the poem when the poems section is navigated to
function resetPoemForSection() {
  // Clear any ongoing typing
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  
  // Remove typing cursor
  const poemContent = document.getElementById('poemContent');
  poemContent.classList.remove('typing');
  
  // Load a fresh poem
  loadRandomPoem();
}

// Event listeners for the buttons
document.addEventListener("DOMContentLoaded", () => {
  // Load the first poem on page load
  loadRandomPoem();

  const refreshBtn = document.getElementById('refreshPoemBtn');
  const skipBtn = document.getElementById('skipTypingBtn');

  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    loadRandomPoem();
  });

  skipBtn.addEventListener('click', () => {
    skipTypewriter();
  });

  // Listen for navigation to the poems section (if using a SPA navigation)
  // This will depend on how your site handles navigation
  // Example for hash-based navigation:
  window.addEventListener('hashchange', function() {
    if (window.location.hash === '#poems') {
      // Small delay to ensure section is visible
      setTimeout(resetPoemForSection, 100);
    }
  });
});

// If your site uses a different navigation system, you might need to call
// resetPoemForSection() when the poems section becomes active
