import { NextResponse } from 'next/server';

const PERFORMANCE_METRICS = {
  mobility: [
    { score: 85, explanation: "Excellent agility and speed" },
    { score: 70, explanation: "Good movement but limited turning radius" },
    { score: 95, explanation: "Superior maneuverability in all directions" },
    { score: 60, explanation: "Stable but slower movement" }
  ],
  durability: [
    { score: 90, explanation: "Highly resistant to environmental damage" },
    { score: 75, explanation: "Good structural integrity" },
    { score: 65, explanation: "Moderate protection against impacts" },
    { score: 85, explanation: "Strong armor and reinforced joints" }
  ],
  efficiency: [
    { score: 80, explanation: "Optimal power consumption" },
    { score: 95, explanation: "Exceptional energy management" },
    { score: 70, explanation: "Standard operational efficiency" },
    { score: 88, explanation: "Advanced power distribution" }
  ],
  task_suitability: [
    { score: 92, explanation: "Perfect match for intended task" },
    { score: 78, explanation: "Well-suited with minor limitations" },
    { score: 85, explanation: "Strong performance capabilities" },
    { score: 73, explanation: "Good but could be optimized" }
  ]
};

const STRENGTHS = [
  "Advanced stabilization system",
  "High-performance actuators",
  "Reinforced structural design",
  "Efficient power management",
  "Superior sensor integration",
  "Adaptive movement patterns",
  "Enhanced grip mechanisms",
  "Quick response time",
  "Modular component design",
  "Environmental adaptability"
];

const LIMITATIONS = [
  "Limited operational range",
  "Higher power consumption",
  "Weather sensitivity",
  "Maintenance complexity",
  "Size constraints",
  "Speed limitations",
  "Weight distribution issues",
  "Specialized terrain requirements",
  "Temperature sensitivity",
  "Component wear rate"
];

const RECOMMENDATIONS = [
  "Add weather protection",
  "Optimize power systems",
  "Enhance sensor coverage",
  "Upgrade actuator efficiency",
  "Improve stability control",
  "Reinforce weak points",
  "Add redundant systems",
  "Streamline movement patterns",
  "Balance weight distribution",
  "Include backup power"
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function POST(req: Request) {
  try {
    const { robotData } = await req.json();

    if (!robotData?.parts || !Array.isArray(robotData.parts)) {
      return new Response(
        JSON.stringify({ error: 'Invalid robot data format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate random performance analysis
    const analysis = {
      performance_scores: {
        mobility: getRandomItem(PERFORMANCE_METRICS.mobility),
        durability: getRandomItem(PERFORMANCE_METRICS.durability),
        efficiency: getRandomItem(PERFORMANCE_METRICS.efficiency),
        task_suitability: getRandomItem(PERFORMANCE_METRICS.task_suitability)
      },
      strengths: getRandomItems(STRENGTHS, 3),
      limitations: getRandomItems(LIMITATIONS, 2),
      overall_score: Math.floor(Math.random() * 20) + 75, // Random score between 75-95
      recommendations: getRandomItems(RECOMMENDATIONS, 2)
    };

    return new Response(
      JSON.stringify(analysis),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in performance analysis:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze robot performance' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
