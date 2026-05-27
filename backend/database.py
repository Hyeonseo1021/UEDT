from sqlmodel import SQLModel, create_engine, Session

sqlite_file_name = "dev.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(
    sqlite_url, 
    echo=False,  # 데이터가 10만 건이라 True로 하면 터미널이 멈추므로 False로 끕니다.
    connect_args={"check_same_thread": False}
)

def init_db():
    """서버 시작 시 호출되어 테이블을 생성하는 함수"""
    # 기존에 엉킨 테이블 구조가 있다면 완전히 날리고 새로 깨끗하게 만듭니다.
    SQLModel.metadata.drop_all(engine)
    import models 
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session