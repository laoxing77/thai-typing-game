import json
import os
import shutil
import uuid
from pathlib import Path


DEFAULT_DATA_FILE = "words.json"
DATA_FILE_CANDIDATES = [DEFAULT_DATA_FILE, "word.json"]
REQUIRED_FIELDS = ("th", "zh")


def get_project_root():
    return Path(__file__).resolve().parent.parent


def get_data_root():
    configured = os.getenv("APP_DATA_DIR", "").strip()
    if configured:
        data_root = Path(configured)
        data_root.mkdir(parents=True, exist_ok=True)
        return data_root
    return get_project_root()


def _seed_runtime_file(filename):
    data_root = get_data_root()
    target = data_root / filename
    if target.exists() or data_root == get_project_root():
        return target

    source = get_project_root() / filename
    if source.exists():
        shutil.copy2(source, target)
    return target


def get_data_file_path():
    """Return the existing data file path, or the default save path."""
    base_dir = get_data_root()

    for filename in DATA_FILE_CANDIDATES:
        file_path = _seed_runtime_file(filename) if base_dir != get_project_root() else base_dir / filename
        if file_path.exists():
            return file_path

    return base_dir / DEFAULT_DATA_FILE


def build_item_key(item):
    """Build a stable content key for one item."""
    return f"{item.get('type', 'word')}||{item['th']}||{item['zh']}"


def normalize_item(item, default_type):
    """Validate and normalize a single word-bank item."""
    if not isinstance(item, dict):
        raise ValueError("Item must be a JSON object.")

    missing_fields = [field for field in REQUIRED_FIELDS if not str(item.get(field, "")).strip()]
    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

    normalized = dict(item)
    normalized["id"] = str(item.get("id") or uuid.uuid4().hex)
    normalized["th"] = str(item["th"]).strip()
    normalized["zh"] = str(item["zh"]).strip()

    inferred_type = item.get("type")
    if str(item.get("category", "")).strip().lower() == "phrase":
        inferred_type = "phrase"

    normalized["type"] = str(inferred_type or default_type).strip() or default_type
    return normalized


def split_items_by_type(items):
    """Split normalized items into words and phrases."""
    words = []
    phrases = []

    for item in items:
        if item.get("type") == "phrase":
            phrases.append(item)
        else:
            words.append(item)

    return {"words": words, "phrases": phrases}


def get_import_lists(data):
    """Read word/phrase lists from multiple supported key formats."""
    words = data.get("words")
    if words is None:
        words = data.get("word", [])

    phrases = data.get("phrases")
    if phrases is None:
        phrases = data.get("phrase", [])

    sentences = data.get("sentence", [])
    if sentences is None:
        sentences = []

    if not isinstance(words, list):
        raise ValueError("Expected words or word to be a list.")

    if not isinstance(phrases, list):
        raise ValueError("Expected phrases or phrase to be a list.")

    if not isinstance(sentences, list):
        raise ValueError("Expected sentence to be a list.")

    return words, phrases + sentences


def load_data():
    """Load the current word bank."""
    file_path = get_data_file_path()

    if not file_path.exists():
        return {"words": [], "phrases": []}

    with file_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if isinstance(data, list):
        normalized_items = [normalize_item(item, item.get("type", "word")) for item in data]
        return split_items_by_type(normalized_items)

    if not isinstance(data, dict):
        raise ValueError("Word-bank data must be a JSON object or array.")

    words, phrases = get_import_lists(data)
    normalized_items = [normalize_item(item, "word") for item in words]
    normalized_items.extend(normalize_item(item, "phrase") for item in phrases)
    return split_items_by_type(normalized_items)


def save_data(data):
    """Save the word bank to the default data file."""
    file_path = get_data_file_path()

    with file_path.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


def ensure_data_file():
    """Normalize and persist the data file."""
    data = load_data()
    save_data(data)
    return data


def validate_import_data(data):
    """Validate uploaded word-bank data."""
    if isinstance(data, list):
        normalized_items = [normalize_item(item, item.get("type", "word")) for item in data]
        return split_items_by_type(normalized_items)

    if not isinstance(data, dict):
        raise ValueError("Imported data must be a JSON object or array.")

    words, phrases = get_import_lists(data)
    normalized_items = []

    for index, item in enumerate(words, start=1):
        try:
            normalized_items.append(normalize_item(item, "word"))
        except ValueError as error:
            raise ValueError(f"Invalid words row {index}: {error}") from error

    for index, item in enumerate(phrases, start=1):
        try:
            normalized_items.append(normalize_item(item, "phrase"))
        except ValueError as error:
            raise ValueError(f"Invalid phrases row {index}: {error}") from error

    return split_items_by_type(normalized_items)


