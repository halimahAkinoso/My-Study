from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)

    topic_id = Column(Integer, ForeignKey("topics.id"))

    question = Column(String, nullable=False)

    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)

    correct_answer = Column(String, nullable=False)

    topic = relationship("Topic")