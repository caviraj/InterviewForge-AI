export interface PracticeFeedback {
  feedback: string;
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export async function getPracticeFeedback(
  authFetch: (path: string, options?: any) => Promise<any>,
  question: string, 
  userAnswer: string
): Promise<PracticeFeedback> {
  try {
    const result = await authFetch('/api/evaluate/practice', {
      method: 'POST',
      body: JSON.stringify({ question, userAnswer })
    });
    
    if (result.error) throw new Error(result.error);
    return result as PracticeFeedback;
  } catch (error) {
    console.error("Practice Service Error:", error);
    throw new Error("Failed to synthesize neural feedback. Please try again.");
  }
}
