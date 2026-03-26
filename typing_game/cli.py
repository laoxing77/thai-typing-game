import json
from pathlib import Path

from .console import setup_console_encoding
from .quiz import choose_random_questions, format_correct_answer, is_correct_answer
from .storage import (
    create_item,
    delete_item_by_id,
    ensure_data_file,
    format_item_brief,
    get_all_items,
    get_all_lessons,
    get_item_summary,
    import_data_from_path,
    list_items,
    load_data,
    search_items,
    update_item,
)
from .wrong_book import add_wrong_items, get_wrong_book_count, get_wrong_items, remove_correct_items


def import_data_cli():
    file_input = input('\n请输入要导入的 JSON 文件路径：').strip().strip('"')
    if not file_input:
        print('未输入文件路径，已取消导入。')
        return

    print('\n请选择导入方式：')
    print('1. 追加到现有词库')
    print('2. 覆盖现有词库')
    mode_choice = input('请输入选项编号：').strip()
    mode = {'1': 'append', '2': 'replace'}.get(mode_choice)
    if not mode:
        print('输入无效，已取消导入。')
        return

    try:
        result = import_data_from_path(Path(file_input), mode)
    except FileNotFoundError as error:
        print(error)
        return
    except json.JSONDecodeError as error:
        print(f'JSON 解析失败：第 {error.lineno} 行，第 {error.colno} 列。')
        return
    except ValueError as error:
        print(f'导入失败：{error}')
        return
    except OSError as error:
        print(f'读取或保存失败：{error}')
        return

    print('\n导入成功！')
    print(f"单词新增：{result['added_words']} 条")
    print(f"短句新增：{result['added_phrases']} 条")
    print(f"当前词库总单词：{result['total_words']} 条")
    print(f"当前词库总短句：{result['total_phrases']} 条")
    print(f"已保存到：{result['path']}")


def choose_mode(words, phrases):
    print('\n请选择练习模式：')
    print('1. 单词练习')
    print('2. 短句练习')
    print('3. 全部混合练习')
    print('4. 按课程练习')
    print('5. 只练错题')

    choice = input('请输入选项编号：').strip()

    if choice == '1':
        return words, '单词练习'
    if choice == '2':
        return phrases, '短句练习'
    if choice == '3':
        return words + phrases, '全部混合练习'
    if choice == '4':
        lessons = get_all_lessons(words, phrases)
        print(f'\n可选课程：{lessons}')
        lesson_input = input('请输入课程号：').strip()
        if lesson_input.isdigit():
            lesson_num = int(lesson_input)
            selected = [item for item in (words + phrases) if item.get('lesson') == lesson_num]
            if selected:
                return selected, f'第 {lesson_num} 课练习'
        print('这个课程没有内容，默认返回全部混合练习。')
        return words + phrases, '全部混合练习'
    if choice == '5':
        wrong_items = get_wrong_items()
        if wrong_items:
            return wrong_items, '只练错题'
        print('错题本是空的，默认返回全部混合练习。')
        return words + phrases, '全部混合练习'

    print('输入无效，默认进入全部混合练习。')
    return words + phrases, '全部混合练习'


def choose_direction():
    print('\n请选择答题方向：')
    print('1. 中文 -> 泰文')
    print('2. 泰文 -> 中文')

    choice = input('请输入选项编号：').strip()
    if choice == '2':
        return 'th_to_zh', '泰文 -> 中文'
    if choice != '1':
        print('输入无效，默认使用 中文 -> 泰文。')
    return 'zh_to_th', '中文 -> 泰文'


def choose_question_count(total_available):
    default_count = min(5, total_available)
    prompt = f'请输入本次要练习的题数（1-{total_available}，默认 {default_count}）：'
    user_input = input(prompt).strip()

    if not user_input:
        return default_count
    if not user_input.isdigit():
        print(f'输入无效，默认使用 {default_count} 题。')
        return default_count

    question_count = int(user_input)
    if question_count < 1:
        print(f'题数不能小于 1，默认使用 {default_count} 题。')
        return default_count
    if question_count > total_available:
        print(f'题库里只有 {total_available} 题，本次将使用全部题目。')
        return total_available
    return question_count


def show_question(item, direction):
    if direction == 'th_to_zh':
        print(f"泰文：{item['th']}")
        return input('请输入对应的中文意思：').strip()
    print(f"中文：{item['zh']}")
    return input('请输入对应的泰文：').strip()


