import json
import mimetypes
import csv
import io
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .access_stats import get_access_stats_summary, record_event, record_page_visit
from .practice_history import append_practice_record, get_practice_history_summary
from .quiz import choose_random_questions, format_correct_answer, is_correct_answer
from .storage import (
    build_item_key,
    create_item,
    delete_item_by_id,
    get_all_lessons,
    get_item_by_id,
    get_item_summary,
    list_items,
    load_data,
    normalize_item,
    save_data,
    update_item,
)
from .wrong_book import add_wrong_items, get_wrong_items, load_wrong_book_records, remove_correct_items


STATIC_DIR = Path(__file__).resolve().parent.parent / "web"
ROUTE_TO_FILE = {
    "/": "index.html",
    "/word-bank": "word-bank.html",
    "/word-bank/import": "word-bank-import.html",
    "/practice": "practice.html",
}

TYPE_ALIASES = {
    "word": "word",
    "words": "word",
    "\u5355\u8bcd": "word",
    "\u8bcd": "word",
    "phrase": "phrase",
    "phrases": "phrase",
    "\u77ed\u53e5": "phrase",
    "\u53e5\u5b50": "phrase",
}

COLUMN_ALIASES = {
    "type": "type",
    "\u7c7b\u578b": "type",
    "thai": "th",
    "th": "th",
    "\u6cf0\u6587": "th",
    "chinese": "zh",
    "zh": "zh",
    "\u4e2d\u6587": "zh",
    "lesson": "lesson",
    "\u8bfe\u6b21": "lesson",
    "category": "category",
    "\u5206\u7c7b": "category",
}

TEMPLATE_HEADERS = ["\u7c7b\u578b", "\u6cf0\u6587", "\u4e2d\u6587", "\u8bfe\u6b21", "\u5206\u7c7b"]
TEMPLATE_ROWS = [
    ["\u5355\u8bcd", "\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35", "\u4f60\u597d", "1", "\u95ee\u5019"],
    ["\u77ed\u53e5", "\u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e04\u0e23\u0e31\u0e1a", "\u8c22\u8c22", "1", "\u793c\u8c8c"],
]


def build_dashboard_payload():
    data = load_data()
    summary = get_item_summary(data)
    lessons = get_all_lessons(data.get("words", []), data.get("phrases", []))
    wrong_records = load_wrong_book_records()
    history = get_practice_history_summary()
    return {
        "summary": summary,
        "lessons": lessons,
        "wrongBookCount": len(wrong_records),
        "practiceHistory": history,
        "accessStats": get_access_stats_summary(),
    }


def build_items_payload(query):
    lesson_raw = query.get("lesson", [None])[0]
    lesson = int(lesson_raw) if lesson_raw and lesson_raw.isdigit() else None

    item_type = query.get("type", ["all"])[0]
    bucket = None
    if item_type == "word":
        bucket = "words"
    elif item_type == "phrase":
        bucket = "phrases"

    keyword = query.get("keyword", [""])[0].strip() or None
    limit_raw = query.get("limit", ["50"])[0]
    offset_raw = query.get("offset", ["0"])[0]
    limit = int(limit_raw) if limit_raw.isdigit() else 50
    offset = int(offset_raw) if offset_raw.isdigit() else 0

    page = list_items(
        bucket=bucket,
        lesson=lesson,
        keyword=keyword,
        limit=max(1, min(limit, 200)),
        offset=max(0, offset),
    )

    items = []
    for entry in page["items"]:
        item = dict(entry["item"])
        item["bucket"] = entry["bucket"]
        items.append(item)

    return {
        "items": items,
        "total": page["total"],
        "offset": page["offset"],
        "limit": page["limit"],
    }


def _normalize_word_bank_input(payload):
    item_type = str(payload.get("type", "word")).strip().lower() or "word"
    th = str(payload.get("th", "")).strip()
    zh = str(payload.get("zh", "")).strip()
    category = str(payload.get("category", "")).strip()
    lesson_raw = payload.get("lesson")

    item = {"type": item_type, "th": th, "zh": zh}
    if category:
        item["category"] = category
    if lesson_raw not in (None, ""):
        if isinstance(lesson_raw, int):
            item["lesson"] = lesson_raw
        elif str(lesson_raw).isdigit():
            item["lesson"] = int(str(lesson_raw))
    return item


