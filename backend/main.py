from fastapi import FastAPI, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

from database import engine, get_db
from models import Buildings, Thresholds, EnergyFeatures
import random

app = FastAPI(title="Digital Twin Energy Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/buildings")
def get_buildings(db: Session = Depends(get_db)):
    statement = select(Buildings)
    buildings_data = db.exec(statement).all()
    return {"buildings": buildings_data}

@app.get("/api/state")
def get_state(
    timestamp: str = Query(..., description="ISO 8601 형식: 예) 2017-01-12 18:00:00"),
    db: Session = Depends(get_db)
):
    # 1. 시점 데이터 조회
    feature_statement = select(EnergyFeatures).where(EnergyFeatures.timestamp == timestamp)
    features = db.exec(feature_statement).all()
    
    if not features:
        raise HTTPException(status_code=404, detail="해당 시간의 데이터가 DB에 없습니다.")
    
    # 🔥 피처 데이터를 딕셔너리화 (strip()을 추가해 보이지 않는 공백 에러 방지)
    feature_map = { f.building_type.lower().strip(): f for f in features }
    
    # 2. 임계값 매핑 (역시 공백 제거)
    threshold_statement = select(Thresholds)
    thresholds_list = db.exec(threshold_statement).all()
    thresh_map = { t.building_type.lower().strip(): t for t in thresholds_list }
    
    # 3. 가상 도시의 전체 건물 목록 조회 및 그룹화
    b_statement = select(Buildings)
    all_buildings = db.exec(b_statement).all()
    
    b_type_to_ids = {}
    for b in all_buildings:
        b_type = b.building_type.lower().strip()
        if b_type not in b_type_to_ids:
            b_type_to_ids[b_type] = []
        b_type_to_ids[b_type].append(b.building_id)
        
    buildings_state = []
    weather_info = {
        "temperature": features[0].temperature,
        "humidity": features[0].humidity
    }
    
    # 4. 🔥 무결점 브로드캐스팅 (원본 구역 그대로 1:1 매칭)
    for b_type, bid_list in b_type_to_ids.items():
        
        # 🔥 강제 변환 로직 삭제: 구역 이름(office, public, commercial, residential)을 그대로 사용
        lookup_type = b_type
            
        # 해당 구역의 에너지 데이터 및 위험 임계값 꺼내기
        f_data = feature_map.get(lookup_type)
        t_data = thresh_map.get(lookup_type)
        
        # 매핑할 데이터가 존재한다면 개별 건물들에 변동성을 주며 뿌려주기
        if f_data:
            base_load = f_data.load_kw
            
            for bid in bid_list:
                variance = random.uniform(0.85, 1.15)
                individual_load = round(base_load * variance, 2)
                individual_predicted = round(individual_load * 0.98, 2)
                
                if t_data:
                    if individual_load >= t_data.q90:
                        risk = "danger"
                    elif individual_load >= t_data.q75:
                        risk = "warning"
                    else:
                        risk = "normal"
                else:
                    risk = "normal"
                    
                buildings_state.append({
                    "building_id": bid,
                    "load_kw": individual_load,
                    "predicted_kw": individual_predicted,
                    "risk": risk
                })

    return {
        "timestamp": timestamp,
        "weather": weather_info,
        "buildings": buildings_state
    }