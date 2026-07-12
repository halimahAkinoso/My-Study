from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)

    topic_id = Column(
        Integer,
        ForeignKey("topics.id"),
        nullable=False
    )

    title = Column(String(200), nullable=False)

    notes = Column(Text)

    image_url = Column(String(500), nullable=True)

    video_url = Column(String(500), nullable=True)

    pdf_url = Column(String(500), nullable=True)

    topic = relationship(
        "Topic",
        back_populates="lessons"
    )