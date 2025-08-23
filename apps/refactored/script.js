/**
 * Addition Math Game - JavaScript Logic
 * Purpose: Handles game logic, state management, and user interactions for the addition math game
 * Dependencies: DOM elements from index.html, styles from styles.css
 * Features: Problem generation, score tracking, audio feedback, visual effects
 */

// ===== GAME STATE MANAGEMENT =====
/**
 * GameState class to encapsulate all game-related state and prevent global variable pollution
 */
class GameState {
    constructor() {
        this.currentProblem = {};
        this.correctCount = 0;
        this.totalCount = 0;
        this.streakCount = 0;
        this.isAnswered = false;
        this.difficulty = 'easy';
        this.audioContext = null;
        
        // Configuration constants
        this.DIFFICULTY_RANGES = {
            easy: { min: 1, max: 10 },
            medium: { min: 1, max: 20 },
            hard: { min: 1, max: 50 }
        };
        
        // Cached DOM elements for performance
        this.elements = {};
    }

    /**
     * Cache DOM elements to avoid repeated queries
     */
    cacheDOMElements() {
        this.elements = {
            problem: document.getElementById('problem'),
            answer: document.getElementById('answer'),
            feedback: document.getElementById('feedback'),
            correctCount: document.getElementById('correct-count'),
            totalCount: document.getElementById('total-count'),
            streakCount: document.getElementById('streak-count'),
            encouragement: document.getElementById('encouragement'),
            stars: document.getElementById('stars'),
            confetti: document.getElementById('confetti')
        };
    }

    /**
     * Reset game state
     */
    reset() {
        this.currentProblem = {};
        this.correctCount = 0;
        this.totalCount = 0;
        this.streakCount = 0;
        this.isAnswered = false;
        this.updateScoreDisplay();
    }

    /**
     * Update score display elements
     */
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

// ===== AUDIO MANAGEMENT =====
/**
 * AudioManager class to handle all audio-related functionality
 */
class AudioManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Initialize audio context (called on first user interaction)
     */
    initAudio() {
        if (!this.gameState.audioContext) {
            try {
                this.gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Audio not supported');
            }
        }
    }

    /**
     * Play success sound (Do-Mi-So chord)
     */
    playSuccessSound() {
        if (!this.gameState.audioContext) return;
        
        const frequencies = [523, 659, 784]; // Do-Mi-So
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'triangle', 0.1);
            }, index * 100);
        });
    }

    /**
     * Play error sound
     */
    playErrorSound() {
        if (!this.gameState.audioContext) return;
        this.playTone(200, 0.2, 'sawtooth', 0.05);
    }

    /**
     * Generic tone generator
     */
    playTone(frequency, duration, waveType = 'sine', volume = 0.1) {
        if (!this.gameState.audioContext) return;

        const oscillator = this.gameState.audioContext.createOscillator();
        const gainNode = this.gameState.audioContext.createGain();
        
        oscillator.frequency.value = frequency;
        oscillator.type = waveType;
        
        gainNode.gain.value = volume;
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.gameState.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gameState.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.gameState.audioContext.currentTime + duration);
    }
}

// ===== VISUAL EFFECTS MANAGER =====
/**
 * EffectsManager class to handle animations and visual feedback
 */
class EffectsManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Create star animation effect
     */
    createStars() {
        const starsContainer = this.gameState.elements.stars;
        if (!starsContainer) return;
        
        for (let i = 0; i < 12; i++) {
            const star = document.createElement('div');
            star.textContent = '⭐';
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            starsContainer.appendChild(star);
            
            // Clean up after animation
            this.scheduleCleanup(star, 3000);
        }
    }

    /**
     * Create confetti animation effect
     */
    createConfetti() {
        const confettiContainer = this.gameState.elements.confetti;
        if (!confettiContainer) return;
        
        const colors = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#5352ed', '#ff6b81'];
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.3 + 's';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confettiContainer.appendChild(confetti);
            
            // Clean up after animation
            this.scheduleCleanup(confetti, 2000);
        }
    }

    /**
     * Schedule element cleanup to prevent memory leaks
     */
    scheduleCleanup(element, delay) {
        setTimeout(() => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, delay);
    }
}

// ===== INPUT VALIDATION =====
/**
 * InputValidator class to handle user input processing and validation
 */
