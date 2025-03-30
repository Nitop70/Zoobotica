"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type BodyPart = {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  components: Array<{
    id: string
    name: string
    type: string
    source: string
  }>
}

interface AITraitGeneratorProps {
  selectedPart: string | null
  preferences: {
    robotTask: string
    operatingEnvironment: string
    keyFeatures: string[]
  }
  onTraitsGeneratedAction: (traits: Array<{
    id: string
    name: string
    type: string
    source: string
  }>) => void
}

export default function AITraitGenerator({ selectedPart, preferences, onTraitsGeneratedAction }: AITraitGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTraits = async () => {
    if (!selectedPart) return
    
    setIsGenerating(true)
    try {
      const prompt = `Based on these requirements:
      - Robot task: ${preferences.robotTask}
      - Operating environment: ${preferences.operatingEnvironment}
      - Key features needed: ${preferences.keyFeatures.join(', ')}
      
      Suggest 3 biomimetic components for the ${selectedPart} part of the robot.
      For each component:
      1. Name the animal it's inspired by
      2. Describe the specific trait or feature
      3. Explain how it helps the robot's task
      
      Format as JSON array with fields:
      - id (unique string)
      - name (component name)
      - type (sensor/actuator/structure)
      - source (animal name)
      - description (how it helps)`

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate traits')
      }

      const data = await response.json()
      const traits = JSON.parse(data.response)
      onTraitsGeneratedAction(traits)
    } catch (error) {
      console.error('Error generating traits:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-4 border-t border-zinc-800">
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-500"
        disabled={!selectedPart || isGenerating}
        onClick={generateTraits}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating traits...
          </>
        ) : (
          `Generate traits for ${selectedPart || 'selected part'}`
        )}
      </Button>
    </div>
  )
}