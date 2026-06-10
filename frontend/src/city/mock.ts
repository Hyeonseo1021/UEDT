// ④ 내 영역 — mock.ts
// x: 도로(±13.5) → 나무(±13) → 건물(±26 이상) 으로 충분한 여백 확보
// z: 건물 깊이(최대 13) + 여백 11 = 24 단위 간격

import type { Building, ApiStateResponse } from './types'

export const MOCK_BUILDINGS: Building[] = [
  // ─── 좌측 열 (x=-26) — 주거 + 오피스 ───────────────────────────────────
  { building_id: 1,  building_type: 'residential', display_name: 'Suzhou Apt A',    city_x: -26, city_z:  12, height_factor: 6.5 },
  { building_id: 2,  building_type: 'residential', display_name: 'Suzhou Apt B',    city_x: -26, city_z: -12, height_factor: 7.2 },
  { building_id: 3,  building_type: 'residential', display_name: 'Suzhou Apt C',    city_x: -26, city_z: -36, height_factor: 6.8 },
  { building_id: 4,  building_type: 'residential', display_name: 'Suzhou Apt D',    city_x: -26, city_z: -60, height_factor: 7.5 },
  { building_id: 5,  building_type: 'office',      display_name: 'West Tower',      city_x: -26, city_z: -84, height_factor: 8.0 },

  // ─── 우측 열 (x=26) — 오피스 + 상업 ────────────────────────────────────
  { building_id: 6,  building_type: 'office',      display_name: 'Park View Tower', city_x:  26, city_z:  12, height_factor: 9.0 },
  { building_id: 7,  building_type: 'office',      display_name: 'East Tower 1',    city_x:  26, city_z: -12, height_factor: 8.5 },
  { building_id: 8,  building_type: 'office',      display_name: 'East Tower 2',    city_x:  26, city_z: -36, height_factor: 7.8 },
  { building_id: 9,  building_type: 'commercial',  display_name: 'Commerce Plaza',  city_x:  26, city_z: -60, height_factor: 3.0 },
  { building_id: 10, building_type: 'commercial',  display_name: 'Retail Center',   city_x:  26, city_z: -84, height_factor: 2.8 },

  // ─── 좌측 2열 (x=-44) ───────────────────────────────────────────────────
  { building_id: 11, building_type: 'residential', display_name: 'Garden Apt 1',    city_x: -44, city_z:   8, height_factor: 5.5 },
  { building_id: 12, building_type: 'residential', display_name: 'Garden Apt 2',    city_x: -44, city_z: -18, height_factor: 6.0 },
  { building_id: 13, building_type: 'residential', display_name: 'Garden Apt 3',    city_x: -44, city_z: -44, height_factor: 5.8 },
  { building_id: 14, building_type: 'public',      display_name: 'City Hall',       city_x: -44, city_z: -70, height_factor: 4.5 },

  // ─── 우측 2열 (x=44) ────────────────────────────────────────────────────
  { building_id: 15, building_type: 'office',      display_name: 'Finance Center',  city_x:  44, city_z:   8, height_factor: 7.0 },
  { building_id: 16, building_type: 'office',      display_name: 'Tech Tower',      city_x:  44, city_z: -18, height_factor: 8.2 },
  { building_id: 17, building_type: 'commercial',  display_name: 'Shopping Mall',   city_x:  44, city_z: -44, height_factor: 2.5 },
  { building_id: 18, building_type: 'public',      display_name: 'Cultural Center', city_x:  44, city_z: -70, height_factor: 4.0 },

  // ─── 입구 좌우 (카메라 근처, 나무 라인보다 충분히 바깥) ──────────────────
  { building_id: 19, building_type: 'commercial',  display_name: 'Boulevard Cafe',  city_x: -22, city_z:  32, height_factor: 2.2 },
  { building_id: 20, building_type: 'public',      display_name: 'Info Center',     city_x:  22, city_z:  32, height_factor: 2.5 },
]

export const MOCK_STATE: ApiStateResponse = {
  timestamp: '2018-07-15T14:00:00',
  weather: { temperature: 32.1, humidity: 68 },
  buildings: [
    { building_id: 1,  load_kw: 820, predicted_kw: 800, risk: 'danger'  },
    { building_id: 2,  load_kw: 610, predicted_kw: 600, risk: 'warning' },
    { building_id: 3,  load_kw: 430, predicted_kw: 440, risk: 'normal'  },
    { building_id: 4,  load_kw: 550, predicted_kw: 530, risk: 'warning' },
    { building_id: 5,  load_kw: 780, predicted_kw: 760, risk: 'danger'  },
    { building_id: 6,  load_kw: 210, predicted_kw: 205, risk: 'normal'  },
    { building_id: 7,  load_kw: 195, predicted_kw: 200, risk: 'normal'  },
    { building_id: 8,  load_kw: 310, predicted_kw: 280, risk: 'warning' },
    { building_id: 9,  load_kw: 180, predicted_kw: 185, risk: 'normal'  },
    { building_id: 10, load_kw: 245, predicted_kw: 240, risk: 'normal'  },
    { building_id: 11, load_kw: 270, predicted_kw: 265, risk: 'normal'  },
    { building_id: 12, load_kw: 380, predicted_kw: 340, risk: 'warning' },
    { building_id: 13, load_kw: 160, predicted_kw: 162, risk: 'normal'  },
    { building_id: 14, load_kw: 490, predicted_kw: 460, risk: 'warning' },
    { building_id: 15, load_kw: 710, predicted_kw: 680, risk: 'danger'  },
    { building_id: 16, load_kw: 420, predicted_kw: 415, risk: 'normal'  },
    { building_id: 17, load_kw: 530, predicted_kw: 510, risk: 'warning' },
    { building_id: 18, load_kw: 320, predicted_kw: 310, risk: 'normal'  },
    { building_id: 19, load_kw: 290, predicted_kw: 295, risk: 'normal'  },
    { building_id: 20, load_kw: 150, predicted_kw: 145, risk: 'normal'  },
  ],
}
