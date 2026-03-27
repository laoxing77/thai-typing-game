const translations = {
  en: {
    "nav.home": "Home",
    "nav.wordBank": "Word Bank",
    "nav.practice": "Practice",
    "common.language": "Language",
    "common.previous": "Previous",
    "common.next": "Next",
    "common.loading": "Loading...",
    "common.lesson": "Lesson {lesson}",
    "common.noCategory": "uncategorized",
    "common.word": "Word",
    "common.phrase": "Phrase",
    "home.eyebrow": "Thai study dashboard",
    "home.title": "Train with a clear flow, not a crowded page.",
    "home.subtitle": "Start from the overview, then move into word bank management or a focused practice session.",
    "home.startPractice": "Start Practice",
    "home.editWordBank": "Edit Word Bank",
    "home.libraryTitle": "Word Bank Snapshot",
    "home.librarySubtitle": "A quick read on the current study library.",
    "home.practiceTitle": "Practice Snapshot",
    "home.practiceSubtitle": "Recent rounds and cumulative progress.",
    "home.recentTitle": "Recent Practice",
    "home.recentSubtitle": "The latest finished rounds are shown here.",
    "home.viewPractice": "Open practice page",
    "home.totalEntries": "Total entries",
    "home.totalWords": "Words",
    "home.totalPhrases": "Phrases",
    "home.wrongBook": "Wrong book",
    "home.totalRounds": "Finished rounds",
    "home.totalQuestions": "Questions answered",
    "home.averageAccuracy": "Average accuracy",
    "home.emptyRecent": "No practice records yet. Start your first round.",
    "home.recordMode": "Mode",
    "home.recordDirection": "Direction",
    "home.recordScore": "Score",
    "home.recordTime": "Completed",
    "home.footerStats": "Visits: {today_views}/{total_views} today/total, Practice starts: {today_practice}/{total_practice} today/total",
    "wordBank.eyebrow": "Word bank workspace",
    "wordBank.title": "Browse and inspect the current Thai study library.",
    "wordBank.subtitle": "This page is only for word bank viewing and filtering, so practice stays focused elsewhere.",
    "wordBank.filtersTitle": "Filters",
    "wordBank.filtersSubtitle": "Search by type, lesson, or keyword.",
    "wordBank.type": "Type",
    "wordBank.lesson": "Lesson",
    "wordBank.keyword": "Keyword",
    "wordBank.refresh": "Refresh List",
    "wordBank.entriesTitle": "Entries",
    "wordBank.allTypes": "All",
    "wordBank.wordsOnly": "Words",
    "wordBank.phrasesOnly": "Phrases",
    "wordBank.allLessons": "All lessons",
    "wordBank.keywordPlaceholder": "Search Thai, Chinese, lesson, or ID",
    "wordBank.showing": "Showing {start}-{end} of {total}",
    "wordBank.empty": "No entries match the current filter.",
    "wordBank.editorTitle": "Edit Library",
    "wordBank.editorSubtitle": "Create, update, or remove entries here.",
    "wordBank.editorType": "Entry type",
    "wordBank.editorThai": "Thai",
    "wordBank.editorChinese": "Chinese",
    "wordBank.editorLesson": "Lesson",
    "wordBank.editorCategory": "Category",
    "wordBank.save": "Save Entry",
    "wordBank.reset": "Clear Form",
    "wordBank.editorHint": "Choose a row to edit, or create a new entry.",
    "wordBank.editorEditing": "Editing the selected entry.",
    "wordBank.saveSuccessCreate": "Entry created.",
    "wordBank.saveSuccessUpdate": "Entry updated.",
    "wordBank.deleteConfirm": "Delete this entry?",
    "wordBank.deleteSuccess": "Entry deleted.",
    "wordBank.tableId": "ID",
    "wordBank.tableType": "Type",
    "wordBank.tableLesson": "Lesson",
    "wordBank.tableThai": "Thai",
    "wordBank.tableChinese": "Chinese",
    "wordBank.tableCategory": "Category",
    "wordBank.tableActions": "Actions",
    "wordBank.edit": "Edit",
    "wordBank.delete": "Delete",
    "wordBank.importTitle": "Batch Import",
    "wordBank.importSubtitle": "Paste simple rows, preview them, then confirm the import.",
    "wordBank.importPlaceholder": "Type | Thai | Chinese | Lesson | Category",
    "wordBank.importExampleTitle": "Recommended format",
    "wordBank.importPreview": "Preview Import",
    "wordBank.importConfirm": "Confirm Import",
    "wordBank.importClear": "Clear Text",
    "wordBank.importHint": "Example: 单词 | สวัสดี | 你好 | 1 | 问候",
    "wordBank.importPreviewEmpty": "Paste some content before previewing.",
    "wordBank.importPreviewReady": "Preview ready. Review the rows below before importing.",
    "wordBank.importSuccess": "Imported {count} new entries.",
    "wordBank.importParsed": "Parsed {count}",
    "wordBank.importReady": "Ready {count}",
    "wordBank.importDuplicates": "Duplicates {count}",
    "wordBank.importErrors": "Errors {count}",
    "wordBank.importLine": "Line {line}",
    "wordBank.importStatus": "Status",
    "wordBank.importStatusReady": "Ready",
    "wordBank.importStatusDuplicate": "Duplicate",
    "wordBank.importErrorTitle": "Import errors",
    "wordBank.openImport": "Import Word Bank",
    "wordBank.importPageEyebrow": "Word bank import",
    "wordBank.importPageTitle": "Import your library from a template file.",
    "wordBank.importPageSubtitle": "Download the template, fill it in with Excel or WPS, then upload the CSV for validation before import.",
    "wordBank.importDownloadTitle": "Template download",
    "wordBank.importDownloadSubtitle": "Use the official template so the column names and order stay correct.",
    "wordBank.importDownloadTemplate": "Download CSV Template",
    "wordBank.importUploadTitle": "Upload file",
    "wordBank.importUploadSubtitle": "Choose a CSV file, then run a pre-check against your current word bank.",
    "wordBank.importChooseFile": "Choose CSV File",
    "wordBank.importSelectedFile": "Selected file: {name}",
    "wordBank.importFileEmpty": "Choose a CSV file before previewing.",
    "wordBank.importCheckTitle": "Import check",
    "wordBank.importCheckSubtitle": "The system checks format, duplicates inside the file, and duplicates against the current library.",
    "wordBank.importPreviewTableTitle": "Preview rows",
    "wordBank.importNoPreview": "Upload a CSV file and run the check to see preview rows.",
    "wordBank.importBack": "Back to Word Bank",
    "practice.eyebrow": "Practice studio",
    "practice.title": "Run one clean practice round at a time.",
    "practice.subtitle": "Pick a mode, answer each prompt, and save the result back into your study history.",
    "practice.setupTitle": "Round Setup",
    "practice.mode": "Mode",
    "practice.direction": "Direction",
    "practice.lessonFocus": "Lesson focus",
    "practice.questionCount": "Question count",
    "practice.start": "Start Practice",
    "practice.mixed": "Mixed",
    "practice.wordsOnly": "Words only",
    "practice.phrasesOnly": "Phrases only",
    "practice.byLesson": "By lesson",
    "practice.wrongBook": "Wrong book",
    "practice.zhToTh": "Chinese to Thai",
    "practice.thToZh": "Thai to Chinese",
    "practice.chooseLesson": "Choose lesson when needed",
    "practice.yourAnswer": "Your answer",
    "practice.submitAnswer": "Submit Answer",
    "practice.nextQuestion": "Next Question",
    "practice.viewResult": "View Result",
    "practice.endRound": "End Round",
    "practice.ready": "Set up a round and start practicing.",
    "practice.emptyStage": "Choose your practice settings, then start a round.",
    "practice.loading": "Starting practice...",
    "practice.lessonRequired": "Choose a lesson before starting lesson mode.",
    "practice.startError": "Unable to start this round right now.",
    "practice.answerHint": "Answer this prompt and submit to check it.",
    "practice.correct": "Correct. {answer}",
    "practice.incorrect": "Incorrect. Correct answer: {answer}",
    "practice.finishTitle": "Round Summary",
    "practice.finalScore": "Final Score",
    "practice.accuracy": "Accuracy",
    "practice.practiceAgain": "Practice Again",
    "practice.questionLabelZhToTh": "Chinese prompt",
    "practice.questionLabelThToZh": "Thai prompt",
    "practice.statusRunning": "Question {current} of {total}. Stay focused on one answer at a time.",
    "practice.statusFinished": "Round complete. Review the result summary below.",
    "practice.modeChip": "Mode {mode}",
    "practice.directionChip": "{direction}",
    "practice.scoreChip": "Score {score}",
    "practice.progressChip": "{current}/{total}",
    "practice.finishError": "Unable to save this round right now.",
  },
  zh: {
    "nav.home": "\u9996\u9875",
    "nav.wordBank": "\u8bcd\u5e93",
    "nav.practice": "\u7ec3\u4e60",
    "common.language": "\u8bed\u8a00",
    "common.previous": "\u4e0a\u4e00\u9875",
    "common.next": "\u4e0b\u4e00\u9875",
    "common.loading": "\u52a0\u8f7d\u4e2d...",
    "common.lesson": "\u7b2c {lesson} \u8bfe",
    "common.noCategory": "\u672a\u5206\u7c7b",
    "common.word": "\u5355\u8bcd",
    "common.phrase": "\u77ed\u53e5",
    "home.eyebrow": "\u6cf0\u8bed\u5b66\u4e60\u603b\u89c8",
    "home.title": "\u5148\u770b\u5168\u5c40\uff0c\u518d\u8fdb\u5165\u8bcd\u5e93\u6216\u7ec3\u4e60\u3002",
    "home.subtitle": "\u9996\u9875\u53ea\u8d1f\u8d23\u5bfc\u89c8\uff0c\u8ba9\u4f60\u6e05\u695a\u770b\u5230\u8bcd\u5e93\u89c4\u6a21\u3001\u9519\u9898\u672c\u548c\u6700\u8fd1\u7ec3\u4e60\u8bb0\u5f55\u3002",
    "home.startPractice": "\u5f00\u59cb\u7ec3\u4e60",
    "home.editWordBank": "\u7f16\u8f91\u8bcd\u5e93",
    "home.libraryTitle": "\u8bcd\u5e93\u6982\u89c8",
    "home.librarySubtitle": "\u5feb\u901f\u67e5\u770b\u5f53\u524d\u5b66\u4e60\u9898\u5e93\u7684\u4f53\u91cf\u3002",
    "home.practiceTitle": "\u7ec3\u4e60\u6982\u89c8",
    "home.practiceSubtitle": "\u67e5\u770b\u7d2f\u8ba1\u7ec3\u4e60\u60c5\u51b5\u548c\u6700\u8fd1\u8fdb\u5ea6\u3002",
    "home.recentTitle": "\u6700\u8fd1\u7ec3\u4e60\u8bb0\u5f55",
    "home.recentSubtitle": "\u8fd9\u91cc\u663e\u793a\u6700\u8fd1\u5b8c\u6210\u7684\u7ec3\u4e60\u8f6e\u6b21\u3002",
    "home.viewPractice": "\u8fdb\u5165\u7ec3\u4e60\u9875",
    "home.totalEntries": "\u603b\u8bcd\u6761",
    "home.totalWords": "\u5355\u8bcd",
    "home.totalPhrases": "\u77ed\u53e5",
    "home.wrongBook": "\u9519\u9898\u672c",
    "home.totalRounds": "\u5df2\u5b8c\u6210\u8f6e\u6b21",
    "home.totalQuestions": "\u5df2\u7b54\u9898\u6570",
    "home.averageAccuracy": "\u5e73\u5747\u6b63\u786e\u7387",
    "home.emptyRecent": "\u8fd8\u6ca1\u6709\u7ec3\u4e60\u8bb0\u5f55\uff0c\u5148\u5f00\u59cb\u7b2c\u4e00\u8f6e\u5427\u3002",
    "home.recordMode": "\u6a21\u5f0f",
    "home.recordDirection": "\u65b9\u5411",
    "home.recordScore": "\u5f97\u5206",
    "home.recordTime": "\u5b8c\u6210\u65f6\u95f4",
    "home.footerStats": "\u8bbf\u95ee\u6570\uff1a\u4eca\u65e5 {today_views} / \u603b\u6570 {total_views}\uff0c\u7ec3\u4e60\u6b21\u6570\uff1a\u4eca\u65e5 {today_practice} / \u603b\u6570 {total_practice}",
    "wordBank.eyebrow": "\u8bcd\u5e93\u5de5\u4f5c\u533a",
    "wordBank.title": "\u6d4f\u89c8\u5e76\u68c0\u67e5\u5f53\u524d\u6cf0\u8bed\u9898\u5e93\u3002",
    "wordBank.subtitle": "\u8fd9\u4e2a\u9875\u9762\u53ea\u8d1f\u8d23\u8bcd\u5e93\u67e5\u770b\u548c\u7b5b\u9009\uff0c\u7ec3\u4e60\u6d41\u7a0b\u5355\u72ec\u653e\u5230\u7ec3\u4e60\u9875\u3002",
    "wordBank.filtersTitle": "\u7b5b\u9009\u6761\u4ef6",
    "wordBank.filtersSubtitle": "\u6309\u7c7b\u578b\u3001\u8bfe\u7a0b\u548c\u5173\u952e\u8bcd\u7b5b\u9009\u8bcd\u6761\u3002",
    "wordBank.type": "\u7c7b\u578b",
    "wordBank.lesson": "\u8bfe\u7a0b",
    "wordBank.keyword": "\u5173\u952e\u8bcd",
    "wordBank.refresh": "\u66f4\u65b0\u5217\u8868",
    "wordBank.entriesTitle": "\u8bcd\u6761\u5217\u8868",
    "wordBank.allTypes": "\u5168\u90e8",
    "wordBank.wordsOnly": "\u5355\u8bcd",
    "wordBank.phrasesOnly": "\u77ed\u53e5",
    "wordBank.allLessons": "\u5168\u90e8\u8bfe\u7a0b",
    "wordBank.keywordPlaceholder": "\u641c\u7d22\u6cf0\u6587\u3001\u4e2d\u6587\u3001\u8bfe\u6b21\u6216 ID",
    "wordBank.showing": "\u5f53\u524d\u663e\u793a\u7b2c {start}-{end} \u6761\uff0c\u5171 {total} \u6761",
    "wordBank.empty": "\u5f53\u524d\u7b5b\u9009\u6761\u4ef6\u4e0b\u6ca1\u6709\u7ed3\u679c\u3002",
    "wordBank.editorTitle": "\u8bcd\u5e93\u7f16\u8f91",
    "wordBank.editorSubtitle": "\u5728\u8fd9\u91cc\u65b0\u589e\u3001\u4fee\u6539\u6216\u5220\u9664\u8bcd\u6761\u3002",
    "wordBank.editorType": "\u8bcd\u6761\u7c7b\u578b",
    "wordBank.editorThai": "\u6cf0\u6587",
    "wordBank.editorChinese": "\u4e2d\u6587",
    "wordBank.editorLesson": "\u8bfe\u6b21",
    "wordBank.editorCategory": "\u5206\u7c7b",
    "wordBank.save": "\u4fdd\u5b58\u8bcd\u6761",
    "wordBank.reset": "\u6e05\u7a7a\u8868\u5355",
    "wordBank.editorHint": "\u9009\u62e9\u4e00\u884c\u8bcd\u6761\u8fdb\u884c\u7f16\u8f91\uff0c\u6216\u76f4\u63a5\u65b0\u589e\u3002",
    "wordBank.editorEditing": "\u6b63\u5728\u7f16\u8f91\u5f53\u524d\u9009\u4e2d\u7684\u8bcd\u6761\u3002",
    "wordBank.saveSuccessCreate": "\u8bcd\u6761\u5df2\u65b0\u589e\u3002",
    "wordBank.saveSuccessUpdate": "\u8bcd\u6761\u5df2\u66f4\u65b0\u3002",
    "wordBank.deleteConfirm": "\u786e\u5b9a\u5220\u9664\u8fd9\u6761\u8bcd\u6761\u5417\uff1f",
    "wordBank.deleteSuccess": "\u8bcd\u6761\u5df2\u5220\u9664\u3002",
    "wordBank.tableId": "ID",
    "wordBank.tableType": "\u7c7b\u578b",
    "wordBank.tableLesson": "\u8bfe\u6b21",
    "wordBank.tableThai": "\u6cf0\u6587",
    "wordBank.tableChinese": "\u4e2d\u6587",
    "wordBank.tableCategory": "\u5206\u7c7b",
    "wordBank.tableActions": "\u64cd\u4f5c",
    "wordBank.edit": "\u7f16\u8f91",
    "wordBank.delete": "\u5220\u9664",
    "wordBank.importTitle": "\u6279\u91cf\u5bfc\u5165",
    "wordBank.importSubtitle": "\u76f4\u63a5\u7c98\u8d34\u7b80\u5355\u884c\u6587\u672c\uff0c\u5148\u9884\u89c8\uff0c\u518d\u786e\u8ba4\u5bfc\u5165\u3002",
    "wordBank.importPlaceholder": "\u7c7b\u578b | \u6cf0\u6587 | \u4e2d\u6587 | \u8bfe\u6b21 | \u5206\u7c7b",
    "wordBank.importExampleTitle": "\u63a8\u8350\u683c\u5f0f",
    "wordBank.importPreview": "\u9884\u89c8\u5bfc\u5165",
    "wordBank.importConfirm": "\u786e\u8ba4\u5bfc\u5165",
    "wordBank.importClear": "\u6e05\u7a7a\u5185\u5bb9",
    "wordBank.importHint": "\u793a\u4f8b\uff1a\u5355\u8bcd | สวัสดี | \u4f60\u597d | 1 | \u95ee\u5019",
    "wordBank.importPreviewEmpty": "\u8bf7\u5148\u7c98\u8d34\u8981\u5bfc\u5165\u7684\u5185\u5bb9\u3002",
    "wordBank.importPreviewReady": "\u9884\u89c8\u5df2\u751f\u6210\uff0c\u8bf7\u5148\u68c0\u67e5\u4e0b\u65b9\u884c\u5185\u5bb9\u518d\u5bfc\u5165\u3002",
    "wordBank.importSuccess": "\u5df2\u5bfc\u5165 {count} \u6761\u65b0\u8bcd\u6761\u3002",
    "wordBank.importParsed": "\u5df2\u89e3\u6790 {count}",
    "wordBank.importReady": "\u53ef\u5bfc\u5165 {count}",
    "wordBank.importDuplicates": "\u91cd\u590d {count}",
    "wordBank.importErrors": "\u9519\u8bef {count}",
    "wordBank.importLine": "\u7b2c {line} \u884c",
    "wordBank.importStatus": "\u72b6\u6001",
    "wordBank.importStatusReady": "\u53ef\u5bfc\u5165",
    "wordBank.importStatusDuplicate": "\u91cd\u590d",
    "wordBank.importErrorTitle": "\u5bfc\u5165\u9519\u8bef",
    "wordBank.openImport": "\u5bfc\u5165\u8bcd\u5e93",
    "wordBank.importPageEyebrow": "\u8bcd\u5e93\u5bfc\u5165",
    "wordBank.importPageTitle": "\u901a\u8fc7\u6a21\u677f\u6587\u4ef6\u5bfc\u5165\u4f60\u7684\u8bcd\u5e93\u3002",
    "wordBank.importPageSubtitle": "\u5148\u4e0b\u8f7d\u6a21\u677f\uff0c\u7528 Excel \u6216 WPS \u586b\u5199\uff0c\u7136\u540e\u4e0a\u4f20 CSV \u6587\u4ef6\u8fdb\u884c\u9884\u68c0\u540e\u518d\u5bfc\u5165\u3002",
    "wordBank.importDownloadTitle": "\u6a21\u677f\u4e0b\u8f7d",
    "wordBank.importDownloadSubtitle": "\u8bf7\u4f7f\u7528\u5b98\u65b9\u6a21\u677f\uff0c\u786e\u4fdd\u5217\u540d\u548c\u987a\u5e8f\u6b63\u786e\u3002",
    "wordBank.importDownloadTemplate": "\u4e0b\u8f7d CSV \u6a21\u677f",
    "wordBank.importUploadTitle": "\u4e0a\u4f20\u6587\u4ef6",
    "wordBank.importUploadSubtitle": "\u9009\u62e9 CSV \u6587\u4ef6\uff0c\u7136\u540e\u5148\u6267\u884c\u5bfc\u5165\u524d\u68c0\u67e5\u3002",
    "wordBank.importChooseFile": "\u9009\u62e9 CSV \u6587\u4ef6",
    "wordBank.importSelectedFile": "\u5df2\u9009\u62e9\u6587\u4ef6\uff1a{name}",
    "wordBank.importFileEmpty": "\u8bf7\u5148\u9009\u62e9 CSV \u6587\u4ef6\u518d\u9884\u89c8\u3002",
    "wordBank.importCheckTitle": "\u5bfc\u5165\u68c0\u67e5",
    "wordBank.importCheckSubtitle": "\u7cfb\u7edf\u4f1a\u68c0\u67e5\u683c\u5f0f\u3001\u6587\u4ef6\u5185\u90e8\u91cd\u590d\u3001\u4ee5\u53ca\u4e0e\u73b0\u6709\u8bcd\u5e93\u7684\u91cd\u590d\u3002",
    "wordBank.importPreviewTableTitle": "\u9884\u89c8\u884c",
    "wordBank.importNoPreview": "\u4e0a\u4f20 CSV \u6587\u4ef6\u5e76\u6267\u884c\u68c0\u67e5\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a\u9884\u89c8\u7ed3\u679c\u3002",
    "wordBank.importBack": "\u8fd4\u56de\u8bcd\u5e93",
    "practice.eyebrow": "\u7ec3\u4e60\u5de5\u4f5c\u53f0",
    "practice.title": "\u4e00\u8f6e\u4e00\u8f6e\u5730\u4e13\u6ce8\u7ec3\u4e60\u3002",
    "practice.subtitle": "\u9009\u62e9\u6a21\u5f0f\u540e\u5f00\u59cb\u7b54\u9898\uff0c\u6bcf\u9898\u5373\u65f6\u53cd\u9988\uff0c\u7ed3\u679c\u4f1a\u5199\u56de\u7ec3\u4e60\u8bb0\u5f55\u548c\u9519\u9898\u672c\u3002",
    "practice.setupTitle": "\u672c\u8f6e\u8bbe\u7f6e",
    "practice.mode": "\u6a21\u5f0f",
    "practice.direction": "\u65b9\u5411",
    "practice.lessonFocus": "\u8bfe\u7a0b\u805a\u7126",
    "practice.questionCount": "\u9898\u6570",
    "practice.start": "\u5f00\u59cb\u7ec3\u4e60",
    "practice.mixed": "\u6df7\u5408\u7ec3\u4e60",
    "practice.wordsOnly": "\u53ea\u7ec3\u5355\u8bcd",
    "practice.phrasesOnly": "\u53ea\u7ec3\u77ed\u53e5",
    "practice.byLesson": "\u6309\u8bfe\u7a0b",
    "practice.wrongBook": "\u9519\u9898\u672c",
    "practice.zhToTh": "\u4e2d\u6587\u5230\u6cf0\u6587",
    "practice.thToZh": "\u6cf0\u6587\u5230\u4e2d\u6587",
    "practice.chooseLesson": "\u6309\u8bfe\u7a0b\u7ec3\u4e60\u65f6\u8bf7\u9009\u62e9\u8bfe\u6b21",
    "practice.yourAnswer": "\u4f60\u7684\u7b54\u6848",
    "practice.submitAnswer": "\u63d0\u4ea4\u7b54\u6848",
    "practice.nextQuestion": "\u4e0b\u4e00\u9898",
    "practice.viewResult": "\u67e5\u770b\u7ed3\u679c",
    "practice.endRound": "\u7ed3\u675f\u672c\u8f6e",
    "practice.ready": "\u5148\u8bbe\u7f6e\u4e00\u8f6e\u7ec3\u4e60\uff0c\u7136\u540e\u5f00\u59cb\u7b54\u9898\u3002",
    "practice.emptyStage": "\u5148\u9009\u62e9\u7ec3\u4e60\u53c2\u6570\uff0c\u518d\u5f00\u59cb\u4e00\u8f6e\u7ec3\u4e60\u3002",
    "practice.loading": "\u6b63\u5728\u5f00\u59cb\u7ec3\u4e60...",
    "practice.lessonRequired": "\u6309\u8bfe\u7a0b\u7ec3\u4e60\u524d\uff0c\u8bf7\u5148\u9009\u62e9\u8bfe\u6b21\u3002",
    "practice.startError": "\u6682\u65f6\u65e0\u6cd5\u5f00\u59cb\u8fd9\u4e00\u8f6e\u7ec3\u4e60\u3002",
    "practice.answerHint": "\u8f93\u5165\u7b54\u6848\u5e76\u63d0\u4ea4\uff0c\u7cfb\u7edf\u4f1a\u7acb\u5373\u5224\u9898\u3002",
    "practice.correct": "\u56de\u7b54\u6b63\u786e\u3002\u6b63\u786e\u7b54\u6848\uff1a{answer}",
    "practice.incorrect": "\u56de\u7b54\u9519\u8bef\u3002\u6b63\u786e\u7b54\u6848\uff1a{answer}",
    "practice.finishTitle": "\u672c\u8f6e\u7ed3\u679c",
    "practice.finalScore": "\u6700\u7ec8\u5f97\u5206",
    "practice.accuracy": "\u6b63\u786e\u7387",
    "practice.practiceAgain": "\u518d\u6765\u4e00\u8f6e",
    "practice.questionLabelZhToTh": "\u4e2d\u6587\u9898\u76ee",
    "practice.questionLabelThToZh": "\u6cf0\u6587\u9898\u76ee",
    "practice.statusRunning": "\u7b2c {current} / {total} \u9898\uff0c\u4fdd\u6301\u4e13\u6ce8\uff0c\u4e00\u6b21\u7b54\u4e00\u9898\u3002",
    "practice.statusFinished": "\u672c\u8f6e\u5df2\u5b8c\u6210\uff0c\u53ef\u4ee5\u67e5\u770b\u7ed3\u679c\u6458\u8981\u3002",
    "practice.modeChip": "\u6a21\u5f0f {mode}",
    "practice.directionChip": "{direction}",
    "practice.scoreChip": "\u5f97\u5206 {score}",
    "practice.progressChip": "{current}/{total}",
    "practice.finishError": "\u6682\u65f6\u65e0\u6cd5\u4fdd\u5b58\u8fd9\u4e00\u8f6e\u7ed3\u679c\u3002",
  },
};