class InputValidator {
    /**
     * Convert full-width numbers to half-width
     */
    convertToHalfWidth(str) {
        return str.replace(/[０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
    }

    /**
     * Extract only numeric characters
     */
    extractNumbers(str) {
        return str.replace(/[^0-9]/g, '');
    }

    /**
     * Validate and sanitize user input
     */
    validateInput(inputValue) {
        if (!inputValue) {
            return { isValid: false, value: null, error: 'すうじを いれてね！' };
        }

        // Convert and sanitize input
        let processedValue = this.convertToHalfWidth(inputValue);
        processedValue = this.extractNumbers(processedValue);
        
        const numericValue = parseInt(processedValue);
        
        if (isNaN(numericValue)) {
            return { isValid: false, value: null, error: 'すうじを いれてね！' };
        }

        return { isValid: true, value: numericValue, error: null };
    }
}

// ===== PROBLEM GENERATOR =====
/**
 * ProblemGenerator class to create math problems based on difficulty
 */
class ProblemGenerator {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Generate a new math problem based on current difficulty
     */
    generateProblem() {
        const range = this.gameState.DIFFICULTY_RANGES[this.gameState.difficulty];
        
        const num1 = Math.floor(Math.random() * range.max) + range.min;
        const num2 = Math.floor(Math.random() * range.max) + range.min;
        
        this.gameState.currentProblem = {
            num1: num1,
            num2: num2,
            answer: num1 + num2
        };

        return this.gameState.currentProblem;
    }
}

// ===== UI MANAGER =====
/**
 * UIManager class to handle all UI updates and interactions
 */
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Message arrays
        this.encouragements = [
            "🎉 すごい！せいかい！",
            "✨ やったね！",
            "🌟 かんぺき！",
            "🎊 おめでとう！",
            "💫 すばらしい！",
            "🏆 よくできました！",
            "🎈 だいせいかい！",
            "⭐ すてき！",
            "🌈 おしゃれ！"
        ];

        this.tryAgainMessages = [
            "😊 もういちど がんばって！",
            "🤔 ちがうよ。もういちど！",
            "💪 あとすこし！がんばって！",
            "🌈 だいじょうぶ！もういちど！",
            "🎯 おしい！もういちど！",
            "🤗 もう一回 やってみよう！"
        ];

        this.streakMessages = [
            "🔥 れんぞく せいかい！",
            "⚡ ちょうし いいね！",
            "🚀 すごい ちから！",
            "🌟 きみは てんさい！"
        ];
    }

    /**
     * Update the problem display
     */
    updateProblemDisplay(problem) {
        if (this.gameState.elements.problem) {
            this.gameState.elements.problem.textContent = `${problem.num1} + ${problem.num2}`;
        }
    }

    /**
     * Clear input and feedback
     */
    clearInputAndFeedback() {
        if (this.gameState.elements.answer) {
            this.gameState.elements.answer.value = '';
            this.gameState.elements.answer.focus();
        }
        if (this.gameState.elements.feedback) {
            this.gameState.elements.feedback.textContent = '';
            this.gameState.elements.feedback.className = 'feedback';
        }
        if (this.gameState.elements.encouragement) {
            this.gameState.elements.encouragement.classList.add('hidden');
        }
        this.removeNextButton();
    }

    /**
     * Display correct answer feedback
     */
    displayCorrectFeedback() {
        const feedback = this.gameState.elements.feedback;
        if (!feedback) return;

        const randomMessage = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
        feedback.textContent = randomMessage;
        feedback.className = 'feedback correct';

        this.addNextButton();
    }

    /**
     * Display incorrect answer feedback
     */
    displayIncorrectFeedback() {
        const feedback = this.gameState.elements.feedback;
        if (!feedback) return;

        const randomMessage = this.tryAgainMessages[Math.floor(Math.random() * this.tryAgainMessages.length)];
        feedback.textContent = randomMessage;
        feedback.className = 'feedback incorrect';

        // Clear input after delay for retry
        setTimeout(() => {
            if (this.gameState.elements.answer) {
                this.gameState.elements.answer.value = '';
                this.gameState.elements.answer.focus();
            }
        }, 1000);
    }

    /**
     * Display input validation error
     */
    displayValidationError(errorMessage) {
        const feedback = this.gameState.elements.feedback;
        if (!feedback) return;

        feedback.textContent = errorMessage;
        feedback.className = 'feedback incorrect';
    }

    /**
     * Show streak achievement message
     */
    showStreakMessage(streakCount) {
        const encouragementBox = this.gameState.elements.encouragement;
        if (!encouragementBox) return;

        const randomMessage = this.streakMessages[Math.floor(Math.random() * this.streakMessages.length)];
        encouragementBox.textContent = `${randomMessage} (${streakCount}れんぞく)`;
        encouragementBox.classList.remove('hidden');
    }

    /**
     * Add next problem button
     */
    addNextButton() {
        const feedback = this.gameState.elements.feedback;
        if (!feedback) return;

        this.removeNextButton(); // Remove existing button first

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'つぎのもんだい';
        nextBtn.className = 'btn btn-secondary';
        nextBtn.onclick = () => MathGame.generateNewProblem();
        feedback.appendChild(nextBtn);
    }

