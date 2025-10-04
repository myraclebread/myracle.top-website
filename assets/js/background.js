// ===== BACKGROUND SYSTEM =====
let gradientEl;
let canvas;
let ctx;
let particles = [];
const particleCount = 18;
let currentSection = 'intro';
let targetBehavior = 'intro';
let transitionProgress = 1;
let gradientTransitionTimeout = null;
let currentGradientSection = 'intro';
let targetGradientSection = 'intro';

// Gradient themes for each section - FIXED SYNTAX
const gradientThemes = {
    intro: {
        background: `
            radial-gradient(circle at 20% 30%, rgba(100, 80, 255, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 100, 100, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 90%, rgba(100, 200, 255, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a2a 0%, #000000 100%)
        `,
        animation: 'gradientShift 20s ease infinite',
        size: '400% 400%'
    },
    work: {
        background: `
            radial-gradient(circle at 10% 20%, rgba(80, 120, 255, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 90% 40%, rgba(0, 200, 255, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(0, 100, 200, 0.3) 0%, transparent 50%),
            linear-gradient(45deg, #001122 0%, #000811 100%)
        `,
        animation: 'gradientShift 15s ease infinite',
        size: '400% 400%'
    },
    resume: {
        background: `
            radial-gradient(circle at 30% 20%, rgba(120, 180, 255, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(80, 160, 255, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(60, 140, 255, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #001a33 0%, #000000 100%)
        `,
        animation: 'gradientShift 12s ease infinite',
        size: '400% 400%'
    },
    poems: {
        background: `
            radial-gradient(circle at 30% 20%, rgba(180, 80, 255, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(255, 100, 200, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(255, 150, 255, 0.3) 0%, transparent 50%),
            linear-gradient(225deg, #1a0a2a 0%, #110022 50%, #000000 100%)
        `,
        animation: 'gradientFlow 25s linear infinite',
        size: '200% 200%'
    },
    contact: {
        background: `
            radial-gradient(circle at 20% 50%, rgba(100, 255, 150, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(0, 255, 200, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 60% 70%, rgba(150, 255, 100, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #002200 0%, #001100 50%, #000000 100%)
        `,
        animation: 'gradientPulse 12s ease-in-out infinite',
        size: '200% 200%'
    }
};

// Section behaviors
const behaviors = {
    intro: { color: 'hsl(170, 80%, 60%)', speed: 0.8, connectionDistance: 120, formation: 'random' },
    work: { color: 'hsl(200, 80%, 60%)', speed: 0.5, connectionDistance: 150, formation: 'clusters' },
    resume: { color: 'hsl(220, 80%, 60%)', speed: 0.6, connectionDistance: 140, formation: 'organized' },
    poems: { color: 'hsl(280, 70%, 65%)', speed: 0.4, connectionDistance: 130, formation: 'gentleFlow' },
    contact: { color: 'hsl(120, 70%, 60%)', speed: 0.9, connectionDistance: 160, formation: 'network' }
};

// Set canvas size
function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

// Create particles
function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.8,
            speedX: (Math.random() - 0.5) * 0.8,
            speedY: (Math.random() - 0.5) * 0.8,
            baseX: Math.random() * canvas.width,
            baseY: Math.random() * canvas.height,
            cluster: Math.floor(Math.random() * 3),
            angle: Math.random() * Math.PI * 2,
            flowSpeed: 0.02 + Math.random() * 0.02,
            flowRadius: 20 + Math.random() * 40
        });
    }
}

function updateGradient(section) {
    const config = gradientThemes[section];
    if (!config || !gradientEl) return;
    
    // If we're already at this section, do nothing
    if (currentGradientSection === section) return;
    
    // Clear any pending transition
    if (gradientTransitionTimeout) {
        clearTimeout(gradientTransitionTimeout);
    }
    
    // Start transition immediately
    gradientEl.style.transition = 'opacity 0.4s ease';
    gradientEl.style.opacity = '0.2'; // Quick fade out
    
    gradientTransitionTimeout = setTimeout(() => {
        // Apply new gradient while faded out
        gradientEl.style.background = config.background;
        gradientEl.style.animation = config.animation;
        gradientEl.style.backgroundSize = config.size;
        
        // Fade back in
        gradientEl.style.transition = 'opacity 0.8s ease';
        gradientEl.style.opacity = '0.8';
        
        currentGradientSection = section;
        gradientTransitionTimeout = null;
    }, 200);
}

