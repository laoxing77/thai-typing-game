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
    { label: i18n.t("home.wrongBook"), value: data.wrongBookCount },
    { label: i18n.t("home.totalPageViews"), value: data.accessStats.totalPageViews },
    { label: i18n.t("home.todayPageViews"), value: data.accessStats.todayPageViews },
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

  var accessStats = [
    { label: i18n.t("home.todayUniqueVisitors"), value: data.accessStats.todayUniqueVisitors },
    { label: i18n.t("home.totalPracticeStarts"), value: data.accessStats.totalPracticeStarts },
    { label: i18n.t("home.totalPracticeFinishes"), value: data.accessStats.totalPracticeFinishes },
  ];
  document.querySelector("#accessStatsSummary").innerHTML = accessStats.map(function (item) {
    return '<article class="mini-stat"><span>' + item.label + "</span><strong>" + item.value + "</strong></article>";
  }).join("");

  var trendList = document.querySelector("#trafficTrendList");
  trendList.innerHTML = data.accessStats.recentDays.map(function (day) {
    return (
      '<article class="record-card traffic-card">' +
        '<div class="record-topline">' +
          '<strong>' + day.label + '</strong>' +
          '<span class="item-meta">' + day.date + '</span>' +
        '</div>' +
        '<div class="record-grid">' +
          '<div><span>' + i18n.t("home.pageViews") + '</span><strong>' + day.pageViews + '</strong></div>' +
          '<div><span>' + i18n.t("home.practiceStarts") + '</span><strong>' + day.practiceStarts + '</strong></div>' +
        '</div>' +
      '</article>'
    );
  }).join("");

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
