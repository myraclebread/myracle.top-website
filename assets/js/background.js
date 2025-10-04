// ===== BACKGROUND SYSTEM =====
let gradientCanvas;
let gradientCtx;
let canvas;
let ctx;
let particles = [];
const particleCount = 18;
let currentSection = 'intro';
let targetBehavior = 'intro';
let transitionProgress = 1;
let currentGradient = { colors: [], positions: [] };
let targetGradient = { colors: [], positions: [] };
let gradientProgress = 1;

// Define smooth gradient transitions
const smoothGradients = {
    intro: {
        colors: [
            {r: 10, g: 10, b: 42},    // #0a0a2a
            {r: 100, g: 80, b: 255},  // Purple
            {r: 255, g: 100, b: 100}, // Pink
            {r: 100, g: 200, b: 255}  // Light blue
        ],
        positions: [0, 0.3, 0.7, 1]
    },
    work: {
        colors: [
            {r: 0, g: 17, b: 34},     // #001122
            {r: 80, g: 120, b: 255},  // Blue
            {r: 0, g: 200, b: 255},   // Cyan
            {r: 0, g: 100, b: 200}    // Dark blue
        ],
        positions: [0, 0.3, 0.7, 1]
    },
    resume: {
        colors: [
            {r: 0, g: 26, b: 51},     // #001a33
            {r: 120, g: 180, b: 255}, // Light blue
            {r: 80, g: 160, b: 255},  // Medium blue
            {r: 60, g: 140, b: 255}   // Dark blue
        ],
        positions: [0, 0.3, 0.7, 1]
    },
    poems: {
        colors: [
            {r: 26, g: 10, b: 42},    // #1a0a2a
            {r: 180, g: 80, b: 255},  // Purple
            {r: 255, g: 100, b: 200}, // Pink
            {r: 255, g: 150, b: 255}  // Light pink
        ],
        positions: [0, 0.3, 0.7, 1]
    },
    contact: {
        colors: [
            {r: 0, g: 34, b: 0},      // #002200
            {r: 100, g: 255, b: 150}, // Green
            {r: 0, g: 255, b: 200},   // Teal
            {r: 150, g: 255, b: 100}  // Light green
        ],
        positions: [0, 0.3, 0.7, 1]
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

// ===== GRADIENT CANVAS SYSTEM =====
function initGradientCanvas() {
    gradientCanvas = document.createElement('canvas');
    gradientCanvas.id = 'gradient-canvas';
    gradientCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1000;
        opacity: 0.8;
    `;
    document.body.appendChild(gradientCanvas);
    
    gradientCtx = gradientCanvas.getContext('2d');
    resizeGradientCanvas();
    window.addEventListener('resize', resizeGradientCanvas);
    
    // Set initial gradient
    currentGradient = {...smoothGradients.intro};
    targetGradient = {...smoothGradients.intro};
    drawGradient();
}

function resizeGradientCanvas() {
    if (gradientCanvas) {
        gradientCanvas.width = window.innerWidth;
        gradientCanvas.height = window.innerHeight;
        drawGradient();
    }
}

function drawGradient() {
    if (!gradientCtx) return;
    
    const width = gradientCanvas.width;
    const height = gradientCanvas.height;
    const gradient = gradientCtx.createLinearGradient(0, 0, width, height);
    
    // Interpolate between current and target gradients
    for (let i = 0; i < currentGradient.colors.length; i++) {
        const currentColor = currentGradient.colors[i];
        const targetColor = targetGradient.colors[i];
        const position = currentGradient.positions[i];
        
        // Smooth color interpolation
        const r = Math.round(currentColor.r + (targetColor.r - currentColor.r) * gradientProgress);
        const g = Math.round(currentColor.g + (targetColor.g - currentColor.g) * gradientProgress);
        const b = Math.round(currentColor.b + (targetColor.b - currentColor.b) * gradientProgress);
        
        gradient.addColorStop(position, `rgb(${r}, ${g}, ${b})`);
    }
    
    gradientCtx.fillStyle = gradient;
    gradientCtx.fillRect(0, 0, width, height);
}

function updateGradient(section) {
    if (smoothGradients[section]) {
        targetGradient = {...smoothGradients[section]};
        gradientProgress = 0;
        
        // Start smooth transition
        function animateGradient() {
            if (gradientProgress < 1) {
                gradientProgress += 0.02;
                drawGradient();
                requestAnimationFrame(animateGradient);
            } else {
                // Transition complete
                currentGradient = {...targetGradient};
                gradientProgress = 1;
                drawGradient();
            }
        }
        animateGradient();
    }
}

// ===== PARTICLE SYSTEM =====
function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

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

// ===== NAVIGATION DETECTION =====
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
            if (smoothGradients[section]) {
                targetBehavior = section;
                transitionProgress = 0;
                updateGradient(section);
            }
        }
    });
}

// ===== INITIALIZATION =====
function initBackground() {
    // Initialize gradient canvas
    initGradientCanvas();
    
    // Initialize particle canvas
    canvas = document.getElementById('particles-bg');
    if (!canvas) {
        console.error('Particles canvas not found');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // Set initial size and create particles
    resizeCanvas();
    createParticles();
    
    // Set initial background based on current URL
    const initialSection = window.location.hash.substring(1);
    if (smoothGradients[initialSection]) {
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
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackground);
} else {
    initBackground();
}