import os
import random
import re
import unicodedata
from difflib import SequenceMatcher

ANSWER_SPLIT_RE = re.compile(r"[\/|；;、\n]+")
CHINESE_FILLER_SUFFIXES = ("的", "地", "得")
CHINESE_PUNCTUATION = str.maketrans(
    {
        "，": ",",
        "。": ".",
        "；": ";",
        "：": ":",
        "？": "?",
        "！": "!",
        "（": "(",
        "）": ")",
        "【": "[",
        "】": "]",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "、": ",",
        "／": "/",
    }
)


def normalize_thai_answer(text):
    return " ".join(unicodedata.normalize("NFKC", str(text or "")).strip().split())



def normalize_chinese_answer(text):
    normalized = unicodedata.normalize("NFKC", str(text or "")).translate(CHINESE_PUNCTUATION).strip().lower()
    compact = "".join(normalized.split())
    return compact



def expand_chinese_forms(text):
    base = normalize_chinese_answer(text)
    forms = set()
    if not base:
        return forms

    forms.add(base)

    trimmed = base
    while len(trimmed) > 1 and trimmed.endswith(CHINESE_FILLER_SUFFIXES):
        trimmed = trimmed[:-1]
        forms.add(trimmed)

    return {form for form in forms if form}



def split_answer_variants(raw_value):
    if raw_value is None:
        return []

    if isinstance(raw_value, list):
        values = []
        for entry in raw_value:
            values.extend(split_answer_variants(entry))
        return values

    text = str(raw_value).strip()
    if not text:
        return []

    variants = [part.strip() for part in ANSWER_SPLIT_RE.split(text) if part.strip()]
    return variants or [text]



def get_expected_answers(item, direction):
    if direction == "th_to_zh":
        raw_answers = []
        raw_answers.extend(split_answer_variants(item.get("zh", "")))
        raw_answers.extend(split_answer_variants(item.get("zh_aliases", [])))
        raw_answers.extend(split_answer_variants(item.get("accepted_answers", [])))

        expanded = set()
        for answer in raw_answers:
            expanded.update(expand_chinese_forms(answer))

        return sorted(expanded) or list(expand_chinese_forms(item.get("zh", "")))

    return [normalize_thai_answer(item.get("th", ""))]



def _shared_prefix_length(first, second):
    return len(os.path.commonprefix([first, second]))



def is_close_chinese_match(user_answer, expected_answer):
    if user_answer == expected_answer:
        return True

    shorter, longer = sorted((user_answer, expected_answer), key=len)
    if len(shorter) >= 2 and longer.startswith(shorter) and (len(shorter) / max(len(longer), 1)) >= 0.67:
        return True

    similarity = SequenceMatcher(None, user_answer, expected_answer).ratio()
    shared_prefix = _shared_prefix_length(user_answer, expected_answer)
    if shared_prefix >= 2 and similarity >= 0.58:
        return True

    return False



def is_correct_answer(item, direction, answer):
    if direction == "th_to_zh":
        normalized_user_forms = expand_chinese_forms(answer)
        expected_answers = get_expected_answers(item, direction)
        for user_form in normalized_user_forms:
            for expected in expected_answers:
                if is_close_chinese_match(user_form, expected):
                    return True
        return False

    return normalize_thai_answer(answer) == normalize_thai_answer(item.get("th", ""))



def format_correct_answer(item, direction):
    if direction == "th_to_zh":
        aliases = split_answer_variants(item.get("zh_aliases", []))
        accepted = [str(item.get("zh", "")).strip()] + aliases
        unique_answers = []
        seen = set()
        for answer in accepted:
            if answer and answer not in seen:
                unique_answers.append(answer)
                seen.add(answer)
        return " / ".join(unique_answers)
    return item["th"]



def choose_random_questions(items, count):
    count = min(max(count, 1), len(items))
    return random.sample(items, count)
