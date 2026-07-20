from io import BytesIO
from pathlib import Path
import re
import textwrap

GENERATED_ROOT = (
    Path(__file__).resolve().parents[2] / "generated" / "lesson-pdfs"
)
GENERATED_ROOT.mkdir(parents=True, exist_ok=True)


def sanitize_text(markdown_text: str) -> list[str]:
    lines: list[str] = []

    for raw_line in markdown_text.splitlines():
        line = raw_line.strip()

        if not line:
            lines.append("")
            continue

        line = re.sub(r"^#{1,6}\s*", "", line)
        line = line.replace("**", "")
        line = line.replace("*", "")
        line = line.replace("`", "")
        line = line.replace("> ", "")

        if re.match(r"^\d+\.\s+", line):
            cleaned = line
        elif line.startswith("- "):
            cleaned = line
        else:
            cleaned = line

        wrapped = textwrap.wrap(cleaned, width=88) or [""]
        lines.extend(wrapped)

    return lines


def escape_pdf_text(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
    )


def build_pdf_bytes(title: str, markdown_text: str) -> bytes:
    lines = [title, ""] + sanitize_text(markdown_text)
    lines_per_page = 42
    pages = [
        lines[index:index + lines_per_page]
        for index in range(0, len(lines), lines_per_page)
    ] or [[title]]

    page_count = len(pages)
    font_object_number = 3 + (page_count * 2)
    objects: list[str] = []

    objects.append("<< /Type /Catalog /Pages 2 0 R >>")

    kids = " ".join(
        f"{3 + (page_index * 2)} 0 R"
        for page_index in range(page_count)
    )
    objects.append(
        f"<< /Type /Pages /Kids [{kids}] /Count {page_count} >>"
    )

    for page_index, page_lines in enumerate(pages):
        page_object_number = 3 + (page_index * 2)
        content_object_number = page_object_number + 1

        objects.append(
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            f"/Resources << /Font << /F1 {font_object_number} 0 R >> >> "
            f"/Contents {content_object_number} 0 R >>"
        )

        commands = [
            "BT",
            "/F1 12 Tf",
            "50 780 Td",
            "14 TL",
        ]

        for line in page_lines:
            commands.append(f"({escape_pdf_text(line)}) Tj")
            commands.append("T*")

        commands.append("ET")

        stream = "\n".join(commands)
        stream_bytes = stream.encode("utf-8")
        objects.append(
            f"<< /Length {len(stream_bytes)} >>\nstream\n{stream}\nendstream"
        )

    objects.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    buffer = BytesIO()
    buffer.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []

    for object_number, obj in enumerate(objects, start=1):
        offsets.append(buffer.tell())
        buffer.write(
            f"{object_number} 0 obj\n{obj}\nendobj\n".encode("utf-8")
        )

    xref_offset = buffer.tell()
    buffer.write(f"xref\n0 {len(objects) + 1}\n".encode("utf-8"))
    buffer.write(b"0000000000 65535 f \n")

    for offset in offsets:
        buffer.write(f"{offset:010d} 00000 n \n".encode("utf-8"))

    buffer.write(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF"
        ).encode("utf-8")
    )

    return buffer.getvalue()


def ensure_lesson_pdf(topic_id: int, title: str, notes: str) -> str:
    file_path = GENERATED_ROOT / f"topic-{topic_id}.pdf"

    file_path.write_bytes(build_pdf_bytes(title, notes))

    return f"/generated/lesson-pdfs/{file_path.name}"
