'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Trait, TraitType } from "./zoobot-preview"

type UserPreferences = {
  robotTask: string
  operatingEnvironment: string
  keyFeatures: string[]
  generatedDesign?: string
}

interface ComponentSelectionPanelProps {
  userPreferences: UserPreferences
}

const predefinedTraits: Trait[] = [
  {
    id: 'kangaroo-legs',
    name: 'Kangaroo-Inspired Legs',
    type: 'locomotion',
    animal: 'Kangaroo',
    description: 'Powerful jumping legs with energy-efficient tendons',
    confidence: 0.9
  },
  {
    id: 'eagle-vision',
    name: 'Eagle Eye System',
    type: 'sensor',
    animal: 'Eagle',
    description: 'High-resolution vision with 4x zoom capability',
    confidence: 0.95
  },
  {
    id: 'octopus-grip',
    name: 'Octopus Tentacle',
    type: 'manipulator',
    animal: 'Octopus',
    description: 'Flexible gripper with suction cups for precise control',
    confidence: 0.85
  },
  {
    id: 'cheetah-spine',
    name: 'Cheetah Spine',
    type: 'core',
    animal: 'Cheetah',
    description: 'Flexible spine for enhanced agility and speed',
    confidence: 0.88
  },
  {
    id: 'scorpion-tail',
    name: 'Scorpion Tail',
    type: 'stabilizer',
    animal: 'Scorpion',
    description: 'Articulated tail for balance and manipulation',
    confidence: 0.82
  },
  {
    id: 'bat-sonar',
    name: 'Bat Sonar Array',
    type: 'sensor',
    animal: 'Bat',
    description: 'Echolocation system for navigation in low light',
    confidence: 0.87
  },
  {
    id: 'snake-joints',
    name: 'Snake Vertebrae',
    type: 'core',
    animal: 'Snake',
    description: 'Highly articulated spine for maximum flexibility',
    confidence: 0.86
  },
  {
    id: 'gecko-feet',
    name: 'Gecko Adhesion Pads',
    type: 'locomotion',
    animal: 'Gecko',
    description: 'Micro-structured adhesive pads for wall climbing',
    confidence: 0.89
  },
  {
    id: 'elephant-trunk',
    name: 'Elephant Trunk',
    type: 'manipulator',
    animal: 'Elephant',
    description: 'Versatile manipulator with fine motor control',
    confidence: 0.91
  },
  {
    id: 'peacock-tail',
    name: 'Peacock Fan',
    type: 'stabilizer',
    animal: 'Peacock',
    description: 'Deployable fan for balance and heat regulation',
    confidence: 0.83
  }
]

export default function ComponentSelectionPanel({ userPreferences }: ComponentSelectionPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTraits, setFilteredTraits] = useState(predefinedTraits)

  useEffect(() => {
    const filtered = predefinedTraits.filter(trait =>
      trait.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trait.animal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trait.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTraits(filtered)
  }, [searchQuery])

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

    // Create a ghost image
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
    <div className="h-full flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-medium">Animal Traits</h2>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search traits..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {filteredTraits.map((trait) => (
            <Card
              key={trait.id}
              className="p-4 cursor-move hover:border-blue-500/50 transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, trait)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-zinc-100">{trait.name}</h3>
                <span className="px-2 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300">
                  {trait.type}
                </span>
              </div>
              <p className="text-sm text-zinc-400">
                Inspired by: {trait.animal}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                {trait.description}
              </p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
