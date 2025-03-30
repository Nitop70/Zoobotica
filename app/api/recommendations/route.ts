import { NextResponse } from "next/server";
import { TraitType } from "@/components/zoobot-preview";

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

    const { robotTask, operatingEnvironment, keyFeatures } = body;
    console.log('Extracted fields:', { robotTask, operatingEnvironment, keyFeatures });

    if (!robotTask || !operatingEnvironment) {
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

    const prompt = `As a biomimetic robotics expert, analyze this robot design requirement and provide:
1. A brief summary explaining the rationale for your recommendations (max 3 bullet points)
2. 5 specific animal-inspired features for different robot systems

Format your response as a JSON object with two fields:
1. "summary": Array of bullet points explaining the rationale
2. "recommendations": Array of trait objects

Each trait object should have:
- id: a unique string
- name: the robotic feature name (e.g., "Articulated Gripper", "Dynamic Stabilizer")
- animal: the inspiration animal
- description: how the animal's feature is adapted for robotic use
- type: must match the robot system it enhances (one of: sensor, core, manipulator, locomotion, stabilizer)
- confidence: number between 0 and 1 indicating match quality

Robot Systems:
- sensor -> Sensor Array (vision, detection, processing)
- core -> Core System (protection, adaptation, power)
- manipulator -> Manipulator (grasping, handling, interaction)
- locomotion -> Locomotion System (movement, balance, terrain adaptation)
- stabilizer -> Stabilization Unit (balance, steering, optional)

Requirements:
- Task: ${robotTask}
- Operating Environment: ${operatingEnvironment}
- Key Features: ${keyFeatures?.join(", ") || "None specified"}

Return ONLY the JSON object. Example format:
{
  "summary": [
    "Prioritized aquatic adaptations due to underwater operating environment",
    "Selected features optimized for precise manipulation and sensing",
    "Focused on energy-efficient movement systems"
  ],
  "recommendations": [
    {
      "id": "octopus-manipulator",
      "name": "Adaptive Manipulator Array",
      "animal": "Octopus",
      "description": "Distributed suction cups and soft robotics for precise, adaptable gripping inspired by octopus tentacles",
      "type": "manipulator",
      "confidence": 0.95
    }
  ]
}`;

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
          }
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
    
    let recommendations;
    try {
      const responseText = data.candidates[0].content.parts[0].text;
      // Extract JSON object from response text (it might have extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate trait types
      const validTypes: TraitType[] = ['sensor', 'core', 'manipulator', 'locomotion', 'stabilizer'];
      recommendations = {
        summary: parsedData.summary || [],
        recommendations: (parsedData.recommendations || []).filter((rec: { type: string }) => 
          validTypes.includes(rec.type as TraitType)
        )
      };
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      throw new Error('Failed to parse recommendations from API response');
    }

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Error in /api/recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
