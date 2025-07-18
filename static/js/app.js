// Global variables
let currentTopic = null;
let currentQuestionIndex = 0;
let topicsData = [];
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Audio elements
let countdownAudio = null;
let timerUpAudio = null;

// Auto advance settings
let autoAdvanceEnabled = false;
let autoAdvanceTimer = null;

// Timer variables for clearing when exiting
let prepInterval = null;
let answerInterval = null;

// Practice state tracking
let isPracticeActive = false;

// Completion tracking
let topicCompletions = JSON.parse(
    localStorage.getItem("topicCompletions") || "{}"
);

// DOM elements
const screens = {
    welcome: document.getElementById("welcome-screen"),
    topic: document.getElementById("topic-screen"),
    practice: document.getElementById("practice-screen"),
    completion: document.getElementById("completion-screen"),
};

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
    loadTopics();
    setupEventListeners();
    initializeAudio();

    // Reset current topic and question index on page load
    currentTopic = null;
    currentQuestionIndex = 0;
    isPracticeActive = false;
});

// Initialize audio elements
function initializeAudio() {
    // Use Web Audio API for better sound quality
    if (window.AudioUtils) {
        countdownAudio = window.AudioUtils.generateCountdownBeep;
        timerUpAudio = window.AudioUtils.generateTimerUpSound;
    } else {
        // Fallback to basic audio elements
        countdownAudio = new Audio();
        countdownAudio.src =
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
        countdownAudio.load();

        timerUpAudio = new Audio();
        timerUpAudio.src =
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
        timerUpAudio.load();
    }
}

