// ==================================================
// app.js — Fulfill Care Record (FINAL COMBINED)
// ==================================================

// =======================
// Global State
// =======================
window.allClients = [];
window.currentView = 'list';
window.editingClient = null;
window.viewingClient = null;
window.uploadedImageData = null;
window.medicationList = [];
window.currentStatusFilter = 'ทั้งหมด';
window.searchKeyword = '';
function renderBackButton() {
  return `
    <div class="mb-4">
      <button onclick="goBack()"
        class="inline-flex items-center gap-2
               px-4 py-2
               rounded-xl
               bg-gradient-to-r from-blue-500 to-indigo-600
               text-white font-bold
               shadow-sm
               hover:from-blue-600 hover:to-indigo-700
               active:scale-95
               transition
               no-print">
        <span class="text-lg">←</span>
        <span>กลับหน้าหลัก</span>
      </button>
    </div>
  `;
}

// =======================
// App Render
// =======================
window.renderApp = function () {
  const app = document.getElementById('app');
  if (!app) return;

  if (currentView === 'list') renderList(app);
  else if (currentView === 'form') renderForm(app);
  else if (currentView === 'detail') renderDetail(app);
};

// =======================
// Navigation Helpers
// =======================
window.goBack = () => {
  currentView = 'list';
  editingClient = null;
  renderApp();
};

window.viewClient = id => {
  viewingClient = allClients.find(c => c.id === id);
  currentView = 'detail';
  renderApp();
};

window.editClient = id => {
  editingClient = allClients.find(c => c.id === id);
  currentView = 'form';
  renderApp();
};

window.deleteClient = id => {
  if (!confirm('ยืนยันการลบข้อมูลนี้หรือไม่?')) return;
  allClients = allClients.filter(c => c.id !== id);
  DB.save();
};

// ==================================================
// View: LIST
// ==================================================

window.setStatusFilter = status => {
  currentStatusFilter = status;
  renderClientTable();
};
window.setSearch = value => {
  searchKeyword = value.toLowerCase();
  renderClientTable();
};

function renderClientTable() {
  const tbody = document.getElementById('clientTableBody');
  if (!tbody) return;

  const visibleClients = allClients.filter(c => {
    const matchStatus =
      currentStatusFilter === 'ทั้งหมด'
        ? true
        : c.client_status === currentStatusFilter;

    const matchSearch =
      !searchKeyword ||
      c.client_name.toLowerCase().includes(searchKeyword);

    return matchStatus && matchSearch;
  });

  tbody.innerHTML =
    visibleClients.length === 0
      ? `<tr>
           <td colspan="4" class="p-10 text-center text-slate-400">
             ไม่มีข้อมูล
           </td>
         </tr>`
      : visibleClients.map(c => `
          <tr class="border-t">
            <td class="p-4 font-semibold">${c.client_name}</td>

            <td class="p-4">
              ${new Date(c.contract_date).toLocaleDateString('th-TH')}
            </td>

            <td class="p-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold
                ${
                  c.client_status === 'ปกติ'
                    ? 'bg-green-100 text-green-700'
                    : c.client_status === 'ออก'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }">
                ${
                  c.client_status === 'ปกติ'
                    ? '🟢 ปกติ'
                    : c.client_status === 'ออก'
                    ? '🟡 ออก'
                    : '🔴 เสียชีวิต'
                }
              </span>
            </td>

            <td class="p-4 text-center">
  <div class="inline-flex items-center gap-3">

    <!-- ดู -->
    <button onclick="viewClient('${c.id}')"
      class="inline-flex items-center gap-2
             px-5 py-2
             rounded-xl
             text-sm font-bold
             bg-blue-500 text-white
             hover:bg-blue-600
             active:scale-95
             transition">
      👁 ดู
    </button>

    <!-- แก้ไข -->
    <button onclick="editClient('${c.id}')"
      class="inline-flex items-center gap-2
             px-5 py-2
             rounded-xl
             text-sm font-bold
             bg-amber-500 text-white
             hover:bg-amber-600
             active:scale-95
             transition">
      ✏️ แก้ไข
    </button>

    <!-- ลบ -->
    <button onclick="confirmDelete('${c.id}')"
  class="inline-flex items-center gap-2
         px-5 py-2 rounded-xl
         text-sm font-bold
         bg-red-500 text-white
         hover:bg-red-600
         active:scale-95 transition">
  🗑 ลบ
</button>


  </div>
</td>



          </tr>
        `).join('');
}

