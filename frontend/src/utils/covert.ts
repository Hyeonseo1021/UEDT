// utils/convertToCity.ts

import type { Building as EnergyBuilding } from '../types/energy'
import type { Building as CityBuilding } from '../city/types'

export function convertToCityBuildings(
  buildings: EnergyBuilding[]
): CityBuilding[] {
  return buildings.map((b, index) => ({
    building_id: Number(b.id),
    display_name: b.name,
    building_type: 'office', // 나중에 매핑
    city_x: (index % 5) * 20,
    city_z: Math.floor(index / 5) * 20,
    height_factor: 1,
  }))
}