import { useEffect, useState, useMemo } from 'react'
import './styles/dashboard.css'
import { DashboardLayout } from './components/DashboardLayout'
import type { Building as CityBuilding, BuildingState } from './city/types'

function App() {
  const [buildings, setBuildings] = useState<CityBuilding[]>([])
  const [buildingStates, setBuildingStates] = useState<BuildingState[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null)
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState("2017-01-12")
  
  const timestamps = useMemo(() => {
    const times = []
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0')
      times.push(`${selectedDate} ${hour}:00:00`) // 선택한 날짜가 반영됨
    }
    return times
  }, [selectedDate])

  const currentTimestamp = timestamps[currentTimeIndex]

  /* 🔥 핵심: 중심 좌표 계산 */
  const center = useMemo(() => {
    if (!buildings.length) return { x: 0, z: 0 }

    const avgX = buildings.reduce((sum, b) => sum + b.city_x, 0) / buildings.length
    const avgZ = buildings.reduce((sum, b) => sum + b.city_z, 0) / buildings.length

    return { x: avgX, z: avgZ }
  }, [buildings])

  useEffect(() => {
    fetch('http://localhost:8000/api/buildings')
      .then(res => res.json())
      .then(data => {
        setBuildings(data.buildings)

        if (data.buildings.length > 0) {
          setSelectedBuildingId(data.buildings[0].building_id)
        }
      })
      .catch(err => console.error('건물 데이터 가져오기 실패:', err))
  }, [])

  useEffect(() => {
    if (!currentTimestamp) return

    fetch(`http://localhost:8000/api/state?timestamp=${currentTimestamp}`)
      .then(res => res.json())
      .then(data => {
        setBuildingStates(data.buildings)
      })
      .catch(err => console.error('상태 데이터 가져오기 실패:', err))
  }, [currentTimestamp]) // currentTimeIndex가 바뀌어 currentTimestamp가 변경되면 자동으로 재실행!

  return (
    <div className="app-root">
      <DashboardLayout
        buildings={buildings}
        buildingStates={buildingStates}
        selectedBuildingId={selectedBuildingId}
        currentTimeIndex={currentTimeIndex}
        maxTimeIndex={timestamps.length - 1}
        onBuildingSelect={setSelectedBuildingId}
        onTimeIndexChange={setCurrentTimeIndex}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        center={center}
      />
    </div>
  )
}

export default App