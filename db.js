// db.js
window.DB = {
  load() {
    const data = localStorage.getItem('local_client_db');
    window.allClients = data ? JSON.parse(data) : [];
    window.allClients.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  },

  save() {
    localStorage.setItem(
      'local_client_db',
      JSON.stringify(window.allClients)
    );
    this.load();
    renderApp();
  }
};
