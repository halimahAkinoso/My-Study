from sqlalchemy.orm import Session

from app.models.subject import Subject
from app.models.topic import Topic

SUBJECT_TOPICS = {
    "Mathematics": [
        "Algebra",
        "Geometry",
        "Trigonometry",
        "Calculus",
        "Statistics",
        "Probability",
        "Vectors",
        "Matrices",
        "Number Theory",
        "Differentiation",
        "Integration",
        "Quadratic Equations",
        "Indices",
        "Logarithms",
        "Sets",
        "Functions",
        "Graphs",
        "Sequences",
        "Series",
        "Mensuration",
    ],
    "Physics": [
        "Motion",
        "Force",
        "Energy",
        "Power",
        "Work",
        "Momentum",
        "Electricity",
        "Magnetism",
        "Waves",
        "Optics",
        "Heat",
        "Pressure",
        "Nuclear Physics",
        "Electronics",
        "Current",
        "Voltage",
        "Resistance",
        "Gravity",
        "Projectile Motion",
        "Sound",
    ],
    "Chemistry": [
        "Atomic Structure",
        "Periodic Table",
        "Chemical Bonding",
        "Organic Chemistry",
        "Hydrocarbons",
        "Acids",
        "Bases",
        "Salts",
        "Electrolysis",
        "Equilibrium",
        "Reaction Rates",
        "Thermochemistry",
        "Redox",
        "Gas Laws",
        "Stoichiometry",
        "Solutions",
        "Metals",
        "Non-metals",
        "Polymers",
        "Water",
    ],
    "Biology": [
        "Cell",
        "Genetics",
        "Ecology",
        "Evolution",
        "Photosynthesis",
        "Respiration",
        "Nutrition",
        "Excretion",
        "Circulatory System",
        "Digestive System",
        "Nervous System",
        "Hormones",
        "Reproduction",
        "Classification",
        "Microorganisms",
        "Immunity",
        "Plants",
        "Animals",
        "DNA",
        "Protein Synthesis",
    ],
    "English": [
        "Grammar",
        "Comprehension",
        "Vocabulary",
        "Essay Writing",
        "Letter Writing",
        "Tenses",
        "Parts of Speech",
        "Figures of Speech",
        "Summary",
        "Poetry",
        "Drama",
        "Novel",
        "Concord",
        "Direct Speech",
        "Indirect Speech",
        "Pronunciation",
        "Reading",
        "Listening",
        "Writing",
        "Speaking",
    ],
    "Computer Science": [
        "Computer Basics",
        "Programming",
        "Python",
        "Java",
        "C++",
        "HTML",
        "CSS",
        "JavaScript",
        "Database",
        "SQL",
        "Networking",
        "Cybersecurity",
        "AI",
        "Machine Learning",
        "Cloud Computing",
        "Operating Systems",
        "Algorithms",
        "Data Structures",
        "Git",
        "Software Engineering",
    ],
}


def seed_subjects_and_topics(db: Session):
    subjects_seeded = False
    topics_seeded = False

    for subject_name, topic_titles in SUBJECT_TOPICS.items():
        subject = (
            db.query(Subject)
            .filter(Subject.name == subject_name)
            .first()
        )

        if not subject:
            subject = Subject(name=subject_name)
            db.add(subject)
            db.flush()
            subjects_seeded = True

        existing_topics = {
            title
            for (title,) in (
                db.query(Topic.title)
                .filter(Topic.subject_id == subject.id)
                .all()
            )
        }

        for title in topic_titles:
            if title in existing_topics:
                continue

            db.add(
                Topic(
                    subject_id=subject.id,
                    title=title,
                    description=f"Learn {title} in {subject_name}",
                )
            )
            topics_seeded = True

    if subjects_seeded or topics_seeded:
        db.commit()
