export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachResponse {
  content: string;
  followUps: string[];
}

export async function getCoachResponse(history: CoachMessage[]): Promise<CoachResponse> {
  try {
    const API_URL = import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL.replace(/:300\d/, ':5000')}` : 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/coach/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ history })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content || "I'm processing your request. Let's focus on your next evolution.",
      followUps: data.followUps || []
    };
  } catch (error) {
    console.error("Coach Service Error:", error);
    return {
      content: "I encountered a neural desync while processing your request. Let's try re-establishing the link.",
      followUps: ["Would you like to try rephrasing your last query?", "Shall we focus on a different skill vector for now?"]
    };
  }
}
