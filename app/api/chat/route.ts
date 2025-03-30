import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('Parsed request body:', body);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { message, preferences, history } = body;
    console.log('Extracted fields:', { message, preferences, history });

    if (!message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      console.error('API key not configured');
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Format conversation history for Gemini
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add system context about the robot design
    const systemContext = `You are a biomimetic robotics design assistant. The user is designing a robot with these specifications:
- Task: ${preferences?.robotTask || 'Not specified'}
- Operating Environment: ${preferences?.operatingEnvironment || 'Not specified'}
- Key Features: ${preferences?.keyFeatures?.join(', ') || 'Not specified'}

Use this context to provide relevant suggestions and explanations about animal traits and biomimetic design principles.`;

    const prompt = `${systemContext}\n\nUser: ${message}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    const aiResponse = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: "Failed to generate response", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