const LANGUAGE_STORAGE_KEY = "thaiTypingLanguage_v2";

function formatMessage(template, values) {
  var safeValues = values || {};
  return String(template).replace(/\{(\w+)\}/g, function (_, key) {
    return Object.prototype.hasOwnProperty.call(safeValues, key) ? safeValues[key] : "";
  });
}

var i18n = {
  language: "zh",
  t: function (key, values) {
    var dictionary = translations[this.language] || translations.en;
    var template = dictionary[key] || translations.en[key] || key;
    return formatMessage(template, values);
  },
  setLanguage: function (language) {
    this.language = translations[language] ? language : "zh";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, this.language);
    document.documentElement.lang = this.language === "zh" ? "zh-CN" : "en";
    applyTranslations();
    document.dispatchEvent(new CustomEvent("languagechange", { detail: { language: this.language } }));
  },
};

function applyTranslations(root) {
  var scope = root || document;
  Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n]"), function (node) {
    node.textContent = i18n.t(node.dataset.i18n);
  });
  Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n-placeholder]"), function (node) {
    node.placeholder = i18n.t(node.dataset.i18nPlaceholder);
  });
}

function initLanguagePicker() {
  var initial = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "zh";
  i18n.language = translations[initial] ? initial : "zh";
  document.documentElement.lang = i18n.language === "zh" ? "zh-CN" : "en";
  var select = document.querySelector("#languageSelect");
  if (select) {
    select.value = i18n.language;
    select.addEventListener("change", function (event) {
      i18n.setLanguage(event.target.value);
    });
  }
  applyTranslations();
}

