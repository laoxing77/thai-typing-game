import json
from datetime import datetime, timezone

from .storage import get_data_root


PRACTICE_HISTORY_FILE = "practice_history.json"


def get_practice_history_path():
    return get_data_root() / PRACTICE_HISTORY_FILE


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def load_practice_history():
    file_path = get_practice_history_path()
    if not file_path.exists():
        return []

    with file_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if isinstance(data, dict):
        records = data.get("records", [])
    elif isinstance(data, list):
        records = data
    else:
        return []

    normalized = []
    for record in records:
        if not isinstance(record, dict):
            continue
        normalized.append(
            {
                "completed_at": str(record.get("completed_at") or _now_iso()),
                "mode": str(record.get("mode") or "all"),
                "direction": str(record.get("direction") or "zh_to_th"),
                "score": int(record.get("score", 0) or 0),
                "total": int(record.get("total", 0) or 0),
                "accuracy": int(record.get("accuracy", 0) or 0),
            }
        )
    return normalized


def save_practice_history(records):
    payload = {"records": records}
    file_path = get_practice_history_path()
    with file_path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)


def append_practice_record(record):
    records = load_practice_history()
    normalized = {
        "completed_at": str(record.get("completed_at") or _now_iso()),
        "mode": str(record.get("mode") or "all"),
        "direction": str(record.get("direction") or "zh_to_th"),
        "score": int(record.get("score", 0) or 0),
        "total": int(record.get("total", 0) or 0),
        "accuracy": int(record.get("accuracy", 0) or 0),
    }
    records.insert(0, normalized)
    save_practice_history(records[:30])


def get_practice_history_summary():
    records = load_practice_history()
    total_rounds = len(records)
    total_questions = sum(record["total"] for record in records)
    total_correct = sum(record["score"] for record in records)
    average_accuracy = round((total_correct / total_questions) * 100) if total_questions else 0
    return {
        "totalRounds": total_rounds,
        "totalQuestions": total_questions,
        "averageAccuracy": average_accuracy,
        "recent": records[:5],
    }
