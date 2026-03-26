# Thai Typing Game

Version / 版本: `v0.2.0`

## English

Thai Typing Game is a lightweight Thai typing practice app for beginners.

Current features:
- Web home page, word bank page, practice page, and import page
- Word bank browsing, filtering, editing, and deletion
- CSV template download, import preview, duplicate checking, and confirm import
- Practice rounds, scoring, wrong-book tracking, and recent history

### Local Run

```bash
python web_main.py
```

Open:
- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/word-bank`
- `http://127.0.0.1:8000/practice`
- `http://127.0.0.1:8000/word-bank/import`

### CSV Import

Download the template from:

`/api/word-bank/import-template.csv`

The import flow is:
1. Download the CSV template.
2. Fill it with Excel or WPS.
3. Upload the file on the import page.
4. Review validation results before confirming import.

The system checks:
- Required fields
- CSV column format
- Duplicate rows inside the uploaded file
- Duplicate rows against the current word bank

### Railway Trial Deployment

This project can be deployed to Railway as a trial version.

Recommended steps:
1. Push this repository to GitHub.
2. Create a Railway project from the GitHub repo.
3. Start with `python web_main.py` if Railway does not auto-detect it.
4. Add `APP_DATA_DIR=/data` if you attach a persistent volume.

Important note:
- Without persistent storage, imported data, wrong-book data, and practice history may be lost after restart or redeploy.

### Project Structure

- `web_main.py`: web entry point
- `typing_game/`: backend logic
- `web/`: frontend pages and scripts
- `words.json`: current word bank data

## 中文

Thai Typing Game 是一个面向初学者的轻量级泰语打字练习应用。

当前功能：
- 已有网页首页、词库页、练习页、导入页
- 支持词库浏览、筛选、编辑、删除
- 支持 CSV 模板下载、导入预检、去重检查、确认导入
- 支持练习答题、计分、错题本、最近练习记录

### 本地运行

```bash
python web_main.py
```

打开：
- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/word-bank`
- `http://127.0.0.1:8000/practice`
- `http://127.0.0.1:8000/word-bank/import`

### 词库导入

CSV 模板下载地址：

`/api/word-bank/import-template.csv`

导入流程：
1. 下载 CSV 模板。
2. 用 Excel 或 WPS 按模板填写内容。
3. 在导入页上传文件。
4. 先查看预检结果，再确认导入。

系统会自动检查：
- 必填字段是否完整
- CSV 列名和格式是否正确
- 上传文件内部是否有重复词条
- 与现有词库相比是否重复

### Railway 试用版部署

这个项目现在可以先按“试用版”方式部署到 Railway。

建议步骤：
1. 把仓库推送到 GitHub。
2. 在 Railway 中从 GitHub 仓库创建项目。
3. 如果 Railway 没自动识别启动命令，就填写 `python web_main.py`。
4. 如果你挂载了持久卷，建议设置环境变量 `APP_DATA_DIR=/data`。

注意：
- 如果没有持久存储，导入后的词库数据、错题本和练习记录在重启或重新部署后可能会丢失。

### 项目结构

- `web_main.py`：网页启动入口
- `typing_game/`：后端逻辑
- `web/`：前端页面和脚本
- `words.json`：当前词库数据
