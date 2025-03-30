'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RobotVisualizationProps {
  parts: {
    id: string
    name: string
    type: string
    traits: Array<{
      name: string
      animal: string
      description: string
    }>
  }[]
  robotTask: string
}

export default function RobotVisualization({ parts, robotTask }: RobotVisualizationProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateImage = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create a detailed prompt from the robot parts and traits
      const prompt = createPrompt(parts)
      console.log('Sending prompt:', prompt)
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('API error:', data)
        throw new Error(data.error || 'Failed to generate image')
      }

      if (!data.artifacts?.[0]?.base64) {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response from image generation API')
      }

      // Stability AI returns base64 images in the artifacts array
      const imageBase64 = data.artifacts[0].base64
      setImageUrl(`data:image/png;base64,${imageBase64}`)
    } catch (err) {
      console.error('Error in generateImage:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createPrompt = (parts: RobotVisualizationProps['parts']) => {
    const traitDescriptions = parts
      .filter(part => part.traits.length > 0)
      .map(part => {
        const traitList = part.traits
          .map(trait => `${trait.name} (inspired by ${trait.animal})`)
          .join(', ')
        return `${part.name} with ${traitList}`
      })
      .join('. ')

    return `Create a detailed technical diagram of a biomimetic robot with the following features: ${traitDescriptions}. 
    Style: Clean, technical, detailed engineering diagram with labels. 
    Background: White or light gray grid pattern.
    View: Side view with additional detail views of key components.
    Color scheme: Professional blues and grays with accent colors for different systems.`
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Robot Visualization</h2>
          <div className="space-x-4">
            <Button
              onClick={generateImage}
              disabled={loading || parts.every(p => p.traits.length === 0)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Design'
              )}
            </Button>
            {imageUrl && (
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = 'robot-design.png';
                  link.click();
                }}
                variant="secondary"
              >
                Download PNG
              </Button>
            )}
            {imageUrl && (
              <Button
                onClick={() => {
                  // Store robot data for simulation
                  localStorage.setItem('robotData', JSON.stringify({
                    parts,
                    environment: robotTask?.toLowerCase().includes('water') ? 'water' :
                              robotTask?.toLowerCase().includes('fly') ? 'air' : 'land'
                  }))
                  router.push('/simulation')
                }}
                className="ml-2"
                variant="secondary"
              >
                Test in Environment
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="relative aspect-square w-full">
            <Image
              src={imageUrl}
              alt="Generated robot design"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {!imageUrl && !loading && (
          <div className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              Click &quot;Generate Design&quot; to create a visualization
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
