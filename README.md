# TOEIC Conversation Practice Web App

A modern web application for practicing TOEIC speaking questions with voice synthesis and timed practice sessions.

## Features

-   🎤 **Voice Synthesis**: Questions are read aloud using browser's speech synthesis
-   ⏱️ **Timed Practice**: Structured timing for preparation and answer phases
-   🔊 **Audio Feedback**: Countdown beeps and timer completion sounds
-   🎙️ **Voice Recording**: Record your answers and play them back
-   💾 **Recording Storage**: Automatically save recordings with metadata
-   ⚡ **Auto Advance**: Automatically move to next question after 3 seconds
-   📊 **Progress Tracking**: Track completion status for each topic
-   📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
-   🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations
-   ⌨️ **Keyboard Shortcuts**: Quick navigation with keyboard controls
-   📊 **Progress Tracking**: Visual progress indicators throughout the session

## Practice Flow

1. **Voice Reading**: Question is read aloud automatically
2. **Preparation Time**: 3 seconds to prepare your answer
3. **Answer Time**:
    - Q5 & Q6: 15 seconds
    - Q7: 30 seconds
    - Bonus questions: 20 seconds
4. **Next Question**: Automatic progression through all questions

## Installation

### Prerequisites

-   Python 3.7 or higher
-   Modern web browser with speech synthesis support

### Setup

1. **Clone or download the project files**

2. **Install Python dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3. **Run the application**:

    ```bash
    python app.py
    ```

4. **Open your browser** and navigate to:
    ```
    http://localhost:5000
    ```

## Usage

### Getting Started

1. Click "Start Practice" on the welcome screen
2. Choose a topic from the grid (shows completion status)
3. Listen to the question being read aloud
4. Use the 3-second preparation time to think
5. Speak your answer during the allocated time
6. Continue through all questions in the topic
7. Your progress is automatically saved for each topic

### Controls

#### Mouse/Touch

-   **Play/Pause Voice**: Click the play button
-   **Skip Voice**: Click "Skip Voice" to go directly to preparation
-   **Start Recording**: Click "Start Recording" during answer phase
-   **Stop Recording**: Click "Stop Recording" to end recording
-   **Play Recording**: Click "Play Recording" to hear your answer
-   **Auto Advance**: Toggle the switch to automatically move to next question
-   **Next Question**: Click "Next Question" after time's up
-   **Exit Practice**: Click the "Exit" button anytime

#### Keyboard Shortcuts

-   **Space**: Play/pause voice reading
-   **Enter**: Skip voice or go to next question
-   **Escape**: Exit practice session
-   **R**: Start/stop recording (during answer phase)

### Browser Compatibility

The app works best with modern browsers that support:

-   Speech Synthesis API
-   CSS Grid and Flexbox
-   ES6+ JavaScript features

**Recommended browsers**:

-   Chrome 66+
-   Firefox 60+
-   Safari 12+
-   Edge 79+

## File Structure

```
toeic/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── style.css     # Styles and animations
    └── js/
        └── app.js        # Application logic
```

## Customization

### Adding New Topics

Edit the `topics_data` list in `app.py` to add new topics and questions.

### Modifying Timing

Adjust the timing values in `static/js/app.js`:

-   Preparation time: `startPreparationPhase()` function
-   Answer times: `startAnswerPhase()` function

### Styling

Modify `static/css/style.css` to customize the appearance and animations.

## Troubleshooting

### Voice Not Working

-   Ensure your browser supports speech synthesis
-   Check that your system has audio enabled
-   Try refreshing the page
-   Some browsers require user interaction before playing audio

### App Won't Start

-   Verify Python 3.7+ is installed
-   Check that all dependencies are installed: `pip install -r requirements.txt`
-   Ensure port 5000 is not in use by another application

### Performance Issues

-   Close other browser tabs to free up memory
-   Disable browser extensions that might interfere
-   Try a different browser if issues persist

## Development

### Running in Development Mode

The app runs in debug mode by default. For production, set:

```python
app.run(debug=False, host='0.0.0.0', port=5000)
```

### Adding Features

-   Voice settings can be modified in the `playQuestionVoice()` function
-   New phases can be added by extending the phase management system
-   Additional keyboard shortcuts can be added to the event listener

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Verify browser compatibility
3. Ensure all dependencies are properly installed

---

**Happy practicing! 🎤✨**
