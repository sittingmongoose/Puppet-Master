/**
 * RWM Puppet Master - Modern Playful Dashboard
 * JavaScript for theme toggling and interactions
 */

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Add a subtle animation effect
  document.body.style.transition = 'background-color 0.4s ease, color 0.4s ease';
});

// Simulate live output updates
const terminal = document.querySelector('.terminal');
const outputLines = [
  '> Checking acceptance criteria...',
  '> Filter dropdown renders correctly',
  '> Testing URL parameter updates...',
  '> Running: npm run typecheck',
  '> TypeScript compilation successful',
  '> Running: npm test',
  '> Test suite passed (15/15)',
  '> Committing changes...',
  '> ralph: ST-001-002-003 add status filter',
  '> Iteration complete. Moving to next subtask...'
];

let outputIndex = 0;
let lastUpdateTime = Date.now();

function addTerminalLine() {
  if (outputIndex >= outputLines.length) {
    outputIndex = 0;
  }

  const cursorLine = terminal.querySelector('.cursor');
  const newLine = document.createElement('div');
  newLine.className = 'terminal-line';
  newLine.textContent = outputLines[outputIndex];

  terminal.insertBefore(newLine, cursorLine);
  terminal.scrollTop = terminal.scrollHeight;

  outputIndex++;
  lastUpdateTime = Date.now();
}

// Add new terminal line every 3 seconds
setInterval(addTerminalLine, 3000);

// Animate progress bars on load
function animateProgressBars() {
  const progressBars = document.querySelectorAll('.progress-bar');
  progressBars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 100);
  });
}

// Run animations on page load
document.addEventListener('DOMContentLoaded', () => {
  animateProgressBars();
});

// Button click effects
const controlButtons = document.querySelectorAll('.control-btn');
controlButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    // Add ripple effect
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = 'translateY(-2px)';
    }, 100);

    // Log action (in real app, this would trigger actual controls)
    const action = this.classList.contains('start') ? 'Start' :
                   this.classList.contains('pause') ? 'Pause' : 'Stop';
    console.log(`Control: ${action} clicked`);

    // Add to terminal
    const terminal = document.querySelector('.terminal');
    const cursorLine = terminal.querySelector('.cursor');
    const newLine = document.createElement('div');
    newLine.className = 'terminal-line';
    newLine.textContent = `> ${action} command received...`;
    terminal.insertBefore(newLine, cursorLine);
    terminal.scrollTop = terminal.scrollHeight;
  });
});

// Copy button functionality
const copyBtn = document.querySelector('.copy-btn');
if (copyBtn) {
  const originalHTML = copyBtn.innerHTML;
  copyBtn.addEventListener('click', () => {
    const terminalContent = document.querySelector('.terminal').innerText;
    navigator.clipboard.writeText(terminalContent).then(() => {
      // Visual feedback - show checkmark SVG
      copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      copyBtn.style.background = 'var(--accent-mint-light)';
      copyBtn.style.color = '#166534';
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.background = '';
        copyBtn.style.color = '';
      }, 1500);
    });
  });
}

// Simulate elapsed time update
const timeValue = document.querySelector('.time-value');
let elapsedSeconds = 45 * 60 + 23; // Starting at 45m 23s

function updateElapsedTime() {
  elapsedSeconds++;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  timeValue.textContent = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

setInterval(updateElapsedTime, 1000);

// Add hover effects to spheres (subtle parallax)
document.addEventListener('mousemove', (e) => {
  const spheres = document.querySelectorAll('.sphere');
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  spheres.forEach((sphere, index) => {
    const speed = (index + 1) * 0.5;
    const xOffset = (x - 0.5) * speed * 20;
    const yOffset = (y - 0.5) * speed * 20;

    sphere.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  });
});

// Acceptance criteria click to toggle (demo)
const criteria = document.querySelectorAll('.criterion');
criteria.forEach(criterion => {
  criterion.addEventListener('click', () => {
    if (criterion.classList.contains('pending')) {
      criterion.classList.remove('pending');
      criterion.classList.add('passed');
      criterion.querySelector('.check-icon').textContent = '✓';
    } else {
      criterion.classList.remove('passed');
      criterion.classList.add('pending');
      criterion.querySelector('.check-icon').textContent = '○';
    }
  });
});

// Project dropdown change
const projectDropdown = document.querySelector('.project-dropdown');
if (projectDropdown) {
  projectDropdown.addEventListener('change', function() {
    console.log(`Project changed to: ${this.value}`);
    // Add terminal notification
    const terminal = document.querySelector('.terminal');
    const cursorLine = terminal.querySelector('.cursor');
    const newLine = document.createElement('div');
    newLine.className = 'terminal-line';
    newLine.textContent = `> Switched to project: ${this.value}`;
    terminal.insertBefore(newLine, cursorLine);
    terminal.scrollTop = terminal.scrollHeight;
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Space to toggle start/pause
  if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
    e.preventDefault();
    const startBtn = document.querySelector('.control-btn.start');
    const pauseBtn = document.querySelector('.control-btn.pause');
    // Toggle logic would go here
    console.log('Space pressed - toggle start/pause');
  }

  // Escape to stop
  if (e.code === 'Escape') {
    console.log('Escape pressed - stop');
  }

  // ? for help
  if (e.key === '?' && !e.target.matches('input, textarea')) {
    console.log('Help requested');
    alert('Keyboard Shortcuts:\n\nSpace - Start/Pause\nEscape - Stop\nR - Retry\nL - Logs\n? - This help');
  }
});

console.log('[Modern Playful Dashboard] Loaded successfully');
console.log('[Modern Playful Dashboard] Theme:', html.getAttribute('data-theme'));
