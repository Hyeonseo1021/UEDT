import type { BuildingState } from '../city/types'

type EnergyChartProps = {
  buildingStates: BuildingState[]
}

export function EnergyChart({ buildingStates }: EnergyChartProps) {
  return (
    <section className="panel chart-panel">
      <div className="panel-title">Energy Overview</div>

      <div style={{ padding: 12 }}>
        {buildingStates.map((b) => (
          <div key={b.building_id}>
            Building {b.building_id} : {b.load_kw} kW ({b.risk})
          </div>
        ))}
      </div>
    </section>
  )
}