"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface AnimalTrait {
  id: string
  name: string
  animal: string
  description: string
  category: string
  efficiency?: number
  complexity?: number
  power?: number
}

const TRAITS: AnimalTrait[] = [
  {
    id: "gecko-feet",
    name: "Adhesive Pads",
    animal: "Gecko",
    description: "Microscopic hairs that allow climbing on virtually any surface through van der Waals forces.",
    category: "grip",
    efficiency: 90,
    complexity: 70,
    power: 20
  },
  {
    id: "cheetah-legs",
    name: "High-Speed Legs",
    animal: "Cheetah",
    description: "Powerful leg muscles and flexible spine for incredible acceleration and speed.",
    category: "locomotion",
    efficiency: 95,
    complexity: 85,
    power: 90
  },
  {
    id: "eagle-eyes",
    name: "High-Resolution Vision",
    animal: "Eagle",
    description: "Extremely sharp vision with high density of photoreceptors.",
    category: "sensing",
    efficiency: 95,
    complexity: 80,
    power: 40
  },
  {
    id: "octopus-arms",
    name: "Flexible Manipulator",
    animal: "Octopus",
    description: "Highly dexterous tentacles with distributed neural control.",
    category: "actuator",
    efficiency: 85,
    complexity: 90,
    power: 60
  },
  {
    id: "shark-skin",
    name: "Drag-Reducing Surface",
    animal: "Shark",
    description: "Microscopic scales that reduce drag in fluid environments.",
    category: "surface",
    efficiency: 80,
    complexity: 65,
    power: 30
  },
  {
    id: "dolphin-fins",
    name: "Efficient Propulsion",
    animal: "Dolphin",
    description: "Streamlined fins for efficient aquatic propulsion.",
    category: "propulsion",
    efficiency: 90,
    complexity: 75,
    power: 70
  }
]

export default function AnimalTraitLibrary() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTraits = TRAITS.filter(trait =>
    trait.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trait.animal.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trait.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragStart = (e: React.DragEvent, trait: AnimalTrait) => {
    e.dataTransfer.setData("application/json", JSON.stringify(trait))
  }

  return (
    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
      <h2 className="text-lg font-medium mb-4 text-white">Animal Traits</h2>
      <div className="grid gap-4">
        {filteredTraits.map((trait) => (
          <Card
            key={trait.id}
            draggable
            onDragStart={(e) => handleDragStart(e, trait)}
            className="p-4 bg-zinc-800/50 border-zinc-700 cursor-move hover:border-zinc-600 transition-colors"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">{trait.name}</h3>
                  <p className="text-sm text-zinc-400">{trait.animal}</p>
                </div>
                <span className="px-2 py-1 rounded-md bg-zinc-800 text-xs font-medium text-zinc-400">
                  {trait.category}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{trait.description}</p>
              {(trait.efficiency || trait.complexity || trait.power) && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {trait.efficiency && (
                    <div className="text-center">
                      <div className="text-xs text-zinc-400">Efficiency</div>
                      <div className="text-sm font-medium text-emerald-400">{trait.efficiency}%</div>
                    </div>
                  )}
                  {trait.complexity && (
                    <div className="text-center">
                      <div className="text-xs text-zinc-400">Complexity</div>
                      <div className="text-sm font-medium text-blue-400">{trait.complexity}%</div>
                    </div>
                  )}
                  {trait.power && (
                    <div className="text-center">
                      <div className="text-xs text-zinc-400">Power</div>
                      <div className="text-sm font-medium text-amber-400">{trait.power}%</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