// Particle behavior based on section
function updateParticleBehavior(particle, behavior) {
    const behaviorConfig = behaviors[behavior];
    
    switch(behaviorConfig.formation) {
        case 'random':
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            break;
            
        case 'clusters':
            const centerX = (particle.cluster * (canvas.width / 3)) + (canvas.width / 6);
            const centerY = canvas.height / 2;
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 40) {
                particle.x += dx * 0.01;
                particle.y += dy * 0.01;
            }
            particle.x += (Math.random() - 0.5) * 0.3;
            particle.y += (Math.random() - 0.5) * 0.3;
            break;
            
        case 'organized':
            const orgCenterX = canvas.width / 2;
            const orgCenterY = canvas.height / 2;
            const orgDx = orgCenterX - particle.x;
            const orgDy = orgCenterY - particle.y;
            const orgDistance = Math.sqrt(orgDx * orgDx + orgDy * orgDy);
            
            if (orgDistance > 60) {
                particle.x += orgDx * 0.008;
                particle.y += orgDy * 0.008;
            }
            break;
            
        case 'gentleFlow':
            particle.angle += particle.flowSpeed;
            const waveX = Math.cos(particle.angle) * particle.flowRadius;
            const waveY = Math.sin(particle.angle * 1.3) * (particle.flowRadius * 0.7);
            
            const toBaseX = particle.baseX - particle.x;
            const toBaseY = particle.baseY - particle.y;
            
            particle.x += toBaseX * 0.005 + waveX * 0.05;
            particle.y += toBaseY * 0.005 + waveY * 0.05;
            break;
            
        case 'network':
            particle.x += particle.speedX * 1.2;
            particle.y += particle.speedY * 1.2;
            break;
    }
    
    // Bounce off walls
    if (particle.x <= 0) {
        particle.x = 1;
        particle.speedX *= -0.8;
    }
    if (particle.x >= canvas.width) {
        particle.x = canvas.width - 1;
        particle.speedX *= -0.8;
    }
    if (particle.y <= 0) {
        particle.y = 1;
        particle.speedY *= -0.8;
    }
    if (particle.y >= canvas.height) {
        particle.y = canvas.height - 1;
        particle.speedY *= -0.8;
    }
}

