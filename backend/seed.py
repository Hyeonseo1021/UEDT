import pandas as pd
from sqlmodel import Session
from database import engine, init_db
from models import Buildings, Thresholds, EnergyFeatures

def seed_all_data():
    print("데이터베이스 테이블 초기화 중...")
    init_db()
    
    # 1. 건물 메타데이터 주입
    print("건물 메타데이터 적재 시작...")
    df_b = pd.read_csv("energy_project_submission/data/buildings_metadata.csv")
    with Session(engine) as session:
        for _, row in df_b.iterrows():
            session.add(Buildings(**row.to_dict()))
        session.commit()
        
    # 2. 임계값 데이터 주입
    print("위험 임계값 데이터 적재 시작...")
    df_t = pd.read_csv("energy_project_submission/data/risk_thresholds.csv")
    with Session(engine) as session:
        for _, row in df_t.iterrows():
            session.add(Thresholds(**row.to_dict()))
        session.commit()

    # 3. 10만 건 시계열 데이터 주입 (안전한 데이터 타입 변환)
    print("⚡ 10만 건 시계열 데이터 적재 시작 (약 10초 소요)...")
    df_e = pd.read_csv("energy_project_submission/data/energy_features_xgb.csv")
    
    # 데이터베이스 호환성을 위해 날짜를 문자열 포맷으로 통일합니다.
    df_e['timestamp'] = df_e['timestamp'].astype(str)
    
    with Session(engine) as session:
        records = []
        for idx, row in df_e.iterrows():
            records.append(EnergyFeatures(**row.to_dict()))
            # 1만 건씩 묶어서 고속 대량 적재
            if len(records) >= 10000:
                session.bulk_save_objects(records)
                session.commit()
                records = []
                print(f" 진행 중... {idx+1}개 행 완료")
        if records:
            session.bulk_save_objects(records)
            session.commit()

    print("모든 진짜 데이터가 데이터베이스(dev.db)에 완벽하게 저장되었습니다!")

if __name__ == "__main__":
    seed_all_data()