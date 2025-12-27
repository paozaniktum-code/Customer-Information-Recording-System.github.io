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
window.DB = {
  async load() {
    const snap = await db
      .collection('clients')
      .orderBy('contract_date', 'desc')
      .get();

    allClients = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    renderApp();
  },

  async save() {
    const batch = db.batch();

    allClients.forEach(c => {
      const ref = db.collection('clients').doc(c.id);
      batch.set(ref, c);
    });

    await batch.commit();
  },

  async delete(id) {
    await db.collection('clients').doc(id).delete();
    allClients = allClients.filter(c => c.id !== id);
    renderApp();
  }
};
