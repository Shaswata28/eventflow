'use client'

import { useEffect, useState } from 'react'

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    // Generate particles on client side to avoid hydration mismatch
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 60) + 20, // 20px to 80px
      left: Math.floor(Math.random() * 100), // 0% to 100%
      top: Math.floor(Math.random() * 100), // 0% to 100%
      animationDuration: Math.floor(Math.random() * 20) + 15, // 15s to 35s
      animationDelay: Math.floor(Math.random() * 10),
      xMove: Math.floor(Math.random() * 100) - 50, // -50px to 50px
      yMove: Math.floor(Math.random() * 100) - 50, // -50px to 50px
    }))
    setParticles(newParticles)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-gray-950 dark:via-gray-950 dark:to-indigo-950/20 transition-colors duration-500">
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Animated Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full mix-blend-multiply dark:mix-blend-screen opacity-40 dark:opacity-30 animate-drift"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: p.id % 2 === 0 ? '#6366f1' : '#a855f7', // Indigo or Purple
            filter: 'blur(15px)',
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `${p.animationDelay}s`,
            '--x-move': `${p.xMove}px`,
            '--y-move': `${p.yMove}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