// Load topics from the server
async function loadTopics() {
    try {
        const response = await fetch("/api/topics");
        topicsData = await response.json();
        populateTopicsGrid();
    } catch (error) {
        console.error("Error loading topics:", error);
        // Fallback to hardcoded data if API fails
        topicsData = window.topicsData || [];
        populateTopicsGrid();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Welcome screen
    document
        .getElementById("start-btn")
        .addEventListener("click", showTopicScreen);

    // Practice screen
    document
        .getElementById("exit-practice")
        .addEventListener("click", exitPractice);
    document
        .getElementById("play-voice")
        .addEventListener("click", playQuestionVoice);
    document.getElementById("skip-voice").addEventListener("click", skipVoice);
    document
        .getElementById("next-question")
        .addEventListener("click", nextQuestion);

    // Auto advance toggle
    document
        .getElementById("auto-advance-toggle")
        .addEventListener("change", toggleAutoAdvance);

    // Completion screen
    document
        .getElementById("practice-again")
        .addEventListener("click", practiceAgain);
    document
        .getElementById("choose-topic")
        .addEventListener("click", showTopicScreen);
}

// Screen navigation functions
function showScreen(screenId) {
    Object.values(screens).forEach((screen) => {
        screen.classList.remove("active");
    });
    screens[screenId].classList.add("active");
}

function showWelcomeScreen() {
    showScreen("welcome");
}

function showTopicScreen() {
    showScreen("topic");
    populateTopicsGrid(); // Refresh completion status

    // Set practice as inactive and reset state
    isPracticeActive = false;
    currentTopic = null;
    currentQuestionIndex = 0;
}

function showPracticeScreen() {
    showScreen("practice");
}

function showCompletionScreen() {
    showScreen("completion");
    updateCompletionStats();
}

// Populate topics grid
function populateTopicsGrid() {
    const container = document.getElementById("topics-container");
    container.innerHTML = "";

    topicsData.forEach((topic, index) => {
        const completionStatus = getTopicCompletionStatus(index);
        const topicCard = document.createElement("div");
        topicCard.className = "topic-card";
        topicCard.innerHTML = `
            <h3>${topic.title}</h3>
            <p>${topic.questions.length} questions</p>
            <div class="completion-status">
                ${completionStatus}
            </div>
        `;
        topicCard.addEventListener("click", () => startTopic(index));
        container.appendChild(topicCard);
    });
}

// Get completion status for a topic
function getTopicCompletionStatus(topicIndex) {
    const topicKey = `topic_${topicIndex}`;
    const completion = topicCompletions[topicKey];

    if (!completion) {
        return '<span class="completion-badge not-started"><i class="fas fa-circle"></i> Not Started</span>';
    }

    if (completion.completed) {
        return `<span class="completion-badge completed"><i class="fas fa-check-circle"></i> Completed</span>`;
    } else {
        const progress = completion.currentQuestion || 0;
        const total = topicsData[topicIndex].questions.length;
        return `<span class="completion-badge in-progress"><i class="fas fa-clock"></i> ${progress}/${total} Questions</span>`;
    }
}

// Start a specific topic
function startTopic(topicIndex) {
    currentTopic = topicsData[topicIndex];
    // Always start from question 1 (index 0)
    currentQuestionIndex = 0;

    // Reset completion status to start from beginning
    updateTopicCompletion(topicIndex, 0, false);

    // Set practice as active
    isPracticeActive = true;

    // Update UI
    document.getElementById("current-topic-title").textContent =
        currentTopic.title;
    updateProgress();

    showPracticeScreen();
    startQuestion();
}

// Get current question for a topic
function getTopicCurrentQuestion(topicIndex) {
    const topicKey = `topic_${topicIndex}`;
    const completion = topicCompletions[topicKey];
    return completion ? completion.currentQuestion || 0 : 0;
}

// Update topic completion status
function updateTopicCompletion(topicIndex, currentQuestion, completed = false) {
    const topicKey = `topic_${topicIndex}`;
    topicCompletions[topicKey] = {
        currentQuestion: currentQuestion,
        completed: completed,
        lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("topicCompletions", JSON.stringify(topicCompletions));
}

// Start the current question
function startQuestion() {
    if (currentQuestionIndex >= currentTopic.questions.length) {
        // Mark topic as completed
        const topicIndex = topicsData.findIndex(
            (topic) => topic.title === currentTopic.title
        );
        if (topicIndex !== -1) {
            updateTopicCompletion(
                topicIndex,
                currentTopic.questions.length,
                true
            );
        }
        showCompletionScreen();
        return;
    }

    const question = currentTopic.questions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 5; // Q5, Q6, Q7...

    // Update question display
    document.getElementById("question-text").textContent = question;
    document.getElementById("answer-question-text").textContent = question;
    document.getElementById("prep-question-text").textContent = question;

    // Update progress
    updateProgress();

    // Reset UI elements for new question
    const nextQuestionButton = document.getElementById("next-question");
    const countdownElement = document.getElementById("auto-advance-countdown");

    if (nextQuestionButton) {
        nextQuestionButton.style.display = "inline-flex";
    }
    if (countdownElement) {
        countdownElement.classList.add("hidden");
    }

    // Show voice phase
    showPhase("voice");

    // Auto-play voice after a short delay
    setTimeout(() => {
        playQuestionVoice();
    }, 500);
}

// Show specific phase
function showPhase(phaseName) {
    const phases = ["voice", "prep", "answer", "times-up"];
    phases.forEach((phase) => {
        const element = document.getElementById(`${phase}-phase`);
        if (element) {
            element.classList.add("hidden");
        }
    });

    const targetPhase = document.getElementById(`${phaseName}-phase`);
    if (targetPhase) {
        targetPhase.classList.remove("hidden");
    }
}

// Play question voice using speech synthesis
function playQuestionVoice() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    const question = currentTopic.questions[currentQuestionIndex];
    const utterance = new SpeechSynthesisUtterance(question);

    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use an English voice
    const voices = speechSynthesis.getVoices();
    const englishVoice =
        voices.find(
            (voice) =>
                voice.lang.startsWith("en") && voice.name.includes("Google")
        ) || voices.find((voice) => voice.lang.startsWith("en"));

    if (englishVoice) {
        utterance.voice = englishVoice;
    }

    // Event handlers
    utterance.onstart = () => {
        if (!isPracticeActive) return;

        document.getElementById("play-voice").innerHTML =
            '<i class="fas fa-pause"></i> Pause';
        document.getElementById("play-voice").onclick = pauseVoice;
    };

    utterance.onend = () => {
        if (!isPracticeActive) return;

        document.getElementById("play-voice").innerHTML =
            '<i class="fas fa-play"></i> Play Question';
        document.getElementById("play-voice").onclick = playQuestionVoice;
        startPreparationPhase();
    };

    utterance.onerror = (event) => {
        if (!isPracticeActive) return;

        console.error("Speech synthesis error:", event);
        document.getElementById("play-voice").innerHTML =
            '<i class="fas fa-play"></i> Play Question';
        document.getElementById("play-voice").onclick = playQuestionVoice;
        // If voice fails, automatically start preparation phase
        setTimeout(() => {
            if (isPracticeActive) {
                startPreparationPhase();
            }
        }, 1000);
    };

    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
}

// Pause voice
function pauseVoice() {
    if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        document.getElementById("play-voice").innerHTML =
            '<i class="fas fa-play"></i> Resume';
        document.getElementById("play-voice").onclick = resumeVoice;
    }
}

