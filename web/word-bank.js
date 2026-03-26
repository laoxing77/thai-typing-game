var common = window.appCommon;
var i18n = common.i18n;
var initLanguagePicker = common.initLanguagePicker;
var fetchJson = common.fetchJson;
var postJson = common.postJson;
var formatLessonLabel = common.formatLessonLabel;

var state = {
  limit: 12,
  offset: 0,
  total: 0,
  dashboard: null,
  editingId: "",
};

function setEditorStatus(message, tone) {
  var card = document.querySelector("#editorStatus");
  card.className = "feedback-card " + (tone || "neutral");
  card.textContent = message;
}

function renderLessonOptions(lessons) {
  var lessonSelect = document.querySelector("#lessonSelect");
  lessonSelect.innerHTML =
    '<option value="">' + i18n.t("wordBank.allLessons") + "</option>" +
    lessons.map(function (lesson) {
      return '<option value="' + lesson + '">' + formatLessonLabel(lesson) + "</option>";
    }).join("");
}

function updateDashboardState(dashboard) {
  state.dashboard = dashboard;
  renderLessonOptions(dashboard.lessons || []);
}

function buildQuery() {
  var params = new URLSearchParams();
  params.set("limit", state.limit);
  params.set("offset", state.offset);

  var type = document.querySelector("#typeSelect").value;
  var lesson = document.querySelector("#lessonSelect").value;
  var keyword = document.querySelector("#keywordInput").value.trim();

  if (type) {
    params.set("type", type);
  }
  if (lesson) {
    params.set("lesson", lesson);
  }
  if (keyword) {
    params.set("keyword", keyword);
  }

  return params.toString();
}

function fillEditor(item) {
  state.editingId = item.id;
  document.querySelector("#editorItemId").value = item.id;
  document.querySelector("#editorType").value = item.type || "word";
  document.querySelector("#editorTh").value = item.th || "";
  document.querySelector("#editorZh").value = item.zh || "";
  document.querySelector("#editorLesson").value = item.lesson || "";
  document.querySelector("#editorCategory").value = item.category || "";
  setEditorStatus(i18n.t("wordBank.editorEditing"), "neutral");
}

function resetEditor() {
  state.editingId = "";
  document.querySelector("#editorItemId").value = "";
  document.querySelector("#editorType").value = "word";
  document.querySelector("#editorTh").value = "";
  document.querySelector("#editorZh").value = "";
  document.querySelector("#editorLesson").value = "";
  document.querySelector("#editorCategory").value = "";
  setEditorStatus(i18n.t("wordBank.editorHint"), "neutral");
}

function buildTableRows(items) {
  return items.map(function (item) {
    var typeLabel = item.type === "phrase" ? i18n.t("common.phrase") : i18n.t("common.word");
    var lessonLabel = item.lesson ? formatLessonLabel(item.lesson) : "-";
    var category = item.category ? item.category : i18n.t("common.noCategory");
    var itemJson = encodeURIComponent(JSON.stringify(item));
    var selectedClass = item.id === state.editingId ? " is-selected" : "";

    return (
      '<tr class="word-bank-row' + selectedClass + '" data-item="' + itemJson + '">' +
        '<td class="table-id">' + item.id + '</td>' +
        '<td><span class="item-type">' + typeLabel + '</span></td>' +
        '<td>' + lessonLabel + '</td>' +
        '<td class="table-cell-main">' + item.th + '</td>' +
        '<td class="table-cell-secondary">' + item.zh + '</td>' +
        '<td>' + category + '</td>' +
        '<td>' +
          '<div class="table-actions">' +
            '<button type="button" class="ghost-btn item-edit-btn" data-item="' + itemJson + '">' + i18n.t("wordBank.edit") + '</button>' +
            '<button type="button" class="ghost-btn danger-btn item-delete-btn" data-id="' + item.id + '">' + i18n.t("wordBank.delete") + '</button>' +
          '</div>' +
        '</td>' +
      '</tr>'
    );
  }).join("");
}

function renderItems(payload) {
  state.total = payload.total;
  var list = document.querySelector("#itemsList");
  var meta = document.querySelector("#listMeta");
  var start = payload.total === 0 ? 0 : payload.offset + 1;
  var end = payload.offset + payload.items.length;

  meta.textContent = i18n.t("wordBank.showing", { start: start, end: end, total: payload.total });

  if (!payload.items.length) {
    list.innerHTML = '<div class="empty-state">' + i18n.t("wordBank.empty") + "</div>";
  } else {
    list.innerHTML =
      '<table class="word-bank-table">' +
        '<thead><tr>' +
          '<th>' + i18n.t("wordBank.tableId") + '</th>' +
          '<th>' + i18n.t("wordBank.tableType") + '</th>' +
          '<th>' + i18n.t("wordBank.tableLesson") + '</th>' +
          '<th>' + i18n.t("wordBank.tableThai") + '</th>' +
          '<th>' + i18n.t("wordBank.tableChinese") + '</th>' +
          '<th>' + i18n.t("wordBank.tableCategory") + '</th>' +
          '<th>' + i18n.t("wordBank.tableActions") + '</th>' +
        '</tr></thead>' +
        '<tbody>' + buildTableRows(payload.items) + '</tbody>' +
      '</table>';
  }

  bindItemActions();
  document.querySelector("#prevBtn").disabled = state.offset === 0;
  document.querySelector("#nextBtn").disabled = state.offset + state.limit >= state.total;
}

