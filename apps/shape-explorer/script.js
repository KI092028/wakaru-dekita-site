/**
 * Shape Explorer Game Logic
 * Purpose: Educational shape recognition game for children
 * Features: Multiple difficulty levels, interactive learning, visual feedback
 * Architecture: Class-based modular design with separation of concerns
 */

class GameState {
  constructor() {
    this.difficulty = 'easy';
    this.currentShape = null;
    this.currentChoices = [];
    this.correctAnswer = '';
    this.correctCount = 0;
    this.totalCount = 0;
    this.streakCount = 0;
    this.isAnswered = false;
    this.audioEnabled = true;
    
    this.elements = {};
    
    // Shape definitions by difficulty
    this.SHAPES = {
      easy: [
        { name: 'まる', class: 'circle', hint: 'まるい かたちです。ボールのように ころころしています。' },
        { name: 'しかく', class: 'square', hint: 'よっつの かどが あります。ぜんぶ おなじ ながさです。' },
        { name: 'さんかく', class: 'triangle', hint: 'みっつの かどが あります。やまの かたちです。' },
        { name: 'ちょうほうけい', class: 'rectangle', hint: 'よっつの かどが あります。よこが ながいです。' }
      ],
      medium: [
        { name: 'まる', class: 'circle', hint: 'まるい かたちです。ボールのように ころころしています。' },
        { name: 'しかく', class: 'square', hint: 'よっつの かどが あります。ぜんぶ おなじ ながさです。' },
        { name: 'さんかく', class: 'triangle', hint: 'みっつの かどが あります。やまの かたちです。' },
        { name: 'ちょうほうけい', class: 'rectangle', hint: 'よっつの かどが あります。よこが ながいです。' },
        { name: 'ひしがた', class: 'diamond', hint: 'しかくを かたむけた かたちです。ダイヤモンドみたいです。' },
        { name: 'だえん', class: 'oval', hint: 'まるを のばした かたちです。たまごみたいです。' }
      ],
      hard: [
        { name: 'まる', class: 'circle', hint: 'まるい かたちです。ボールのように ころころしています。' },
        { name: 'しかく', class: 'square', hint: 'よっつの かどが あります。ぜんぶ おなじ ながさです。' },
        { name: 'さんかく', class: 'triangle', hint: 'みっつの かどが あります。やまの かたちです。' },
        { name: 'ちょうほうけい', class: 'rectangle', hint: 'よっつの かどが あります。よこが ながいです。' },
        { name: 'ひしがた', class: 'diamond', hint: 'しかくを かたむけた かたちです。ダイヤモンドみたいです。' },
        { name: 'だえん', class: 'oval', hint: 'まるを のばした かたちです。たまごみたいです。' },
        { name: 'ほし', class: 'star', hint: 'よるの そらで ひかっている かたちです。とがった かどが あります。' },
        { name: 'ろっかく', class: 'hexagon', hint: 'むっつの かどが あります。はちの すの かたちです。' }
      ]
    };
    
    this.ENCOURAGEMENTS = [
      'すごいね！',
      'やったね！',
      'がんばったね！',
      'せいかい！',
      'よくできました！',
      'すばらしい！',
      'かしこいね！',
      'がんばって！'
    ];
  }

  cacheDOMElements() {
    this.elements = {
      difficultyScreen: document.getElementById('difficulty-screen'),
      gameScreen: document.getElementById('game-screen'),
      shapeDisplay: document.getElementById('shape-display'),
      choicesArea: document.getElementById('choices-area'),
      feedback: document.getElementById('feedback'),
      hintDisplay: document.getElementById('hint-display'),
      hintText: document.getElementById('hint-text'),
      nextBtn: document.getElementById('next-btn'),
      correctCount: document.getElementById('correct-count'),
      totalCount: document.getElementById('total-count'),
      streakCount: document.getElementById('streak-count'),
      encouragement: document.getElementById('encouragement'),
      stars: document.getElementById('stars'),
      confetti: document.getElementById('confetti'),
      audioToggle: document.getElementById('audio-toggle')
    };
  }

  reset() {
    this.currentShape = null;
    this.currentChoices = [];
    this.correctAnswer = '';
    this.correctCount = 0;
    this.totalCount = 0;
    this.streakCount = 0;
    this.isAnswered = false;
    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    if (this.elements.correctCount) {
      this.elements.correctCount.textContent = this.correctCount;
    }
    if (this.elements.totalCount) {
      this.elements.totalCount.textContent = this.totalCount;
    }
    if (this.elements.streakCount) {
      this.elements.streakCount.textContent = this.streakCount;
    }
  }
}

class AudioManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.audioContext = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  playSound(frequency, duration = 0.3, type = 'sine') {
    if (!this.gameState.audioEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.value = 0.1;
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  playCorrectSound() {
    this.playSound(523.25, 0.2); // C5
    setTimeout(() => this.playSound(659.25, 0.2), 100); // E5
    setTimeout(() => this.playSound(783.99, 0.3), 200); // G5
  }

  playIncorrectSound() {
    this.playSound(311.13, 0.5, 'sawtooth'); // Eb4
  }

  playClickSound() {
    this.playSound(440, 0.1); // A4
  }
}

class EffectsManager {
  constructor(gameState) {
    this.gameState = gameState;
  }

  showStars() {
    const container = this.gameState.elements.stars;
    if (!container) return;

    // Clear existing stars
    container.innerHTML = '';

    // Create multiple stars
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        this.createStar(container);
      }, i * 100);
    }
  }

  createStar(container) {
    const star = document.createElement('div');
    star.innerHTML = '⭐';
    star.style.position = 'absolute';
    star.style.fontSize = '2rem';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.pointerEvents = 'none';
    star.style.zIndex = '999';
    star.style.animation = 'starTwinkle 1.5s ease-out forwards';

    container.appendChild(star);

    // Remove star after animation
    setTimeout(() => {
      if (star.parentNode) {
        star.parentNode.removeChild(star);
      }
    }, 1500);
  }

  showConfetti() {
    const container = this.gameState.elements.confetti;
    if (!container) return;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        this.createConfetti(container, colors[Math.floor(Math.random() * colors.length)]);
      }, i * 20);
    }
  }

  createConfetti(container, color) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '999';
    confetti.style.animation = 'confettiFall 3s linear forwards';

    container.appendChild(confetti);

    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 3000);
  }

  showEncouragement(message) {
    const element = this.gameState.elements.encouragement;
    if (!element) return;

    element.textContent = message;
    element.classList.remove('hidden');

    setTimeout(() => {
      element.classList.add('hidden');
    }, 2000);
  }
}

class ShapeGenerator {
  constructor(gameState) {
    this.gameState = gameState;
  }

  generateProblem() {
    const shapes = this.gameState.SHAPES[this.gameState.difficulty];
    if (!shapes || shapes.length === 0) return null;

    // Select random shape
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    this.gameState.currentShape = randomShape;
    this.gameState.correctAnswer = randomShape.name;

    // Generate choices (correct answer + random wrong answers)
    const choices = [randomShape];
    const availableShapes = shapes.filter(s => s.name !== randomShape.name);
    
    // Add 3 random wrong answers
    const numChoices = Math.min(4, shapes.length);
    while (choices.length < numChoices && availableShapes.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableShapes.length);
      choices.push(availableShapes.splice(randomIndex, 1)[0]);
    }

    // Shuffle choices
    this.gameState.currentChoices = this.shuffleArray(choices);

    return {
      shape: randomShape,
      choices: this.gameState.currentChoices
    };
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

class UIManager {
  constructor(gameState, audioManager, effectsManager) {
    this.gameState = gameState;
    this.audioManager = audioManager;
    this.effectsManager = effectsManager;
  }

  showDifficultyScreen() {
    this.gameState.elements.difficultyScreen?.classList.remove('hidden');
    this.gameState.elements.gameScreen?.classList.add('hidden');
  }

  showGameScreen() {
    this.gameState.elements.difficultyScreen?.classList.add('hidden');
    this.gameState.elements.gameScreen?.classList.remove('hidden');
  }

  displayShape(shape) {
    const container = this.gameState.elements.shapeDisplay;
    if (!container || !shape) return;

    container.innerHTML = `<div class="shape ${shape.class}"></div>`;
  }

  displayChoices(choices) {
    const container = this.gameState.elements.choicesArea;
    if (!container || !choices) return;

    container.innerHTML = '';

    choices.forEach(choice => {
      const button = document.createElement('button');
      button.className = 'choice-btn';
      button.onclick = () => this.handleChoice(choice.name, button);
      
      button.innerHTML = `
        <div class="choice-shape ${choice.class}"></div>
        <span>${choice.name}</span>
      `;

      container.appendChild(button);
    });
  }

  handleChoice(selectedAnswer, button) {
    if (this.gameState.isAnswered) return;

    this.audioManager.playClickSound();
    this.gameState.isAnswered = true;
    this.gameState.totalCount++;

    const isCorrect = selectedAnswer === this.gameState.correctAnswer;

    if (isCorrect) {
      this.handleCorrectAnswer(button);
    } else {
      this.handleIncorrectAnswer(button);
    }

    this.gameState.updateScoreDisplay();
    this.showNextButton();
  }

