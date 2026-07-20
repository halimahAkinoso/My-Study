import json
import os
import re
from typing import Any
from urllib.parse import quote_plus

from openai import OpenAI

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


def strip_code_fences(content: str) -> str:
    cleaned = content.strip()
    cleaned = re.sub(r"^```(?:json|markdown)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def build_youtube_embed_url(subject: str, topic: str) -> str:
    query = quote_plus(f"{subject} {topic} lesson")
    return f"https://www.youtube.com/embed?listType=search&list={query}"


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
            timeout=25,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def fallback_lesson_data(
    subject: str,
    topic: str,
    overview: str | None = None,
) -> dict[str, Any]:
    topic_overview = (
        overview
        or f"{topic} is an important concept in {subject}. It helps students understand how ideas in this area work and how to apply them correctly in classwork, assignments, and exams."
    )

    return {
        "title": f"{topic} Lesson",
        "overview": topic_overview,
        "objectives": [
            f"Explain the meaning of {topic} in {subject}.",
            f"Identify the main rules, ideas, or features linked to {topic}.",
            f"Apply {topic} correctly in worked examples and practice questions.",
            f"Build confidence in answering exam-style questions on {topic}.",
        ],
        "explanation_sections": [
            {
                "heading": "What This Topic Means",
                "body": f"{topic} introduces a key part of {subject}. Before solving questions, students should first understand the meaning of the topic, the language used around it, and why it matters. Once the meaning is clear, it becomes easier to recognize the topic in examples and apply the correct approach.",
            },
            {
                "heading": "Core Explanation",
                "body": f"When learning {topic}, it helps to move from simple understanding to correct application. Start by identifying the main principle behind the topic. Next, pay attention to the rules, steps, and patterns that appear repeatedly. Finally, practice using those rules in short examples before attempting more difficult questions.",
            },
            {
                "heading": "How To Approach Questions",
                "body": f"A good way to answer {topic} questions is to read the task carefully, identify what is being asked, recall the relevant rule or method, and work step by step. Students should avoid rushing. Careful reasoning, clear steps, and checking the final answer usually lead to better results in {subject}.",
            },
            {
                "heading": "Why Students Find It Difficult",
                "body": f"Many students struggle with {topic} because they try to memorize answers without understanding the idea behind them. Another challenge is skipping steps or mixing up related rules. The best solution is to practise short examples, compare correct and incorrect methods, and explain the answer in simple words.",
            },
            {
                "heading": "Real Learning Application",
                "body": f"In real study situations, {topic} becomes easier when students connect it to familiar examples, classroom activities, or exam questions. Repetition, worked examples, and regular revision help move the topic from short-term memory into long-term understanding.",
            },
        ],
        "worked_examples": [
            {
                "title": "Worked Example 1",
                "steps": [
                    f"Read the {topic} question carefully and identify the concept being tested.",
                    f"Recall the main rule or method used in {topic}.",
                    "Apply the method step by step without skipping any part.",
                    "Check the final answer and explain why it is correct.",
                ],
            },
            {
                "title": "Worked Example 2",
                "steps": [
                    f"Start with a simple example related to {topic}.",
                    "Break the question into smaller parts if necessary.",
                    "Show the correct process clearly and neatly.",
                    "Review the result and compare it with the question requirements.",
                ],
            },
        ],
        "common_mistakes": [
            f"Confusing the meaning of {topic} with a related idea in {subject}.",
            "Skipping steps and jumping straight to an answer.",
            "Using the wrong rule, formula, or method.",
            "Failing to check the final answer carefully.",
        ],
        "study_tips": [
            f"Rewrite the meaning of {topic} in your own words.",
            "Practise short examples before attempting full questions.",
            "Keep a notebook of rules, mistakes, and corrections.",
            "Revise the topic regularly instead of waiting until the last minute.",
        ],
        "practice_exercises": [
            f"Define {topic} in your own words and explain why it matters in {subject}.",
            f"Solve two simple questions based on {topic}.",
            f"List the most common mistakes students make in {topic} and explain how to avoid them.",
            f"Create one exam-style question on {topic} and solve it step by step.",
        ],
        "summary": f"{topic} is a valuable part of {subject}. Once students understand the meaning, the rules, and the correct steps, they can answer questions more confidently and avoid common mistakes. Consistent practice is the key to mastering the topic.",
        "youtube_search_query": f"{subject} {topic} lesson",
    }


def build_lesson_markdown(lesson_data: dict[str, Any]) -> str:
    objectives = "\n".join(
        f"- {item}" for item in lesson_data["objectives"]
    )
    explanation_sections = "\n\n".join(
        f"## {section['heading']}\n{section['body']}"
        for section in lesson_data["explanation_sections"]
    )
    worked_examples = "\n\n".join(
        "\n".join(
            [f"## {example['title']}"]
            + [f"{index}. {step}" for index, step in enumerate(example["steps"], start=1)]
        )
        for example in lesson_data["worked_examples"]
    )
    common_mistakes = "\n".join(
        f"- {item}" for item in lesson_data["common_mistakes"]
    )
    study_tips = "\n".join(
        f"- {item}" for item in lesson_data["study_tips"]
    )
    practice_exercises = "\n".join(
        f"- {item}" for item in lesson_data["practice_exercises"]
    )

    return f"""# {lesson_data['title']}

## Overview
{lesson_data['overview']}

## Learning Objectives
{objectives}

## Detailed Explanation
{explanation_sections}

## Worked Examples
{worked_examples}

## Common Mistakes
{common_mistakes}

## Study Tips
{study_tips}

## Practice Exercises
{practice_exercises}

## Summary
{lesson_data['summary']}
"""


def generate_lesson_data(
    subject: str,
    topic: str,
    overview: str | None = None,
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
- worked_examples: array of 2 objects with keys "title" and "steps" where "steps" is an array of 4 strings
- common_mistakes: array of 4 strings
- study_tips: array of 4 strings
- practice_exercises: array of 4 strings
- summary: string
- youtube_search_query: string

The lesson should be suitable for secondary school students, detailed, clear, and practical.
Do not wrap the JSON in markdown fences.
"""

    raw_response = call_model(prompt, temperature=0.6)

    if raw_response:
        try:
            parsed = json.loads(strip_code_fences(raw_response))
            required_keys = {
                "title",
                "overview",
                "objectives",
                "explanation_sections",
                "worked_examples",
                "common_mistakes",
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
    lesson_data = generate_lesson_data(subject, topic)
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

    raw_response = call_model(prompt, temperature=0.4)

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
    return json.dumps(generate_quiz_questions(subject, topic))
