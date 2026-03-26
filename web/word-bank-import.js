var common = window.appCommon;
var i18n = common.i18n;
var initLanguagePicker = common.initLanguagePicker;
var postJson = common.postJson;
var formatLessonLabel = common.formatLessonLabel;

var importState = {
  file: null,
  content: "",
  preview: null,
};

function setImportStatus(message, tone) {
  var card = document.querySelector("#importStatus");
  card.className = "feedback-card " + (tone || "neutral");
  card.textContent = message;
}

function renderSelectedFile() {
  var node = document.querySelector("#selectedFileName");
  if (importState.file) {
    node.textContent = i18n.t("wordBank.importSelectedFile", { name: importState.file.name });
  } else {
    node.textContent = i18n.t("wordBank.importFileEmpty");
  }
}

function renderImportSummary(preview) {
  var summaryNode = document.querySelector("#importSummary");
  if (!preview) {
    summaryNode.innerHTML = "";
    return;
  }

  var summary = preview.summary;
  summaryNode.innerHTML =
    '<div class="import-summary-grid">' +
      '<span class="meta-chip">' + i18n.t("wordBank.importParsed", { count: summary.parsed }) + '</span>' +
      '<span class="meta-chip">' + i18n.t("wordBank.importReady", { count: summary.ready }) + '</span>' +
      '<span class="meta-chip">' + i18n.t("wordBank.importDuplicates", { count: summary.duplicates }) + '</span>' +
      '<span class="meta-chip">' + i18n.t("wordBank.importErrors", { count: summary.errors }) + '</span>' +
    '</div>';
}

function renderImportErrors(preview) {
  var errorNode = document.querySelector("#importErrors");
  if (!preview || !preview.errors.length) {
    errorNode.innerHTML = "";
    return;
  }

  errorNode.innerHTML =
    '<div class="feedback-card error">' +
      '<strong>' + i18n.t("wordBank.importErrorTitle") + '</strong>' +
      '<ul class="import-error-list">' +
      preview.errors.map(function (entry) {
        return '<li>' + i18n.t("wordBank.importLine", { line: entry.line }) + ': ' + entry.message + '</li>';
      }).join("") +
      '</ul>' +
    '</div>';
}

function renderImportTable(preview) {
  var tableNode = document.querySelector("#importPreviewTable");
  if (!preview || !preview.items.length) {
    tableNode.innerHTML = '<div class="empty-state">' + i18n.t("wordBank.importNoPreview") + '</div>';
    return;
  }

  tableNode.innerHTML =
    '<table class="word-bank-table">' +
      '<thead><tr>' +
        '<th>' + i18n.t("wordBank.importLine") + '</th>' +
        '<th>' + i18n.t("wordBank.importStatus") + '</th>' +
        '<th>' + i18n.t("wordBank.tableType") + '</th>' +
        '<th>' + i18n.t("wordBank.tableLesson") + '</th>' +
        '<th>' + i18n.t("wordBank.tableThai") + '</th>' +
        '<th>' + i18n.t("wordBank.tableChinese") + '</th>' +
        '<th>' + i18n.t("wordBank.tableCategory") + '</th>' +
      '</tr></thead>' +
      '<tbody>' +
        preview.items.map(function (entry) {
          var item = entry.item;
          var statusLabel = entry.status === "duplicate" ? i18n.t("wordBank.importStatusDuplicate") : i18n.t("wordBank.importStatusReady");
          var statusClass = entry.status === "duplicate" ? "meta-chip duplicate-chip" : "meta-chip";
          return (
            '<tr>' +
              '<td class="table-id">' + i18n.t("wordBank.importLine", { line: entry.line }) + '</td>' +
              '<td><span class="' + statusClass + '">' + statusLabel + '</span></td>' +
              '<td><span class="item-type">' + (item.type === "phrase" ? i18n.t("common.phrase") : i18n.t("common.word")) + '</span></td>' +
              '<td>' + (item.lesson ? formatLessonLabel(item.lesson) : '-') + '</td>' +
              '<td class="table-cell-main">' + item.th + '</td>' +
              '<td class="table-cell-secondary">' + item.zh + '</td>' +
              '<td>' + (item.category || i18n.t("common.noCategory")) + '</td>' +
            '</tr>'
          );
        }).join("") +
      '</tbody>' +
    '</table>';
}

function updatePreview(preview) {
  importState.preview = preview;
  renderImportSummary(preview);
  renderImportErrors(preview);
  renderImportTable(preview);
  document.querySelector("#confirmImportBtn").disabled = !preview || preview.summary.ready === 0;
}

function readSelectedFile() {
  return new Promise(function (resolve, reject) {
    if (!importState.file) {
      reject(new Error(i18n.t("wordBank.importFileEmpty")));
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      resolve(String(reader.result || ""));
    };
    reader.onerror = function () {
      reject(new Error("Failed to read the selected file."));
    };
    reader.readAsText(importState.file, "utf-8");
  });
}

async function previewImport() {
  try {
    importState.content = await readSelectedFile();
    var preview = await postJson("/api/word-bank/import-preview", { content: importState.content });
    updatePreview(preview);
    setImportStatus(i18n.t("wordBank.importPreviewReady"), "success");
  } catch (error) {
    setImportStatus(error.message, "error");
  }
}

async function confirmImport() {
  if (!importState.content) {
    setImportStatus(i18n.t("wordBank.importFileEmpty"), "warning");
    return;
  }

  try {
    var result = await postJson("/api/word-bank/import-confirm", { content: importState.content });
    var refreshedPreview = await postJson("/api/word-bank/import-preview", { content: importState.content });
    updatePreview(refreshedPreview);
    setImportStatus(i18n.t("wordBank.importSuccess", { count: result.imported }), "success");
  } catch (error) {
    setImportStatus(error.message, "error");
  }
}

function clearPreview() {
  updatePreview(null);
  renderSelectedFile();
  setImportStatus(i18n.t("wordBank.importFileEmpty"), "neutral");
}

function bootstrapImportPage() {
  initLanguagePicker();
  clearPreview();

  document.querySelector("#chooseFileBtn").addEventListener("click", function () {
    document.querySelector("#importFileInput").click();
  });

  document.querySelector("#importFileInput").addEventListener("change", function (event) {
    importState.file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    importState.content = "";
    importState.preview = null;
    clearPreview();
  });

  document.querySelector("#previewImportBtn").addEventListener("click", previewImport);
  document.querySelector("#confirmImportBtn").addEventListener("click", confirmImport);

  document.addEventListener("languagechange", function () {
    renderSelectedFile();
    if (importState.preview) {
      updatePreview(importState.preview);
      setImportStatus(i18n.t("wordBank.importPreviewReady"), "success");
    } else {
      setImportStatus(i18n.t("wordBank.importFileEmpty"), "neutral");
    }
  });
}

bootstrapImportPage();
