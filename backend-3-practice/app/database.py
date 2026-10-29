from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    pass


def make_database(url):
    engine = create_engine(url, connect_args={"check_same_thread": False})
    return engine, sessionmaker(bind=engine)
