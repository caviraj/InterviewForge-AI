import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `You are InterviewForge, an expert AI interview coach helping students crack real job interviews. Always respond with valid JSON only. No markdown, no explanation outside the JSON.`;

export async function callGroq(userPrompt) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        let text = completion.choices[0].message.content;

        // Fallback parsing
        text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Groq API Error:", error);
        throw error;
    }
}
