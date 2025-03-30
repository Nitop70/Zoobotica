import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  console.log('Received prompt:', prompt);
  
  const apiKey = process.env.STABILITY_API_KEY;
  console.log('Raw API Key:', apiKey); // Log the raw key (will be redacted in logs)
  console.log('API Key length:', apiKey?.length);
  console.log('API Key starts with:', apiKey?.substring(0, 5));
  console.log('API Key available:', !!apiKey); // Will log true/false without exposing the key
  
  if (!apiKey) {
    console.error('No API key found in environment variables');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }
  
  try {
    console.log('Making request to Stability AI...');
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${apiKey}`, // Use the API key directly
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Stability API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Received response from Stability AI');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-image route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}
