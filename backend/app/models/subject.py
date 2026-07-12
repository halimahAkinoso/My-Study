from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    topics = relationship(
        "Topic",
        back_populates="subject",
        cascade="all, delete"
    )