// Resume voice
function resumeVoice() {
    if (speechSynthesis.paused) {
        speechSynthesis.resume();
        document.getElementById("play-voice").innerHTML =
            '<i class="fas fa-pause"></i> Pause';
        document.getElementById("play-voice").onclick = pauseVoice;
    }
}

// Skip voice and go directly to preparation
function skipVoice() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    startPreparationPhase();
}

// Start preparation phase (3 seconds)
function startPreparationPhase() {
    if (!isPracticeActive) return;

    showPhase("prep");

    let prepTime = 3;
    const prepTimer = document.getElementById("prep-timer");

    // Clear any existing prep interval
    if (prepInterval) {
        clearInterval(prepInterval);
    }

    // Set initial value and play first sound
    prepTimer.textContent = prepTime;
    playCountdownSound();

    prepInterval = setInterval(() => {
        if (!isPracticeActive) {
            clearInterval(prepInterval);
            prepInterval = null;
            return;
        }

        prepTime--;
        prepTimer.textContent = prepTime;

        // Play countdown sound for remaining seconds
        if (prepTime > 0) {
            playCountdownSound();
        }

        if (prepTime <= 0) {
            clearInterval(prepInterval);
            prepInterval = null;
            // Play start answer sound
            playStartAnswerSound();
            startAnswerPhase();
        }
    }, 1000);
}

// Start answer phase
function startAnswerPhase() {
    if (!isPracticeActive) return;

    showPhase("answer");

    // Determine answer time based on question number
    const questionNumber = currentQuestionIndex + 5;
    let answerTime = 30; // Default for Q7

    if (questionNumber === 5 || questionNumber === 6) {
        answerTime = 15;
    } else if (questionNumber === 7) {
        answerTime = 30;
    } else if (
        questionNumber === 8 &&
        currentTopic.questions[currentQuestionIndex].includes("Bonus Question")
    ) {
        answerTime = 20; // Bonus question gets 20 seconds
    }

    const answerTimer = document.getElementById("answer-timer");
    answerTimer.textContent = answerTime;

    // Clear any existing answer interval
    if (answerInterval) {
        clearInterval(answerInterval);
    }

    answerInterval = setInterval(() => {
        if (!isPracticeActive) {
            clearInterval(answerInterval);
            answerInterval = null;
            return;
        }

        answerTime--;
        answerTimer.textContent = answerTime;

        if (answerTime <= 0) {
            clearInterval(answerInterval);
            answerInterval = null;
            showTimesUpPhase();
        }
    }, 1000);
}

// Show times up phase
function showTimesUpPhase() {
    showPhase("times-up");
    playTimerUpSound();

    const nextQuestionButton = document.getElementById("next-question");
    const countdownElement = document.getElementById("auto-advance-countdown");

    // Auto advance to next question after 3 seconds if enabled
    if (autoAdvanceEnabled) {
        // Hide the next question button and show countdown
        if (nextQuestionButton) {
            nextQuestionButton.style.display = "none";
        }
        if (countdownElement) {
            countdownElement.classList.remove("hidden");
        }
        startAutoAdvanceTimer();
    } else {
        // Show the next question button and hide countdown
        if (nextQuestionButton) {
            nextQuestionButton.style.display = "inline-flex";
        }
        if (countdownElement) {
            countdownElement.classList.add("hidden");
        }
    }
}

