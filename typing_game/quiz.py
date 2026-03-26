import random


def normalize_chinese_answer(text):
    translation_table = str.maketrans(
        {
            "，": ",",
            "。": ".",
            "、": ",",
            "；": ";",
            "：": ":",
            "？": "?",
            "！": "!",
            "（": "(",
            "）": ")",
            "“": '"',
            "”": '"',
            "‘": "'",
            "’": "'",
            "／": "/",
        }
    )
    return "".join(str(text).strip().translate(translation_table).lower().split())


def get_expected_answers(item, direction):
    if direction == "th_to_zh":
        raw_answers = str(item["zh"]).split("/")
        answers = [normalize_chinese_answer(answer) for answer in raw_answers if answer.strip()]
        return answers or [normalize_chinese_answer(item["zh"])]
    return [item["th"]]


def is_correct_answer(item, direction, answer):
    if direction == "th_to_zh":
        return normalize_chinese_answer(answer) in get_expected_answers(item, direction)
    return answer == item["th"]


def format_correct_answer(item, direction):
    return item["zh"] if direction == "th_to_zh" else item["th"]


def choose_random_questions(items, count):
    count = min(max(count, 1), len(items))
    return random.sample(items, count)
