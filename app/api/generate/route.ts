import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    console.log('API route called');
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

    const { robotTask, operatingEnvironment, keyFeatures } = body;
    console.log('Extracted fields:', { robotTask, operatingEnvironment, keyFeatures });

    if (!robotTask || !operatingEnvironment || !keyFeatures) {
      console.log('Missing required fields:', { robotTask, operatingEnvironment, keyFeatures });
      return NextResponse.json(
        { error: "Missing required fields", received: { robotTask, operatingEnvironment, keyFeatures } },
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

    const prompt = `Design a biomimetic robot with the following specifications:
- Task: ${robotTask}
- Operating Environment: ${operatingEnvironment}
- Key Features: ${keyFeatures.join(", ")}

Please provide a brief design description focusing on how animal-inspired features could be used to achieve the specified requirements. Include specific examples of animals and their traits that could be incorporated into the design.`;

    console.log('Sending prompt to Gemini:', prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
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
    const design = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ design });
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      { error: "Failed to generate response", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
