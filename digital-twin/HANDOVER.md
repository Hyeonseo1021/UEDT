# 디지털 트윈 ④ 파트 인계서

**작성자**: Claude Code (④ 디지털 트윈 담당)  
**작성일**: 2026-06-01  
**상태**: 완성 (② ③ 연결 대기)

---

## 📋 작업 완료 사항

### 1. 핵심 3D 씬 완성
- **CityScene.tsx**: Canvas + 카메라 + 조명 + 효과
  - 주간 대로변 시점 (카메라 z+80, 거의 눈높이)
  - Sky + directionalLight (태양광 intensity 2.8) + hemisphereLight
  - SSAO + Bloom(danger만) + Vignette
  - fog (near 80, far 350) → 원경 자연스러운 흐림

### 2. 건물 20채 (층별 파사드 방식)
- **Building.tsx**: 4가지 유형
  - **office**: 수평 스트라이프 (슬래브+유리 교번, 멀리온)
  - **residential**: 패널+발코니 (테라코타색, 층간 띠)
  - **commercial**: 1층 대형 유리 + 상층 밴드
  - **public**: 기단+기둥+돔 (신고전주의)
- **mock.ts**: 건물 20채
  - 좌/우 2쌍 (x=±26, ±44) + 입구 2채 (x=±22)
  - z 간격 24 (건물 깊이+여백 충분)

