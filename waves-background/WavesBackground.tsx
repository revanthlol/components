'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { createNoise2D } from 'simplex-noise'

interface Point {
  x: number
  y: number
  wave: { x: number; y: number }
  cursor: {
    x: number
    y: number
    vx: number
    vy: number
  }
}

export default function WavesDemo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white">
      <div className="w-full flex flex-col items-center">
        {/* Top border */}
        <div className="w-full h-[1px] bg-black/80"></div>

        {/* Waves */}
        <div className="w-full aspect-video relative">
          <Waves />
        </div>

        {/* Bottom border */}
        <div className="w-full h-[1px] bg-black/80"></div>
      </div>
    </div>
  )
}

function Waves({
  strokeColor = '#000000',
  backgroundColor = '#ffffff',
  pointerSize = 0.5,
}: {
  strokeColor?: string
  backgroundColor?: string
  pointerSize?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const mouseRef = useRef({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  })

  const pathsRef = useRef<SVGPathElement[]>([])
  const linesRef = useRef<Point[][]>([])
  const noiseRef = useRef<((x: number, y: number) => number) | null>(null)
  const rafRef = useRef<number | null>(null)
  const boundingRef = useRef<DOMRect | null>(null)

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return

    noiseRef.current = createNoise2D()

    setSize()
    setLines()

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const setSize = () => {
    if (!containerRef.current || !svgRef.current) return

    boundingRef.current = containerRef.current.getBoundingClientRect()
    const { width, height } = boundingRef.current

    svgRef.current.style.width = `${width}px`
    svgRef.current.style.height = `${height}px`
  }

  const setLines = () => {
    if (!svgRef.current || !boundingRef.current) return

    const { width, height } = boundingRef.current

    linesRef.current = []
    pathsRef.current.forEach((p) => p.remove())
    pathsRef.current = []

    const xGap = 8
    const yGap = 8

    const totalLines = Math.ceil((width + 200) / xGap)
    const totalPoints = Math.ceil((height + 30) / yGap)

    const xStart = (width - xGap * totalLines) / 2
    const yStart = (height - yGap * totalPoints) / 2

    for (let i = 0; i < totalLines; i++) {
      const points: Point[] = []

      for (let j = 0; j < totalPoints; j++) {
        points.push({
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        })
      }

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      )

      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', strokeColor)
      path.setAttribute('stroke-width', '1')

      svgRef.current.appendChild(path)
      pathsRef.current.push(path)
      linesRef.current.push(points)
    }
  }

  const onResize = () => {
    setSize()
    setLines()
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!boundingRef.current) return

    const mouse = mouseRef.current
    mouse.x = e.pageX - boundingRef.current.left
    mouse.y = e.pageY - boundingRef.current.top
  }

  const movePoints = (time: number) => {
    const noise = noiseRef.current
    const mouse = mouseRef.current
    if (!noise) return

    linesRef.current.forEach((points) => {
      points.forEach((p) => {
        const move =
          noise((p.x + time * 0.008) * 0.003, (p.y + time * 0.003) * 0.002) * 8

        p.wave.x = Math.cos(move) * 12
        p.wave.y = Math.sin(move) * 6

        const dx = p.x - mouse.sx
        const dy = p.y - mouse.sy
        const d = Math.hypot(dx, dy)
        const l = Math.max(175, mouse.vs)

        if (d < l) {
          const s = 1 - d / l
          const f = Math.cos(d * 0.001) * s

          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035
        }

        p.cursor.vx += (0 - p.cursor.x) * 0.01
        p.cursor.vy += (0 - p.cursor.y) * 0.01

        p.cursor.vx *= 0.95
        p.cursor.vy *= 0.95

        p.cursor.x += p.cursor.vx
        p.cursor.y += p.cursor.vy
      })
    })
  }

  const drawLines = () => {
    linesRef.current.forEach((points, i) => {
      if (!points.length) return

      let d = `M ${points[0].x} ${points[0].y}`

      for (let j = 1; j < points.length; j++) {
        const p = points[j]
        d += `L ${p.x + p.wave.x + p.cursor.x} ${
          p.y + p.wave.y + p.cursor.y
        }`
      }

      pathsRef.current[i].setAttribute('d', d)
    })
  }

  const tick = (time: number) => {
    const mouse = mouseRef.current

    mouse.sx += (mouse.x - mouse.sx) * 0.1
    mouse.sy += (mouse.y - mouse.sy) * 0.1

    const dx = mouse.x - mouse.lx
    const dy = mouse.y - mouse.ly

    mouse.vs += (Math.hypot(dx, dy) - mouse.vs) * 0.1
    mouse.lx = mouse.x
    mouse.ly = mouse.y
    mouse.a = Math.atan2(dy, dx)

    movePoints(time)
    drawLines()

    rafRef.current = requestAnimationFrame(tick)
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ backgroundColor }}
    >
      <svg ref={svgRef} className="w-full h-full" />
      <div
        style={{
          position: 'absolute',
          width: `${pointerSize}rem`,
          height: `${pointerSize}rem`,
          background: strokeColor,
          borderRadius: '50%',
          transform: `translate(${mouseRef.current.sx}px, ${mouseRef.current.sy}px)`,
        }}
      />
    </div>
  )
}