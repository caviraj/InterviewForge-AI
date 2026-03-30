import React, { useState, useEffect } from 'react';

export function InterviewScreen({ state, submitAnswer }) {
    const { questions, currentQuestionIndex, responseTime, isLoading } = state;
    const question = questions[currentQuestionIndex] || {};

    const [answer, setAnswer] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [fillerCount, setFillerCount] = useState(0);
    const [fillersFound, setFillersFound] = useState([]);

    useEffect(() => {
        const fillerWordsMap = /\b(um|uh|like|basically|you know)\b/gi;
        const matches = answer.match(fillerWordsMap) || [];
        setFillerCount(matches.length);
        setFillersFound([...new Set(matches.map(w => w.toLowerCase()))]);
    }, [answer]);

    const startVoice = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Your browser does not support Speech Recognition. You MUST use official Google Chrome.");
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            let currentInterim = '';
            let currentFinal = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    currentFinal += event.results[i][0].transcript;
                } else {
                    currentInterim += event.results[i][0].transcript;
                }
            }

            if (currentFinal) {
                setAnswer(prev => (prev + ' ' + currentFinal).trim());
            }
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === 'network') {
                alert("Microphone Error: 'network'. If you are using Chromium on Linux, Speech Recognition is completely blocked by Google. Please install and use official Google Chrome!");
            } else if (event.error === 'not-allowed') {
                alert("Microphone Error: You denied microphone permission, or the site is not secure! Reload http://localhost:5173/ and click 'Allow' or check your browser settings.");
            } else {
                alert("Microphone Error: " + event.error);
            }
        };

        recognition.onend = () => setIsListening(false);

        // Stop if already listening, otherwise start
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div id="interview-screen">
            <h2 id="question-text">{question.question}</h2>
            <div id="progress">Progress: {currentQuestionIndex + 1} / 5</div>
            <div id="timer">Time: {formatTime(responseTime)}</div>

            <div
                id="answer-display"
                style={{
                    minHeight: '100px',
                    border: '1px solid #3b494c',
                    padding: '1rem',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#10141a',
                    color: '#dfe2eb'
                }}>
                {answer || (isListening ? "Listening... Speak now!" : "Click 'Start Listening' and begin speaking...")}
            </div>

            <button id="voice-btn" onClick={startVoice} disabled={isLoading} style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}>
                {isListening ? "⏹ Stop Listening" : "🎤 Start Listening"}
            </button>

            <div id="filler-word-badge" style={{ marginTop: '1rem', marginBottom: '1rem' }}>Filler words detected: {fillerCount}</div>

            <button
                id="submit-answer"
                onClick={() => {
                    submitAnswer(answer, fillersFound);
                    setAnswer('');
                }}
                disabled={isLoading || !answer.trim()}
                style={{ padding: '0.5rem 1rem' }}
            >
                {isLoading ? "Grading..." : "Submit Answer"}
            </button>
        </div>
    );
}
