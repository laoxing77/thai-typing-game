var common = window.appCommon;
var i18n = common.i18n;
var initLanguagePicker = common.initLanguagePicker;
var fetchJson = common.fetchJson;
var postJson = common.postJson;
var formatLessonLabel = common.formatLessonLabel;
var formatDirectionLabel = common.formatDirectionLabel;
var formatModeLabel = common.formatModeLabel;

var state = {
  dashboard: null,
  practice: {
    questions: [],
    currentIndex: 0,
    direction: "zh_to_th",
    mode: "all",
    correctIds: [],
    wrongIds: [],
    score: 0,
    finished: false,
  },
};

function currentQuestion() {
  return state.practice.questions[state.practice.currentIndex] || null;
}

function setPracticeStatus(message, tone) {
  var card = document.querySelector("#feedbackCard");
  card.className = "feedback-card " + (tone || "neutral");
  card.textContent = message;
}

function renderPracticeMeta() {
  var chips = document.querySelector("#practiceMetaChips");
  var total = state.practice.questions.length;
  var current = total ? Math.min(state.practice.currentIndex + 1, total) : 0;
  chips.innerHTML = [
    '<span class="meta-chip">' + i18n.t("practice.modeChip", { mode: formatModeLabel(state.practice.mode) }) + "</span>",
    '<span class="meta-chip">' + i18n.t("practice.directionChip", { direction: formatDirectionLabel(state.practice.direction) }) + "</span>",
    '<span class="meta-chip">' + i18n.t("practice.scoreChip", { score: state.practice.score }) + "</span>",
    '<span class="meta-chip">' + i18n.t("practice.progressChip", { current: current, total: total }) + "</span>",
  ].join("");
}

function updateStatusText() {
  var total = state.practice.questions.length;
  var statusNode = document.querySelector("#practiceStatusText");
  if (!total) {
    statusNode.textContent = i18n.t("practice.ready");
  } else if (state.practice.finished) {
    statusNode.textContent = i18n.t("practice.statusFinished");
  } else {
    statusNode.textContent = i18n.t("practice.statusRunning", {
      current: state.practice.currentIndex + 1,
      total: total,
    });
  }
}

function renderQuestion() {
  var question = currentQuestion();
  var total = state.practice.questions.length;
  var progress = total ? ((state.practice.currentIndex + 1) / total) * 100 : 0;
  document.querySelector("#progressBar").style.width = progress + "%";
  renderPracticeMeta();
  updateStatusText();

  if (!question) {
    return;
  }

  document.querySelector("#practiceEmpty").classList.add("hidden");
  document.querySelector("#practiceStage").classList.remove("hidden");
  document.querySelector("#practiceResult").classList.add("hidden");
  document.querySelector("#questionTypeBadge").textContent = question.type === "phrase" ? i18n.t("common.phrase") : i18n.t("common.word");
  document.querySelector("#questionCounter").textContent = (state.practice.currentIndex + 1) + " / " + total;
  document.querySelector("#questionLabel").textContent =
    state.practice.direction === "zh_to_th" ? i18n.t("practice.questionLabelZhToTh") : i18n.t("practice.questionLabelThToZh");
  document.querySelector("#questionPrompt").textContent =
    state.practice.direction === "zh_to_th" ? question.zh : question.th;
  document.querySelector("#answerInput").value = "";
  document.querySelector("#answerInput").focus();
  setPracticeStatus(i18n.t("practice.answerHint"));
}

function renderIdleState() {
  document.querySelector("#practiceStage").classList.add("hidden");
  document.querySelector("#practiceResult").classList.add("hidden");
  var empty = document.querySelector("#practiceEmpty");
  empty.classList.remove("hidden");
  empty.textContent = i18n.t("practice.emptyStage");
  renderPracticeMeta();
  updateStatusText();
}

function renderLessonOptions() {
  document.querySelector("#practiceLessonSelect").innerHTML =
    '<option value="">' + i18n.t("practice.chooseLesson") + "</option>" +
    state.dashboard.lessons.map(function (lesson) {
      return '<option value="' + lesson + '">' + formatLessonLabel(lesson) + "</option>";
    }).join("");
}

async function startPractice(event) {
  event.preventDefault();
  var startButton = document.querySelector("#startPracticeBtn");
  startButton.disabled = true;
  setPracticeStatus(i18n.t("practice.loading"));

  try {
    var mode = document.querySelector("#practiceModeSelect").value;
    var direction = document.querySelector("#practiceDirectionSelect").value;
    var lessonValue = document.querySelector("#practiceLessonSelect").value;
    var countValue = Number.parseInt(document.querySelector("#practiceCountInput").value, 10);

    if (mode === "lesson" && !lessonValue) {
      setPracticeStatus(i18n.t("practice.lessonRequired"), "warning");
      return;
    }

    var payload = {
      mode: mode,
      direction: direction,
      count: Number.isFinite(countValue) ? countValue : 5,
    };
    if (lessonValue) {
      payload.lesson = Number.parseInt(lessonValue, 10);
    }

    var result = await postJson("/api/practice/setup", payload);
    if (!result.ok || !result.questions.length) {
      setPracticeStatus(result.message || i18n.t("practice.startError"), "warning");
      return;
    }

    state.practice = {
      questions: result.questions,
      currentIndex: 0,
      direction: result.direction,
      mode: result.mode,
      correctIds: [],
      wrongIds: [],
      score: 0,
      finished: false,
    };
    renderQuestion();
  } catch (error) {
    setPracticeStatus(error.message || i18n.t("practice.startError"), "error");
  } finally {
    startButton.disabled = false;
  }
}

