let currentTypewriterTimeouts = []; // Track all active timeouts

// Function to clear any active typewriter effects
function clearTypewriter() {
  // Cancel all running timeouts
  currentTypewriterTimeouts.forEach(timeout => clearTimeout(timeout));
  currentTypewriterTimeouts = [];
}

// Typewriter effect function
function typeWriterEffect(text, element, speed = 30) {
  clearTypewriter(); // Stop any previous typewriter effect

  element.textContent = ""; // Clear existing text
  let i = 0;

  // Recursive function to simulate typing effect
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      const timeout = setTimeout(type, speed);
      currentTypewriterTimeouts.push(timeout); // Track timeouts to clear them if needed
      i++;
    }
  }

  type(); // Start typing effect
}

// Function to load a random poem
async function loadRandomPoem() {
  try {
    const res = await fetch('https://myracle.top/poems/poems.json');
    const poems = await res.json(); // Parse JSON

    // Check if poems data is valid
    if (!Array.isArray(poems) || poems.length === 0) {
      throw new Error("Poems data is empty or invalid");
    }

    const randomPoem = poems[Math.floor(Math.random() * poems.length)]; // Pick a random poem

    // Check if the poem has content
    if (!randomPoem || !randomPoem.content) {
      throw new Error("Poem content missing");
    }

    // Set the poem title and apply typewriter effect for the content
    document.getElementById('poemTitle').textContent = randomPoem.title || "Untitled";
    typeWriterEffect(randomPoem.content, document.getElementById('poemContent'));
  } catch (error) {
    console.error('Error loading poem:', error); // Log the error
    document.getElementById('poemTitle').textContent = "Error";
    document.getElementById('poemContent').textContent = "Could not load poem.";
  }
}

// Ensure the poem is loaded once the page is ready
document.addEventListener("DOMContentLoaded", loadRandomPoem);
