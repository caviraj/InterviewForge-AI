import { useState, useEffect, useRef } from "react";
import { callGroq } from "../lib/groq";

const INITIAL_STATE = {
    selectedRole: "",
    questions: [],
    currentQuestionIndex: 0,
    allFeedbacks: [],
    finalReport: null,
    screen: "role_select", // "role_select" | "interview" | "feedback" | "final_report"
    isLoading: false,
    responseTime: 0,
};

export function useInterviewState() {
    const [state, setState] = useState(INITIAL_STATE);
    const timerRef = useRef(null);

    const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

    const startTimer = () => {
        updateState({ responseTime: 0 });
        timerRef.current = setInterval(() => {
            setState((prev) => ({ ...prev, responseTime: prev.responseTime + 1 }));
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const selectRole = async (role) => {
        updateState({ selectedRole: role, isLoading: true });
        try {
            const prompt = `Generate 5 interview questions for role: ${role}.
      Return ONLY JSON:
      {
        "questions": [
          {
            "id": 1,
            "type": "technical",
            "question": "",
            "ideal_keywords": [],
            "ideal_answer_points": []
          }
        ]
      }`;
            const response = await callGroq(prompt);
            updateState({
                questions: response.questions,
                screen: "interview",
                isLoading: false,
            });
            startTimer();
        } catch (error) {
            console.error(error);
            updateState({ isLoading: false });
        }
    };

    const submitAnswer = async (answer) => {
        stopTimer();
        updateState({ isLoading: true });
        const question = state.questions[state.currentQuestionIndex];
        try {
            const prompt = `Question: ${question.question}. Ideal points: ${JSON.stringify(question.ideal_answer_points)}.
      User answer: ${answer}.
      Return ONLY JSON:
      {
        "scores": { "content": 0, "confidence": 0, "clarity": 0 },
        "filler_words_found": [],
        "missing_points": [],
        "strengths": [],
        "improvement_tips": [],
        "ideal_answer_summary": ""
      }`;
            const feedback = await callGroq(prompt);
            feedback.time = state.responseTime;
            updateState({
                allFeedbacks: [...state.allFeedbacks, feedback],
                screen: "feedback",
                isLoading: false,
            });
        } catch (error) {
            console.error(error);
            updateState({ isLoading: false });
        }
    };

    const nextQuestion = () => {
        if (state.currentQuestionIndex < 4) {
            updateState({
                currentQuestionIndex: state.currentQuestionIndex + 1,
                screen: "interview",
                responseTime: 0,
            });
            startTimer();
        }
    };

    const generateFinalReport = async () => {
        updateState({ isLoading: true });
        try {
            const scoresArray = state.allFeedbacks.map((f) => f.scores);
            const prompt = `Role: ${state.selectedRole}. All 5 question scores: ${JSON.stringify(scoresArray)}.
      Return ONLY JSON:
      {
        "overall_score": 0,
        "communication_score": 0,
        "technical_score": 0,
        "confidence_score": 0,
        "top_strengths": [],
        "critical_gaps": [],
        "personalized_study_plan": [],
        "interview_readiness": "Not Ready"
      }`;
            const report = await callGroq(prompt);
            
            // Persist session to backend
            try {
                await fetch('/api/users/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        role: state.selectedRole,
                        overallScore: report.overall_score || 0,
                        report: report
                    })
                });
            } catch (saveError) {
                console.error("Failed to save session to backend:", saveError);
            }

            updateState({
                finalReport: report,
                screen: "final_report",
                isLoading: false,
            });
        } catch (error) {
            console.error(error);
            updateState({ isLoading: false });
        }
    };

    const retryInterview = () => {
        setState(INITIAL_STATE);
    };

    return {
        ...state,
        selectRole,
        submitAnswer,
        nextQuestion,
        generateFinalReport,
        retryInterview,
    };
}
