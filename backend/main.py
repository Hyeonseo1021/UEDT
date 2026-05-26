from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random

app = FastAPI(title="Digital Twin Energy Management System")

# 기존에 작성되어 있던 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 기존 루트 엔드포인트
@app.get("/")
def read_root():
    return {"Hello": "World"}

# 1. GET /api/buildings (20채 가상 건물 메타데이터 고정 응답)
@app.get("/api/buildings")
def get_buildings():
    """
    앱 시작 시 프론트엔드가 1회 호출하는 건물 기본 메타데이터
    용도별 비율: office 5, residential 8, commercial 4, public 3 (총 20채)
    """
    buildings_list = []
    
    # 가상 도시에 배치할 20채 건물 빌드 (난수 시드 고정으로 결과 유지)
    random.seed(42) 
    
    for i in range(1, 21):
        if i <= 5:
            b_type = "office"
            name = f"Office Tower {i}"
        elif i <= 13:
            b_type = "residential"
            name = f"Apartment {i-5}"
        elif i <= 17:
            b_type = "commercial"
            name = f"Shopping Mall {i-13}"
        else:
            b_type = "public"
            name = f"Public Hospital {i-17}"
            
        buildings_list.append({
            "building_id": i,
            "building_type": b_type,
            "display_name": name,
            "city_x": round(random.uniform(-30.0, 30.0), 1),
            "city_z": round(random.uniform(-30.0, 30.0), 1),
            "height_factor": round(random.uniform(1.5, 3.5), 1)
        })
        
    return {"buildings": buildings_list}


# 2. GET /api/state (디지털 트윈 시간 엔진의 심장 - 1주차 Stub 버전)
@app.get("/api/state")
def get_state(timestamp: str = Query(..., description="ISO 8601 UTC+8 시각: 예) 2018-07-15T14:00:00")):
    """
    ④ 디지털 트윈의 시간 재생 엔진이 매 Clock Tick마다 호출하는 API
    아직 DB/AI 모델 연동 전이므로 규칙 기반 Stub 데이터로 응답 처리
    """
    buildings_state = []
    
    # 타임스탬프 문자열에 고유한 시드를 매핑하여, 같은 시간엔 항상 같은 데이터가 나오도록 처리 (결정론적 노이즈 모사)
    random.seed(hash(timestamp))
    
    for i in range(1, 21):
        # 건물 타입별 기저 부하(kW) 차별화
        if i <= 5:   base = 220.0  # office
        elif i <= 13: base = 60.0   # residential
        elif i <= 17: base = 180.0  # commercial
        else:         base = 110.0  # public
            
        # 변동성 적용 (±15%)
        actual = round(base * random.uniform(0.85, 1.15), 1)
        # 모델 예측값 모사 (실측값 대비 오차 ±5% 내외)
        predicted = round(actual * random.uniform(0.95, 1.05), 1)
        
        # 1주차 프론트/디지털트윈 컴포넌트 시각화 테스트용 위험도(normal, warning, danger) 강제 분배
        # 특정 건물 몇 개에 예외적으로 위험 상태를 부여해 시각화 동작을 확인시킵니다.
        if i in [3, 14]:
            risk = "danger"
        elif i in [8, 19]:
            risk = "warning"
        else:
            risk = "normal"
            
        buildings_state.append({
            "building_id": i,
            "load_kw": actual,
            "predicted_kw": predicted,
            "risk": risk
        })
        
    return {
        "timestamp": timestamp,
        "weather": {
            "temperature": round(random.uniform(22.0, 33.0), 1),
            "humidity": random.randint(55, 75)
        },
        "buildings": buildings_state
    }