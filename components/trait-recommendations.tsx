"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { TraitType, Trait } from "./zoobot-preview"
import { Lightbulb } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UserPreferences {
  robotTask: string
  operatingEnvironment: string
  keyFeatures: string[]
  generatedDesign?: string
}

interface RecommendationsResponse {
  summary: string[]
  recommendations: Trait[]
}

export default function TraitRecommendations({ preferences }: { preferences: UserPreferences }) {
  const [recommendations, setRecommendations] = useState<Trait[]>([])
  const [summary, setSummary] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!preferences.robotTask || !preferences.operatingEnvironment) return
      
      setLoading(true)
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const data: RecommendationsResponse = await response.json()
        setRecommendations(data.recommendations || [])
        setSummary(data.summary || [])
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [preferences])

  const handleDragStart = (e: React.DragEvent, trait: Trait) => {
    const data = {
      id: trait.id,
      name: trait.name,
      type: trait.type.toLowerCase(),
      animal: trait.animal,
      description: trait.description,
      confidence: trait.confidence
    }
    console.log('Setting drag data:', data)
    
    // Set both formats to ensure compatibility
    e.dataTransfer.setData('text/plain', JSON.stringify(data))
    e.dataTransfer.setData('application/json', JSON.stringify(data))
    e.dataTransfer.effectAllowed = 'copy'

    const ghost = document.createElement('div')
    ghost.className = 'fixed top-0 left-0 bg-zinc-800 border border-zinc-700 rounded-lg p-3 pointer-events-none'
    ghost.style.width = '200px'
    ghost.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="font-medium text-zinc-100">${trait.name}</div>
        <span class="px-2 py-1 text-xs rounded-full bg-zinc-700 text-zinc-300">
          ${trait.type}
        </span>
      </div>
    `
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 100, 20)
    
    requestAnimationFrame(() => {
      document.body.removeChild(ghost)
    })
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-medium text-white mb-4">Recommended Traits</h2>
        </div>
        <p className="text-sm text-zinc-400 mt-1">Based on your requirements</p>
      </div>
      <ScrollArea className="h-[500px] p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {/* Summary section */}
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <h3 className="font-medium text-zinc-100 mb-2">Design Rationale</h3>
              <ul className="list-disc list-inside space-y-1">
                {summary.map((point, index) => (
                  <li key={index} className="text-sm text-zinc-400">{point}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations section */}
            <div className="space-y-3">
              {recommendations.map((trait) => (
                <div
                  key={trait.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, trait)}
                  className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 cursor-move hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-zinc-100">{trait.name}</h3>
                      <p className="text-sm text-zinc-400">{trait.animal}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-zinc-700 text-zinc-300">
                      {trait.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{trait.description}</p>
                  {trait.confidence && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${trait.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400">
                        {Math.round(trait.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-400">
            <p>No recommendations yet.</p>
            <p className="text-sm">Complete the questionnaire to get started.</p>
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}