// Toggle auto advance feature
function toggleAutoAdvance() {
    autoAdvanceEnabled = document.getElementById("auto-advance-toggle").checked;

    if (autoAdvanceEnabled) {
        console.log("Auto advance enabled");
    } else {
        console.log("Auto advance disabled");
        // Clear any existing auto advance timer and show next question button
        clearAutoAdvanceTimer();
    }
}

// Start auto advance timer
function startAutoAdvanceTimer() {
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
    }

    // Show countdown display
    const countdownElement = document.getElementById("auto-advance-countdown");
    const countdownSecondsElement =
        document.getElementById("countdown-seconds");

    if (countdownElement && countdownSecondsElement) {
        countdownElement.classList.remove("hidden");

        let secondsLeft = 3;
        countdownSecondsElement.textContent = secondsLeft;

        // Add click event listener to countdown
        const handleCountdownClick = () => {
            clearInterval(countdownInterval);
            countdownElement.classList.add("hidden");
            nextQuestion();
        };

        countdownElement.addEventListener("click", handleCountdownClick);

        const countdownInterval = setInterval(() => {
            secondsLeft--;
            countdownSecondsElement.textContent = secondsLeft;

            if (secondsLeft <= 0) {
                clearInterval(countdownInterval);
                countdownElement.classList.add("hidden");
                countdownElement.removeEventListener(
                    "click",
                    handleCountdownClick
                );
                if (autoAdvanceEnabled) {
                    nextQuestion();
                }
            }
        }, 1000);

        // Store the interval ID to clear it if needed
        autoAdvanceTimer = countdownInterval;
    } else {
        // Fallback to simple timeout if elements not found
        autoAdvanceTimer = setTimeout(() => {
            if (autoAdvanceEnabled) {
                nextQuestion();
            }
        }, 3000);
    }
}

// Clear auto advance timer
function clearAutoAdvanceTimer() {
    if (autoAdvanceTimer) {
        // Clear both timeout and interval
        clearTimeout(autoAdvanceTimer);
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }

    // Hide countdown display and show next question button
    const countdownElement = document.getElementById("auto-advance-countdown");
    const nextQuestionButton = document.getElementById("next-question");

    if (countdownElement) {
        countdownElement.classList.add("hidden");
    }

    if (nextQuestionButton) {
        nextQuestionButton.style.display = "inline-flex";
    }
}

// Clear all timers and audio
function clearAllTimersAndAudio() {
    // Clear speech synthesis
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    // Clear auto advance timer
    clearAutoAdvanceTimer();

    // Clear preparation timer
    if (prepInterval) {
        clearInterval(prepInterval);
        prepInterval = null;
    }

    // Clear answer timer
    if (answerInterval) {
        clearInterval(answerInterval);
        answerInterval = null;
    }

    // Stop any playing audio
    if (countdownAudio && typeof countdownAudio.stop === "function") {
        countdownAudio.stop();
    }
    if (timerUpAudio && typeof timerUpAudio.stop === "function") {
        timerUpAudio.stop();
    }
}

// Play countdown sound
function playCountdownSound() {
    if (countdownAudio) {
        if (typeof countdownAudio === "function") {
            countdownAudio();
        } else {
            countdownAudio.currentTime = 0;
            countdownAudio
                .play()
                .catch((e) => console.log("Audio play failed:", e));
        }
    }
}

// Play timer up sound
function playTimerUpSound() {
    if (timerUpAudio) {
        if (typeof timerUpAudio === "function") {
            timerUpAudio();
        } else {
            timerUpAudio.currentTime = 0;
            timerUpAudio
                .play()
                .catch((e) => console.log("Audio play failed:", e));
        }
    }
}

