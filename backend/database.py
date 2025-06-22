# from sqlmodel import SQLModel, create_engine, Session

# DATABASE_URL = "sqlite:///./compliance_scheduler.db"
# engine = create_engine(DATABASE_URL, echo=True)

# def get_session():
#     with Session(engine) as session:
#         yield session
from sqlmodel import create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://smartcompliance_db_user:WsbSvLCv0IXsEdU6KElAtTnMTZ5Y95Vx@dpg-d1brkjp5pdvs73e5s7tg-a/smartcompliance_db")

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session