'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function GeminiTest() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [models, setModels] = useState<any[]>([])

  // Function to list available models
  const listModels = async () => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to list models');
      }

      const data = await response.json();
      console.log('Available models:', data);
      setModels(data.models || []);
      return data.models;
    } catch (error: any) {
      console.error('Error listing models:', error);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // First, get the list of models if we haven't already
      if (models.length === 0) {
        const availableModels = await listModels();
        console.log('Available models:', availableModels);
      }

      console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.slice(0, 5) + '...')
      
      // Using v1 API endpoint with key parameter
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
                text: input
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
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate content');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setResponse(generatedText);
    } catch (error: any) {
      console.error('Detailed error:', error)
      setError(error?.message || 'Error generating response')
      setResponse('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gemini API Test</h1>
      
      {models.length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-zinc-800">
          <h2 className="font-bold mb-2">Available Models:</h2>
          <ul className="list-disc pl-4">
            {models.map((model: any) => (
              <li key={model.name}>{model.name}</li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your prompt..."
          disabled={loading}
        />
        
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-200">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 rounded-lg bg-zinc-800">
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  )
}