// Play start answer sound
function playStartAnswerSound() {
    if (window.AudioUtils) {
        window.AudioUtils.generateStartAnswerSound();
    }
}

// Move to next question
function nextQuestion() {
    clearAutoAdvanceTimer(); // Clear any existing auto advance timer and hide countdown

    // Update completion status
    const topicIndex = topicsData.findIndex(
        (topic) => topic.title === currentTopic.title
    );
    if (topicIndex !== -1) {
        updateTopicCompletion(topicIndex, currentQuestionIndex + 1, false);
    }

    currentQuestionIndex++;
    startQuestion();
}

// Update progress bar and counter
function updateProgress() {
    const totalQuestions = currentTopic.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    document.getElementById("progress-fill").style.width = `${progress}%`;
    document.getElementById("question-counter").textContent = `Question ${
        currentQuestionIndex + 1
    } of ${totalQuestions}`;
}

// Update completion statistics
function updateCompletionStats() {
    document.getElementById("total-questions").textContent =
        currentTopic.questions.length;
}

// Exit practice and return to topic selection
function exitPractice() {
    // Set practice as inactive
    isPracticeActive = false;

    // Clear all timers and audio
    clearAllTimersAndAudio();

    // Reset current question index to 0 when exiting
    currentQuestionIndex = 0;

    // Reset completion status for current topic to start from beginning
    if (currentTopic) {
        const topicIndex = topicsData.findIndex(
            (topic) => topic.title === currentTopic.title
        );
        if (topicIndex !== -1) {
            updateTopicCompletion(topicIndex, 0, false);
        }
    }

    showTopicScreen();
}

// Practice the same topic again
function practiceAgain() {
    // Clear all timers and audio
    clearAllTimersAndAudio();

    // Set practice as active
    isPracticeActive = true;

    // Reset completion status for this topic
    const topicIndex = topicsData.findIndex(
        (topic) => topic.title === currentTopic.title
    );
    if (topicIndex !== -1) {
        updateTopicCompletion(topicIndex, 0, false);
    }

    currentQuestionIndex = 0;
    showPracticeScreen();
    startQuestion();
}

// Handle speech synthesis voices loading
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function () {
        // Voices are now loaded
        console.log("Speech synthesis voices loaded");
    };
}

// Handle page visibility change to pause speech when tab is not active
document.addEventListener("visibilitychange", function () {
    if (document.hidden && speechSynthesis.speaking) {
        speechSynthesis.pause();
    }
});

// Handle beforeunload to clean up speech synthesis and reset progress
window.addEventListener("beforeunload", function () {
    // Clear all timers and audio
    clearAllTimersAndAudio();

    // Reset current question index to 0 when refreshing
    currentQuestionIndex = 0;

    // Reset completion status for current topic to start from beginning
    if (currentTopic) {
        const topicIndex = topicsData.findIndex(
            (topic) => topic.title === currentTopic.title
        );
        if (topicIndex !== -1) {
            updateTopicCompletion(topicIndex, 0, false);
        }
    }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (event) {
    // Space bar to play/pause voice
    if (event.code === "Space" && !event.target.matches("input, textarea")) {
        event.preventDefault();
        const playButton = document.getElementById("play-voice");
        if (playButton && !playButton.classList.contains("hidden")) {
            playButton.click();
        }
    }

    // Enter to skip voice or go to next question
    if (event.code === "Enter" && !event.target.matches("input, textarea")) {
        event.preventDefault();
        const skipButton = document.getElementById("skip-voice");
        const nextButton = document.getElementById("next-question");

        if (skipButton && !skipButton.classList.contains("hidden")) {
            skipButton.click();
        } else if (nextButton && !nextButton.classList.contains("hidden")) {
            nextButton.click();
        }
    }

    // Escape to exit practice
    if (event.code === "Escape") {
        const exitButton = document.getElementById("exit-practice");
        if (exitButton && !exitButton.classList.contains("hidden")) {
            exitButton.click();
        }
    }
});
