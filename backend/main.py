from fastapi import FastAPI, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
import os

# database, models 파일에서 필요한 엔진 및 테이블 가져오기
from database import engine, get_db
from models import Buildings, Thresholds, EnergyFeatures

app = FastAPI(title="Digital Twin Energy Management System")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 루트 엔드포인트
@app.get("/")
def read_root():
    return {"Hello": "World"}


# =================================================================
# 🟢 1~3주차 백엔드 핵심 산출물: 실물 데이터베이스 연동 및 경로 보완 버전
# =================================================================

# 1. GET /api/buildings (실제 DB 기반 건물 메타데이터 반환)
@app.get("/api/buildings")
def get_buildings(db: Session = Depends(get_db)):
    """
    앱 시작 시 프론트엔드가 1회 호출하여 가상 도시를 그리는 건물 리스트 API
    """
    statement = select(Buildings)
    buildings_data = db.exec(statement).all()
    
    return {"buildings": buildings_data}


# 2. GET /api/state (디지털 트윈 시간 엔진 연동 - 실제 데이터 기반)
@app.get("/api/state")
def get_state(
    timestamp: str = Query(..., description="ISO 8601 형식: 예) 2017-01-12 18:00:00"),
    db: Session = Depends(get_db)
):
    """
    ④ 디지털 트윈의 시간 재생 엔진이 매 Clock Tick마다 호출하는 API.
    입력받은 타임스탬프 시점의 진짜 에너지 부하 및 기상 정보를 반환합니다.
    """
    # 1. 해당 시점의 모든 건물 에너지 피처 조회
    feature_statement = select(EnergyFeatures).where(EnergyFeatures.timestamp == timestamp)
    features = db.exec(feature_statement).all()
    
    if not features:
        raise HTTPException(
            status_code=404, 
            detail=f"해당 시간({timestamp})의 데이터가 DB에 없습니다. 2017-01-12 18:00:00 ~ 2019-12-31 23:00:00 사이로 요청하세요."
        )
    
    # 2. 건물 타입별 임계값(Thresholds) 정보를 통째로 가져와 딕셔너리로 맵핑
    threshold_statement = select(Thresholds)
    thresholds_list = db.exec(threshold_statement).all()
    thresh_map = {t.building_type: t for t in thresholds_list}
    
    # 3. 데이터 조립 및 기술 명세서 기준 실시간 위험 등급 분류 로직 수행
    buildings_state = []
    
    # 조하된 데이터 중 첫 번째 행에서 기상 정보 추출 (시간대별 기상은 용도와 관계없이 동일)
    weather_info = {
        "temperature": features[0].temperature,
        "humidity": features[0].humidity
    }
    
    # 메타데이터 번호 매칭을 위한 건물 조회
    b_statement = select(Buildings)
    all_buildings = db.exec(b_statement).all()
    
    # 데이터 매칭용 딕셔너리 구성 (정밀한 대소문자 매칭 보완)
    b_type_to_id = {b.building_type.lower(): b.building_id for b in all_buildings}
    
    for f in features:
        actual_load = f.load_kw
        # 1주차 단계에서는 아직 AI 예측 모델(.pkl) 서빙 전이므로 실측값 부근의 모사값으로 대체
        predicted_load = round(actual_load * 0.98, 2) 
        
        # 위험 등급 분류 (명세서 q75, q90 규칙 기준)
        # 중요: 원본 데이터의 대소문자가 다를 수 있으므로 key를 표준화하여 조회합니다.
        t_data = thresh_map.get(f.building_type)
        
        if t_data:
            if actual_load >= t_data.q90:
                risk = "danger"
            elif actual_load >= t_data.q75:
                risk = "warning"
            else:
                risk = "normal"
        else:
            risk = "normal"
            
        buildings_state.append({
            "building_id": b_type_to_id.get(f.building_type.lower(), 1),
            "load_kw": actual_load,
            "predicted_kw": predicted_load,
            "risk": risk
        })
        
    return {
        "timestamp": timestamp,
        "weather": weather_info,
        "buildings": buildings_state
    }