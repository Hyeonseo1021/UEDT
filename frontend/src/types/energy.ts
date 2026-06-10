export type ZoneType = 'residential' | 'commercial' | 'industrial'

export type RiskLevel = 'normal' | 'caution' | 'danger'

export type ViewMode = 'status' | 'load' | 'zone'

export type Building = {
  id: string
  name: string
  zone: ZoneType
  position: {
    x: number
    y: number
    z?: number
  }
  baseConsumption: number
  threshold: number
  currentConsumption?: number
  predictedConsumption?: number
  optimizedConsumption?: number
  loadRate?: number
  riskLevel?: RiskLevel
}

export type EnergyTimePoint = {
  timeIndex: number
  timeLabel: string
  buildingId: string
  actualConsumption: number
  predictedConsumption: number
  threshold: number
  temperature: number
  humidity: number
  demandFactor: number
}

export type ScenarioControls = {
  temperature: number
  humidity: number
  demandIncrease: number
}

export type TimelinePoint = EnergyTimePoint & {
  loadRate: number
}

export type AlertItem = {
  id: string
  buildingName: string
  zone: ZoneType
  message: string
  riskLevel: Exclude<RiskLevel, 'normal'>
  loadRate: number
}
