import csv
import random

# 🔥 도시 생성 설정값
FILENAME = 'buildings_metadata_large.csv'
GRID_SPACING = 15  # 건물 간의 간격 (이 공간에 도로가 생깁니다)

# 🔥 구역(Zone)별 특성 설정
# x, z 좌표 범위를 나누어 도시를 4개의 블록으로 분할합니다.
zones = {
    'Residential': {
        'x_range': (-60, -10), 
        'z_range': (10, 60), 
        'height_range': (1.0, 2.5), 
        'prefix': 'Res-Block'
    },
    'Commercial': {
        'x_range': (10, 60), 
        'z_range': (10, 60), 
        'height_range': (2.0, 4.5), 
        'prefix': 'Com-Center'
    },
    'Public': {
        'x_range': (-60, -10), 
        'z_range': (-60, -10), 
        'height_range': (0.5, 1.5), # 공공 건물은 보통 낮고 넓음
        'prefix': 'Pub-Building'
    },
    'Office': {
        'x_range': (10, 60), 
        'z_range': (-60, -10), 
        'height_range': (3.0, 6.0), # 오피스는 고층 빌딩
        'prefix': 'Off-Tower'
    }
}

def generate_city_data():
    buildings = []
    building_id = 1
    
    for zone_type, config in zones.items():
        x_start, x_end = config['x_range']
        z_start, z_end = config['z_range']
        
        # 격자(Grid) 형태로 좌표 생성
        for x in range(x_start, x_end + 1, GRID_SPACING):
            for z in range(z_start, z_end + 1, GRID_SPACING):
                
                # 약간의 불규칙성을 위해 10% 확률로 빈 땅(공원/주차장 등)을 남겨둠
                if random.random() < 0.1:
                    continue
                    
                # 구역 특성에 맞는 높이 랜덤 부여
                h_min, h_max = config['height_range']
                height_factor = round(random.uniform(h_min, h_max), 1)
                
                display_name = f"{config['prefix']} {building_id}"
                
                buildings.append({
                    'building_id': building_id,
                    'building_type': zone_type,
                    'display_name': display_name,
                    'city_x': float(x),
                    'city_z': float(z),
                    'height_factor': height_factor
                })
                building_id += 1
                
    return buildings

# CSV 파일로 저장
def save_to_csv(data, filename):
    headers = ['building_id', 'building_type', 'display_name', 'city_x', 'city_z', 'height_factor']
    
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
        
    print(f"✅ 총 {len(data)}개의 건물이 포함된 '{filename}' 파일이 성공적으로 생성되었습니다!")
    print("   도시가 4개의 구역(주거, 상업, 공공, 오피스)으로 완벽하게 나뉘었습니다.")

if __name__ == "__main__":
    city_data = generate_city_data()
    save_to_csv(city_data, FILENAME)