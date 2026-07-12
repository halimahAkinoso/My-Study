from app.database.database import SessionLocal

from app.models.subject import Subject
from app.models.topic import Topic

db = SessionLocal()

subjects = {

    "Mathematics":[

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

    "Physics":[

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

    "Chemistry":[

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

    "Biology":[

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

    "English":[

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

    "Computer Science":[

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

for subject_name, topics in subjects.items():

    subject = (
        db.query(Subject)
        .filter(Subject.name == subject_name)
        .first()
    )

    if not subject:

        subject = Subject(
            name=subject_name
        )

        db.add(subject)

        db.commit()

        db.refresh(subject)

    for title in topics:

        exists = (

            db.query(Topic)

            .filter(

                Topic.subject_id == subject.id,

                Topic.title == title,

            )

            .first()

        )

        if not exists:

            db.add(

                Topic(

                    subject_id=subject.id,

                    title=title,

                    description=f"Learn {title} in {subject_name}"

                )

            )

db.commit()

print("Subjects and Topics seeded successfully.")