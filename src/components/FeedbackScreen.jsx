import React from 'react';

export function FeedbackScreen({ state, nextQuestion, generateFinalReport }) {
    const { allFeedbacks, currentQuestionIndex, isLoading } = state;
    const feedback = allFeedbacks[currentQuestionIndex];

    if (!feedback) return null;

    const { scores, strengths, missing_points } = feedback;

    const CircleRing = ({ score, label }) => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const dash = (score / 10) * circumference;
        return (
            <div className="score-ring" style={{ textAlign: 'center' }}>
                <svg width="100" height="100">
                    <circle cx="50" cy="50" r={radius} stroke="#3b494c" strokeWidth="8" fill="none" />
                    <circle
                        cx="50" cy="50" r={radius}
                        stroke="#00E5FF"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${dash} ${circumference}`}
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className="score-label">
                    {label}: {score}/10
                </div>
            </div>
        );
    };

    return (
        <div id="feedback-screen">
            <h2>Feedback for Question {currentQuestionIndex + 1}</h2>

            <div className="rings-container" style={{ display: 'flex', gap: '2rem' }}>
                <CircleRing score={scores?.content || 0} label="Content" />
                <CircleRing score={scores?.confidence || 0} label="Confidence" />
                <CircleRing score={scores?.clarity || 0} label="Clarity" />
            </div>

            <div className="feedback-details">
                <div className="strengths">
                    <h3>Strengths</h3>
                    <ul>
                        {strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div className="missing">
                    <h3>Missing Points</h3>
                    <ul>
                        {missing_points?.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                </div>
            </div>

            {currentQuestionIndex < 4 ? (
                <button id="next-question-btn" onClick={nextQuestion} disabled={isLoading}>
                    Next Question
                </button>
            ) : (
                <button id="view-final-report-btn" onClick={generateFinalReport} disabled={isLoading}>
                    {isLoading ? "Generating Report..." : "View Final Report"}
                </button>
            )}
        </div>
    );
}