def _parse_import_type(raw_type):
    key = str(raw_type).strip().lower()
    resolved = TYPE_ALIASES.get(key)
    if not resolved:
        raise ValueError("Type must be word/phrase or \u5355\u8bcd/\u77ed\u53e5.")
    return resolved


def _normalize_import_headers(headers):
    normalized = {}
    for header in headers:
        if header is None:
            continue
        mapped = COLUMN_ALIASES.get(str(header).strip().lower())
        if mapped:
            normalized[mapped] = header
    required = {"type", "th", "zh"}
    if not required.issubset(set(normalized.keys())):
        raise ValueError("Template columns are missing. Please use the downloaded template.")
    return normalized


def _parse_import_csv(content):
    text = str(content or "").lstrip("\ufeff").strip()
    rows = []
    errors = []
    if not text:
        errors.append({"line": 0, "message": "Please choose a CSV file before previewing."})
        return rows, errors

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        errors.append({"line": 0, "message": "The CSV file is empty."})
        return rows, errors

    try:
        mapped_headers = _normalize_import_headers(reader.fieldnames)
    except ValueError as error:
        errors.append({"line": 0, "message": str(error)})
        return rows, errors

    for row in reader:
        line_number = reader.line_num
        if row is None:
            continue

        values = [str(value or "").strip() for value in row.values()]
        if not any(values):
            continue

        try:
            item_type = _parse_import_type(row.get(mapped_headers["type"], ""))
            thai_text = str(row.get(mapped_headers["th"], "")).strip()
            chinese_text = str(row.get(mapped_headers["zh"], "")).strip()
            lesson_text = str(row.get(mapped_headers.get("lesson"), "")).strip()
            category_text = str(row.get(mapped_headers.get("category"), "")).strip()

            payload = {
                "type": item_type,
                "th": thai_text,
                "zh": chinese_text,
                "category": category_text,
            }
            if lesson_text:
                if not lesson_text.isdigit():
                    raise ValueError("Lesson must be a number.")
                payload["lesson"] = int(lesson_text)

            normalized = normalize_item(payload, item_type)
            rows.append({"line": line_number, "item": normalized})
        except ValueError as error:
            errors.append({"line": line_number, "message": str(error)})

    if not rows and not errors:
        errors.append({"line": 0, "message": "The CSV file has no usable rows."})

    return rows, errors


def build_import_template_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(TEMPLATE_HEADERS)
    writer.writerows(TEMPLATE_ROWS)
    return output.getvalue()


def preview_word_bank_import(payload):
    parsed_rows, errors = _parse_import_csv(payload.get("content", ""))
    current_data = load_data()
    existing_keys = {
        build_item_key(item)
        for item in current_data.get("words", []) + current_data.get("phrases", [])
    }
    seen_keys = set()
    preview_items = []
    ready_count = 0
    duplicate_count = 0

    for row in parsed_rows:
        item = row["item"]
        item_key = build_item_key(item)
        is_duplicate = item_key in existing_keys or item_key in seen_keys
        status = "duplicate" if is_duplicate else "ready"
        if is_duplicate:
            duplicate_count += 1
        else:
            ready_count += 1
            seen_keys.add(item_key)

        preview_items.append({"line": row["line"], "status": status, "item": item})

    return {
        "ok": True,
        "items": preview_items,
        "errors": errors,
        "summary": {
            "parsed": len(parsed_rows),
            "ready": ready_count,
            "duplicates": duplicate_count,
            "errors": len(errors),
        },
    }


