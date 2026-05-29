import { useEffect, useState } from 'react'
import type { EnergyTimePoint } from '../types/energy'

type TimelineBarProps = {
  currentTimeIndex: number
  timePoints: EnergyTimePoint[]
  onTimeIndexChange: (timeIndex: number) => void
}

export function TimelineBar({ currentTimeIndex, timePoints, onTimeIndexChange }: TimelineBarProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const lastIndex = timePoints.length - 1

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    // 재생 중에는 currentTimeIndex를 순차적으로 증가시켜 전체 대시보드 상태를 갱신합니다.
    const timer = window.setInterval(() => {
      onTimeIndexChange(currentTimeIndex >= lastIndex ? 0 : currentTimeIndex + 1)
    }, 900)

    return () => window.clearInterval(timer)
  }, [currentTimeIndex, isPlaying, lastIndex, onTimeIndexChange])

  return (
    <section className="panel timeline-bar">
      <div className="playback-controls">
        <button type="button" onClick={() => setIsPlaying(true)} aria-label="Play timeline">
          Play
        </button>
        <button type="button" onClick={() => setIsPlaying(false)} aria-label="Pause timeline">
          Pause
        </button>
      </div>

      <div className="timeline-readout">
        <span>{isPlaying ? 'Simulating' : 'Paused'}</span>
        <strong>{timePoints[currentTimeIndex]?.timeLabel}</strong>
      </div>

      <input
        type="range"
        min="0"
        max={lastIndex}
        value={currentTimeIndex}
        onChange={(event) => onTimeIndexChange(Number(event.target.value))}
      />
    </section>
  )
}
