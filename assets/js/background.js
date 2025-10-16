// ===== BACKGROUND SYSTEM v5 (Complete & Final with Afterimage Trail) =====

// --- General Setup ---
let gradientEl;
let canvas;
let ctx;
let particles = [];
const particleCount = 40;
let currentSection = 'intro';
let targetBehavior = 'intro';
let transitionProgress = 1;
const mouse = { x: null, y: null, radius: 150 };

const knight = {
    img: new Image(),
    x: -200,
    y: window.innerHeight - 150,
    width: 50,
    height: 70,
    animationProgress: 0,
    animationDuration: 45000 // 45 seconds in milliseconds
};
knight.img.src = 'https://static.wikia.nocookie.net/deltarune/images/7/7b/TheRoaringKnightDeltarune.webp';

// An array to store the Knight's last few positions for the trail
let knightHistory = [];
const KNIGHT_TRAIL_LENGTH = 30; // How many afterimages to show
let frameCount = 0;
const TRAIL_SPACING_FRAMES = 5;

// --- Color & Theme Configuration ---
const gradientThemes = {
    intro: {
        background: `
            radial-gradient(circle at 20% 30%, rgba(220, 70, 255, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255, 105, 180, 0.25) 0%, transparent 40%),
            linear-gradient(135deg, #2A0A3D 0%, #1A0526 100%)
        `,
        animation: 'gradientShift 20s ease infinite',
        size: '400% 400%'
    },
    work: {
        background: `
            radial-gradient(circle at 10% 20%, rgba(150, 70, 255, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 90% 40%, rgba(180, 100, 220, 0.3) 0%, transparent 50%),
            linear-gradient(45deg, #1A1A3D 0%, #0F0F26 100%)
        `,
        animation: 'gradientShift 15s ease infinite',
        size: '400% 400%'
    },
    resume: {
        background: `
            radial-gradient(circle at 30% 20%, rgba(255, 100, 180, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(200, 80, 255, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #3D0A30 0%, #1A051A 100%)
        `,
        animation: 'gradientShift 12s ease infinite',
        size: '400% 400%'
    },
    poems: {
        background: `
            radial-gradient(circle at 30% 20%, rgba(255, 182, 193, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(218, 112, 214, 0.35) 0%, transparent 50%),
            linear-gradient(225deg, #4A1A4A 0%, #2A0A2A 50%, #1A051A 100%)
        `,
        animation: 'gradientFlow 25s linear infinite',
        size: '200% 200%'
    },
    contact: {
        background: `
            radial-gradient(circle at 20% 50%, rgba(255, 20, 147, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 80% 30%, rgba(199, 21, 133, 0.35) 0%, transparent 50%),
            linear-gradient(135deg, #5A0535 0%, #3D0A2A 50%, #1A051A 100%)
        `,
        animation: 'gradientPulse 12s ease-in-out infinite',
        size: '200% 200%'
    }
};

const behaviors = {
    intro: { color: 'hsl(285, 90%, 75%)', speed: 0.3, connectionDistance: 120, formation: 'interactiveNebula' },
    work: { color: 'hsl(250, 80%, 80%)', speed: 0.1, connectionDistance: 100, formation: 'focusedGrid' },
    resume: { color: 'hsl(330, 90%, 75%)', speed: 0.4, connectionDistance: 90, formation: 'gentleRise' },
    poems: { color: 'hsl(300, 100%, 85%)', speed: 0.5, connectionDistance: 110, formation: 'dreamyOrbit' },
    contact: { color: 'hsl(320, 95%, 70%)', speed: 1.0, connectionDistance: 130, formation: 'interactiveNetwork' }
};

// --- Core Animation Functions ---
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
            id: i,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.8,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            angle: Math.random() * Math.PI * 2,
            orbitSpeed: 0.005 + Math.random() * 0.005,
        });
    }
}

function updateGradient(section) {
    const config = gradientThemes[section];
    if (config && gradientEl) {
        gradientEl.style.transition = 'opacity 0.75s ease';
        gradientEl.style.opacity = '0';
        setTimeout(() => {
            gradientEl.style.background = config.background;
            gradientEl.style.animation = config.animation;
            gradientEl.style.backgroundSize = config.size;
            gradientEl.style.opacity = '0.8';
        }, 750);
    }
}

