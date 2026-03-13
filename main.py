from words import words
import random


def run_quiz(question_words):
    score = 0
    wrong_words = []

    for i, word in enumerate(question_words):
        print(f"\n第 {i + 1} 题")
        print(f"中文：{word['zh']}")
        answer = input("请输入泰文：").strip()

        if answer == word["th"]:
            print("正确！")
            score += 1
        else:
            print("错误！")
            print(f"正确答案是：{word['th']}")
            wrong_words.append(word)

    total = len(question_words)
    accuracy = (score / total) * 100 if total > 0 else 0

    print("\n本轮结束！")
    print(f"得分：{score}/{total}")
    print(f"正确率：{accuracy:.0f}%")

    if wrong_words:
        print("\n错题本：")
        for w in wrong_words:
            print(f"{w['zh']} - {w['th']}")
    else:
        print("\n太棒了，没有错题！")

    return wrong_words


print("欢迎来到泰文打字练习小游戏！")
print("一共 5 题，请输入对应的泰文。")

total_questions = 5
selected_words = random.sample(words, total_questions)

# 第一轮
wrong_words = run_quiz(selected_words)

# 是否重练错题
if wrong_words:
    retry = input("\n是否重练错题？(y/n)：").strip().lower()

    if retry == "y":
        print("\n开始错题重练：")
        run_quiz(wrong_words)

print("\n游戏结束，感谢练习！")