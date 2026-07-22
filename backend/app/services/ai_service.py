import json
import os
import re
from typing import Any
from urllib.parse import quote_plus

from openai import OpenAI
from app.services.curriculum_service import get_curated_topic_profile

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None
CURATED_LESSON_MARKER = "<!-- curated-topic-v3 -->"


def strip_code_fences(content: str) -> str:
    cleaned = content.strip()
    cleaned = re.sub(r"^```(?:json|markdown)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def find_youtube_video_url(subject: str, topic: str) -> str:
    curated_profile = get_curated_topic_profile(subject, topic)
    query = curated_profile["video_query"]
    return (
        "https://www.youtube.com/results?search_query="
        f"{quote_plus(query)}"
    )


def call_model(prompt: str, temperature: float = 0.5) -> str | None:
    if not client:
        return None

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=temperature,
            timeout=8,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def fallback_lesson_data(
    subject: str,
    topic: str,
    overview: str | None = None,
) -> dict[str, Any]:
    curated_profile = get_curated_topic_profile(subject, topic, overview)
    topic_overview = curated_profile["overview"]
    focus = curated_profile["focus"]
    example = curated_profile["example"]
    mistake = curated_profile["mistake"]
    practice = curated_profile["practice"]

    subject_textbook_lens = {
        "Mathematics": {
            "concept_label": "mathematical idea",
            "method_label": "solution method",
            "evidence_label": "worked calculation",
            "language_label": "symbols, rules, and steps",
        },
        "Physics": {
            "concept_label": "scientific principle",
            "method_label": "physical reasoning process",
            "evidence_label": "scientific example",
            "language_label": "quantities, units, and relationships",
        },
        "Chemistry": {
            "concept_label": "chemical idea",
            "method_label": "chemical reasoning process",
            "evidence_label": "reaction-based example",
            "language_label": "particles, substances, and reactions",
        },
        "Biology": {
            "concept_label": "biological idea",
            "method_label": "process explanation",
            "evidence_label": "life-process example",
            "language_label": "structures, functions, and processes",
        },
        "English": {
            "concept_label": "language idea",
            "method_label": "interpretation or writing method",
            "evidence_label": "language example",
            "language_label": "meaning, form, and effect",
        },
        "Computer Science": {
            "concept_label": "computing concept",
            "method_label": "logical procedure",
            "evidence_label": "system or code example",
            "language_label": "commands, structure, and logic",
        },
    }.get(
        subject,
        {
            "concept_label": "core idea",
            "method_label": "learning process",
            "evidence_label": "classroom example",
            "language_label": "key terms and patterns",
        },
    )

    explanation_sections = [
        {
            "heading": "1. Introduction To The Topic",
            "body": (
                f"{topic_overview} In a textbook lesson, the first goal is to make the {subject_textbook_lens['concept_label']} clear. "
                f"Students should be able to explain what {topic} means, identify where it appears in {subject}, and describe the "
                f"main purpose of the topic without relying on memorized sentences."
            ),
        },
        {
            "heading": "2. Core Teaching",
            "body": (
                f"The central focus in {topic} is {focus}. This means students must move beyond the overview and understand how the "
                f"idea actually works. A strong explanation should unpack the rules, relationships, or patterns behind {topic} and "
                f"show how those ideas guide correct answers. In {subject}, success usually depends on understanding the "
                f"{subject_textbook_lens['language_label']} that belong to the topic."
            ),
        },
        {
            "heading": "3. How The Idea Is Applied",
            "body": (
                f"A useful way to teach {topic} is to connect the explanation directly to {example}. That kind of {subject_textbook_lens['evidence_label']} "
                f"shows students how the topic moves from theory into use. At this stage, the learner should be able to state the relevant rule or principle, "
                f"explain why it fits the question, and then apply the {subject_textbook_lens['method_label']} with confidence."
            ),
        },
        {
            "heading": "4. Why Errors Happen",
            "body": (
                f"One common difficulty in {topic} is {mistake}. This matters because many learners can repeat a definition but still fail to use it correctly. "
                f"A real textbook lesson should therefore point out not only the correct method, but also the exact place where students often go wrong. "
                f"Learning improves when the student compares correct reasoning with incorrect reasoning."
            ),
        },
        {
            "heading": "5. Independent Study Guidance",
            "body": (
                f"For independent study, the learner should revisit the explanation and then practise with tasks that reflect {practice}. "
                f"The most effective habit is to read the worked example slowly, restate each step in simple words, and then attempt a similar question alone. "
                f"This turns {topic} into something the student can genuinely study and understand without depending completely on a teacher."
            ),
        },
    ]

    key_points = [
        f"{topic} should first be understood as a {subject_textbook_lens['concept_label']} before it is treated as an exam topic.",
        f"The learner must understand {focus} because it controls how questions in {topic} are answered correctly.",
        f"A strong answer in {topic} uses the correct {subject_textbook_lens['method_label']} and explains why that method fits the task.",
        f"{example[0].upper() + example[1:]} is the type of application that helps move the topic from explanation to mastery.",
    ]

    method_steps = [
        f"Read the question or example and identify the part connected to {topic}.",
        f"Recall the specific rule, process, or principle behind {focus}.",
        f"Apply the correct {subject_textbook_lens['method_label']} step by step instead of jumping to the answer.",
        f"Check the result carefully and confirm that it matches the requirement of the topic.",
    ]

    glossary = [
        {
            "term": topic,
            "meaning": f"The main topic being studied, understood here as {topic_overview.lower()}",
        },
        {
            "term": "Core Focus",
            "meaning": f"The main idea the learner must understand in this lesson: {focus}.",
        },
        {
            "term": "Application",
            "meaning": f"The point where the explanation is used in practice, such as {example}.",
        },
        {
            "term": "Common Error",
            "meaning": f"A repeated learner difficulty in this topic, for example {mistake}.",
        },
    ]

    quick_check = [
        f"In your own words, what does {topic} mean in {subject}?",
        f"What part of this lesson explains {focus} most clearly?",
        f"Why is {example} a good example for studying {topic}?",
        f"How would you avoid the mistake described as {mistake}?",
    ]

    return {
        "title": f"{topic} Lesson",
        "overview": topic_overview,
        "objectives": [
            f"Explain the meaning of {topic} in {subject} using accurate subject vocabulary.",
            f"Describe the key ideas behind {focus}.",
            f"Apply {topic} to examples such as {example}.",
            f"Avoid common errors and build confidence through {practice}.",
        ],
        "explanation_sections": explanation_sections,
        "key_points": key_points,
        "method_steps": method_steps,
        "worked_examples": [
            {
                "title": "Worked Example 1",
                "steps": [
                    f"Start with an example based on {example}.",
                    f"Identify the exact idea in {focus} that the question is testing.",
                    f"Apply the correct method for {topic} step by step without skipping reasoning.",
                    "Check the final answer and explain why it is correct.",
                ],
            },
            {
                "title": "Worked Example 2",
                "steps": [
                    f"Choose a second example that still focuses on {practice}.",
                    "Break the task into smaller parts and link each part to the rule being used.",
                    f"Point out how to avoid {mistake} while solving it.",
                    "Review the result and connect it back to the topic overview.",
                ],
            },
        ],
        "common_mistakes": [
            f"Misunderstanding the core focus of {topic}: {focus}.",
            mistake[0].upper() + mistake[1:] + ".",
            "Jumping to an answer without showing the steps or reasoning clearly.",
            f"Practising {topic} without checking whether the method matches the question being asked.",
        ],
        "study_tips": [
            f"Rewrite the overview of {topic} in your own words after studying it.",
            f"Use short exercises built around {practice} before trying harder tasks.",
            f"Keep track of mistakes such as {mistake} and write the correction beside each one.",
            f"Revise {topic} regularly so the method behind {focus} becomes familiar.",
        ],
        "glossary": glossary,
        "quick_check": quick_check,
        "practice_exercises": [
            f"Explain the overview of {topic} and describe how it fits into {subject}.",
            f"Work through an example based on {example} and explain each step.",
            f"Describe why {mistake} causes errors and how to avoid it.",
            f"Answer an exam-style question that focuses on {practice}.",
        ],
        "summary": f"{topic} is a valuable part of {subject}. Students perform better when they understand {focus}, learn from examples such as {example}, and deliberately avoid mistakes like {mistake}. Regular practice built around {practice} makes the topic easier to remember and apply.",
        "youtube_search_query": curated_profile["video_query"],
    }


def build_lesson_markdown(lesson_data: dict[str, Any]) -> str:
    objectives = "\n".join(
        f"- {item}" for item in lesson_data["objectives"]
    )
    explanation_sections = "\n\n".join(
        f"## {section['heading']}\n{section['body']}"
        for section in lesson_data["explanation_sections"]
    )
    key_points = "\n".join(
        f"- {item}" for item in lesson_data["key_points"]
    )
    method_steps = "\n".join(
        f"{index}. {step}"
        for index, step in enumerate(lesson_data["method_steps"], start=1)
    )
    worked_examples = "\n\n".join(
        "\n".join(
            [f"## {example['title']}"]
            + [f"{index}. {step}" for index, step in enumerate(example["steps"], start=1)]
        )
        for example in lesson_data["worked_examples"]
    )
    glossary = "\n".join(
        f"- **{item['term']}**: {item['meaning']}"
        for item in lesson_data["glossary"]
    )
    common_mistakes = "\n".join(
        f"- {item}" for item in lesson_data["common_mistakes"]
    )
    study_tips = "\n".join(
        f"- {item}" for item in lesson_data["study_tips"]
    )
    quick_check = "\n".join(
        f"- {item}" for item in lesson_data["quick_check"]
    )
    practice_exercises = "\n".join(
        f"- {item}" for item in lesson_data["practice_exercises"]
    )

    return f"""{CURATED_LESSON_MARKER}

# {lesson_data['title']}

## Overview
{lesson_data['overview']}

## Learning Objectives
{objectives}

## Main Lesson
{explanation_sections}

## Key Ideas To Remember
{key_points}

## Step-By-Step Method
{method_steps}

## Worked Examples
{worked_examples}

## Lesson Vocabulary
{glossary}

## Common Mistakes
{common_mistakes}

## Quick Check
{quick_check}

## Study Tips After Reading
{study_tips}

## Independent Practice
{practice_exercises}

## Summary
{lesson_data['summary']}
"""


def generate_lesson_data(
    subject: str,
    topic: str,
    overview: str | None = None,
    use_ai: bool = False,
) -> dict[str, Any]:
    prompt = f"""
You are an experienced secondary school teacher.

Create a rich lesson package for:

Subject: {subject}
Topic: {topic}
Overview hint: {overview or "No extra overview provided"}

Return valid JSON with these exact keys:
- title: string
- overview: string
- objectives: array of 4 strings
- explanation_sections: array of 5 objects with keys "heading" and "body"
- key_points: array of 4 strings
- method_steps: array of 4 strings
- worked_examples: array of 2 objects with keys "title" and "steps" where "steps" is an array of 4 strings
- glossary: array of 4 objects with keys "term" and "meaning"
- common_mistakes: array of 4 strings
- quick_check: array of 4 strings
- study_tips: array of 4 strings
- practice_exercises: array of 4 strings
- summary: string
- youtube_search_query: string

The lesson should be suitable for secondary school students, detailed, clear, and practical.
Do not wrap the JSON in markdown fences.
"""

    raw_response = (
        call_model(prompt, temperature=0.6)
        if use_ai
        else None
    )

    if raw_response:
        try:
            parsed = json.loads(strip_code_fences(raw_response))
            required_keys = {
                "title",
                "overview",
                "objectives",
                "explanation_sections",
                "key_points",
                "method_steps",
                "worked_examples",
                "glossary",
                "common_mistakes",
                "quick_check",
                "study_tips",
                "practice_exercises",
                "summary",
                "youtube_search_query",
            }
            if required_keys.issubset(parsed):
                return parsed
        except Exception:
            pass

    return fallback_lesson_data(subject, topic, overview)


def generate_lesson(subject: str, topic: str) -> str:
    lesson_data = generate_lesson_data(subject, topic, use_ai=True)
    return build_lesson_markdown(lesson_data)


def fallback_quiz_questions(subject: str, topic: str) -> list[dict[str, str]]:
    correct_statements = [
        f"It helps students understand and apply {topic} correctly.",
        f"It develops confidence in solving {topic} questions in {subject}.",
        f"It focuses on the main rules, steps, and ideas behind {topic}.",
        f"It requires careful reasoning and step-by-step work.",
        f"It becomes easier with regular practice and revision.",
    ]

    prompts = [
        f"What is the main purpose of studying {topic} in {subject}?",
        f"Why is {topic} important for students in {subject}?",
        f"Which approach is best when answering a question on {topic}?",
        f"What should a student do first when solving a {topic} problem?",
        f"Which habit helps most when revising {topic}?",
        f"What is a common mistake students make in {topic}?",
        f"How can a student improve understanding of {topic}?",
        f"What makes {topic} easier to remember?",
        f"What should students focus on while learning {topic}?",
        f"Which statement best describes good practice in {topic}?",
        f"What should students check after answering a {topic} question?",
        f"Why should students avoid skipping steps in {topic}?",
        f"Which activity best supports mastery of {topic}?",
        f"What is the best way to build confidence in {topic}?",
        f"How should students handle difficult {topic} questions?",
        f"What should students connect {topic} to during revision?",
        f"Which method helps reduce mistakes in {topic}?",
        f"What kind of examples should students start with in {topic}?",
        f"What is the best long-term strategy for mastering {topic}?",
        f"Which result shows that a student understands {topic} well?",
    ]

    option_sets = [
        (
            correct_statements[0],
            "Memorizing one answer without understanding the topic.",
            "Ignoring the rules connected to the topic.",
            "Skipping all examples and moving straight to exams.",
        ),
        (
            correct_statements[1],
            "It removes the need to revise related concepts.",
            "It means students never need to check their answers.",
            "It only matters for one class exercise.",
        ),
        (
            correct_statements[3],
            "Guess quickly and move on without checking.",
            "Avoid reading the full question carefully.",
            "Use any method even if it does not fit the topic.",
        ),
        (
            "Identify the concept and the rule or method needed.",
            "Write the final answer before understanding the question.",
            "Skip directly to the most difficult part.",
            "Ignore the topic and focus on a different idea.",
        ),
        (
            correct_statements[4],
            "Study once and never revisit the topic.",
            "Depend only on a friend’s answer.",
            "Avoid written practice completely.",
        ),
        (
            "Mixing up the correct rule or skipping important steps.",
            "Practising with simple examples first.",
            "Reviewing corrections after classwork.",
            "Writing down key ideas in a notebook.",
        ),
        (
            "Practise short examples and explain the method in simple words.",
            "Avoid asking questions when confused.",
            "Memorize answers without understanding them.",
            "Skip all corrections after making mistakes.",
        ),
        (
            "Regular revision and repeated practice.",
            "Using only one example once.",
            "Rushing through difficult tasks.",
            "Avoiding the topic for long periods.",
        ),
        (
            correct_statements[2],
            "Irrelevant details that do not match the question.",
            "Only the final answer with no method.",
            "Random information from another topic.",
        ),
        (
            "Start simple, then move gradually to harder questions.",
            "Start with the hardest possible question and never review it.",
            "Avoid examples and rely on memory alone.",
            "Use a different topic’s method every time.",
        ),
    ]

    questions = []

    for index, prompt in enumerate(prompts):
        option_a, option_b, option_c, option_d = option_sets[index % len(option_sets)]
        questions.append(
            {
                "question": prompt,
                "option_a": option_a,
                "option_b": option_b,
                "option_c": option_c,
                "option_d": option_d,
                "correct_answer": option_a,
            }
        )

    return questions


def generate_quiz_questions(
    subject: str,
    topic: str,
    use_ai: bool = False,
) -> list[dict[str, str]]:
    prompt = f"""
Create exactly 20 multiple choice questions for secondary school students.

Subject: {subject}
Topic: {topic}

Return valid JSON as an array of 20 objects.
Each object must have exactly these keys:
- question
- option_a
- option_b
- option_c
- option_d
- correct_answer

Rules:
- The correct_answer must exactly match one of the options.
- Questions should test understanding, application, and common mistakes.
- Do not include markdown fences or any explanation outside the JSON.
"""

    raw_response = (
        call_model(prompt, temperature=0.4)
        if use_ai
        else None
    )

    if raw_response:
        try:
            parsed = json.loads(strip_code_fences(raw_response))
            if isinstance(parsed, list) and len(parsed) == 20:
                valid = all(
                    isinstance(item, dict)
                    and {
                        "question",
                        "option_a",
                        "option_b",
                        "option_c",
                        "option_d",
                        "correct_answer",
                    }.issubset(item)
                    and item["correct_answer"]
                    in {
                        item["option_a"],
                        item["option_b"],
                        item["option_c"],
                        item["option_d"],
                    }
                    for item in parsed
                )
                if valid:
                    return parsed
        except Exception:
            pass

    return fallback_quiz_questions(subject, topic)


def generate_quiz(subject: str, topic: str) -> str:
    return json.dumps(generate_quiz_questions(subject, topic, use_ai=True))
