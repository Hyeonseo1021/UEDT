import type { Building, BuildingState } from '../city/types'

type AlertFeedProps = {
  buildings: Building[]              // 🔥 추가
  buildingStates: BuildingState[]
}

export function AlertFeed({ buildings, buildingStates }: AlertFeedProps) {

  // 🔥 상태 map
  const buildingMap = new Map(
    buildings.map((b) => [b.building_id, b])
  )

  const alerts = buildingStates.filter(
    (b) => b.risk === 'warning' || b.risk === 'danger'
  )

  return (
    <section className="panel alert-panel">
      <div className="panel-title">Alert Feed</div>

      {alerts.length === 0 ? (
        <div className="empty-alert">현재 과부하 위험 없음</div>
      ) : (
        <ul className="alert-list">
          {alerts.map((alert) => {
            const building = buildingMap.get(alert.building_id)

            return (
              <li
                className={`alert-item ${alert.risk}`}
                key={alert.building_id}
              >
                <span className="alert-dot" />

                <div>
                  <strong>
                    {building?.display_name ?? `Building ${alert.building_id}`}
                  </strong>

                  <small>
                    load {alert.load_kw} kW
                  </small>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}