function updateParticleBehavior(particle, behavior) {
    const config = behaviors[behavior];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (config.formation) {
        case 'interactiveNebula':
            if (mouse.x != null) {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    particle.x += forceDirectionX * force * 1.5;
                    particle.y += forceDirectionY * force * 1.5;
                }
            }
            const pulse = Math.sin(particle.angle + Date.now() * 0.0001);
            const distFromCenter = Math.sqrt(Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2));
            const pullFactor = (distFromCenter > 100) ? 0.01 : -0.01 * pulse;
            particle.x += ((centerX - particle.x) * 0.001) + particle.speedX * config.speed + pullFactor;
            particle.y += ((centerY - particle.y) * 0.001) + particle.speedY * config.speed + pullFactor;
            break;

        case 'focusedGrid':
            const gridSize = Math.floor(Math.sqrt(particleCount));
            const spacingX = canvas.width / (gridSize + 1);
            const spacingY = canvas.height / (gridSize + 1);
            const targetX = ((particle.id % gridSize) + 1) * spacingX;
            const targetY = (Math.floor(particle.id / gridSize) + 1) * spacingY;
            particle.x += (targetX - particle.x) * 0.02;
            particle.y += (targetY - particle.y) * 0.02;
            break;

        case 'gentleRise':
            particle.x += particle.speedX * config.speed;
            particle.y -= config.speed * 0.5;
            if (particle.y < -10) particle.y = canvas.height + 10;
            break;

        case 'dreamyOrbit':
            particle.angle += particle.orbitSpeed;
            const orbitRadiusX = canvas.width * 0.35;
            const orbitRadiusY = canvas.height * 0.4;
            const targetOrbitX = centerX + Math.sin(particle.angle) * orbitRadiusX;
            const targetOrbitY = centerY + Math.sin(particle.angle * 2) * orbitRadiusY / 2;
            particle.x += (targetOrbitX - particle.x) * 0.03;
            particle.y += (targetOrbitY - particle.y) * 0.03;
            break;

        case 'interactiveNetwork':
            if (mouse.x != null) {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    particle.x += forceDirectionX * force * 1.5;
                    particle.y += forceDirectionY * force * 1.5;
                }
            }
            particle.x += particle.speedX * config.speed;
            particle.y += particle.speedY * config.speed;
            break;
    }

    if (config.formation !== 'gentleRise' && config.formation !== 'dreamyOrbit') {
        if (particle.x <= 0 || particle.x >= canvas.width) particle.speedX *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.speedY *= -1;
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

function updateKnightPosition(deltaTime) {
    knight.animationProgress = (knight.animationProgress + deltaTime) % knight.animationDuration;
    const progress = knight.animationProgress / knight.animationDuration;

    const screenWidth = canvas.width;
    const startX = -200;
    const endX = screenWidth + 200;

    if (progress < 0.5) {
        const phaseProgress = progress * 2;
        knight.x = startX + (endX - startX) * phaseProgress;
        const yOffset = -30 * Math.sin(phaseProgress * Math.PI);
        knight.y = screenWidth > 768 ? window.innerHeight - 150 + yOffset : window.innerHeight - 100 + yOffset;
    } else {
        const phaseProgress = (progress - 0.5) * 2;
        knight.x = endX + (startX - endX) * phaseProgress;
        const yOffset = -30 * Math.sin(phaseProgress * Math.PI);
        knight.y = screenWidth > 768 ? window.innerHeight - 300 + yOffset : window.innerHeight - 200 + yOffset;
    }
    if (frameCount % TRAIL_SPACING_FRAMES === 0) {
        knightHistory.push({ x: knight.x, y: knight.y });

        if (knightHistory.length > KNIGHT_TRAIL_LENGTH) {
            knightHistory.shift();
        }
    }
}

function drawKnightAndTrail() {
    if (!knight.img.complete) return;

    for (let i = 0; i < knightHistory.length; i++) {
        const pos = knightHistory[i];
        const opacity = (i / KNIGHT_TRAIL_LENGTH) * 0.4;
        
        ctx.globalAlpha = opacity;
        ctx.filter = 'brightness(0.7)';
        ctx.drawImage(knight.img, pos.x, pos.y, knight.width, knight.height);
    }

    ctx.globalAlpha = 0.6;
    ctx.filter = 'brightness(0.7)';
    ctx.drawImage(knight.img, knight.x, knight.y, knight.width, knight.height);
    
    ctx.globalAlpha = 1.0;
    ctx.filter = 'none';
}

let lastTime = 0;
function animate(currentTime) {
    if (!ctx || !canvas) return;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    frameCount++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (transitionProgress < 1) {
        transitionProgress += 0.015;
        if (transitionProgress >= 1) {
            currentSection = targetBehavior;
            transitionProgress = 1;
        }
    }

    particles.forEach(p => {
        const oldPos = { x: p.x, y: p.y };
        updateParticleBehavior(p, currentSection);
        const currentBehaviorPos = { x: p.x, y: p.y };
        p.x = oldPos.x; p.y = oldPos.y;
        updateParticleBehavior(p, targetBehavior);
        const targetBehaviorPos = { x: p.x, y: p.y };

        if (transitionProgress < 1) {
            p.x = oldPos.x + (targetBehaviorPos.x - oldPos.x) * transitionProgress;
            p.y = oldPos.y + (targetBehaviorPos.y - oldPos.y) * transitionProgress;
        } else {
             p.x = currentBehaviorPos.x;
             p.y = currentBehaviorPos.y;
        }
        
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

    const connectionDist = behaviors[currentSection].connectionDistance;
    const targetConnectionDist = behaviors[targetBehavior].connectionDistance;
    const currentConnectionDist = transitionProgress < 1 ?
        connectionDist + (targetConnectionDist - connectionDist) * transitionProgress :
        connectionDist;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < currentConnectionDist) {
                const opacity = 1 - (distance / currentConnectionDist);
                ctx.strokeStyle = interpolateColor(behaviors[currentSection].color, behaviors[targetBehavior].color, transitionProgress)
                                  .replace('hsl', 'hsla').replace(')', `, ${opacity * 0.15})`);
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    updateKnightPosition(deltaTime);
    drawKnightAndTrail();

    requestAnimationFrame(animate);
}

function setupEventListeners() {
    window.addEventListener('mousemove', e => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    const handleSectionChange = (section) => {
        if (gradientThemes[section] && targetBehavior !== section) {
            targetBehavior = section;
            transitionProgress = 0;
            updateGradient(section);
        }
    };

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.tagName === 'ARTICLE' && target.id) {
                    if (target.classList.contains('active')) {
                        handleSectionChange(target.id);
                    } else {
                        if (document.querySelectorAll('article.active').length === 0) {
                             handleSectionChange('intro');
                        }
                    }
                }
            }
        });
    });

    document.querySelectorAll('article').forEach(article => {
        observer.observe(article, { attributes: true });
    });

    document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.hash) {
            const section = link.hash.substring(1);
            handleSectionChange(section);
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            handleSectionChange('intro');
        }
    });
}

function initBackground() {
    gradientEl = document.getElementById('gradient-bg');
    canvas = document.getElementById('particles-bg');
    if (!gradientEl || !canvas) {
        console.error('Background elements not found');
        return;
    }
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    createParticles();
    
    const initialSection = window.location.hash.substring(1);
    if (gradientThemes[initialSection]) {
        currentSection = initialSection;
        targetBehavior = initialSection;
        updateGradient(initialSection);
    } else {
        updateGradient('intro');
    }
    
    lastTime = performance.now();
    requestAnimationFrame(animate);
    
    window.addEventListener('resize', resizeCanvas);
    setupEventListeners();
}

function addGradientKeyframes() {
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
            z-index: -1000;
        }
    `;
    document.head.appendChild(style);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        addGradientKeyframes();
        initBackground();
    });
} else {
    addGradientKeyframes();
    initBackground();
}