function finishPayload() {
  var wrongSet = {};
  var correctSet = {};
  var wrongItemIds = [];
  var correctItemIds = [];
  var i;
  for (i = 0; i < state.practice.wrongIds.length; i += 1) {
    wrongSet[state.practice.wrongIds[i]] = true;
  }
  for (i = 0; i < state.practice.correctIds.length; i += 1) {
    if (!wrongSet[state.practice.correctIds[i]]) {
      correctSet[state.practice.correctIds[i]] = true;
    }
  }
  Object.keys(wrongSet).forEach(function (key) {
    wrongItemIds.push(key);
  });
  Object.keys(correctSet).forEach(function (key) {
    correctItemIds.push(key);
  });
  var total = state.practice.questions.length;
  var accuracy = total ? Math.round((state.practice.score / total) * 100) : 0;
  return {
    wrongItemIds: wrongItemIds,
    correctItemIds: correctItemIds,
    total: total,
    score: state.practice.score,
    accuracy: accuracy,
    mode: state.practice.mode,
    direction: state.practice.direction,
  };
}

async function finishPractice() {
  if (state.practice.finished || !state.practice.questions.length) {
    return;
  }

  state.practice.finished = true;
  try {
    var result = await postJson("/api/practice/finish", finishPayload());
    var total = state.practice.questions.length;
    var accuracy = total ? Math.round((state.practice.score / total) * 100) : 0;
    document.querySelector("#practiceStage").classList.add("hidden");
    var resultPanel = document.querySelector("#practiceResult");
    resultPanel.classList.remove("hidden");
    resultPanel.innerHTML =
      '<div class="section-head"><h2>' + i18n.t("practice.finishTitle") + "</h2></div>" +
      '<div class="result-grid">' +
        '<article class="summary-card"><div>' + i18n.t("practice.finalScore") + "</div><strong>" + state.practice.score + "/" + total + "</strong></article>" +
        '<article class="summary-card"><div>' + i18n.t("practice.accuracy") + "</div><strong>" + accuracy + "%</strong></article>" +
        '<article class="summary-card"><div>' + i18n.t("home.wrongBook") + "</div><strong>" + result.wrongBookCount + "</strong></article>" +
      "</div>" +
      '<div class="result-actions"><button type="button" class="primary-btn" id="restartPracticeBtn">' + i18n.t("practice.practiceAgain") + "</button></div>";

    document.querySelector("#restartPracticeBtn").addEventListener("click", function () {
      state.practice = {
        questions: [],
        currentIndex: 0,
        direction: document.querySelector("#practiceDirectionSelect").value,
        mode: document.querySelector("#practiceModeSelect").value,
        correctIds: [],
        wrongIds: [],
        score: 0,
        finished: false,
      };
      renderIdleState();
    });
    renderPracticeMeta();
    updateStatusText();
  } catch (error) {
    state.practice.finished = false;
    setPracticeStatus(error.message || i18n.t("practice.finishError"), "error");
  }
}

async function submitAnswer(event) {
  event.preventDefault();
  var question = currentQuestion();
  if (!question || state.practice.finished) {
    return;
  }

  try {
    var answer = document.querySelector("#answerInput").value;
    var result = await postJson("/api/practice/check", {
      itemId: question.id,
      direction: state.practice.direction,
      answer: answer,
    });

    if (result.correct) {
      state.practice.score += 1;
      state.practice.correctIds.push(question.id);
      setPracticeStatus(i18n.t("practice.correct", { answer: result.correctAnswer }), "success");
    } else {
      state.practice.wrongIds.push(question.id);
      setPracticeStatus(i18n.t("practice.incorrect", { answer: result.correctAnswer }), "error");
    }

    renderPracticeMeta();
    window.setTimeout(async function () {
      state.practice.currentIndex += 1;
      if (state.practice.currentIndex >= state.practice.questions.length) {
        await finishPractice();
      } else {
        renderQuestion();
      }
    }, 650);
  } catch (error) {
    setPracticeStatus(error.message, "error");
  }
}

async function bootstrapPractice() {
  initLanguagePicker();
  state.dashboard = await fetchJson("/api/dashboard");
  renderLessonOptions();
  renderIdleState();

  document.querySelector("#practiceForm").addEventListener("submit", startPractice);
  document.querySelector("#answerForm").addEventListener("submit", submitAnswer);
  document.querySelector("#finishPracticeBtn").addEventListener("click", finishPractice);
  document.addEventListener("languagechange", function () {
    renderLessonOptions();
    if (state.practice.questions.length && !state.practice.finished) {
      renderQuestion();
    } else {
      renderIdleState();
    }
  });
}

bootstrapPractice().catch(function (error) {
  var empty = document.querySelector("#practiceEmpty");
  empty.classList.remove("hidden");
  empty.textContent = error.message;
});