def import_data_from_path(import_path, mode):
    """Import word-bank data from a JSON file path."""
    import_path = Path(import_path)
    if not import_path.is_absolute():
        import_path = Path.cwd() / import_path

    if not import_path.exists():
        raise FileNotFoundError(f"Import file not found: {import_path}")

    with import_path.open("r", encoding="utf-8") as file:
        imported_data = json.load(file)

    validated_data = validate_import_data(imported_data)
    if not validated_data["words"] and not validated_data["phrases"]:
        raise ValueError("Imported file does not contain any items.")

    if mode == "append":
        current_data = load_data()
        merged_data = {
            "words": current_data.get("words", []) + validated_data["words"],
            "phrases": current_data.get("phrases", []) + validated_data["phrases"],
        }
    elif mode == "replace":
        merged_data = validated_data
    else:
        raise ValueError("Unsupported import mode.")

    save_data(merged_data)
    return {
        "ok": True,
        "added_words": len(validated_data["words"]),
        "added_phrases": len(validated_data["phrases"]),
        "total_words": len(merged_data["words"]),
        "total_phrases": len(merged_data["phrases"]),
        "path": str(get_data_file_path()),
    }


def get_all_lessons(words, phrases):
    lessons = set()
    for item in words + phrases:
        lesson = item.get("lesson")
        if lesson is not None:
            lessons.add(lesson)
    return sorted(lessons)


def get_all_items(data):
    """Return all items with bucket info for CRUD operations."""
    all_items = []
    for item in data.get("words", []):
        all_items.append({"bucket": "words", "item": item})
    for item in data.get("phrases", []):
        all_items.append({"bucket": "phrases", "item": item})
    return all_items


def get_item_summary(data=None):
    """Return compact counts for frontend or CLI."""
    data = data or load_data()
    all_items = get_all_items(data)
    return {
        "words": len(data["words"]),
        "phrases": len(data["phrases"]),
        "total": len(all_items),
    }


def list_items(data=None, bucket=None, lesson=None, keyword=None, limit=None, offset=0):
    """List items with simple filters for future API/frontends."""
    data = data or load_data()
    all_items = get_all_items(data)

    filtered = []
    for entry in all_items:
        item = entry["item"]

        if bucket and entry["bucket"] != bucket:
            continue
        if lesson is not None and item.get("lesson") != lesson:
            continue
        if keyword:
            haystack = " ".join(
                [
                    item.get("id", ""),
                    item.get("th", ""),
                    item.get("zh", ""),
                    str(item.get("lesson", "")),
                    item.get("type", ""),
                    item.get("category", ""),
                ]
            ).lower()
            if keyword.strip().lower() not in haystack:
                continue

        filtered.append(entry)

    total = len(filtered)
    if offset:
        filtered = filtered[offset:]
    if limit is not None:
        filtered = filtered[:limit]

    return {
        "items": filtered,
        "total": total,
        "offset": offset,
        "limit": limit,
    }


def format_item_brief(index, item):
    lesson = item.get("lesson", "-")
    return f"{index}. [{item.get('type', 'word')}][lesson {lesson}] {item['zh']} - {item['th']}"


def search_items(all_items, keyword):
    """Search items by keyword."""
    keyword = keyword.strip().lower()
    if not keyword:
        return []

    results = []
    for display_index, entry in enumerate(all_items, start=1):
        item = entry["item"]
        haystack = " ".join(
            [
                item.get("id", ""),
                item.get("th", ""),
                item.get("zh", ""),
                str(item.get("lesson", "")),
                item.get("type", ""),
                item.get("category", ""),
            ]
        ).lower()
        if keyword in haystack:
            results.append((display_index, entry))
    return results


def create_item(item_data):
    """Create one item and persist it."""
    data = load_data()
    item_type = item_data.get("type", "word")
    normalized = normalize_item(item_data, item_type)

    bucket = "phrases" if normalized["type"] == "phrase" else "words"
    data[bucket].append(normalized)
    save_data(data)
    return {"ok": True, "item": normalized, "bucket": bucket}


def get_item_by_id(item_id, data=None):
    """Return one item and its bucket by stable id."""
    data = data or load_data()
    for bucket in ("words", "phrases"):
        for item in data[bucket]:
            if item.get("id") == item_id:
                return {"item": item, "bucket": bucket}
    return None


def update_item(item_id, updates):
    """Update one item by stable id and persist it."""
    data = load_data()
    existing = get_item_by_id(item_id, data=data)
    if not existing:
        return {"ok": False, "item": None, "bucket": None, "previous_bucket": None}

    current_item = existing["item"]
    current_bucket = existing["bucket"]
    merged = dict(current_item)
    merged.update(updates)
    merged["id"] = current_item["id"]

    default_type = merged.get("type", current_item.get("type", "word"))
    normalized = normalize_item(merged, default_type)
    new_bucket = "phrases" if normalized["type"] == "phrase" else "words"

    data[current_bucket] = [item for item in data[current_bucket] if item.get("id") != item_id]
    data[new_bucket].append(normalized)
    save_data(data)

    return {
        "ok": True,
        "item": normalized,
        "previous_bucket": current_bucket,
        "bucket": new_bucket,
    }


def delete_item_by_id(item_id):
    """Delete one item by stable id."""
    data = load_data()
    for bucket in ("words", "phrases"):
        before = len(data[bucket])
        data[bucket] = [item for item in data[bucket] if item.get("id") != item_id]
        if len(data[bucket]) != before:
            save_data(data)
            return {"ok": True, "deleted": True, "item_id": item_id, "bucket": bucket}
    return {"ok": False, "deleted": False, "item_id": item_id, "bucket": None}
