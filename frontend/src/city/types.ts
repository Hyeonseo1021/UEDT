// ④ 내 영역 — types.ts
// 팀 간 계약 타입. 변경 시 ③·⑤ 협의 필수.

export interface Building {
  building_id: number
  building_type: 'office' | 'residential' | 'commercial' | 'public'
  display_name: string
  city_x: number
  city_z: number
  height_factor: number
}

export type RiskLevel = 'normal' | 'warning' | 'danger'

export interface BuildingState {
  building_id: number
  load_kw: number
  predicted_kw: number
  risk: RiskLevel
}

export interface ApiStateResponse {
  timestamp: string
  weather: { temperature: number; humidity: number }
  buildings: BuildingState[]
}

export type ViewMode = 'status' | 'heatmap'

// ③과의 계약 — 임의 변경 금지
export interface CitySceneProps {
  buildings: Building[]
  selectedId: number | null
  viewMode: ViewMode
  onBuildingClick: (id: number) => void
}