async function fetchJson(url) {
  var response = await fetch(url);
  if (!response.ok) {
    throw new Error("Request failed: " + response.status);
  }
  return response.json();
}

async function postJson(url, body) {
  var response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  var data;
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.message || ("Request failed: " + response.status));
  }
  return data;
}

function formatLessonLabel(lesson) {
  return i18n.language === "zh" ? i18n.t("common.lesson", { lesson: lesson }) : "Lesson " + lesson;
}

function formatDirectionLabel(direction) {
  return direction === "th_to_zh" ? i18n.t("practice.thToZh") : i18n.t("practice.zhToTh");
}

function formatModeLabel(mode) {
  var map = {
    all: "practice.mixed",
    word: "practice.wordsOnly",
    phrase: "practice.phrasesOnly",
    lesson: "practice.byLesson",
    wrong: "practice.wrongBook",
  };
  return i18n.t(map[mode] || "practice.mixed");
}

function formatDateTime(isoText) {
  var date = new Date(isoText);
  return new Intl.DateTimeFormat(i18n.language === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

window.appCommon = {
  i18n: i18n,
  initLanguagePicker: initLanguagePicker,
  fetchJson: fetchJson,
  postJson: postJson,
  formatLessonLabel: formatLessonLabel,
  formatDirectionLabel: formatDirectionLabel,
  formatModeLabel: formatModeLabel,
  formatDateTime: formatDateTime,
};








