var common = window.appCommon;
var i18n = common.i18n;
var initLanguagePicker = common.initLanguagePicker;
var fetchJson = common.fetchJson;
var formatDirectionLabel = common.formatDirectionLabel;
var formatModeLabel = common.formatModeLabel;
var formatDateTime = common.formatDateTime;

function renderDashboard(data) {
  var summaryCards = document.querySelector("#summaryCards");
  var cards = [
    { label: i18n.t("home.totalEntries"), value: data.summary.total },
    { label: i18n.t("home.totalWords"), value: data.summary.words },
    { label: i18n.t("home.totalPhrases"), value: data.summary.phrases },
    { label: i18n.t("home.wrongBook"), value: data.wrongBookCount },
  ];

  summaryCards.innerHTML = cards.map(function (card) {
    return (
      '<article class="summary-card">' +
        "<div>" + card.label + "</div>" +
        "<strong>" + card.value + "</strong>" +
      "</article>"
    );
  }).join("");

  var libraryStats = [
    { label: i18n.t("home.totalEntries"), value: data.summary.total },
    { label: i18n.t("home.totalWords"), value: data.summary.words },
    { label: i18n.t("home.totalPhrases"), value: data.summary.phrases },
  ];
  document.querySelector("#librarySnapshot").innerHTML = libraryStats.map(function (item) {
    return '<article class="mini-stat"><span>' + item.label + "</span><strong>" + item.value + "</strong></article>";
  }).join("");

  var practiceStats = [
    { label: i18n.t("home.totalRounds"), value: data.practiceHistory.totalRounds },
    { label: i18n.t("home.totalQuestions"), value: data.practiceHistory.totalQuestions },
    { label: i18n.t("home.averageAccuracy"), value: data.practiceHistory.averageAccuracy + "%" },
  ];
  document.querySelector("#practiceHistorySummary").innerHTML = practiceStats.map(function (item) {
    return '<article class="mini-stat"><span>' + item.label + "</span><strong>" + item.value + "</strong></article>";
  }).join("");

  var footer = document.querySelector("#homeFooterStats");
  footer.textContent = i18n.t("home.footerStats", {
    today_views: data.accessStats.todayPageViews,
    total_views: data.accessStats.totalPageViews,
    today_practice: data.accessStats.todayPracticeStarts,
    total_practice: data.accessStats.totalPracticeStarts,
  });

  var recent = data.practiceHistory.recent;
  var recentList = document.querySelector("#recentPracticeList");
  if (!recent.length) {
    recentList.innerHTML = '<div class="empty-state">' + i18n.t("home.emptyRecent") + "</div>";
    return;
  }

  recentList.innerHTML = recent.map(function (record) {
    return (
      '<article class="record-card">' +
        '<div class="record-topline">' +
          "<strong>" + formatModeLabel(record.mode) + "</strong>" +
          '<span class="item-meta">' + formatDateTime(record.completed_at) + "</span>" +
        "</div>" +
        '<div class="record-grid">' +
          "<div><span>" + i18n.t("home.recordDirection") + "</span><strong>" + formatDirectionLabel(record.direction) + "</strong></div>" +
          "<div><span>" + i18n.t("home.recordScore") + "</span><strong>" + record.score + "/" + record.total + "</strong></div>" +
          "<div><span>" + i18n.t("home.averageAccuracy") + "</span><strong>" + record.accuracy + "%</strong></div>" +
        "</div>" +
      "</article>"
    );
  }).join("");
}

async function bootstrapHome() {
  initLanguagePicker();
  var data = await fetchJson("/api/dashboard");
  renderDashboard(data);
  document.addEventListener("languagechange", function () {
    renderDashboard(data);
  });
}

bootstrapHome().catch(function (error) {
  document.querySelector("#recentPracticeList").innerHTML = '<div class="empty-state">' + error.message + "</div>";
});
