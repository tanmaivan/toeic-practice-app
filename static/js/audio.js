// Audio utility functions for TOEIC Practice App

// Generate a beep sound using Web Audio API
function generateBeep(frequency = 800, duration = 200, volume = 0.3) {
    const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Generate countdown beep (higher pitch)
function generateCountdownBeep() {
    generateBeep(1000, 150, 0.2);
}

// Generate timer up sound (lower pitch, longer)
function generateTimerUpSound() {
    generateBeep(400, 500, 0.4);
}

// Generate warning sound (medium pitch)
function generateWarningSound() {
    generateBeep(600, 300, 0.3);
}

// Generate start answer sound (different pitch to indicate start)
function generateStartAnswerSound() {
    generateBeep(800, 400, 0.4);
}

// Create audio elements with better sounds
function createAudioElements() {
    // Create countdown beep using Web Audio API
    const countdownBeep = () => generateCountdownBeep();

    // Create timer up sound using Web Audio API
    const timerUpSound = () => generateTimerUpSound();

    return {
        countdownBeep,
        timerUpSound,
    };
}

// Export for use in main app
window.AudioUtils = {
    generateBeep,
    generateCountdownBeep,
    generateTimerUpSound,
    generateWarningSound,
    generateStartAnswerSound,
    createAudioElements,
};
