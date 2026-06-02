// ④ 내 영역 — useCityStore.ts
import { create } from 'zustand'
import type { BuildingState } from './types'
import { MOCK_STATE } from './mock'

const USE_MOCK = true   // ← false로 바꾸면 실제 백엔드 연결
const API_BASE = '/api'

let latestSeq = 0       // 레이스 컨디션 방지

interface CityStore {
  timestamp: string
  buildingStates: BuildingState[]
  isLoading: boolean
  setTimestamp: (ts: string) => void   // timestamp만 갱신 (fetch는 CityScene useEffect 담당)
  fetchState: (ts: string) => Promise<void>
}

export const useCityStore = create<CityStore>((set) => ({
  timestamp: '2018-07-15T14:00:00',
  buildingStates: [],
  isLoading: false,

  setTimestamp: (ts) => set({ timestamp: ts }),

  fetchState: async (ts) => {
    const seq = ++latestSeq
    set({ isLoading: true })
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 40))
        if (seq !== latestSeq) return
        set({ buildingStates: MOCK_STATE.buildings, isLoading: false })
      } else {
        const res = await fetch(`${API_BASE}/state?timestamp=${encodeURIComponent(ts)}`)
        if (seq !== latestSeq) return
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        set({ buildingStates: data.buildings, isLoading: false })
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      console.error('[CityStore] fetchState 실패:', err)
      if (seq === latestSeq) set({ isLoading: false })
    }
  },
}))
