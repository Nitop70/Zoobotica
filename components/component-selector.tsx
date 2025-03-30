"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Cpu, Zap, Eye, Hand, Footprints } from "lucide-react"

type ComponentCategory = {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

type ComponentItem = {
  id: string
  name: string
  animal: string
  description: string
  category: string
}

type UserPreferences = {
  robotTask: string
  operatingEnvironment: string
  keyFeatures: string[]
}

const CATEGORIES: ComponentCategory[] = [
  { id: "locomotion", name: "Locomotion", icon: <Footprints className="h-5 w-5" />, color: "emerald" },
  { id: "manipulation", name: "Manipulation", icon: <Hand className="h-5 w-5" />, color: "yellow" },
  { id: "propulsion", name: "Propulsion", icon: <Zap className="h-5 w-5" />, color: "blue" },
  { id: "sensing", name: "Sensing", icon: <Eye className="h-5 w-5" />, color: "purple" },
  { id: "processing", name: "Processing", icon: <Cpu className="h-5 w-5" />, color: "pink" },
]

const COMPONENTS: ComponentItem[] = [
  {
    id: "gecko-feet",
    name: "Adhesive Pads",
    animal: "Gecko",
    description: "Microscopic hairs that allow climbing on virtually any surface through van der Waals forces.",
    category: "locomotion",
  },
  {
    id: "cheetah-legs",
    name: "Sprint Mechanics",
    animal: "Cheetah",
    description: "Specialized leg structure allowing for rapid acceleration and high-speed movement.",
    category: "locomotion",
  },
  {
    id: "kangaroo-legs",
    name: "Energy-Storing Tendons",
    animal: "Kangaroo",
    description: "Elastic energy storage in tendons for efficient jumping and movement.",
    category: "locomotion",
  },
  {
    id: "elephant-trunk",
    name: "Flexible Manipulator",
    animal: "Elephant",
    description: "Highly dexterous appendage with over 40,000 muscles for precise object manipulation.",
    category: "manipulation",
  },
  {
    id: "octopus-arms",
    name: "Distributed Control",
    animal: "Octopus",
    description: "Tentacles with independent neural control for complex manipulation tasks.",
    category: "manipulation",
  },
  {
    id: "manta-ray",
    name: "Oscillating Fins",
    animal: "Manta Ray",
    description: "Efficient underwater propulsion through wave-like movements of large fins.",
    category: "propulsion",
  },
  {
    id: "eagle-eyes",
    name: "High-Resolution Vision",
    animal: "Eagle",
    description: "Visual acuity up to 4-5 times that of humans with excellent color perception.",
    category: "sensing",
  },
  {
    id: "bat-sonar",
    name: "Echolocation",
    animal: "Bat",
    description: "Precise navigation and object detection using sound wave reflections.",
    category: "sensing",
  },
]

export default function ComponentSelector({ userPreferences }: { userPreferences: UserPreferences }) {
  const [activeCategory, setActiveCategory] = useState("locomotion")
  const [wheelRotation, setWheelRotation] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const filteredComponents = COMPONENTS.filter((component) => component.category === activeCategory)

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)

    // Calculate new wheel rotation
    const categoryIndex = CATEGORIES.findIndex((cat) => cat.id === categoryId)
    const rotationDegree = -1 * (categoryIndex * (360 / CATEGORIES.length))
    setWheelRotation(rotationDegree)
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  const getCategoryColorClass = (categoryId: string) => {
    const category = CATEGORIES.find((cat) => cat.id === categoryId)
    switch (category?.color) {
      case "emerald":
        return "text-emerald-400"
      case "yellow":
        return "text-yellow-400"
      case "blue":
        return "text-blue-400"
      case "purple":
        return "text-purple-400"
      case "pink":
        return "text-pink-400"
      default:
        return "text-emerald-400"
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Category Wheel Selector */}
      <div className="p-4 flex justify-center">
        <div className="relative w-48 h-48">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${wheelRotation}deg)`, transition: "transform 0.5s ease-out" }}
          >
            {CATEGORIES.map((category, index) => {
              const angle = (index * 360) / CATEGORIES.length
              const isActive = category.id === activeCategory

              return (
                <div
                  key={category.id}
                  className={`absolute p-2 rounded-full ${
                    isActive ? "bg-zinc-800" : "bg-zinc-900"
                  } cursor-pointer transition-all duration-300 hover:scale-110`}
                  style={{
                    transform: `rotate(${angle}deg) translate(60px) rotate(-${angle}deg)`,
                  }}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <div className={`${isActive ? getCategoryColorClass(category.id) : "text-zinc-500"}`}>
                    {category.icon}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className={`text-lg font-medium ${getCategoryColorClass(activeCategory)}`}>
                {CATEGORIES.find((cat) => cat.id === activeCategory)?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Component Scroller */}
      <div className="relative px-4 flex-1">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 border-zinc-700"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 snap-x"
          style={{ scrollbarWidth: "thin", scrollBehavior: "smooth" }}
        >
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              className="flex-shrink-0 w-64 snap-start bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-emerald-500/50 cursor-pointer transition-colors"
            >
              <div className="p-4">
                <h3 className={`font-medium ${getCategoryColorClass(component.category)}`}>{component.name}</h3>
                <p className="text-sm text-zinc-400 mt-1">From: {component.animal}</p>
                <p className="text-sm text-zinc-300 mt-2 line-clamp-3">{component.description}</p>
                <Button className="w-full mt-3 bg-zinc-700 hover:bg-zinc-600" size="sm">
                  Add to Zoobot
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 border-zinc-700"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

