import { useEffect, useState } from 'react'

type TimelineBarProps = {
  currentTimeIndex: number
  onTimeIndexChange: (timeIndex: number) => void
  maxTimeIndex: number
}

export function TimelineBar({
  currentTimeIndex,
  onTimeIndexChange,
}: TimelineBarProps) {

  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      const next = currentTimeIndex >= 2 ? 0 : currentTimeIndex + 1
      onTimeIndexChange(next)
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying])

  return (
    <section className="panel timeline-bar">
      <div>
        <button onClick={() => setIsPlaying(true)}>Play</button>
        <button onClick={() => setIsPlaying(false)}>Pause</button>
      </div>

      <input
        type="range"
        min="0"
        max="2"
        value={currentTimeIndex}
        onChange={(e) => onTimeIndexChange(Number(e.target.value))}
      />
    </section>
  )
}