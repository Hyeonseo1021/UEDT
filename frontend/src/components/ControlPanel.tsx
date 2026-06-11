type ControlPanelProps = {
  currentTimeIndex: number
  maxTimeIndex: number 
  selectedDate: string
  onTimeIndexChange: (timeIndex: number) => void
  onDateChange: (date: string) => void
}

export function ControlPanel({
  currentTimeIndex,
  maxTimeIndex, 
  onTimeIndexChange,
  selectedDate,
  onDateChange
}: ControlPanelProps) {

  return (
    <aside className="panel control-panel">
      <div className="panel-title">Control Panel</div>

      <label className="control-field" style={{ marginBottom: '20px' }}>
        <span>Date</span>
        <input
          type="date"
          value={selectedDate}
          min="2017-01-01"
          max="2019-12-31" // DB에 있는 데이터 기간으로 제한
          onChange={(e) => onDateChange(e.target.value)}
          style={{ width: '100%', padding: '5px', marginTop: '5px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px' }}
        />
      </label>

      <label className="control-field">
        <span>Time Index</span>
        <strong>{currentTimeIndex}</strong>
        <input
          type="range"
          min="0"
          max={maxTimeIndex} 
          value={currentTimeIndex}
          onChange={(e) => onTimeIndexChange(Number(e.target.value))}
        />
      </label>
    </aside>
  )
}