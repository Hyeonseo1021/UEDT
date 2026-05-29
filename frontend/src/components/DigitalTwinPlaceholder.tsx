import type { Building, RiskLevel, ViewMode } from '../types/energy'

type DigitalTwinPlaceholderProps = {
  buildings: Building[]
  selectedId: string
  currentTimeIndex: number
  viewMode?: ViewMode
  onBuildingClick: (id: string) => void
}

const riskLabels: Record<RiskLevel, string> = {
  normal: 'Low',
  caution: 'Moderate',
  danger: 'High',
}

export function DigitalTwinPlaceholder({
  buildings,
  selectedId,
  currentTimeIndex,
  viewMode = 'status',
  onBuildingClick,
}: DigitalTwinPlaceholderProps) {
  return (
    <section className="panel city-panel" aria-label="Virtual city model">
      <div className="panel-title city-title">
        <span>Virtual City Model</span>
        <span className="mode-pill">{viewMode} · T{String(currentTimeIndex).padStart(2, '0')}</span>
      </div>

      {/* TODO: Replace this placeholder with React Three Fiber CityScene */}
      {/* 디지털트윈 교체 부분
          연결 기준 props는 buildings, selectedId, currentTimeIndex, onBuildingClick입니다. */}
      <div className="city-grid" role="list">
        {buildings.map((building) => {
          const riskLevel = building.riskLevel ?? 'normal'
          // 부하율이 높을수록 건물이 높아지도록 크기 변화 있음.
          const height = Math.max(84, Math.min(170, (building.loadRate ?? 50) * 1.32))

          return (
            <button
              className={`building-card ${riskLevel} ${selectedId === building.id ? 'selected' : ''}`}
              key={building.id}
              style={{
                left: `${building.position.x}%`,
                top: `${building.position.y}%`,
                height,
              }}
              type="button"
              onClick={() => onBuildingClick(building.id)}
              role="listitem"
            >
              <span className="building-roof" />
              <span className="building-copy">
                <span className="building-id">{building.id}</span>
                <span className="building-name">{building.name}</span>
                <span className="building-meta">{building.zone}</span>
                <span className="building-load">
                  <strong>{building.loadRate}%</strong>
                  <span>{riskLabels[riskLevel]}</span>
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="risk-legend">
        <span>
          <i className="legend-dot normal" /> Low
        </span>
        <span>
          <i className="legend-dot caution" /> Moderate
        </span>
        <span>
          <i className="legend-dot danger" /> High
        </span>
      </div>
    </section>
  )
}
