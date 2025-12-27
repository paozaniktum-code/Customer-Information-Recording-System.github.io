// features/export.js
// =======================
// Export PDF / Excel
// =======================

// ---------- PDF (รายคน) ----------
window.exportClientPDF = function () {
  if (!viewingClient) {
    alert('ไม่พบข้อมูลผู้รับบริการ');
    return;
  }

  const c = viewingClient;
  const meds = JSON.parse(c.medications || '[]');

  // ✅ สร้าง container ใหม่ (ไม่ใช้ print-section)
  const pdf = document.createElement('div');
  pdf.style.padding = '40px';
  pdf.style.fontFamily = 'Sarabun, sans-serif';
  pdf.style.color = '#000';
  pdf.style.background = '#fff';
  pdf.style.width = '190mm';
  pdf.style.boxSizing = 'border-box';



  pdf.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px;">
      <div>
        <h1 style="font-size:26px; font-weight:700; border-bottom:3px double #000; display:inline-block;">
          ใบบันทึกข้อมูลและประวัติผู้รับบริการ
        </h1>
        <p><strong>ชื่อ-นามสกุล:</strong> ${c.client_name}</p>
        <p><strong>วันทำสัญญา:</strong> ${new Date(c.contract_date).toLocaleDateString('th-TH')}</p>
        <p><strong>โรคประจำตัว:</strong> ${c.chronic_disease || '-'}</p>
      </div>

      ${
        c.client_image
          ? `<img src="${c.client_image}" style="width:130px;height:160px;object-fit:cover;border:1px solid #000;">`
          : `<div style="width:130px;height:160px;border:1px solid #000;display:flex;align-items:center;justify-content:center;">ไม่มีรูป</div>`
      }
    </div>

    <hr>

    <p><strong>ประวัติผู้รับบริการ:</strong><br>${c.client_history || '-'}</p>
    <p><strong>อาการเปลี่ยนแปลง:</strong><br>${c.symptom_changes || '-'}</p>
    <p><strong>อาการเฝ้าระวัง:</strong><br>${c.monitoring_symptoms || '-'}</p>

    <h3 style="margin-top:30px;">รายการยา</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#eee;">
        <th style="border:1px solid #000;padding:6px;">ลำดับ</th>
        <th style="border:1px solid #000;padding:6px;">ชื่อยา</th>
        <th style="border:1px solid #000;padding:6px;">ขนาด</th>
        <th style="border:1px solid #000;padding:6px;">จำนวน</th>
        <th style="border:1px solid #000;padding:6px;">วิธีรับประทาน</th>
      </tr>
      ${
        meds.length === 0
          ? `<tr><td colspan="5" style="border:1px solid #000;padding:10px;text-align:center;">ไม่มีรายการยา</td></tr>`
          : meds.map((m, i) => `
            <tr>
              <td style="border:1px solid #000;padding:6px;text-align:center;">${i + 1}</td>
              <td style="border:1px solid #000;padding:6px;">${m.name || '-'}</td>
              <td style="border:1px solid #000;padding:6px;">${m.size || '-'}</td>
              <td style="border:1px solid #000;padding:6px;text-align:center;">${m.amount || '-'}</td>
              <td style="border:1px solid #000;padding:6px;">${m.usage || '-'}</td>
            </tr>
          `).join('')
      }
    </table>

    <div style="display:flex; justify-content:space-between; margin-top:60px;">
      <div style="width:250px;text-align:center;border-top:1px solid #000;padding-top:6px;">
        ลงชื่อผู้รับบริการ / ญาติ
      </div>
      <div style="width:250px;text-align:center;border-top:1px solid #000;padding-top:6px;">
        ลงชื่อเจ้าหน้าที่
      </div>
    </div>
  `;

  document.body.appendChild(pdf);

  html2pdf().set({
  margin: 10, // mm
  filename: `client-${c.client_name}.pdf`,
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
})

    .from(pdf)
    .save()
    .then(() => document.body.removeChild(pdf));
};




// ---------- EXCEL (ทั้งศูนย์) ----------
window.exportExcel = function () {
  if (!allClients || allClients.length === 0) {
    alert('ไม่มีข้อมูลให้ Export');
    return;
  }

  const rows = allClients.map(c => ({
    'ชื่อ-นามสกุล': c.client_name,
    'วันทำสัญญา': new Date(c.contract_date).toLocaleDateString('th-TH'),
    'ค่าบริการ': c.service_fee,
    'เงินประกัน': c.deposit,
    'โรคประจำตัว': c.chronic_disease,
    'อาการเฝ้าระวัง': c.monitoring_symptoms ? 'มี' : 'ไม่มี'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');

  XLSX.writeFile(wb, 'fulfill-care-record.xlsx');
};
