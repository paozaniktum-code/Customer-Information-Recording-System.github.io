// =======================
// auth.js — Simple Local Auth
// =======================

// 🔐 รหัสผ่านระบบ (เปลี่ยนได้)
const SYSTEM_PASSWORD = '1234';

// key เก็บสถานะ login
const AUTH_KEY = 'fulfill_logged_in';

// =======================
// Login
// =======================
window.login = function (password) {
  if (password === SYSTEM_PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

// =======================
// Logout
// =======================
window.logout = function () {
  localStorage.removeItem(AUTH_KEY);
  location.reload();
};

// =======================
// Check login status
// =======================
window.isLoggedIn = function () {
  return localStorage.getItem(AUTH_KEY) === 'true';
};

// =======================
// Protect page
// =======================
// =======================
// Check login status (Beautiful Login)
// =======================
window.checkAuth = function () {
  if (isLoggedIn()) return;

  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center
                bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100
                px-4">

      <div class="bg-white w-full max-w-md
                  rounded-3xl shadow-2xl
                  p-8 md:p-10
                  transform transition-all duration-300
                  animate-fade-in">

        <!-- Logo / Title -->
        <div class="text-center mb-8">
          <div class="mx-auto mb-4
                      w-16 h-16
                      rounded-2xl
                      bg-gradient-to-r from-blue-500 to-indigo-600
                      flex items-center justify-center
                      text-white text-3xl font-black shadow-lg">
            F
          </div>

          <h1 class="text-2xl font-black text-slate-800">
            Fulfill Care Record
          </h1>
          <p class="text-slate-500 text-sm mt-1">
            ระบบบันทึกข้อมูลผู้รับบริการ
          </p>
        </div>

        <!-- Input -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-600 mb-1">
              รหัสผ่าน
            </label>
            <input
              id="passwordInput"
              type="password"
              placeholder="กรอกรหัสผ่านเพื่อเข้าสู่ระบบ"
              class="w-full border rounded-xl p-3
                     focus:outline-none
                     focus:ring-2 focus:ring-blue-300
                     transition"
            >
          </div>

          <button
            onclick="handleLogin()"
            class="w-full py-3 rounded-xl
                   bg-gradient-to-r from-blue-600 to-indigo-600
                   text-white font-bold
                   shadow-lg
                   hover:from-blue-700 hover:to-indigo-700
                   active:scale-95
                   transition">
            🔐 เข้าสู่ระบบ
          </button>

          <p id="loginError"
             class="hidden text-red-600 text-sm text-center mt-2">
            ❌ รหัสผ่านไม่ถูกต้อง
          </p>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center text-xs text-slate-400">
          © ${new Date().getFullYear()} Fulfill Living
        </div>
      </div>
    </div>

    <style>
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .animate-fade-in {
        animation: fade-in 0.4s ease-out;
      }
    </style>
  `;
};


// =======================
// Handle login submit
// =======================
window.handleLogin = function () {
  const pass = document.getElementById('passwordInput').value;

  if (login(pass)) {
    location.reload();
  } else {
    document.getElementById('loginError').classList.remove('hidden');
  }
};
// =======================
// Logout Confirm Modal
// =======================
// =======================
// Logout Confirm Modal (Animated)
// =======================
window.logoutConfirm = function () {
  // กันกดซ้อน
  if (document.getElementById('logoutModal')) return;

  const modal = document.createElement('div');
  modal.id = 'logoutModal';
  modal.className = `
    fixed inset-0 z-50 flex items-center justify-center
    bg-black/40 opacity-0 transition-opacity duration-200
  `;

  modal.innerHTML = `
    <div id="logoutModalBox"
      class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm
             transform scale-95 opacity-0
             transition-all duration-200 ease-out">

      <h3 class="text-lg font-bold mb-3 text-center">
        ยืนยันการออกจากระบบ
      </h3>

      <p class="text-slate-600 text-center mb-6">
        คุณต้องการออกจากระบบใช่หรือไม่?
      </p>

      <div class="flex gap-3">
        <button onclick="closeLogoutModal()"
          class="flex-1 px-4 py-2 rounded-xl
                 bg-slate-100 text-slate-600 font-bold
                 hover:bg-slate-200 transition">
          ยกเลิก
        </button>

        <button onclick="logout()"
          class="flex-1 px-4 py-2 rounded-xl
                 bg-red-600 text-white font-bold
                 hover:bg-red-700 transition">
          ออกจากระบบ
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // trigger animation (next frame)
  requestAnimationFrame(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');

    document
      .getElementById('logoutModalBox')
      .classList.remove('scale-95', 'opacity-0');

    document
      .getElementById('logoutModalBox')
      .classList.add('scale-100', 'opacity-100');
  });
};

window.closeLogoutModal = function () {
  const modal = document.getElementById('logoutModal');
  const box = document.getElementById('logoutModalBox');
  if (!modal || !box) return;

  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0');

  box.classList.remove('scale-100', 'opacity-100');
  box.classList.add('scale-95', 'opacity-0');

  setTimeout(() => {
    modal.remove();
  }, 200);
};

