from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

# 1. 건물 메타데이터 테이블 (buildings_metadata.csv)
class Buildings(SQLModel, table=True):
    __tablename__ = "buildings"
    
    building_id: int = Field(default=None, primary_key=True)
    building_type: str
    display_name: str
    city_x: float
    city_z: float
    height_factor: float

# 2. 건물 타입별 위험 임계값 테이블 (risk_thresholds.csv)
class Thresholds(SQLModel, table=True):
    __tablename__ = "thresholds"
    
    building_type: str = Field(primary_key=True)
    q75: float
    q90: float

# 3. 통합 시계열 데이터 테이블 (energy_features_xgb.csv)
class EnergyFeatures(SQLModel, table=True):
    __tablename__ = "energy_features"
    
    # 시간(timestamp)과 건물 타입(building_type) 두 개를 합쳐서 고유 키로 사용합니다.
    timestamp: str = Field(primary_key=True)
    building_type: str = Field(primary_key=True)
    
    load_kw: float
    temperature: float
    humidity: float
    hour: int
    dayofweek: int
    month: int
    
    # AI 모델 피처 변수들
    hour_sin: float
    hour_cos: float
    month_sin: float
    month_cos: float
    load_lag_1h: float
    load_lag_24h: float
    load_lag_168h: float
    load_roll_mean_24h: float
    load_roll_std_24h: float