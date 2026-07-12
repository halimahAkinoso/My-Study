from pydantic import BaseModel


class QuizCreate(BaseModel):
    topic_id: int
    question: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_answer: str


class QuizResponse(QuizCreate):
    id: int

    class Config:
        from_attributes = True