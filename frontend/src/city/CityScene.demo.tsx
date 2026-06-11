import { CityScene } from './CityScene'
import { MOCK_BUILDINGS, MOCK_STATE } from './mock'

const RISK_COLOR: Record<string, string> = {
  normal: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
}

type Props = {
  buildings: any[]
  selectedId: string
  currentTimeIndex: number
  onBuildingClick: (id: string) => void
}

export function CitySceneDemo({
  buildings,
  selectedId,
  currentTimeIndex,
  onBuildingClick,
}: Props) {
  const selected = MOCK_BUILDINGS.find(
    (b) => String(b.building_id) === selectedId
  )

  const selectedState = MOCK_STATE.buildings.find(
    (b) => String(b.building_id) === selectedId
  )

  const danger = MOCK_STATE.buildings.filter((b) => b.risk === 'danger').length
  const warning = MOCK_STATE.buildings.filter((b) => b.risk === 'warning').length
  const normal = MOCK_STATE.buildings.filter((b) => b.risk === 'normal').length

  const handleClick = (id: number) => {
    onBuildingClick(String(id))
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CityScene
        buildings={MOCK_BUILDINGS}
        selectedId={Number(selectedId)}
        viewMode="status"
        onBuildingClick={handleClick}
      />

      {/* 좌상단 */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        background: 'rgba(15,23,42,0.82)',
        padding: '12px 18px',
        borderRadius: 10,
        pointerEvents: 'none',
      }}>
        <div style={{ color: '#38bdf8', fontWeight: 800 }}>
          DIGITAL TWIN
        </div>
      </div>

      {/* 선택 카드 */}
      {selected && selectedState && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          padding: 16,
          borderRadius: 10,
          color: 'white',
        }}>
          <div>{selected.display_name}</div>
          <div style={{ color: RISK_COLOR[selectedState.risk] }}>
            {selectedState.risk}
          </div>
        </div>
      )}
    </div>
  )
}