// Color interpolation
function interpolateColor(color1, color2, progress) {
    const hsl1 = color1.match(/\d+/g).map(Number);
    const hsl2 = color2.match(/\d+/g).map(Number);
    
    const h = hsl1[0] + (hsl2[0] - hsl1[0]) * progress;
    const s = hsl1[1] + (hsl2[1] - hsl1[1]) * progress;
    const l = hsl1[2] + (hsl2[2] - hsl1[2]) * progress;
    
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function animate() {
    if (!ctx || !canvas) return;
    
    // Clear with fade for trails
    ctx.fillStyle = 'rgba(0, 5, 15, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Handle transitions
    if (transitionProgress < 1) {
        transitionProgress += 0.015;
        if (transitionProgress >= 1) {
            currentSection = targetBehavior;
            transitionProgress = 1;
        }
    }
    
    // Update particles with smooth transition
    particles.forEach(p => {
        if (transitionProgress < 1) {
            const oldX = p.x, oldY = p.y;
            
            updateParticleBehavior(p, currentSection);
            const currentX = p.x, currentY = p.y;
            
            p.x = oldX; p.y = oldY;
            updateParticleBehavior(p, targetBehavior);
            const targetX = p.x, targetY = p.y;
            
            p.x = currentX + (targetX - currentX) * transitionProgress;
            p.y = currentY + (targetY - currentY) * transitionProgress;
        } else {
            updateParticleBehavior(p, currentSection);
        }
        
        // Draw particle
        const behavior = behaviors[currentSection];
        const targetBehaviorConfig = behaviors[targetBehavior];
        const currentColor = transitionProgress < 1 ? 
            interpolateColor(behavior.color, targetBehaviorConfig.color, transitionProgress) : 
            behavior.color;
        
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw connections
    const connectionDist = behaviors[currentSection].connectionDistance;
    const targetConnectionDist = behaviors[targetBehavior].connectionDistance;
    const currentConnectionDist = transitionProgress < 1 ? 
        connectionDist + (targetConnectionDist - connectionDist) * transitionProgress : 
        connectionDist;
    
    ctx.strokeStyle = transitionProgress < 1 ? 
        interpolateColor(
            behaviors[currentSection].color, 
            behaviors[targetBehavior].color, 
            transitionProgress
        ).replace('hsl', 'hsla').replace(')', ', 0.08)') : 
        behaviors[currentSection].color.replace('hsl', 'hsla').replace(')', ', 0.08)');
    
    ctx.lineWidth = 0.8;
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < currentConnectionDist) {
                const opacity = 1 - (distance / currentConnectionDist);
                ctx.globalAlpha = opacity * 0.15;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    ctx.globalAlpha = 1;
    
    requestAnimationFrame(animate);
}

// Smooth background transitions for article navigation
function setupSmoothBackgroundTransitions() {
    let lastActiveArticle = null;
    
    // Watch for article changes using MutationObserver
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                // Check if this is an article becoming active/inactive
                if (target.id && target.id !== 'main' && target.tagName === 'ARTICLE') {
                    const isNowActive = target.classList.contains('active');
                    
                    if (isNowActive) {
                        // Article opened - transition to its background
                        lastActiveArticle = target.id;
                        targetBehavior = target.id;
                        transitionProgress = 0;
                        updateGradient(target.id);
                    } else if (lastActiveArticle === target.id) {
                        // Article closed - smoothly transition back to intro
                        lastActiveArticle = null;
                        targetBehavior = 'intro';
                        transitionProgress = 0;
                        updateGradient('intro');
                    }
                }
            }
        });
    });
    
    // Observe all articles for class changes
    document.querySelectorAll('article').forEach(article => {
        observer.observe(article, { attributes: true, attributeFilter: ['class'] });
    });
    
    // Also detect clicks on the main wrapper (when clicking outside articles)
    document.addEventListener('click', function(e) {
        if (e.target.id === 'wrapper' || e.target.id === 'main') {
            targetBehavior = 'intro';
            transitionProgress = 0;
            updateGradient('intro');
        }
    });
    
    // ESC key to close articles and go back to intro
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            targetBehavior = 'intro';
            transitionProgress = 0;
            updateGradient('intro');
        }
    });
    
    // Also handle direct navigation clicks
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            const section = link.getAttribute('href').substring(1);
            if (gradientThemes[section]) {
                targetBehavior = section;
                transitionProgress = 0;
                updateGradient(section);
            }
        }
    });
}

// Detect ESC key to reset background
function setupEscapeKeyDetection() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            targetBehavior = 'intro';
            transitionProgress = 0;
            updateGradient('intro');
        }
    });
}

// Initialize background when page loads
function initBackground() {
    gradientEl = document.getElementById('gradient-bg');
    canvas = document.getElementById('particles-bg');
    
    if (!gradientEl || !canvas) {
        console.error('Background elements not found');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // Set initial size and create particles
    resizeCanvas();
    createParticles();
    
    // Set initial background based on current URL
    const initialSection = window.location.hash.substring(1);
    if (gradientThemes[initialSection]) {
        targetBehavior = initialSection;
        currentSection = initialSection;
        updateGradient(initialSection);
    } else {
        targetBehavior = 'intro';
        currentSection = 'intro';
        updateGradient('intro');
    }
    
    // Start animation
    animate();
    
    // Listen for window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Set up smooth background transitions
    setupSmoothBackgroundTransitions();
    
    // Listen for navigation clicks
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            const section = link.getAttribute('href').substring(1);
            if (gradientThemes[section]) {
                targetBehavior = section;
                transitionProgress = 0;
                updateGradient(section);
            }
        }
    });
}

// Add gradient animations to the page
function addGradientAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        @keyframes gradientPulse {
            0%, 100% { background-size: 200% 200%; opacity: 0.7; }
            50% { background-size: 220% 220%; opacity: 0.9; }
        }

        @keyframes gradientFlow {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
        }

        #gradient-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -3;
            opacity: 0.8;
            transition: all 1.5s ease;
        }
    `;
    document.head.appendChild(style);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        addGradientAnimations();
        initBackground();
    });
} else {
    addGradientAnimations();
    initBackground();
}