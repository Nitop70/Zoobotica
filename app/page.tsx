"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Zap, Layers, MessageSquare, Database, Cpu, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Types
interface UserPreferences {
  robotTask: string
  operatingEnvironment: string
  keyFeatures: string[]
  generatedDesign?: string
}

interface GeneratedTrait {
  id: string
  name: string
  description: string
  category: string
}

// Dynamic imports with loading states
const ZoobotPreview = dynamic(() => import("@/components/zoobot-preview"), {
  loading: () => <div className="animate-pulse">Loading preview...</div>,
  ssr: false
})

const AnimalTraitLibrary = dynamic(() => import("@/components/animal-trait-library"), {
  loading: () => <div className="animate-pulse">Loading trait library...</div>,
  ssr: false
})

const OnboardingQuestionnaire = dynamic(() => import("@/components/onboarding-questionnaire"), {
  loading: () => <div className="animate-pulse">Loading questionnaire...</div>,
  ssr: false
})

const ZoobotChatAssistant = dynamic(() => import("@/components/zoobot-chat-assistant"), {
  loading: () => <div className="animate-pulse">Loading chat assistant...</div>,
  ssr: false
})

const TraitRecommendations = dynamic(() => import("@/components/trait-recommendations"), {
  loading: () => <div className="animate-pulse">Loading recommendations...</div>,
  ssr: false
})

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    robotTask: "",
    operatingEnvironment: "",
    keyFeatures: [],
    generatedDesign: "",
  })

  const handleOnboardingCompleteAction = (preferences: UserPreferences) => {
    setUserPreferences(preferences)
    setOnboardingComplete(true)
  }

  if (!onboardingComplete) {
    return <OnboardingQuestionnaire onCompleteAction={handleOnboardingCompleteAction} />
  }

  return (
    <div>
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-emerald-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
              Zoobotica
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search animal traits..."
                className="pl-8 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700">
              Save Project
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">Export Design</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left Panel - Animal Traits */}
        <div className="col-span-3">
          <AnimalTraitLibrary />
        </div>

        {/* Center Panel - Robot Preview */}
        <div className="col-span-6">
          <ZoobotPreview preferences={userPreferences} onBodyPartClick={setSelectedPart} />
        </div>

        {/* Right Panel - Trait Recommendations */}
        <div className="col-span-3">
          <TraitRecommendations preferences={userPreferences} />
        </div>
      </main>

      {/* Chat Assistant Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <Card className="w-96 bg-zinc-900 border-zinc-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Design Assistant</h3>
                    <p className="text-xs text-zinc-400">Powered by biomimetic AI</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ZoobotChatAssistant userPreferences={userPreferences} />
            </div>
          </Card>
        ) : (
          <Button
            onClick={() => setIsChatOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with AI
          </Button>
        )}
      </div>
    </div>
  )
}