    /**
     * Remove next problem button
     */
    removeNextButton() {
        const existingBtn = document.querySelector('.btn-secondary');
        if (existingBtn) {
            existingBtn.remove();
        }
    }

    /**
     * Update difficulty button states
     */
    updateDifficultyButtons(selectedLevel) {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const selectedBtn = document.querySelector(`[data-level="${selectedLevel}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
    }
}

// ===== MAIN GAME CLASS =====
/**
 * MathGame class - Main game controller that coordinates all other components
 */
class MathGame {
    constructor() {
        this.gameState = new GameState();
        this.audioManager = new AudioManager(this.gameState);
        this.effectsManager = new EffectsManager(this.gameState);
        this.inputValidator = new InputValidator();
        this.problemGenerator = new ProblemGenerator(this.gameState);
        this.uiManager = new UIManager(this.gameState);
    }

    /**
     * Initialize the game
     */
    init() {
        this.gameState.cacheDOMElements();
        this.setupEventListeners();
        this.generateNewProblem();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Input field event listeners
        const answerInput = this.gameState.elements.answer;
        if (answerInput) {
            // Input validation and formatting
            answerInput.addEventListener('input', (e) => {
                let value = e.target.value;
                value = this.inputValidator.convertToHalfWidth(value);
                value = this.inputValidator.extractNumbers(value);
                
                // Limit to 3 digits
                if (value.length > 3) {
                    value = value.substring(0, 3);
                }
                
                e.target.value = value;
            });

            // Enter key to submit answer
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        }

        // Initialize audio on first user interaction
        document.addEventListener('click', () => this.audioManager.initAudio(), { once: true });
        document.addEventListener('touchstart', () => this.audioManager.initAudio(), { once: true });
    }

    /**
     * Generate a new problem
     */
    generateNewProblem() {
        const problem = this.problemGenerator.generateProblem();
        this.uiManager.updateProblemDisplay(problem);
        this.uiManager.clearInputAndFeedback();
        this.gameState.isAnswered = false;
    }

    /**
     * Set game difficulty
     */
    setDifficulty(level) {
        this.gameState.difficulty = level;
        this.uiManager.updateDifficultyButtons(level);
        this.generateNewProblem();
    }

    /**
     * Check user's answer - main validation logic
     */
    checkAnswer() {
        if (this.gameState.isAnswered) return;

        const userInput = this.gameState.elements.answer?.value || '';
        const validation = this.inputValidator.validateInput(userInput);

        if (!validation.isValid) {
            this.uiManager.displayValidationError(validation.error);
            this.audioManager.playErrorSound();
            return;
        }

        this.processAnswer(validation.value);
    }

    /**
     * Process validated answer
     */
    processAnswer(userAnswer) {
        this.updateGameStats();

        if (userAnswer === this.gameState.currentProblem.answer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
    }

    /**
     * Update game statistics
     */
    updateGameStats() {
        this.gameState.totalCount++;
        this.gameState.updateScoreDisplay();
    }

    /**
     * Handle correct answer
     */
    handleCorrectAnswer() {
        this.gameState.correctCount++;
        this.gameState.streakCount++;
        this.gameState.updateScoreDisplay();
        this.gameState.isAnswered = true;

        // UI feedback
        this.uiManager.displayCorrectFeedback();

        // Audio and visual effects
        this.audioManager.playSuccessSound();
        this.effectsManager.createStars();
        this.effectsManager.createConfetti();

        // Show streak message for achievements
        if (this.gameState.streakCount >= 3 && this.gameState.streakCount % 3 === 0) {
            this.uiManager.showStreakMessage(this.gameState.streakCount);
        }
    }

    /**
     * Handle incorrect answer
     */
    handleIncorrectAnswer() {
        this.gameState.streakCount = 0; // Reset streak
        this.gameState.updateScoreDisplay();

        // UI feedback
        this.uiManager.displayIncorrectFeedback();

        // Audio feedback
        this.audioManager.playErrorSound();

        // Hide encouragement message
        if (this.gameState.elements.encouragement) {
            this.gameState.elements.encouragement.classList.add('hidden');
        }
    }

    /**
     * Navigate back to menu
     */
    goBack() {
        if (confirm('メニューに戻りますか？')) {
            window.history.back();
        }
    }
}

// ===== INITIALIZATION =====
// Create global game instance for compatibility with inline event handlers
window.MathGame = new MathGame();

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MathGame.init();
});

// Fallback for cases where DOMContentLoaded already fired
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    MathGame.init();
}