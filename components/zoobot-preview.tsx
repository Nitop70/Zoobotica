'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import RobotVisualization from './robot-visualization'

export interface Trait {
  id: string
  name: string
  animal: string
  description: string
  type: TraitType
  confidence: number
}

export type TraitType = 'sensor' | 'core' | 'manipulator' | 'locomotion' | 'stabilizer'

interface BodyPart {
  id: string
  name: string
  type: TraitType
  traits: Trait[]
}

export default function ZoobotPreview() {
  const [parts, setParts] = useState<BodyPart[]>([
    {
      id: 'sensor',
      name: 'Sensor Array',
      type: 'sensor',
      traits: []
    },
    {
      id: 'core',
      name: 'Core System',
      type: 'core',
      traits: []
    },
    {
      id: 'manipulator-left',
      name: 'Left Manipulator',
      type: 'manipulator',
      traits: []
    },
    {
      id: 'manipulator-right',
      name: 'Right Manipulator',
      type: 'manipulator',
      traits: []
    },
    {
      id: 'locomotion',
      name: 'Locomotion System',
      type: 'locomotion',
      traits: []
    },
    {
      id: 'stabilizer',
      name: 'Stabilization Unit',
      type: 'stabilizer',
      traits: []
    }
  ])

  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent, partId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(partId)
  }

  const handleDrop = (e: React.DragEvent, targetPart: BodyPart) => {
    e.preventDefault()
    setIsDraggingOver(null)

    try {
      // Try parsing as JSON first
      const jsonData = e.dataTransfer.getData('application/json')
      if (jsonData) {
        const trait = JSON.parse(jsonData)
        if (trait.type?.toLowerCase() === targetPart.type.toLowerCase()) {
          setParts(parts.map(part =>
            part.id === targetPart.id
              ? { ...part, traits: [...part.traits, trait] }
              : part
          ))
        }
        return
      }

      // Fallback to text data
      const textData = e.dataTransfer.getData('text/plain')
      if (textData) {
        try {
          const trait = JSON.parse(textData)
          if (trait.type?.toLowerCase() === targetPart.type.toLowerCase()) {
            setParts(parts.map(part =>
              part.id === targetPart.id
                ? { ...part, traits: [...part.traits, trait] }
                : part
            ))
          }
        } catch (parseError) {
          console.error('Error parsing text data:', parseError)
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-12 gap-4 w-full">
        {/* Top Row */}
        <div className="col-span-4">
          <BodyPartCard
            part={parts.find(p => p.id === 'sensor')!}
            isDraggingOver={isDraggingOver === 'sensor'}
            onDragOver={(e) => handleDragOver(e, 'sensor')}
            onDragLeave={() => setIsDraggingOver(null)}
            onDrop={(e) => handleDrop(e, parts.find(p => p.id === 'sensor')!)}
          />
        </div>
        <div className="col-span-4" />
        <div className="col-span-4">
          <BodyPartCard
            part={parts.find(p => p.id === 'stabilizer')!}
            isDraggingOver={isDraggingOver === 'stabilizer'}
            onDragOver={(e) => handleDragOver(e, 'stabilizer')}
            onDragLeave={() => setIsDraggingOver(null)}
            onDrop={(e) => handleDrop(e, parts.find(p => p.id === 'stabilizer')!)}
          />
        </div>

        {/* Middle Row */}
        <div className="col-span-3">
          <BodyPartCard
            part={parts.find(p => p.id === 'manipulator-left')!}
            isDraggingOver={isDraggingOver === 'manipulator-left'}
            onDragOver={(e) => handleDragOver(e, 'manipulator-left')}
            onDragLeave={() => setIsDraggingOver(null)}
            onDrop={(e) => handleDrop(e, parts.find(p => p.id === 'manipulator-left')!)}
          />
        </div>
        <div className="col-span-6">
          <BodyPartCard
            part={parts.find(p => p.id === 'core')!}
            isDraggingOver={isDraggingOver === 'core'}
            onDragOver={(e) => handleDragOver(e, 'core')}
            onDragLeave={() => setIsDraggingOver(null)}
            onDrop={(e) => handleDrop(e, parts.find(p => p.id === 'core')!)}
          />
        </div>
        <div className="col-span-3">
          <BodyPartCard
            part={parts.find(p => p.id === 'manipulator-right')!}
            isDraggingOver={isDraggingOver === 'manipulator-right'}
            onDragOver={(e) => handleDragOver(e, 'manipulator-right')}
            onDragLeave={() => setIsDraggingOver(null)}
            onDrop={(e) => handleDrop(e, parts.find(p => p.id === 'manipulator-right')!)}
          />
        </div>

        {/* Bottom Row */}
        <div className="col-span-12">
          <BodyPartCard
            part={parts.find(p => p.id === 'locomotion')!}
            isDraggingOver={isDraggingOver === 'locomotion'}
            onDragOver={(e) => handleDragOver(e, 'locomotion')}
            onDragLeave={() => setIsDraggingOver(null)}
            onDrop={(e) => handleDrop(e, parts.find(p => p.id === 'locomotion')!)}
          />
        </div>
      </div>

      {/* Add the visualization component */}
      <div className="w-full mt-8">
        <RobotVisualization
          parts={parts}
          robotTask={''}
        />
      </div>
    </div>
  )
}

interface BodyPartCardProps {
  part: BodyPart
  isDraggingOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}

function BodyPartCard({ part, isDraggingOver, onDragOver, onDragLeave, onDrop }: BodyPartCardProps) {
  return (
    <Card 
      className={cn(
        "flex flex-col p-4 min-h-[180px] transition-colors",
        isDraggingOver ? "bg-blue-500/10 border-blue-500" : "hover:bg-zinc-800/50"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">{part.name}</h3>
      <div className="flex flex-col gap-2">
        {part.traits.map((trait, index) => (
          <div 
            key={`${trait.id}-${index}`}
            className="text-sm text-zinc-400 bg-zinc-800/50 px-3 py-2 rounded-lg"
          >
            {trait.name}
          </div>
        ))}
        {part.traits.length === 0 && (
          <div className="text-sm text-zinc-500 italic">
            Drop a {part.type} trait here
          </div>
        )}
      </div>
    </Card>
  )
}