from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)

    subject_id = Column(
        Integer,
        ForeignKey("subjects.id")
    )

    title = Column(String(150), nullable=False)

    description = Column(String(500), nullable=True)

    subject = relationship(
        "Subject",
        back_populates="topics"
    )

    lessons = relationship(
        "Lesson",
        back_populates="topic",
        cascade="all, delete"
    )