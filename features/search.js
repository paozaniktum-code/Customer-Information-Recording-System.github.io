// features/search.js
// =======================
// State สำหรับ Search & Filter
// =======================

window.searchState = {
  keyword: '',
  month: '',
  warningOnly: false
};

// =======================
// Logic กรองข้อมูล
// =======================
window.filterClients = function (clients) {
  return clients.filter(c => {
    const matchName =
      c.client_name
        .toLowerCase()
        .includes(searchState.keyword.toLowerCase());

    const matchMonth =
      !searchState.month ||
      (c.contract_date && c.contract_date.startsWith(searchState.month));

    const hasWarning =
      !searchState.warningOnly ||
      (c.monitoring_symptoms && c.monitoring_symptoms.trim() !== '');

    return matchName && matchMonth && hasWarning;
  });
};
