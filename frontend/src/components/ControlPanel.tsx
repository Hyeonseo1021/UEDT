import type { Dispatch, SetStateAction } from 'react'
import type { EnergyTimePoint, ScenarioControls} from '../types/energy'

type ControlPanelProps = {
  currentTimeIndex: number
  scenario: ScenarioControls
  timePoints: EnergyTimePoint[]
  onScenarioChange: Dispatch<SetStateAction<ScenarioControls>>
  onTimeIndexChange: (timeIndex: number) => void
}


export function ControlPanel({
  currentTimeIndex,
  scenario,
  timePoints,
  onScenarioChange,
  onTimeIndexChange,
}: ControlPanelProps) {
  const updateScenario = (key: keyof ScenarioControls, value: number) => {
    onScenarioChange((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  return (
    <aside className="panel control-panel">
      <div className="panel-title">Control Panel</div>

      <label className="control-field">
        <span>Time</span>
        <strong>{timePoints[currentTimeIndex]?.timeLabel}</strong>
        <input
          type="range"
          min="0"
          max={timePoints.length - 1}
          value={currentTimeIndex}
          onChange={(event) => onTimeIndexChange(Number(event.target.value))}
        />
      </label>

      <label className="control-field">
        <span>Temperature</span>
        <strong>{scenario.temperature}°C</strong>
        <input
          type="range"
          min="16"
          max="38"
          value={scenario.temperature}
          onChange={(event) => updateScenario('temperature', Number(event.target.value))}
        />
      </label>

      <label className="control-field">
        <span>Humidity</span>
        <strong>{scenario.humidity}%</strong>
        <input
          type="range"
          min="30"
          max="90"
          value={scenario.humidity}
          onChange={(event) => updateScenario('humidity', Number(event.target.value))}
        />
      </label>

      <label className="control-field">
        <span>Demand Increase</span>
        <strong>{scenario.demandIncrease}%</strong>
        <input
          type="range"
          min="0"
          max="60"
          value={scenario.demandIncrease}
          onChange={(event) => updateScenario('demandIncrease', Number(event.target.value))}
        />
      </label>

    </aside>
  )
}
