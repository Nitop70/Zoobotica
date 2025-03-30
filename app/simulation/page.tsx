'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

interface PerformanceScore {
  score: number
  explanation: string
}

interface PerformanceAnalysis {
  performance_scores: {
    mobility: PerformanceScore
    durability: PerformanceScore
    efficiency: PerformanceScore
    task_suitability: PerformanceScore
  }
  strengths: string[]
  limitations: string[]
  overall_score: number
  recommendations: string[]
}

export default function SimulationPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [robotData, setRobotData] = useState<any>(null)
  const [environment, setEnvironment] = useState('land')

  useEffect(() => {
    const loadRobotData = () => {
      try {
        const storedData = localStorage.getItem('robotData');
        if (!storedData) {
          throw new Error('No robot data found');
        }

        const robotData = JSON.parse(storedData);
        console.log('Loaded robot data:', robotData);
        
        if (!robotData.parts || !Array.isArray(robotData.parts)) {
          throw new Error('Invalid robot data format');
        }

        setRobotData(robotData);
        setEnvironment(robotData.environment || 'land');
        analyzePerformance(robotData);
      } catch (error) {
        console.error('Error loading robot data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load robot data');
      }
    };

    loadRobotData();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw environment background
      drawEnvironment(ctx, environment);

      // Draw robot in the center
      const robotX = canvas.width / 2;
      const robotY = canvas.height / 2;
      drawRobot(ctx, robotX, robotY);

      // Draw performance overlay
      if (analysis) {
        drawPerformanceOverlay(ctx, analysis);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [analysis, environment]);

  const drawEnvironment = (ctx: CanvasRenderingContext2D, environment: string) => {
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    switch (environment) {
      case 'land':
        // Draw terrain
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.height);
        for (let x = 0; x < ctx.canvas.width; x++) {
          ctx.lineTo(x, ctx.canvas.height / 2 + 20 * Math.sin(x / 40 + Date.now() / 1000));
        }
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
        break;

      case 'water':
        // Draw waves
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.height);
        for (let x = 0; x < ctx.canvas.width; x++) {
          ctx.lineTo(x, ctx.canvas.height / 2 + 20 * Math.sin(x / 40 + Date.now() / 1000));
        }
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
        break;

      case 'air':
        // Draw clouds
        ctx.fillStyle = '#60a5fa';
        for (let i = 0; i < 10; i++) {
          const x = (i * 100 + Date.now() / 100) % ctx.canvas.width;
          const y = 100 + Math.sin(i) * 50;
          drawCloud(ctx, x, y);
        }
        break;
    }
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
    ctx.arc(x + 15, y + 10, 15, 0, Math.PI * 2);
    ctx.arc(x + 30, y, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawRobot = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Robot body
    ctx.fillStyle = '#4a9eff';
    ctx.beginPath();
    ctx.roundRect(-25, -30, 50, 60, 10);
    ctx.fill();

    // Robot head/sensor
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(0, -35, 15, 0, Math.PI * 2);
    ctx.fill();

    // Robot eyes/sensors
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.arc(-8, -38, 5, 0, Math.PI * 2);
    ctx.arc(8, -38, 5, 0, Math.PI * 2);
    ctx.fill();

    // Robot wheels/legs
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(-30, -20, 10, 40, 5);
    ctx.roundRect(20, -20, 10, 40, 5);
    ctx.fill();

    ctx.restore();
  };

  const drawPerformanceOverlay = (ctx: CanvasRenderingContext2D, analysis: PerformanceAnalysis) => {
    const padding = 20;
    const width = 200;
    const height = 300;
    const x = ctx.canvas.width - width - padding;
    const y = padding;

    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.fill();

    // Draw title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 16px Inter';
    ctx.fillText('Performance Analysis', x + 10, y + 25);

    // Draw scores
    ctx.font = '14px Inter';
    const metrics = [
      { label: 'Mobility', score: analysis.performance_scores.mobility.score },
      { label: 'Durability', score: analysis.performance_scores.durability.score },
      { label: 'Efficiency', score: analysis.performance_scores.efficiency.score },
      { label: 'Task Fit', score: analysis.performance_scores.task_suitability.score }
    ];

    metrics.forEach((metric, i) => {
      const metricY = y + 60 + i * 40;
      
      // Draw label
      ctx.fillStyle = '#1e40af';
      ctx.fillText(metric.label, x + 10, metricY);

      // Draw score bar
      const barWidth = 100;
      const barHeight = 10;
      
      // Background
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.roundRect(x + 80, metricY - 8, barWidth, barHeight, 5);
      ctx.fill();
      
      // Fill
      ctx.fillStyle = getScoreColor(metric.score);
      ctx.beginPath();
      ctx.roundRect(x + 80, metricY - 8, (metric.score / 100) * barWidth, barHeight, 5);
      ctx.fill();
      
      // Score text
      ctx.fillStyle = '#1e40af';
      ctx.fillText(metric.score.toString(), x + 190, metricY);
    });

    // Draw overall score
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 24px Inter';
    ctx.fillText(analysis.overall_score.toString(), x + 10, y + height - 20);
    ctx.font = '14px Inter';
    ctx.fillText('Overall Score', x + 50, y + height - 20);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#22c55e'; // Green
    if (score >= 70) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const analyzePerformance = async (robotData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!robotData || !robotData.parts) {
        throw new Error('Invalid robot data');
      }

      const requestBody = {
        robotData: {
          parts: robotData.parts,
          environment: robotData.environment || 'land'
        },
        environment: robotData.environment || 'land'
      };

      console.log('Sending request:', requestBody);
      
      const response = await fetch('/api/analyze-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze performance');
      }

      const data = await response.json();
      console.log('Analysis response:', data);
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing performance:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze performance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Robot Simulation</h1>
          <Button onClick={() => router.push('/')}>Back to Designer</Button>
        </div>

        <div className="grid gap-8">
          <Card className="p-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full border rounded-lg bg-white"
            />
          </Card>

          {error && (
            <Card className="p-6 border-destructive">
              <p className="text-destructive">{error}</p>
            </Card>
          )}

          {loading && (
            <Card className="p-6">
              <p className="mb-2">Analyzing robot performance...</p>
              <Progress value={30} className="w-full" />
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

(CanvasRenderingContext2D.prototype as any).roundRect = function(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  this.beginPath();
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y, x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
}