def run_quiz(question_items, direction):
    score = 0
    wrong_items = []
    correct_items = []

    for index, item in enumerate(question_items, start=1):
        print(f'\n第 {index} 题')
        answer = show_question(item, direction)

        if is_correct_answer(item, direction, answer):
            print('正确！')
            score += 1
            correct_items.append(item)
        else:
            print('错误！')
            print(f'正确答案是：{format_correct_answer(item, direction)}')
            wrong_items.append(item)

    total = len(question_items)
    accuracy = (score / total) * 100 if total > 0 else 0

    print('\n本轮结束！')
    print(f'得分：{score}/{total}')
    print(f'正确率：{accuracy:.0f}%')

    if wrong_items:
        print('\n错题本：')
        for item in wrong_items:
            item_type = item.get('type', 'unknown')
            print(f"[{item_type}] {item['zh']} - {item['th']}")
    else:
        print('\n太棒了，没有错题！')

    return wrong_items, correct_items


def update_wrong_book_after_quiz(wrong_items, correct_items):
    add_wrong_items(wrong_items)
    remove_correct_items(correct_items)


def start_quiz():
    data = load_data()
    words = data.get('words', [])
    phrases = data.get('phrases', [])

    if not words and not phrases:
        print('词库为空，请先导入词库。')
        return

    selected_items, mode_name = choose_mode(words, phrases)
    direction, direction_name = choose_direction()

    if not selected_items:
        print('没有找到可练习的内容。')
        return

    total_questions = choose_question_count(len(selected_items))
    question_items = choose_random_questions(selected_items, total_questions)

    print('\n欢迎来到泰文打字练习小游戏！')
    print(f'当前模式：{mode_name}')
    print(f'答题方向：{direction_name}')
    print(f'本轮共 {total_questions} 题。')

    wrong_items, correct_items = run_quiz(question_items, direction)
    update_wrong_book_after_quiz(wrong_items, correct_items)

    if wrong_items:
        retry = input('\n是否重练错题？(y/n)：').strip().lower()
        if retry == 'y':
            print('\n开始错题重练：')
            retry_wrong_items, retry_correct_items = run_quiz(wrong_items, direction)
            update_wrong_book_after_quiz(retry_wrong_items, retry_correct_items)

    print(f'\n当前持久化错题数：{get_wrong_book_count()}')
    print('游戏结束，感谢练习！')


def show_items(items):
    if not items:
        print('没有找到符合条件的词条。')
        return
    for display_index, entry in items:
        print(format_item_brief(display_index, entry['item']))


def view_word_bank():
    data = load_data()
    summary = get_item_summary(data)
    page_size = 20
    offset = 0

    print(f"\n当前题库：单词 {summary['words']} 条，短句 {summary['phrases']} 条，总计 {summary['total']} 条")

    while True:
        page = list_items(data=data, limit=page_size, offset=offset)
        if not page['items']:
            print('没有更多词条了。')
            return

        print(f'\n第 {offset // page_size + 1} 页')
        page_items = [(offset + idx, entry) for idx, entry in enumerate(page['items'], start=1)]
        show_items(page_items)

        if offset + page_size >= page['total'] and offset == 0:
            return

        action = input('\n输入 n 下一页，p 上一页，q 退出：').strip().lower()
        if action == 'n':
            if offset + page_size < page['total']:
                offset += page_size
            else:
                print('已经是最后一页。')
        elif action == 'p':
            if offset >= page_size:
                offset -= page_size
            else:
                print('已经是第一页。')
        else:
            return


def search_word_bank():
    data = load_data()
    all_items = get_all_items(data)
    keyword = input('\n请输入搜索关键词（可搜中文、泰文、课次、类型、ID）：').strip()
    results = search_items(all_items, keyword)
    print(f'\n共找到 {len(results)} 条结果')
    show_items(results)


def prompt_optional_lesson(current_value=None):
    suffix = f'，当前值 {current_value}' if current_value is not None else ''
    lesson_input = input(f'请输入课次（可留空{suffix}）：').strip()
    if not lesson_input:
        return current_value
    if lesson_input.isdigit():
        return int(lesson_input)
    print('课次输入无效，保持原值。')
    return current_value


