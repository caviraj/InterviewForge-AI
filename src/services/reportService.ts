import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SessionData {
  aptitudeScore: number;
  technicalCode: string;
  technicalLanguage: string;
  technicalTestResults: { name: string; passed: boolean }[];
  hrResponse: string;
  totalTimeUsed: number;
}

export interface AIReport {
  forgeIqScore: number;
  percentile: string;
  confidenceDelta: string;
  masteryPercentage: number;
  metrics: {
    technicalAccuracy: number;
    problemSolving: number;
    communication: number;
    aptitudeScore: number;
  };
  stageAnalysis: {
    aptitude: {
      score: number;
      details: string;
      strengths: string[];
      improvements: string[];
    };
    technical: {
      score: number;
      details: string;
      strengths: string[];
      improvements: string[];
    };
    hr: {
      score: number;
      details: string;
      strengths: string[];
      improvements: string[];
    };
  };
  neuralFeedback: {
    technicalStrength: string;
    growthVector: string;
  };
  recommendations: {
    title: string;
    type: string;
    duration: string;
  }[];
}

const SYSTEM_INSTRUCTION = `
You are the "Forge Synthesis Engine", a high-fidelity AI analyzer for the Interview Forge platform.
Your task is to take raw interview session data and generate a comprehensive, personalized performance report.

THEME:
- Use "Kinetic Foundry" terminology: "neural patterns", "logic processing", "vocal mapping", "synthesis", "evolution".
- Be professional, objective, and encouraging.

DATA INPUT:
- Aptitude performance.
- Technical code and test results.
- HR behavioral response.
- Time management.

OUTPUT:
- You must return a valid JSON object matching the requested schema.
- Ensure the scores are realistic based on the input (e.g., if code failed tests, technical accuracy should be lower).
- Recommendations should be specific to the weaknesses identified.
`;

export async function generateAIReport(data: SessionData): Promise<AIReport> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a synthesis report for the following session data: ${JSON.stringify(data)}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forgeIqScore: { type: Type.NUMBER },
            percentile: { type: Type.STRING },
            confidenceDelta: { type: Type.STRING },
            masteryPercentage: { type: Type.NUMBER },
            metrics: {
              type: Type.OBJECT,
              properties: {
                technicalAccuracy: { type: Type.NUMBER },
                problemSolving: { type: Type.NUMBER },
                communication: { type: Type.NUMBER },
                aptitudeScore: { type: Type.NUMBER }
              },
              required: ["technicalAccuracy", "problemSolving", "communication", "aptitudeScore"]
            },
            stageAnalysis: {
              type: Type.OBJECT,
              properties: {
                aptitude: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    details: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["score", "details", "strengths", "improvements"]
                },
                technical: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    details: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["score", "details", "strengths", "improvements"]
                },
                hr: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    details: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["score", "details", "strengths", "improvements"]
                }
              },
              required: ["aptitude", "technical", "hr"]
            },
            neuralFeedback: {
              type: Type.OBJECT,
              properties: {
                technicalStrength: { type: Type.STRING },
                growthVector: { type: Type.STRING }
              },
              required: ["technicalStrength", "growthVector"]
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                  duration: { type: Type.STRING }
                },
                required: ["title", "type", "duration"]
              }
            }
          },
          required: ["forgeIqScore", "percentile", "confidenceDelta", "masteryPercentage", "metrics", "stageAnalysis", "neuralFeedback", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Report Generation Error:", error);
    throw error;
  }
}
