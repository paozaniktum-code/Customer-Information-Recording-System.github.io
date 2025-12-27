// features/backup.js
// =======================
// Backup & Restore Feature
// =======================

window.backupData = function () {
  if (!window.allClients || window.allClients.length === 0) {
    alert('ไม่มีข้อมูลให้สำรอง');
    return;
  }

  const payload = {
    app: 'Fulfill Care Record',
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    total: allClients.length,
    data: allClients
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `fulfill-care-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.restoreData = function (file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = e => {
    try {
      const json = JSON.parse(e.target.result);

      if (!json.data || !Array.isArray(json.data)) {
        throw new Error('โครงสร้างไฟล์ไม่ถูกต้อง');
      }

      if (
        !confirm(
          `พบข้อมูล ${json.data.length} รายการ\nต้องการแทนที่ข้อมูลเดิมทั้งหมดหรือไม่?`
        )
      ) return;

      window.allClients = json.data;
      DB.save();

      alert('กู้คืนข้อมูลสำเร็จ');
    } catch (err) {
      alert('ไม่สามารถกู้คืนไฟล์นี้ได้');
      console.error(err);
    }
  };

  reader.readAsText(file);
};
