import json
from datetime import datetime, timezone

from .storage import build_item_key, get_data_root, load_data


WRONG_BOOK_FILE = "wrong_book.json"


def get_wrong_book_path():
    return get_data_root() / WRONG_BOOK_FILE


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _build_item_maps():
    data = load_data()
    all_items = data["words"] + data["phrases"]
    by_id = {item["id"]: item for item in all_items}
    by_key = {build_item_key(item): item for item in all_items}
    return by_id, by_key


def load_wrong_book_records():
    """Load wrong-book records in a frontend-friendly structure."""
    file_path = get_wrong_book_path()
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

    by_id, by_key = _build_item_maps()
    normalized_records = []
    seen_ids = set()

    for record in records:
        if not isinstance(record, dict):
            continue

        item_id = record.get("item_id")
        if item_id and item_id in by_id:
            resolved_id = item_id
        elif "th" in record and "zh" in record:
            item = by_key.get(build_item_key(record))
            resolved_id = item["id"] if item else None
        else:
            resolved_id = None

        if not resolved_id or resolved_id in seen_ids:
            continue

        seen_ids.add(resolved_id)
        normalized_records.append(
            {
                "item_id": resolved_id,
                "wrong_count": int(record.get("wrong_count", 1) or 1),
                "last_wrong_at": str(record.get("last_wrong_at") or _now_iso()),
            }
        )

    return normalized_records


def save_wrong_book_records(records):
    """Persist wrong-book records."""
    payload = {"records": records}
    file_path = get_wrong_book_path()
    with file_path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)


def get_wrong_items():
    """Return wrong-book items resolved from current word bank."""
    records = load_wrong_book_records()
    by_id, _ = _build_item_maps()
    items = []
    for record in records:
        item = by_id.get(record["item_id"])
        if item:
            items.append(item)
    return items


def get_wrong_book_count():
    return len(load_wrong_book_records())


def add_wrong_items(items):
    """Add or increment wrong-book records."""
    if not items:
        return

    records = load_wrong_book_records()
    by_id = {record["item_id"]: dict(record) for record in records}

    for item in items:
        item_id = item["id"]
        record = by_id.get(item_id)
        if record:
            record["wrong_count"] += 1
            record["last_wrong_at"] = _now_iso()
        else:
            by_id[item_id] = {
                "item_id": item_id,
                "wrong_count": 1,
                "last_wrong_at": _now_iso(),
            }

    save_wrong_book_records(list(by_id.values()))


def remove_correct_items(items):
    """Remove correctly answered items from wrong book."""
    if not items:
        return

    remove_ids = {item["id"] for item in items}
    records = [record for record in load_wrong_book_records() if record["item_id"] not in remove_ids]
    save_wrong_book_records(records)