function findRowForNode(node) {
  var current = node;
  while (current && current.tagName !== "TR") {
    current = current.parentNode;
  }
  return current;
}

function bindItemActions() {
  Array.prototype.forEach.call(document.querySelectorAll(".word-bank-row"), function (row) {
    row.addEventListener("click", function () {
      fillEditor(JSON.parse(decodeURIComponent(row.getAttribute("data-item"))));
      Array.prototype.forEach.call(document.querySelectorAll(".word-bank-row"), function (otherRow) {
        otherRow.classList.remove("is-selected");
      });
      row.classList.add("is-selected");
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll(".item-edit-btn"), function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      fillEditor(JSON.parse(decodeURIComponent(button.getAttribute("data-item"))));
      Array.prototype.forEach.call(document.querySelectorAll(".word-bank-row"), function (row) {
        row.classList.remove("is-selected");
      });
      var row = findRowForNode(button);
      if (row) {
        row.classList.add("is-selected");
      }
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll(".item-delete-btn"), function (button) {
    button.addEventListener("click", async function (event) {
      event.stopPropagation();
      if (!window.confirm(i18n.t("wordBank.deleteConfirm"))) {
        return;
      }
      try {
        var result = await postJson("/api/word-bank/delete", { id: button.getAttribute("data-id") });
        updateDashboardState(result.dashboard);
        resetEditor();
        await loadItems();
        setEditorStatus(i18n.t("wordBank.deleteSuccess"), "success");
      } catch (error) {
        setEditorStatus(error.message, "error");
      }
    });
  });
}

function getEditorPayload() {
  return {
    id: document.querySelector("#editorItemId").value,
    type: document.querySelector("#editorType").value,
    th: document.querySelector("#editorTh").value,
    zh: document.querySelector("#editorZh").value,
    lesson: document.querySelector("#editorLesson").value,
    category: document.querySelector("#editorCategory").value,
  };
}

async function saveEditorForm(event) {
  event.preventDefault();
  var payload = getEditorPayload();
  var hasId = !!payload.id;
  var endpoint = hasId ? "/api/word-bank/update" : "/api/word-bank/create";

  try {
    var result = await postJson(endpoint, payload);
    updateDashboardState(result.dashboard);
    resetEditor();
    await loadItems();
    setEditorStatus(i18n.t(hasId ? "wordBank.saveSuccessUpdate" : "wordBank.saveSuccessCreate"), "success");
  } catch (error) {
    setEditorStatus(error.message, "error");
  }
}

async function loadItems() {
  var payload = await fetchJson("/api/items?" + buildQuery());
  renderItems(payload);
}

async function bootstrapWordBank() {
  initLanguagePicker();
  var listMeta = document.querySelector("#listMeta");
  var itemsList = document.querySelector("#itemsList");
  var lessonSelect = document.querySelector("#lessonSelect");
  var keywordInput = document.querySelector("#keywordInput");

  listMeta.textContent = i18n.t("common.loading");
  itemsList.innerHTML = '<div class="empty-state">' + i18n.t("common.loading") + "</div>";
  lessonSelect.innerHTML = '<option value="">' + i18n.t("common.loading") + "</option>";
  keywordInput.placeholder = i18n.t("wordBank.keywordPlaceholder");

  updateDashboardState(await fetchJson("/api/dashboard"));
  await loadItems();
  resetEditor();

  document.querySelector("#filtersForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    state.offset = 0;
    await loadItems();
  });

  document.querySelector("#editorForm").addEventListener("submit", saveEditorForm);
  document.querySelector("#resetEditorBtn").addEventListener("click", async function () {
    resetEditor();
    await loadItems();
  });

  document.querySelector("#prevBtn").addEventListener("click", async function () {
    state.offset = Math.max(0, state.offset - state.limit);
    await loadItems();
  });

  document.querySelector("#nextBtn").addEventListener("click", async function () {
    if (state.offset + state.limit < state.total) {
      state.offset += state.limit;
      await loadItems();
    }
  });

  document.addEventListener("languagechange", async function () {
    keywordInput.placeholder = i18n.t("wordBank.keywordPlaceholder");
    renderLessonOptions(state.dashboard && state.dashboard.lessons ? state.dashboard.lessons : []);
    if (state.editingId) {
      setEditorStatus(i18n.t("wordBank.editorEditing"), "neutral");
    } else {
      setEditorStatus(i18n.t("wordBank.editorHint"), "neutral");
    }
    await loadItems();
  });
}

bootstrapWordBank().catch(function (error) {
  document.querySelector("#listMeta").textContent = error.message;
  document.querySelector("#lessonSelect").innerHTML = '<option value="">' + error.message + "</option>";
  document.querySelector("#itemsList").innerHTML = '<div class="empty-state">' + error.message + "</div>";
  setEditorStatus(error.message, "error");
});

