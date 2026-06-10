import type { Building } from '../types/energy'
import { buildAlertFeed } from '../utils/energySimulation'

type AlertFeedProps = {
  buildings: Building[]
}

export function AlertFeed({ buildings }: AlertFeedProps) {
  const alerts = buildAlertFeed(buildings)

  return (
    <section className="panel alert-panel">
      <div className="panel-title">Alert Feed</div>

      {alerts.length === 0 ? (
        <div className="empty-alert">현재 과부하 위험 없음</div>
      ) : (
        <ul className="alert-list">
          {alerts.map((alert) => (
            <li className={`alert-item ${alert.riskLevel}`} key={alert.id}>
              <span className="alert-dot" />
              <div>
                <strong>{alert.message}</strong>
                <small>
                  {alert.zone} · load {alert.loadRate}%
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