  handleCorrectAnswer(button) {
    this.gameState.correctCount++;
    this.gameState.streakCount++;

    button.classList.add('correct');
    this.audioManager.playCorrectSound();
    this.showFeedback('せいかい！', 'correct');

    // Show effects for correct answers
    this.effectsManager.showStars();
    if (this.gameState.streakCount >= 3) {
      this.effectsManager.showConfetti();
    }

    // Show encouragement
    const encouragement = this.gameState.ENCOURAGEMENTS[
      Math.floor(Math.random() * this.gameState.ENCOURAGEMENTS.length)
    ];
    setTimeout(() => {
      this.effectsManager.showEncouragement(encouragement);
    }, 1000);
  }

  handleIncorrectAnswer(button) {
    this.gameState.streakCount = 0;

    button.classList.add('incorrect');
    this.audioManager.playIncorrectSound();
    this.showFeedback('ざんねん...', 'incorrect');

    // Highlight correct answer
    setTimeout(() => {
      this.highlightCorrectAnswer();
    }, 1000);
  }

  highlightCorrectAnswer() {
    const choices = this.gameState.elements.choicesArea?.querySelectorAll('.choice-btn');
    if (!choices) return;

    choices.forEach(choice => {
      const text = choice.textContent.trim();
      if (text === this.gameState.correctAnswer) {
        choice.classList.add('correct');
      }
    });
  }

  showFeedback(message, type) {
    const element = this.gameState.elements.feedback;
    if (!element) return;

    element.textContent = message;
    element.className = `feedback ${type}`;
    element.style.display = 'block';

    setTimeout(() => {
      element.style.display = 'none';
    }, 1500);
  }

  showNextButton() {
    const button = this.gameState.elements.nextBtn;
    if (button) {
      button.classList.remove('hidden');
    }
  }

  hideNextButton() {
    const button = this.gameState.elements.nextBtn;
    if (button) {
      button.classList.add('hidden');
    }
  }

  showHint() {
    const hintDisplay = this.gameState.elements.hintDisplay;
    const hintText = this.gameState.elements.hintText;
    
    if (!hintDisplay || !hintText || !this.gameState.currentShape) return;

    hintText.textContent = this.gameState.currentShape.hint;
    hintDisplay.classList.remove('hidden');
    this.audioManager.playClickSound();
  }

  closeHint() {
    const hintDisplay = this.gameState.elements.hintDisplay;
    if (hintDisplay) {
      hintDisplay.classList.add('hidden');
    }
    this.audioManager.playClickSound();
  }

  updateAudioToggle() {
    const toggle = this.gameState.elements.audioToggle;
    if (toggle) {
      toggle.textContent = this.gameState.audioEnabled ? '🔊' : '🔇';
      toggle.className = `audio-toggle ${this.gameState.audioEnabled ? '' : 'muted'}`;
    }
  }
}

// Main Game Controller
class ShapeExplorerGame {
  constructor() {
    this.gameState = new GameState();
    this.audioManager = new AudioManager(this.gameState);
    this.effectsManager = new EffectsManager(this.gameState);
    this.shapeGenerator = new ShapeGenerator(this.gameState);
    this.uiManager = new UIManager(this.gameState, this.audioManager, this.effectsManager);

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.gameState.cacheDOMElements();
    this.uiManager.showDifficultyScreen();
    this.uiManager.updateAudioToggle();

    // Add dynamic styles for animations
    this.addDynamicStyles();
  }

  addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes starTwinkle {
        0% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        100% { opacity: 0; transform: scale(0) rotate(360deg); }
      }
      
      @keyframes confettiFall {
        0% { 
          transform: translateY(-100vh) rotateZ(0deg); 
          opacity: 1; 
        }
        100% { 
          transform: translateY(100vh) rotateZ(720deg); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(style);
  }

  startGame(difficulty) {
    this.gameState.difficulty = difficulty;
    this.gameState.reset();
    this.uiManager.showGameScreen();
    this.generateNewProblem();
    this.audioManager.playClickSound();
  }

  generateNewProblem() {
    const problem = this.shapeGenerator.generateProblem();
    if (!problem) return;

    this.gameState.isAnswered = false;
    this.uiManager.hideNextButton();
    this.uiManager.displayShape(problem.shape);
    this.uiManager.displayChoices(problem.choices);
  }

  nextProblem() {
    this.generateNewProblem();
    this.audioManager.playClickSound();
  }

  backToDifficulty() {
    this.uiManager.showDifficultyScreen();
    this.audioManager.playClickSound();
  }

  showHint() {
    this.uiManager.showHint();
  }

  closeHint() {
    this.uiManager.closeHint();
  }

  toggleAudio() {
    this.gameState.audioEnabled = !this.gameState.audioEnabled;
    this.uiManager.updateAudioToggle();
    
    if (this.gameState.audioEnabled) {
      this.audioManager.playClickSound();
    }
  }
}

// Initialize game when script loads
const ShapeGame = new ShapeExplorerGame();