def confirm_word_bank_import(payload):
    preview = preview_word_bank_import(payload)
    ready_rows = [entry for entry in preview["items"] if entry["status"] == "ready"]

    if not ready_rows:
        return {"ok": False, "message": "No new items are ready to import.", "preview": preview}

    current_data = load_data()
    words = list(current_data.get("words", []))
    phrases = list(current_data.get("phrases", []))

    for entry in ready_rows:
        item = dict(entry["item"])
        if item.get("type") == "phrase":
            phrases.append(item)
        else:
            words.append(item)

    save_data({"words": words, "phrases": phrases})

    return {
        "ok": True,
        "imported": len(ready_rows),
        "duplicates": preview["summary"]["duplicates"],
        "errors": preview["summary"]["errors"],
        "dashboard": build_dashboard_payload(),
        "preview": preview,
    }


def create_word_bank_item(payload):
    try:
        created = create_item(_normalize_word_bank_input(payload))
    except ValueError as error:
        return {"ok": False, "message": str(error)}
    return {"ok": True, "item": created["item"], "dashboard": build_dashboard_payload()}


def update_word_bank_item(payload):
    item_id = str(payload.get("id", "")).strip()
    if not item_id:
        return {"ok": False, "message": "Missing item id."}

    try:
        updated = update_item(item_id, _normalize_word_bank_input(payload))
    except ValueError as error:
        return {"ok": False, "message": str(error)}

    if not updated.get("ok"):
        return {"ok": False, "message": "Item not found."}
    return {"ok": True, "item": updated["item"], "dashboard": build_dashboard_payload()}


def delete_word_bank_item(payload):
    item_id = str(payload.get("id", "")).strip()
    if not item_id:
        return {"ok": False, "message": "Missing item id."}

    deleted = delete_item_by_id(item_id)
    if not deleted.get("deleted"):
        return {"ok": False, "message": "Item not found."}
    return {"ok": True, "itemId": item_id, "dashboard": build_dashboard_payload()}


def _resolve_practice_pool(data, mode, lesson):
    words = data.get("words", [])
    phrases = data.get("phrases", [])

    if mode == "word":
        return words, "word"
    if mode == "phrase":
        return phrases, "phrase"
    if mode == "wrong":
        return get_wrong_items(), "wrong"
    if mode == "lesson" and lesson is not None:
        lesson_items = [item for item in (words + phrases) if item.get("lesson") == lesson]
        return lesson_items, "lesson"
    return words + phrases, "all"


def build_practice_setup_payload(payload):
    data = load_data()
    mode = str(payload.get("mode", "all")).strip().lower() or "all"
    direction = str(payload.get("direction", "zh_to_th")).strip().lower() or "zh_to_th"
    lesson = payload.get("lesson")
    lesson = lesson if isinstance(lesson, int) else None

    selected_items, resolved_mode = _resolve_practice_pool(data, mode, lesson)
    total_available = len(selected_items)
    if total_available == 0:
        return {
            "ok": False,
            "message": "No practice items available for this selection.",
            "questions": [],
            "summary": {"totalAvailable": 0},
        }

    requested_count = payload.get("count", 5)
    if not isinstance(requested_count, int):
        requested_count = 5
    question_count = min(max(requested_count, 1), total_available)
    questions = choose_random_questions(selected_items, question_count)

    return {
        "ok": True,
        "mode": resolved_mode,
        "direction": direction,
        "questionCount": question_count,
        "summary": {
            "totalAvailable": total_available,
            "wrongBookCount": len(load_wrong_book_records()),
        },
        "questions": questions,
    }


def build_practice_check_payload(payload):
    item_id = str(payload.get("itemId", "")).strip()
    direction = payload.get("direction", "zh_to_th")
    answer = str(payload.get("answer", ""))

    resolved = get_item_by_id(item_id)
    if not resolved:
        return {"ok": False, "message": "Item not found."}

    item = resolved["item"]
    correct = is_correct_answer(item, direction, answer)
    prompt = item["zh"] if direction == "zh_to_th" else item["th"]

    return {
        "ok": True,
        "correct": correct,
        "correctAnswer": format_correct_answer(item, direction),
        "prompt": prompt,
        "item": item,
    }


