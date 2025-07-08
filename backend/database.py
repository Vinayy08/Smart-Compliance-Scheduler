#To run locally, you can use SQLite as follows:
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./compliance_scheduler.db"
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session


# Uncomment the following lines to use PostgreSQL instead of SQLite

# from sqlmodel import create_engine, Session
# import os

# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://...")
# engine = create_engine(DATABASE_URL, echo=True)

# def get_session():
#     with Session(engine) as session:
#         yield session
