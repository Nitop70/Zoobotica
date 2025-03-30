import fs from 'fs'
import { createCanvas } from 'canvas'

// Generate base robot images for each environment
async function generateBaseRobots() {
  const environments = ['land', 'air', 'water'] as const
  const width = 400
  const height = 400

  for (const env of environments) {
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Set background
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, width, height)

    // Draw robot base shape based on environment
    ctx.fillStyle = '#333'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2

    if (env === 'land') {
      // Body
      ctx.beginPath()
      ctx.ellipse(width/2, height/2, 60, 80, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Head
      ctx.beginPath()
      ctx.arc(width/2, height/2 - 70, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Legs
      ctx.beginPath()
      ctx.moveTo(width/2 - 30, height/2 + 60)
      ctx.lineTo(width/2 - 40, height/2 + 120)
      ctx.moveTo(width/2 + 30, height/2 + 60)
      ctx.lineTo(width/2 + 40, height/2 + 120)
      ctx.stroke()

      // Arms
      ctx.beginPath()
      ctx.moveTo(width/2 - 50, height/2)
      ctx.lineTo(width/2 - 80, height/2 + 20)
      ctx.moveTo(width/2 + 50, height/2)
      ctx.lineTo(width/2 + 80, height/2 + 20)
      ctx.stroke()

    } else if (env === 'air') {
      // Body
      ctx.beginPath()
      ctx.ellipse(width/2, height/2, 70, 50, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Head
      ctx.beginPath()
      ctx.arc(width/2, height/2 - 40, 25, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Wings
      ctx.beginPath()
      ctx.moveTo(width/2 - 60, height/2)
      ctx.quadraticCurveTo(width/2 - 100, height/2 - 40, width/2 - 120, height/2 + 20)
      ctx.moveTo(width/2 + 60, height/2)
      ctx.quadraticCurveTo(width/2 + 100, height/2 - 40, width/2 + 120, height/2 + 20)
      ctx.stroke()

      // Tail
      ctx.beginPath()
      ctx.moveTo(width/2, height/2 + 40)
      ctx.lineTo(width/2, height/2 + 100)
      ctx.stroke()

    } else {
      // Body
      ctx.beginPath()
      ctx.ellipse(width/2, height/2, 80, 40, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Head
      ctx.beginPath()
      ctx.arc(width/2 - 60, height/2, 25, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Fins
      ctx.beginPath()
      ctx.moveTo(width/2, height/2 - 30)
      ctx.quadraticCurveTo(width/2, height/2 - 70, width/2 + 20, height/2 - 90)
      ctx.moveTo(width/2, height/2 + 30)
      ctx.quadraticCurveTo(width/2, height/2 + 70, width/2 + 20, height/2 + 90)
      ctx.stroke()

      // Tail
      ctx.beginPath()
      ctx.moveTo(width/2 + 70, height/2)
      ctx.quadraticCurveTo(width/2 + 100, height/2, width/2 + 120, height/2)
      ctx.stroke()
    }

    // Save the image
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(`public/robots/base-${env}.png`, buffer)
  }
}

generateBaseRobots()