def update_practice_results(payload):
    wrong_ids = payload.get("wrongItemIds", [])
    correct_ids = payload.get("correctItemIds", [])

    wrong_items = []
    for item_id in wrong_ids:
        resolved = get_item_by_id(str(item_id))
        if resolved:
            wrong_items.append(resolved["item"])

    correct_items = []
    for item_id in correct_ids:
        resolved = get_item_by_id(str(item_id))
        if resolved:
            correct_items.append(resolved["item"])

    add_wrong_items(wrong_items)
    remove_correct_items(correct_items)

    total = int(payload.get("total", 0) or 0)
    score = int(payload.get("score", 0) or 0)
    accuracy = int(payload.get("accuracy", 0) or 0)
    if total > 0:
        append_practice_record(
            {
                "mode": str(payload.get("mode") or "all"),
                "direction": str(payload.get("direction") or "zh_to_th"),
                "score": score,
                "total": total,
                "accuracy": accuracy,
            }
        )

    return {
        "ok": True,
        "wrongBookCount": len(load_wrong_book_records()),
        "practiceHistory": get_practice_history_summary(),
    }


class TypingGameWebHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/dashboard":
            return self._send_json(build_dashboard_payload())
        if parsed.path == "/api/items":
            return self._send_json(build_items_payload(parse_qs(parsed.query)))
        if parsed.path == "/api/word-bank/import-template.csv":
            return self._send_csv(build_import_template_csv(), "word-bank-import-template.csv")
        if parsed.path == "/health":
            return self._send_json({"ok": True})

        if parsed.path in ROUTE_TO_FILE:
            record_page_visit(parsed.path, self.headers, self.client_address)

        return self._serve_static(parsed.path)

    def do_POST(self):
        parsed = urlparse(self.path)
        payload = self._read_json_body()
        if payload is None:
            return self._send_json({"ok": False, "message": "Invalid JSON body."}, status=HTTPStatus.BAD_REQUEST)

        if parsed.path == "/api/word-bank/create":
            result = create_word_bank_item(payload)
            return self._send_json(result, status=HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST)
        if parsed.path == "/api/word-bank/update":
            result = update_word_bank_item(payload)
            return self._send_json(result, status=HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST)
        if parsed.path == "/api/word-bank/delete":
            result = delete_word_bank_item(payload)
            return self._send_json(result, status=HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST)
        if parsed.path == "/api/word-bank/import-preview":
            result = preview_word_bank_import(payload)
            return self._send_json(result)
        if parsed.path == "/api/word-bank/import-confirm":
            result = confirm_word_bank_import(payload)
            return self._send_json(result, status=HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST)
        if parsed.path == "/api/practice/setup":
            result = build_practice_setup_payload(payload)
            if result.get("ok"):
                record_event("practice_start")
            return self._send_json(result)
        if parsed.path == "/api/practice/check":
            result = build_practice_check_payload(payload)
            status = HTTPStatus.OK if result.get("ok") else HTTPStatus.NOT_FOUND
            return self._send_json(result, status=status)
        if parsed.path == "/api/practice/finish":
            result = update_practice_results(payload)
            if result.get("ok"):
                record_event("practice_finish")
            return self._send_json(result)

        return self._send_json({"ok": False, "message": "Not found."}, status=HTTPStatus.NOT_FOUND)

    def log_message(self, format, *args):
        return

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", "0") or 0)
        raw_body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            return json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            return None

    def _send_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_csv(self, text, filename):
        body = text.encode("utf-8-sig")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_static(self, request_path):
        relative_path = ROUTE_TO_FILE.get(request_path, request_path.lstrip("/"))
        if not relative_path:
            relative_path = "index.html"
        target = (STATIC_DIR / relative_path).resolve()

        if STATIC_DIR.resolve() not in target.parents and target != STATIC_DIR.resolve():
            return self._send_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)
        if not target.exists() or not target.is_file():
            return self._send_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)

        content_type, _ = mimetypes.guess_type(str(target))
        body = target.read_bytes()

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def run_web_app(host="127.0.0.1", port=8000):
    server = ThreadingHTTPServer((host, port), TypingGameWebHandler)
    print(f"Web frontend running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nWeb frontend stopped.")
    finally:
        server.server_close()