function renderList(container) {
  container.innerHTML = `
    <div class="max-w-7xl mx-auto p-6">

      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 class="text-2xl font-bold">${APP_CONFIG.name}</h1>
          <p class="text-gray-500 text-sm">${APP_CONFIG.tagline}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button id="addBtn"
            class="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold">
            + เพิ่มผู้รับบริการ
          </button>

         
  <!-- <button onclick="backupData()"
            class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold">
            📦 Backup
          </button>

          <label class="bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer">
            ♻️ Restore
            <input type="file" accept=".json" hidden
              onchange="restoreData(this.files[0]); this.value=null;">
          </label>  -->

          <button onclick="exportExcel()"
            class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold">
            📊 Excel
          </button>

         <!-- <button onclick="showAbout()"
            class="bg-slate-100 px-4 py-2 rounded-xl font-bold">
            ℹ️ About
          </button>-->
          <button onclick="logoutConfirm()"
  class="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold
         hover:bg-red-100 transition">
  🚪 ออกจากระบบ
</button>

        </div>
      </div>


      <!-- FILTER -->
      <div class="flex flex-col md:flex-row gap-3 mb-4 items-center">
        <div class="flex items-center gap-2">
          <label class="font-bold text-slate-600">สถานะ:</label>
          <select onchange="setStatusFilter(this.value)"
            class="border rounded-xl px-4 py-2 font-bold">
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="ปกติ">🟢 ปกติ</option>
            <option value="ออก">🟡 ออก</option>
            <option value="เสียชีวิต">🔴 เสียชีวิต</option>
          </select>
        </div>

        <!-- SEARCH -->
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อผู้รับบริการ..."
          value="${searchKeyword}"
          oninput="setSearch(this.value)"
          class="w-full md:max-w-sm border rounded-xl px-4 py-2
                 focus:outline-none focus:ring-2 focus:ring-blue-200">
      </div>

      <!-- TABLE -->
      <div class="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b">
            <tr>
              <th class="p-4">ชื่อ</th>
              <th class="p-4">วันทำสัญญา</th>
              <th class="p-4">สถานะ</th>
              <th class="p-4 text-center">จัดการ</th>
            </tr>
          </thead>

          <!-- 🔥 สำคัญ -->
          <tbody id="clientTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  // ปุ่มเพิ่มผู้รับบริการ
  document.getElementById('addBtn').onclick = () => {
    currentView = 'form';
    editingClient = null;
    medicationList = [];
    uploadedImageData = null;
    renderApp();
  };

  // ✅ render ตารางครั้งแรก
  renderClientTable();
}


// ==================================================
// View: FORM (โค้ดจริง)
// ==================================================
function renderForm(container) {
  const isEdit = !!editingClient;

  if (isEdit && medicationList.length === 0) {
    medicationList = JSON.parse(editingClient.medications || '[]');
  }

  container.innerHTML = `
    <div class="max-w-5xl mx-auto p-6">
     ${renderBackButton()}
    


      <div class="bg-white rounded-3xl shadow-xl p-8 border">
        <h2 class="text-2xl font-bold mb-8">
          ${isEdit ? 'แก้ไขข้อมูลผู้รับบริการ' : 'เพิ่มผู้รับบริการ'}
        </h2>

        <form id="clientForm" class="space-y-6">

          <!-- วันทำสัญญา + ชื่อ -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="font-bold block mb-1">วันทำสัญญา *</label>
              <input id="contract_date" type="date" required
                class="w-full border rounded-xl p-3">
            </div>

            <div>
              <label class="font-bold block mb-1">ชื่อ-นามสกุลผู้รับบริการ *</label>
              <input id="client_name" type="text" required
                class="w-full border rounded-xl p-3"
                placeholder="ชื่อ และ นามสกุล">
            </div>
          </div>

          <!-- รูปภาพ -->
          <div>
            <label class="font-bold block mb-2">รูปภาพผู้รับบริการ</label>
            <input id="client_image" type="file" accept="image/*"
              class="w-full text-sm">
            <div id="imagePreview" class="mt-3 hidden">
              <img id="imgTag" class="w-32 h-32 object-cover rounded-xl border">
            </div>
          </div>

          <!-- ราคา -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="font-bold block mb-1">ราคาค่าบริการ (บาท)</label>
              <input id="service_fee" type="number"
                class="w-full border rounded-xl p-3">
            </div>

            <div>
              <label class="font-bold block mb-1">เงินประกัน (บาท)</label>
              <input id="deposit" type="number"
                class="w-full border rounded-xl p-3">
            </div>
          </div>

          <!-- โรค -->
          <div>
            <label class="font-bold block mb-1">โรคประจำตัว</label>
            <input id="chronic_disease" type="text"
              class="w-full border rounded-xl p-3">
          </div>
          <div>
  <label class="font-bold block mb-1">สถานะผู้รับบริการ</label>
  <select id="client_status"
    class="w-full border rounded-xl p-3 font-bold">
    <option value="ปกติ">🟢 ปกติ</option>
    <option value="ออก">🟡 ออก</option>
    <option value="เสียชีวิต">🔴 เสียชีวิต</option>
  </select>
</div>

<div>
  <label class="block text-sm font-bold mb-2">เบอร์โทรญาติ</label>
  <input id="relative_phone" type="tel"
    class="w-full border rounded-xl p-3"
    placeholder="เช่น 08xxxxxxxx">
</div>

          <!-- อาการ -->
          <div>
            <label class="font-bold block mb-1">ประวัติผู้รับบริการ (อาการปัจจุบัน)</label>
            <textarea id="client_history" rows="3"
              class="w-full border rounded-xl p-3"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="font-bold text-amber-700 block mb-1">อาการเปลี่ยนแปลง</label>
              <textarea id="symptom_changes" rows="3"
                class="w-full border rounded-xl p-3 bg-amber-50"></textarea>
            </div>

            <div>
              <label class="font-bold text-red-700 block mb-1">อาการเฝ้าระวัง</label>
              <textarea id="monitoring_symptoms" rows="3"
                class="w-full border rounded-xl p-3 bg-red-50"></textarea>
            </div>
          </div>

          <!-- ยา -->
          <div class="border-t pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-lg">รายการยา</h3>
              <button type="button" onclick="addMedicationRow()"
                class="bg-slate-800 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                + เพิ่มรายการยา
              </button>
            </div>

            <div id="medicationContainer" class="space-y-3"></div>
          </div>

          <!-- ปุ่ม -->
          <div class="flex justify-end gap-4 pt-8 border-t">
            <button type="button" onclick="goBack()"
              class="px-6 py-3 font-bold text-slate-500">
              ยกเลิก
            </button>
            <button type="submit"
              class="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold">
              บันทึกข้อมูล
            </button>
          </div>
          

        </form>
      </div>
    </div>
  `;

  /* ---------- Image ---------- */
  const fileInput = document.getElementById('client_image');
  fileInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      uploadedImageData = ev.target.result;
      imgTag.src = uploadedImageData;
      imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  };

  /* ---------- Edit ---------- */
  if (isEdit) {
    contract_date.value = editingClient.contract_date;
    client_name.value = editingClient.client_name;
    service_fee.value = editingClient.service_fee || '';
    deposit.value = editingClient.deposit || '';
    chronic_disease.value = editingClient.chronic_disease || '';
    client_history.value = editingClient.client_history || '';
    symptom_changes.value = editingClient.symptom_changes || '';
    monitoring_symptoms.value = editingClient.monitoring_symptoms || '';
    uploadedImageData = editingClient.client_image || null;
    relative_phone.value = editingClient.relative_phone || '';
    client_status.value = editingClient.client_status || 'ปกติ';


    if (uploadedImageData) {
      imgTag.src = uploadedImageData;
      imagePreview.classList.remove('hidden');
    }
  }

  renderMedicationRows();

  /* ---------- Submit ---------- */
  document.getElementById('clientForm').onsubmit = e => {
    e.preventDefault();

    const data = {
      id: isEdit ? editingClient.id : Date.now().toString(),
      contract_date: contract_date.value,
      client_name: client_name.value,
      relative_phone: relative_phone.value,
      client_image: uploadedImageData,
      client_status: client_status.value,
      service_fee: parseFloat(service_fee.value) || 0,
      deposit: parseFloat(deposit.value) || 0,
      chronic_disease: chronic_disease.value,
      client_history: client_history.value,
      symptom_changes: symptom_changes.value,
      monitoring_symptoms: monitoring_symptoms.value,
      medications: JSON.stringify(medicationList),
      created_at: isEdit ? editingClient.created_at : new Date().toISOString()
    };

    if (isEdit) {
      const i = allClients.findIndex(c => c.id === editingClient.id);
      allClients[i] = data;
    } else {
      allClients.unshift(data);
    }

    DB.save();
    currentView = 'list';
    renderApp();
  };
}


// ==================================================
// View: DETAIL (โค้ดจริง)
// ==================================================
function renderDetail(container) {
  const c = viewingClient;
  if (!c) return;

  const meds = JSON.parse(c.medications || '[]');

  container.innerHTML = `
    <div class="max-w-5xl mx-auto p-6 no-print">
  <div class="flex justify-between items-center mb-6">
    ${renderBackButton()}

    <div class="flex gap-3">
      <button onclick="exportClientPDF(viewingClient)"
        class="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
        📄 Export PDF
      </button>

      <button onclick="window.print()"
        class="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold">
        🖨 พิมพ์
      </button>
    </div>
  </div>


      <div class="bg-white rounded-3xl shadow-xl p-10 border">
        <!-- Header -->
        <div class="flex flex-col md:flex-row gap-8 mb-10 border-b pb-8">
          <div class="w-40 h-40 bg-slate-100 rounded-2xl overflow-hidden border">
            ${
              c.client_image
                ? `<img src="${c.client_image}" class="w-full h-full object-cover">`
                : ''
            }
          </div>
          <div class="flex-1">
            <h2 class="text-3xl font-black text-slate-800">${c.client_name}</h2>
            <p class="text-slate-500 mt-2">
              วันทำสัญญา:
              <strong>${new Date(c.contract_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</strong>
            </p>
            <div class="mt-3">
  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold
    ${
      c.client_status === 'ปกติ'
        ? 'bg-green-100 text-green-700'
        : c.client_status === 'ออก'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700'
    }">
    ${
      c.client_status === 'ปกติ'
        ? '🟢 ปกติ'
        : c.client_status === 'ออก'
        ? '🟡 ออก'
        : '🔴 เสียชีวิต'
    }
  </span>
</div>

            <div class="mt-3 flex items-center gap-3">
  <a href="tel:${c.relative_phone}"
     class="inline-flex items-center gap-2
            px-3 py-1.5 rounded-lg
            bg-blue-50 text-blue-700 font-bold
            hover:bg-blue-100 transition">
    📞 โทร
    <span class="text-sm font-medium">${c.relative_phone}</span>
  </a>
</div>
            <div class="mt-5 flex flex-wrap gap-4">
              <div class="bg-blue-50 px-4 py-2 rounded-xl border">
                <div class="text-xs text-blue-600 font-bold">ค่าบริการ</div>
                <div class="text-lg font-black text-blue-800">${(c.service_fee || 0).toLocaleString()} บาท</div>
              </div>
              <div class="bg-emerald-50 px-4 py-2 rounded-xl border">
                <div class="text-xs text-emerald-600 font-bold">เงินประกัน</div>
                <div class="text-lg font-black text-emerald-800">${(c.deposit || 0).toLocaleString()} บาท</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 class="font-bold mb-2 underline">โรคประจำตัว</h4>
            <p class="bg-slate-50 p-4 rounded-xl border">${c.chronic_disease || '-'}</p>
          </div>

          <div>
            <h4 class="font-bold mb-2">ประวัติผู้รับบริการ (อาการปัจจุบัน)</h4>
            <p class="bg-slate-50 p-4 rounded-xl border">${c.client_history || '-'}</p>
          </div>

          <div class="bg-amber-50 p-6 rounded-2xl border border-amber-200">
            <h4 class="font-bold text-amber-800 mb-2">⚠️ อาการเปลี่ยนแปลง</h4>
            <p class="text-amber-700">${c.symptom_changes || '-'}</p>
          </div>

          <div class="bg-red-50 p-6 rounded-2xl border border-red-200">
            <h4 class="font-bold text-red-800 mb-2">🚨 อาการเฝ้าระวัง</h4>
            <p class="text-red-700">${c.monitoring_symptoms || '-'}</p>
          </div>
        </div>

        <!-- Medication -->
        <div class="mt-10">
          <h4 class="font-bold text-xl mb-4 border-b pb-2">รายการยา</h4>
          <table class="w-full text-left border rounded-xl overflow-hidden">
            <thead class="bg-slate-800 text-white text-sm">
              <tr>
                <th class="p-3 w-12 text-center">ลำดับ</th>
                <th class="p-3">ชื่อยา</th>
                <th class="p-3">ขนาด</th>
                <th class="p-3 text-center">จำนวน</th>
                <th class="p-3">วิธีรับประทาน</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${
                meds.length === 0
                  ? `<tr><td colspan="5" class="p-4 text-center text-slate-400">ไม่มีรายการยา</td></tr>`
                  : meds.map((m, i) => `
                      <tr>
                        <td class="p-3 text-center font-bold text-slate-400">${i + 1}</td>
                        <td class="p-3 font-semibold">${m.name || '-'}</td>
                        <td class="p-3">${m.size || '-'}</td>
                        <td class="p-3 text-center">${m.amount || '-'}</td>
                        <td class="p-3">${m.usage || '-'}</td>
                      </tr>
                    `).join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PRINT / PDF SECTION -->
    <div class="print-section" style="padding:40px; font-family:'Sarabun',sans-serif; color:#000;">

  <!-- HEADER -->
  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px;">
    <div>
      <h1 style="font-size:26px; font-weight:700; margin-bottom:10px; border-bottom:3px double #000; display:inline-block;">
        ใบบันทึกข้อมูลและประวัติผู้รับบริการ
      </h1>

      <p style="margin:6px 0;">
  <strong>ชื่อ-นามสกุล:</strong> ${c.client_name}
</p>
<p style="margin:6px 0;">
  <strong>วันทำสัญญา:</strong>
  ${new Date(c.contract_date).toLocaleDateString('th-TH')}
</p>
<p style="margin:6px 0;">
  <strong>โรคประจำตัว:</strong> ${c.chronic_disease || '-'}
</p>
<p style="margin:6px 0;">
  <strong>📞 เบอร์โทรญาติ:</strong> ${c.relative_phone || '-'}

</p>

    </div>

    <!-- รูปผู้รับบริการ -->
    ${
      c.client_image
        ? `
          <img src="${c.client_image}"
            style="
              width:130px;
              height:160px;
              object-fit:cover;
              border:1px solid #000;
            ">
        `
        : `
          <div style="
            width:130px;
            height:160px;
            border:1px solid #000;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:12px;
          ">
            ไม่มีรูป
          </div>
        `
    }
  </div>

  <!-- SECTION : อาการ -->
  <div style="border-top:1px solid #999; padding-top:20px; margin-bottom:25px;">
    <p><strong>ประวัติผู้รับบริการ (อาการปัจจุบัน):</strong><br>
      ${c.client_history || '-'}
    </p>

    <p style="margin-top:10px;">
      <strong>อาการเปลี่ยนแปลง:</strong><br>
      ${c.symptom_changes || '-'}
    </p>

    <p style="margin-top:10px;">
      <strong>อาการเฝ้าระวัง:</strong><br>
      ${c.monitoring_symptoms || '-'}
    </p>
  </div>

  <!-- SECTION : MEDICATION -->
  <div style="margin-bottom:40px;">
    <h3 style="font-size:18px; font-weight:700; margin-bottom:10px;">
      รายการยา
    </h3>

    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f2f2f2;">
          <th style="border:1px solid #000; padding:8px; text-align:center; width:60px;">ลำดับ</th>
          <th style="border:1px solid #000; padding:8px;">ชื่อยา</th>
          <th style="border:1px solid #000; padding:8px;">ขนาด</th>
          <th style="border:1px solid #000; padding:8px; text-align:center;">จำนวน</th>
          <th style="border:1px solid #000; padding:8px;">วิธีรับประทาน</th>
        </tr>
      </thead>
      <tbody>
        ${
          meds.length === 0
            ? `
              <tr>
                <td colspan="5" style="border:1px solid #000; padding:12px; text-align:center;">
                  ไม่มีรายการยา
                </td>
              </tr>
            `
            : meds.map((m, i) => `
              <tr>
                <td style="border:1px solid #000; padding:8px; text-align:center;">${i + 1}</td>
                <td style="border:1px solid #000; padding:8px;">${m.name || '-'}</td>
                <td style="border:1px solid #000; padding:8px;">${m.size || '-'}</td>
                <td style="border:1px solid #000; padding:8px; text-align:center;">${m.amount || '-'}</td>
                <td style="border:1px solid #000; padding:8px;">${m.usage || '-'}</td>
              </tr>
            `).join('')
        }
      </tbody>
    </table>
  </div>

  <!-- SIGNATURE -->
  <div style="display:flex; justify-content:space-between; margin-top:60px;">
    <div style="width:250px; text-align:center;">
      <div style="border-top:1px solid #000; padding-top:6px;">
        ลงชื่อผู้รับบริการ / ญาติ
      </div>
    </div>

    <div style="width:250px; text-align:center;">
      <div style="border-top:1px solid #000; padding-top:6px;">
        ลงชื่อเจ้าหน้าที่
      </div>
    </div>
  </div>

</div>

  `;
}


// ==================================================
// Medication Helpers
// ==================================================
window.addMedicationRow = () => {
  medicationList.push({
  name: '',
  size: '',
  amount: '',
  usage: ''
});

  renderMedicationRows();
};

function renderMedicationRows() {
  const el = document.getElementById('medicationContainer');
  if (!el) return;

  el.innerHTML = medicationList.map((m, i) => `
    <div class="flex gap-2">
      <input class="border p-2 rounded w-1/3" placeholder="ชื่อยา"
        value="${m.name}" onchange="medicationList[${i}].name=this.value">
      <input class="border p-2 rounded w-1/4" placeholder="ขนาด"
        value="${m.size}" onchange="medicationList[${i}].size=this.value">
         <input class="border p-2 rounded w-1/5" placeholder="จำนวน"
        value="${m.amount}"onchange="medicationList[${i}].amount=this.value">
      <input class="border p-2 rounded w-1/3" placeholder="วิธีใช้"
        value="${m.usage}" onchange="medicationList[${i}].usage=this.value">
      <button onclick="removeMed(${i})" class="text-red-600 font-bold">✕</button>
    </div>
  `).join('');
}

window.removeMed = i => {
  medicationList.splice(i, 1);
  renderMedicationRows();
};

// =======================
// Delete Confirm Modal (Animated)
// =======================
window.confirmDelete = function (id) {
  const modal = document.createElement('div');
  modal.id = 'deleteModal';
  modal.className = `
    fixed inset-0 z-50 flex items-center justify-center
    bg-black/40 backdrop-blur-sm
  `;

  modal.innerHTML = `
    <div class="
      bg-white rounded-2xl shadow-xl
      w-full max-w-sm p-6
      transform scale-95 opacity-0
      animate-delete-in
    ">
      <div class="text-center">
        <div class="text-4xl mb-3">🗑</div>
        <h3 class="text-lg font-bold mb-2">
          ยืนยันการลบข้อมูล
        </h3>
        <p class="text-slate-500 mb-6">
          การลบนี้ไม่สามารถย้อนกลับได้
        </p>
      </div>

      <div class="flex gap-3">
        <button onclick="closeDeleteModal()"
          class="flex-1 px-4 py-2 rounded-xl
                 bg-slate-100 text-slate-600 font-bold
                 hover:bg-slate-200 transition">
          ยกเลิก
        </button>

        <button onclick="deleteClientConfirmed('${id}')"
          class="flex-1 px-4 py-2 rounded-xl
                 bg-red-600 text-white font-bold
                 hover:bg-red-700 transition">
          ลบข้อมูล
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
};

// ปิด popup
window.closeDeleteModal = function () {
  const modal = document.getElementById('deleteModal');
  if (modal) modal.remove();
};

// ลบจริง
window.deleteClientConfirmed = function (id) {
  allClients = allClients.filter(c => c.id !== id);
  DB.save();
  closeDeleteModal();
  renderApp();
};

// ==================================================
// About Modal
// ==================================================
window.showAbout = function () {
  alert(`${APP_CONFIG.name}\nVersion ${APP_CONFIG.version}\n${APP_CONFIG.company}`);
};

// =======================
// Init
// =======================
window.onload = () => {
  checkAuth();   // 🔐 เช็กก่อน
  DB.load();
  renderApp();
};