### 3. 도시 지면 (주간 리얼)
- **CityGround.tsx**: 도로·인도·가로수·가로등·산
  - 아스팔트 도로 (#374151) + 베이지 지면 (#c8b07a)
  - 중앙선 (이중 황색) + 차선 (흰 점선) + 횡단보도 (흰 줄무늬)
  - 직진 화살표 (3군데)
  - 가로수 (x=±16, 메타세쿼이아 스타일, 높이 25)
  - 가로등 (x=±16.5, 테이퍼 폴대)
  - 원거리 산 실루엣 (z=-250~-280)

### 4. 상태 관리 & API 연동
- **useCityStore.ts** (Zustand)
  - state: timestamp, buildingStates, isLoading
  - action: setTimestamp() — timestamp만 갱신
  - action: fetchState() — /api/state 호출 (USE_MOCK 토글)
  - 레이스 컨디션 방지: latestSeq 카운터
  
- **types.ts**: 팀 간 계약
  ```ts
  interface CitySceneProps {
    buildings: Building[]
    selectedId: number | null
    viewMode: 'status' | 'heatmap'
    onBuildingClick: (id: number) => void
  }
  ```

### 5. Risk 시각화
- **Building.tsx** 내부
  - normal: 자연색
  - warning: 반투명 노랑 오버레이 + ⚠️ + 느린 맥박
  - danger: 반투명 빨강 오버레이 + 🚨 + 빠른 맥박 + PointLight
- Hover: 건물 정보 라벨 (폰트 15px, 큰 패딩)
- Click: 선택 와이어프레임 + 하단 카드

### 6. 버그 7개 선수 처리
1. ✅ 레이스 컨디션: latestSeq로 해결
2. ✅ useFrame Date.now(): state.clock.elapsedTime 사용
3. ✅ THREE.Color 매 렌더: useMemo([risk])
4. ✅ 선택 와이어: {visible} 속성 (조건부 마운트 금지)
5. ✅ 커서 누수: useEffect cleanup에서 'default' 복원
6. ✅ stateMap 재생성: useMemo([buildingStates])
7. ✅ viewMode 묵살: SceneContent까지 전달

---

## 📁 파일 구조

```
frontend/src/city/
├── types.ts           ← 팀 간 계약 인터페이스 (절대 변경 금지)
├── mock.ts            ← 건물 20채 + 상태 더미 데이터
├── useCityStore.ts    ← Zustand 스토어 (USE_MOCK 토글 여기)
├── Building.tsx       ← 4가지 건물 + risk 애니메이션
├── CityGround.tsx     ← 도로·가로수·가로등·산
├── CityScene.tsx      ← Canvas + 조명 + 카메라 + 효과
└── CityScene.demo.tsx ← 임시 demo (③ 통합 시 삭제)

App.tsx               ← ③이 레이아웃 채울 자리
```

---

## 🔗 팀 간 연결점

### ② 백엔드 (API 연동)
**필요한 것**: GET `/api/state?timestamp=2018-07-15T14:00:00`

**응답 스키마** (절대 변경 금지):
```json
{
  "timestamp": "2018-07-15T14:00:00",
  "weather": { "temperature": 32.1, "humidity": 68 },
  "buildings": [
    {
      "building_id": 1,
      "load_kw": 245.3,
      "predicted_kw": 240.1,
      "risk": "normal"   ← "normal"|"warning"|"danger"
    }
  ]
}
```

**④에서 할 일**:
```ts
// useCityStore.ts 6번줄
const USE_MOCK = false  // ← 이 한 줄만 바꾸면 끝
```

---

### ③ 프론트엔드 (UI 통합)
**필요한 것**: `/api/buildings` (정적 건물 정보)

**응답 스키마**:
```json
{
  "buildings": [
    {
      "building_id": 1,
      "building_type": "office",
      "display_name": "Office Tower 1",
      "city_x": -26,
      "city_z": 12,
      "height_factor": 9.0
    }
  ]
}
```

**③이 할 일**:
```tsx
import { CityScene } from './city/CityScene'

<CityScene
  buildings={buildingArray}       // /api/buildings 받아서 넘겨줘
  selectedId={selectedId}         // ③ 상태
  viewMode="status"              // "status" | "heatmap"
  onBuildingClick={(id) => ...}  // ③가 처리
/>
```

**슬라이더 연동**:
```ts
// ③의 슬라이더 onChange에 한 줄 추가
useCityStore.getState().setTimestamp('2018-07-15T15:00:00')
```

---

## 🎯 향후 계획

### Week 2: viewMode="heatmap" 구현 (선택사항)
현재는 "status" (위험도 색칠)만 구현됨.

할 일:
1. Building.tsx: heatmap 색상 로직 추가 (load_kw 기반)
2. CityScene.tsx: viewMode prop 활용
3. 색상 범위 결정 (0~500 kW 기준)

---

## ⚠️ 주의사항

### 금지사항
1. **types.ts 변경 금지** — ③과의 계약
2. **Building props 변경 금지** — CityScene 수정 필요
3. **/api 스키마 변경 금지** — 양쪽 모두 영향

### 성능 주의
- 건물 20개 × 면 여러 개 + 지면 + 효과 → WebGL 중부하
  - 모바일에서는 Bloom 끄거나 해상도 낮춰야 할 수 있음
  - shadow-mapSize [4096, 4096] = 큰 메모리 (필요시 [2048, 2048]으로 감소)

### 버그 재발 방지
- useFrame 안에서 **Date.now() 절대 금지** → `state.clock.elapsedTime`
- 선택 와이어프레임: **{isSelected && <mesh>} 금지** → `visible={isSelected}`
- stateMap 매 렌더 재생성: **useMemo([buildingStates]) 필수**

---

## 📊 코드 통계

| 파일 | 라인 | 설명 |
|---|---|---|
| Building.tsx | ~500 | 4가지 건물 모양 + 애니메이션 |
| CityGround.tsx | ~250 | 도로·가로수·가로등·산 |
| CityScene.tsx | ~120 | Canvas + 조명 + 카메라 |
| CityScene.demo.tsx | ~140 | UI + 범례 + 선택 카드 |
| useCityStore.ts | ~50 | Zustand 스토어 |
| types.ts | ~30 | 인터페이스 |
| mock.ts | ~65 | 더미 데이터 |
| **합계** | **~1,155** | — |

---

## 🔍 검증 체크리스트

- [x] TypeScript 타입 오류 0개 (`tsc --noEmit`)
- [x] 3D 렌더링 정상 (Sky, 조명, 그림자)
- [x] 건물 간격 충분 (x: ±26/±44, z: 24 단위)
- [x] 나무·건물 겹침 없음 (나무 x=±16)
- [x] Hover/Click 콜백 작동
- [x] Risk 색칠 + 애니메이션
- [x] 도로 차선·횡단보도 보임
- [x] 원거리 산 배경
- [x] Zustand 레이스 컨디션 방지
- [x] useEffect 의존성 배열 정확

---

## 📞 연락처 & FAQ

**Q: 건물 추가/수정하려면?**  
A: mock.ts의 MOCK_BUILDINGS 배열 수정. ③이 `/api/buildings` 연결 후 자동.

**Q: 색상 변경하려면?**  
A: Building.tsx 상단 RISK_HEX, CityGround.tsx 메시 색상 코드.

**Q: 카메라 시점 변경?**  
A: CityScene.tsx 101번줄 `position: [0, 35, 80]`

**Q: 성능 느리면?**  
A: 
1. Bloom 끄기 (CityScene.tsx 75번줄)
2. shadow-mapSize 축소 (48번줄)
3. 건물 수 줄이기

---

**최종 상태**: ✅ 완성. 연결 대기.
