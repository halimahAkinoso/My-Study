import os

from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def generate_lesson(subject, topic):

    prompt = f"""
You are an experienced secondary school teacher.

Create a lesson for:

Subject: {subject}

Topic: {topic}

Return:

Title

Objectives

Explanation

Examples

Summary

Practice Exercises

Use Markdown formatting.
"""

    response = client.chat.completions.create(

        model="gpt-4.1-mini",

        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],

        temperature=0.7,

    )

    return response.choices[0].message.content

def generate_quiz(subject, topic):

    prompt = f"""
Create exactly 20 multiple choice questions.

Subject:
{subject}

Topic:
{topic}

Each question must contain:

Question

Option A

Option B

Option C

Option D

Correct Answer

Return valid JSON only.
"""

    response = client.chat.completions.create(

        model="gpt-4.1-mini",

        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],

        temperature=0.5,

    )

    return response.choices[0].message.content