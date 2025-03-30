"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, ArrowRight } from "lucide-react"

type UserPreferences = {
  robotTask: string
  operatingEnvironment: string
  keyFeatures: string[]
  generatedDesign?: string
}

interface OnboardingProps {
  onCompleteAction: (preferences: UserPreferences) => void
}

export default function OnboardingQuestionnaire({ onCompleteAction }: OnboardingProps) {
  const [robotTask, setRobotTask] = useState("")
  const [operatingEnvironment, setOperatingEnvironment] = useState("")
  const [keyFeatures, setKeyFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [typedText, setTypedText] = useState("")

  // Check if we have saved preferences in localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem("zoobotica_preferences")
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences)
        // Instead of auto-completing, just pre-fill the form
        setRobotTask(preferences.robotTask || "")
        setOperatingEnvironment(preferences.operatingEnvironment || "")
        setKeyFeatures(preferences.keyFeatures || [])
      } catch (e) {
        console.error("Error parsing saved preferences", e)
      }
    }
  }, [])

  // Typewriter effect for the welcome message
  useEffect(() => {
    const welcomeText =
      "Welcome to Zoobotica, where nature's engineering meets robotics. Let's design your biomimicry-inspired robot together."
    let i = 0
    const typing = setInterval(() => {
      setTypedText(welcomeText.substring(0, i))
      i++
      if (i > welcomeText.length) {
        clearInterval(typing)
        setIsTyping(false)
      }
    }, 30)

    return () => clearInterval(typing)
  }, [])

  const handleComplete = async () => {
    if (!robotTask || !operatingEnvironment || keyFeatures.length === 0) {
      return // Early return if form is incomplete
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          robotTask,
          operatingEnvironment,
          keyFeatures,
        }),
      })

      if (!response.ok) {
        console.error('Failed to generate design:', await response.text())
        throw new Error('Failed to generate design')
      }

      const data = await response.json()
      
      const preferences = {
        robotTask,
        operatingEnvironment,
        keyFeatures,
        generatedDesign: data.design,
      }

      // Save preferences to localStorage
      localStorage.setItem("zoobotica_preferences", JSON.stringify(preferences))

      // Complete onboarding
      onCompleteAction(preferences)
    } catch (error) {
      console.error('Error generating design:', error)
      // Even if the API call fails, proceed with basic preferences
      const preferences = {
        robotTask,
        operatingEnvironment,
        keyFeatures,
      }
      onCompleteAction(preferences)
    }
  }

  const addFeature = () => {
    if (newFeature) {
      setKeyFeatures([...keyFeatures, newFeature])
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setKeyFeatures(keyFeatures.filter((feature, i) => i !== index))
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-zinc-900 text-zinc-50">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
            Welcome to Zoobotica
          </h1>
          <p className="text-lg text-zinc-400">{typedText}{isTyping && <span className="animate-pulse">|</span>}</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="robotTask" className="block text-sm font-medium text-zinc-200">
              What task will your robot perform?
            </Label>
            <Input
              id="robotTask"
              value={robotTask}
              onChange={(e) => setRobotTask(e.target.value)}
              placeholder="e.g., Climbing steep surfaces, swimming underwater..."
              className="w-full bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment" className="block text-sm font-medium text-zinc-200">
              In what environment will it operate?
            </Label>
            <Input
              id="environment"
              value={operatingEnvironment}
              onChange={(e) => setOperatingEnvironment(e.target.value)}
              placeholder="e.g., Desert terrain, deep ocean, urban areas..."
              className="w-full bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-zinc-200">Key features needed:</Label>
            <div className="flex flex-wrap gap-2">
              {keyFeatures.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  {feature}
                  <button
                    onClick={() => removeFeature(index)}
                    className="ml-2 hover:text-emerald-300 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Add a key feature"
                className="flex-1 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
              />
              <Button
                onClick={addFeature}
                className="bg-emerald-600 hover:bg-emerald-500 text-zinc-50"
              >
                Add
              </Button>
            </div>
          </div>

          <Button
            onClick={handleComplete}
            disabled={!robotTask || !operatingEnvironment || keyFeatures.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-50 disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            Generate Robot Design
          </Button>
        </div>
      </div>
    </div>
  )
}
