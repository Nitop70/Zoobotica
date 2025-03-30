import { NextResponse } from "next/server";

export const runtime = "edge";

type AnimalTrait = {
  id: string;
  name: string;
  animal: string;
  description: string;
  efficiency: number;
  complexity: number;
  power: number;
}

type CategoryData = {
  examples: AnimalTrait[];
  prompt: string;
}

type Categories = {
  "Locomotion Systems": CategoryData;
  "End Effectors": CategoryData;
  "Actuators": CategoryData;
  "Perception Systems": CategoryData;
  "Surface Systems": CategoryData;
  "Balance & Control": CategoryData;
}

// Base traits that serve as inspiration for generation
const BASE_TRAITS: Categories = {
  "Locomotion Systems": {
    examples: [
      {
        id: "gecko-feet",
        name: "Adhesive Pads",
        animal: "Gecko",
        description: "Microscopic hairs that allow climbing on virtually any surface through van der Waals forces",
        efficiency: 90,
        complexity: 85,
        power: 10
      },
      {
        id: "cheetah-legs",
        name: "Sprint Mechanics",
        animal: "Cheetah",
        description: "Specialized leg structure for rapid acceleration and high-speed movement",
        efficiency: 95,
        complexity: 75,
        power: 90
      }
    ],
    prompt: "Focus on unique movement mechanisms that could revolutionize robot mobility"
  },
  "End Effectors": {
    examples: [
      {
        id: "octopus-tentacles",
        name: "Adaptive Grippers",
        animal: "Octopus",
        description: "Distributed control system for precise manipulation of objects of any shape",
        efficiency: 90,
        complexity: 95,
        power: 50
      }
    ],
    prompt: "Consider unique ways animals manipulate objects or interact with their environment"
  },
  "Actuators": {
    examples: [
      {
        id: "elephant-trunk",
        name: "Flexible Manipulator",
        animal: "Elephant",
        description: "Multi-segment appendage with precise control for complex movements",
        efficiency: 95,
        complexity: 90,
        power: 80
      }
    ],
    prompt: "Think about specialized joints or muscles that enable unique movements"
  },
  "Perception Systems": {
    examples: [
      {
        id: "eagle-eyes",
        name: "High-Resolution Vision",
        animal: "Eagle",
        description: "Visual acuity system with exceptional detail recognition and tracking",
        efficiency: 95,
        complexity: 80,
        power: 30
      }
    ],
    prompt: "Focus on extraordinary sensory capabilities that could enhance robot awareness"
  },
  "Surface Systems": {
    examples: [
      {
        id: "shark-scales",
        name: "Dynamic Surface",
        animal: "Shark",
        description: "Micro-structured surface that reduces drag and prevents bio-fouling",
        efficiency: 85,
        complexity: 70,
        power: 5
      }
    ],
    prompt: "Consider unique surface adaptations that enhance functionality"
  },
  "Balance & Control": {
    examples: [
      {
        id: "kangaroo-tail",
        name: "Counterbalance System",
        animal: "Kangaroo",
        description: "Active stabilization system that adjusts body position during movement",
        efficiency: 90,
        complexity: 65,
        power: 40
      }
    ],
    prompt: "Think about how animals maintain stability during complex movements"
  }
};

export async function POST(req: Request) {
  try {
    const { category } = await req.json();

    // Validate category is a valid key of BASE_TRAITS
    if (!Object.prototype.hasOwnProperty.call(BASE_TRAITS, category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const categoryData = BASE_TRAITS[category as keyof Categories];

    // Construct specialized prompt
    const prompt = `Generate a unique biomimetic trait for robotics inspired by nature but different from these examples:
${categoryData.examples.map(ex => `- ${ex.animal}: ${ex.name}`).join('\n')}

${categoryData.prompt}

Requirements:
1. Choose an animal not listed above
2. Focus on a specific, well-defined feature
3. Explain the mechanism in one clear, technical sentence
4. Rate practicality realistically:
   - Efficiency (how well it performs)
   - Complexity (implementation difficulty)
   - Power (energy requirements)

Format response exactly as JSON:
{
  "id": "kebab-case-name",
  "name": "Concise Feature Name",
  "animal": "Source Animal",
  "category": "${category}",
  "description": "One clear technical sentence about the mechanism",
  "efficiency": number (0-100),
  "complexity": number (0-100),
  "power": number (0-100)
}`;

    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

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

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    // Parse the generated text as JSON
    const trait = JSON.parse(data.candidates[0].content.parts[0].text);

    // Validate the trait has all required fields
    const requiredFields = ['id', 'name', 'animal', 'category', 'description', 'efficiency', 'complexity', 'power'] as const;
    const missingFields = requiredFields.filter(field => !(field in trait));
    
    if (missingFields.length > 0) {
      throw new Error(`Generated trait missing required fields: ${missingFields.join(', ')}`);
    }

    return NextResponse.json({ trait });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Failed to generate trait" },
      { status: 500 }
    );
  }
}
