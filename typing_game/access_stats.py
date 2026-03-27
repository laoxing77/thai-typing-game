import hashlib
import json
from datetime import datetime, timedelta, timezone

from .storage import get_data_root


ACCESS_STATS_FILE = "access_stats.json"
PAGE_KEYS = {
    "/": "homeViews",
    "/word-bank": "wordBankViews",
    "/practice": "practiceViews",
    "/word-bank/import": "importViews",
}
EVENT_KEYS = {
    "practice_start": "practiceStarts",
    "practice_finish": "practiceFinishes",
}


def get_access_stats_path():
    return get_data_root() / ACCESS_STATS_FILE



def _today_key():
    return datetime.now(timezone.utc).date().isoformat()



def _empty_day():
    return {
        "pageViews": 0,
        "homeViews": 0,
        "wordBankViews": 0,
        "practiceViews": 0,
        "importViews": 0,
        "practiceStarts": 0,
        "practiceFinishes": 0,
        "visitors": [],
    }



def load_access_stats():
    file_path = get_access_stats_path()
    if not file_path.exists():
        return {"daily": {}}

    with file_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, dict):
        return {"daily": {}}

    daily = data.get("daily", {})
    if not isinstance(daily, dict):
        daily = {}

    normalized = {}
    for day_key, raw_day in daily.items():
        if not isinstance(raw_day, dict):
            continue
        normalized_day = _empty_day()
        for key in normalized_day:
            if key == "visitors":
                visitors = raw_day.get("visitors", [])
                normalized_day["visitors"] = [str(item) for item in visitors if str(item).strip()]
            else:
                normalized_day[key] = int(raw_day.get(key, 0) or 0)
        normalized[day_key] = normalized_day

    return {"daily": normalized}



def save_access_stats(stats):
    payload = {"daily": stats.get("daily", {})}
    file_path = get_access_stats_path()
    with file_path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)



def _cleanup_old_days(stats, keep_days=30):
    daily = stats.get("daily", {})
    today = datetime.now(timezone.utc).date()
    cutoff = today - timedelta(days=keep_days - 1)
    removable = []
    for day_key in daily:
        try:
            current_day = datetime.strptime(day_key, "%Y-%m-%d").date()
        except ValueError:
            removable.append(day_key)
            continue
        if current_day < cutoff:
            removable.append(day_key)

    for day_key in removable:
        daily.pop(day_key, None)



def _build_visitor_key(client_ip, user_agent):
    raw = f"{client_ip}|{user_agent}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:16]



def _client_ip(headers, client_address):
    forwarded_for = headers.get("X-Forwarded-For", "").strip()
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    real_ip = headers.get("X-Real-IP", "").strip()
    if real_ip:
        return real_ip
    return str(client_address[0] if client_address else "unknown")



def record_page_visit(path, headers, client_address):
    page_key = PAGE_KEYS.get(path)
    if not page_key:
        return

    stats = load_access_stats()
    daily = stats.setdefault("daily", {})
    today_key = _today_key()
    bucket = daily.setdefault(today_key, _empty_day())

    visitor_key = _build_visitor_key(_client_ip(headers, client_address), headers.get("User-Agent", ""))
    if visitor_key not in bucket["visitors"]:
        bucket["visitors"].append(visitor_key)

    bucket["pageViews"] += 1
    bucket[page_key] += 1
    _cleanup_old_days(stats)
    save_access_stats(stats)



def record_event(event_name):
    event_key = EVENT_KEYS.get(event_name)
    if not event_key:
        return

    stats = load_access_stats()
    daily = stats.setdefault("daily", {})
    today_key = _today_key()
    bucket = daily.setdefault(today_key, _empty_day())
    bucket[event_key] += 1
    _cleanup_old_days(stats)
    save_access_stats(stats)



def get_access_stats_summary():
    stats = load_access_stats()
    daily = stats.get("daily", {})
    today_key = _today_key()
    today = daily.get(today_key, _empty_day())

    total_page_views = sum(day.get("pageViews", 0) for day in daily.values())
    total_practice_starts = sum(day.get("practiceStarts", 0) for day in daily.values())
    total_practice_finishes = sum(day.get("practiceFinishes", 0) for day in daily.values())

    recent_days = []
    today_date = datetime.now(timezone.utc).date()
    for offset in range(6, -1, -1):
        current_day = today_date - timedelta(days=offset)
        key = current_day.isoformat()
        bucket = daily.get(key, _empty_day())
        recent_days.append(
            {
                "date": key,
                "label": current_day.strftime("%m-%d"),
                "pageViews": bucket.get("pageViews", 0),
                "practiceStarts": bucket.get("practiceStarts", 0),
            }
        )

    return {
        "totalPageViews": total_page_views,
        "todayPageViews": today.get("pageViews", 0),
        "todayUniqueVisitors": len(today.get("visitors", [])),
        "todayPracticeStarts": today.get("practiceStarts", 0),
        "totalPracticeStarts": total_practice_starts,
        "totalPracticeFinishes": total_practice_finishes,
        "recentDays": recent_days,
    }
