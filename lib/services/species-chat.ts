// Using Gemini and using fetch rather than client
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const SPECIES_INSTRUCTION = `You are a helpful species and animal information assistant. Only answer questions about animals, species, wildlife, habitats, diets, behavior, evolution, taxonomy, conservation, and related biology. If a question is unrelated, politely explain that you only handle species-related queries and invite the user to ask about an animal or species instead. Be accurate, concise, and acknowledge uncertainty rather than inventing facts.`;
const FALLBACK_RESPONSE = "I’m unable to reach the species knowledge service right now. Please try again shortly.";

// Queries the Gemini API
export async function generateResponse(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return FALLBACK_RESPONSE;
  }

  // Make the post request to Gemini
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
        apiKey,
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SPECIES_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.3 },
        }),
      },
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Gemini request failed with status ${response.status}: ${errorDetails}`);
    }

    // Processing the response
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const answer = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    return answer ?? FALLBACK_RESPONSE;
  } catch (error) {
    console.error("Gemini species chat request failed:", error);
    return FALLBACK_RESPONSE;
  }
}