def add_word_bank_item():
    print('\n请选择新增类型：')
    print('1. 单词')
    print('2. 短句')
    choice = input('请输入选项编号：').strip()

    item_type = 'phrase' if choice == '2' else 'word'
    th = input('请输入泰文：').strip()
    zh = input('请输入中文：').strip()

    if not th or not zh:
        print('泰文和中文不能为空，已取消新增。')
        return

    lesson = prompt_optional_lesson()
    category = input('请输入 category（可留空）：').strip()

    item = {'th': th, 'zh': zh, 'type': item_type}
    if lesson is not None:
        item['lesson'] = lesson
    if category:
        item['category'] = category
    elif item_type == 'phrase':
        item['category'] = 'phrase'

    created = create_item(item)
    print(f"新增成功，ID：{created['item']['id']}")


def choose_item_from_list():
    data = load_data()
    all_items = get_all_items(data)

    if not all_items:
        print('题库为空。')
        return None

    print('\n当前题库列表：')
    indexed_items = list(enumerate(all_items, start=1))
    show_items(indexed_items)

    raw_index = input('\n请输入编号：').strip()
    if not raw_index.isdigit():
        print('编号输入无效。')
        return None

    display_index = int(raw_index)
    if display_index < 1 or display_index > len(all_items):
        print('编号超出范围。')
        return None

    return all_items[display_index - 1]['item']


def edit_word_bank_item():
    item = choose_item_from_list()
    if not item:
        return

    print(f"\n正在编辑：{format_item_brief(1, item)}")
    print('直接回车表示保持原值。')

    type_input = input(f"类型 word/phrase（当前 {item.get('type', 'word')}）：").strip().lower()
    item_type = item.get('type', 'word') if not type_input else type_input
    if item_type not in {'word', 'phrase'}:
        print('类型输入无效，保持原值。')
        item_type = item.get('type', 'word')

    th = input(f"泰文（当前 {item['th']}）：").strip() or item['th']
    zh = input(f"中文（当前 {item['zh']}）：").strip() or item['zh']
    lesson = prompt_optional_lesson(item.get('lesson'))
    current_category = item.get('category', '')
    category = input(f'category（当前 {current_category}）：').strip() or current_category

    updates = {'type': item_type, 'th': th, 'zh': zh}
    if lesson is not None:
        updates['lesson'] = lesson
    if category:
        updates['category'] = category
    elif item_type == 'phrase':
        updates['category'] = 'phrase'

    result = update_item(item['id'], updates)
    if result and result['ok']:
        print(f"编辑成功：{format_item_brief(1, result['item'])}")
    else:
        print('没有找到要编辑的词条。')


def delete_word_bank_item():
    item = choose_item_from_list()
    if not item:
        return

    print(f'将删除：{format_item_brief(1, item)}')
    confirm = input('确认删除吗？(y/n)：').strip().lower()
    if confirm != 'y':
        print('已取消删除。')
        return

    result = delete_item_by_id(item['id'])
    if result['deleted']:
        remove_correct_items([item])
        print('删除成功。')
    else:
        print('没有找到要删除的词条。')


def manage_word_bank():
    while True:
        print('\n=== 题库管理 ===')
        print('1. 查看题库列表')
        print('2. 搜索词条')
        print('3. 手工新增')
        print('4. 编辑词条')
        print('5. 删除词条')
        print('6. 返回主菜单')

        choice = input('请输入选项编号：').strip()

        if choice == '1':
            view_word_bank()
        elif choice == '2':
            search_word_bank()
        elif choice == '3':
            add_word_bank_item()
        elif choice == '4':
            edit_word_bank_item()
        elif choice == '5':
            delete_word_bank_item()
        elif choice == '6':
            break
        else:
            print('输入无效，请重新选择。')


def main():
    setup_console_encoding()
    ensure_data_file()

    while True:
        print('\n=== 泰文打字练习 ===')
        print('1. 开始练习')
        print('2. 导入词库')
        print('3. 查看错题数')
        print('4. 题库管理')
        print('5. 退出程序')

        choice = input('请输入选项编号：').strip()

        if choice == '1':
            start_quiz()
        elif choice == '2':
            import_data_cli()
        elif choice == '3':
            print(f'当前持久化错题数：{get_wrong_book_count()}')
        elif choice == '4':
            manage_word_bank()
        elif choice == '5':
            print('已退出程序。')
            break
        else:
            print('输入无效，请重新选择。')
