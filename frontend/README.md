## UI 대시보드 흐름 요약
   
1. Control Panel 또는 Timeline Bar 조작
        
2. App.tsx에서 상태 변경

3. energySimulation.ts에서 현재 시간 기준으로 데이터 계산

4. 중앙 도시 모델, KPI, 차트, 경고 피드가 다시 표시됨

## 프론트엔드 작업 메모 (5/30)

현재 프론트엔드는 백엔드 API와 실제 3D 디지털트윈이 붙기 전 단계입니다.  
화면 구조와 데이터 흐름을 먼저 잡아두기 위해 mock 데이터로 동작하도록 만들어두었습니다.

백엔드나 디지털트윈을 연결할 때는 아래 파일들을 먼저 보면 됩니다.

---

## 백엔드

### `src/types/energy.ts`

프론트에서 어떤 데이터 형태를 기대하는지 정리해둔 파일입니다.  
백엔드 응답 형식을 맞출 때 이 파일을 기준으로 보면 됩니다.

- `Building`: 건물 정보
- `EnergyTimePoint`: 시간대별 에너지 데이터
- `ScenarioControls`: 사용자가 슬라이더로 조절하는 값

---

### `src/data/mockBuildings.json`

현재 화면에 나오는 건물 목록입니다.  
나중에 백엔드에서 건물 데이터를 내려주면 이 파일을 대체하면 됩니다.

건물마다 ID, 이름, 구역, 위치, 기본 소비량, 임계값이 들어있습니다.

---

### `src/data/mockEnergyData.json`

현재 시간대별 에너지 데이터입니다.  
실측 소비량, 예측 소비량, 온도, 습도 등이 들어 있습니다.

만약 시간대별 데이터를 내려줘야 한다면 이 구조를 참고하면 됩니다.

---

### `src/App.tsx`

전체 화면의 상태를 관리하는 파일입니다.  
현재는 여기서 mock 데이터를 불러와서 사용하고 있습니다.

나중에 API 연결을 해야하면 이 파일에서 mock 데이터를 API 응답으로 바꾸면 됩니다.

---

### `src/utils/energySimulation.ts`

해당 파일 내에서 임시로 예측 소비량, 부하율, 위험도를 계산하게 했습니다
나중에 이 파일을 대체하면 됩니다.

---

## 디지털트윈

### `src/components/DigitalTwinPlaceholder.tsx`

중앙에 있는 `Virtual City Model` 영역입니다.  
현재는 실제 3D가 아니라 임시로 만든 컴포넌트입니다.

나중에 이 파일을 실제 3D 컴포넌트로 교체하면 됩니다.


```tsx```
<CityScene
  buildings={buildings}
  selectedId={selectedBuildingId}
  viewMode="status"
  currentTimeIndex={currentTimeIndex}
  onBuildingClick={(id) => setSelectedBuildingId(id)}
/>

또는

```tsx```
<DigitalTwinCanvas
  buildings={buildings}
  selectedId={selectedBuildingId}
  currentTimeIndex={currentTimeIndex}
  onBuildingClick={setSelectedBuildingId}
/>
