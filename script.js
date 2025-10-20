// ===== LOGIN LOGIC =====
function login() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  if (user === "admin" && pass === "admin123") {
    window.location.href = "dashboard.html";
  } else {
    document.getElementById('error').innerText = "❌ Username atau password salah!";
  }
}

function logout() {
  window.location.href = "index.html";
}

// ===== PAGE NAVIGATION =====
function showPage(page) {
  document.getElementById("content").innerHTML = "<p>Loading...</p>";

  document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${page}`).classList.add('active');

  if (page === "transaksi") {
    loadTransaksi();
  } else if (page === "stok") {
    loadStok();
  } else if (page === "laporan") {
    loadLaporan();
  } else if (page === "keuangan") {
    loadKeuangan();
  }
}

// ===== HALAMAN TRANSAKSI (AKAN DIISI BERIKUTNYA) =====
function loadTransaksi() {
  document.getElementById("content").innerHTML = `
    <h2>🛒 Transaksi Penjualan</h2>
    <p>(Dalam proses... akan tampil tabel & input barang)</p>
  `;
}

// ===== HALAMAN STOK =====
function loadStok() {
  document.getElementById("content").innerHTML = `
    <h2>📦 Manajemen Stok Barang</h2>
    <p>(Akan ditampilkan tabel stok & tambah barang)</p>
  `;
}

// ===== HALAMAN LAPORAN =====
function loadLaporan() {
  document.getElementById("content").innerHTML = `
    <h2>📈 Laporan Penjualan</h2>
    <p>(Tabel laporan harian/bulanan akan muncul di sini)</p>
  `;
}

// ===== HALAMAN KEUANGAN =====
function loadKeuangan() {
  document.getElementById("content").innerHTML = `
    <h2>💸 Pemasukan & Pengeluaran</h2>
    <p>(Input keuangan + laporan saldo akan ditampilkan di sini)</p>
  `;
}
