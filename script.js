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
// ============================
// 1. DATA BARANG & KERANJANG
// ============================
let barangList = JSON.parse(localStorage.getItem("bsv_barang")) || [
  { nama: "Kerupuk Basah", harga: 13000, stok: 50 },
  { nama: "Es Teh", harga: 5000, stok: 20 }
];
let keranjang = [];

function saveBarang() {
  localStorage.setItem("bsv_barang", JSON.stringify(barangList));
}

// ============================
// 2. LOAD HALAMAN TRANSAKSI
// ============================
function loadTransaksi() {
  document.getElementById("content").innerHTML = `
    <h2>🛒 Transaksi Penjualan</h2>
    <label>Pilih Barang:</label>
    <select id="barangSelect"></select>
    <label>Qty:</label>
    <input type="number" id="qty" value="1" min="1">
    <button onclick="tambahKeranjang()" class="btn">Tambah</button>

    <h3>🧾 Keranjang:</h3>
    <table>
      <thead>
        <tr>
          <th>Barang</th><th>Qty</th><th>Harga</th><th>Total</th><th>Aksi</th>
        </tr>
      </thead>
      <tbody id="keranjangTable"></tbody>
    </table>
    <h3>Total: <span id="totalTransaksi">Rp0</span></h3>
    <button onclick="simpanTransaksi()" class="btn-primary">Simpan Transaksi</button>
  `;

  // Isi dropdown barang
  let select = document.getElementById("barangSelect");
  select.innerHTML = "";
  barangList.forEach((b, i) => {
    select.innerHTML += `<option value="${i}">${b.nama} - Rp${b.harga} (Stok: ${b.stok})</option>`;
  });

  renderKeranjang();
}

// ============================
// 3. TAMBAH BARANG KE KERANJANG
// ============================
function tambahKeranjang() {
  let index = document.getElementById("barangSelect").value;
  let qty = parseInt(document.getElementById("qty").value);

  if (!barangList[index] || qty <= 0) return alert("Barang/qty tidak valid");
  if (barangList[index].stok < qty) return alert("Stok tidak cukup!");

  keranjang.push({
    nama: barangList[index].nama,
    harga: barangList[index].harga,
    qty: qty,
    total: barangList[index].harga * qty
  });

  barangList[index].stok -= qty;
  saveBarang();
  renderKeranjang();
}

// ============================
// 4. RENDER KERANJANG
// ============================
function renderKeranjang() {
  let tbody = document.getElementById("keranjangTable");
  if (!tbody) return;
  tbody.innerHTML = "";

  let total = 0;
  keranjang.forEach((item, i) => {
    total += item.total;
    tbody.innerHTML += `
      <tr>
        <td>${item.nama}</td>
        <td>${item.qty}</td>
        <td>Rp${item.harga}</td>
        <td>Rp${item.total}</td>
        <td><button onclick="hapusItem(${i})" class="btn-danger">Hapus</button></td>
      </tr>
    `;
  });

  document.getElementById("totalTransaksi").innerText = "Rp" + total.toLocaleString();
}

// ============================
// 5. HAPUS ITEM DI KERANJANG
// ============================
function hapusItem(i) {
  keranjang.splice(i, 1);
  renderKeranjang();
}

// ============================
// 6. SIMPAN TRANSAKSI
// ============================
function simpanTransaksi() {
  if (keranjang.length === 0) return alert("Keranjang kosong!");

  let transaksiLama = JSON.parse(localStorage.getItem("bsv_transaksi")) || [];
  transaksiLama.push({
    tanggal: new Date().toLocaleString(),
    items: keranjang,
    total: keranjang.reduce((sum, item) => sum + item.total, 0)
  });

  localStorage.setItem("bsv_transaksi", JSON.stringify(transaksiLama));
  keranjang = [];
  renderKeranjang();
  alert("✅ Transaksi berhasil disimpan!");
}
// ============================
// 7. STOK BARANG
// ============================
function loadStok() {
  let html = `
    <h2>📦 Manajemen Stok Barang</h2>
    <button onclick="formTambahBarang()" class="btn-primary">+ Tambah Barang</button>
    <table>
      <thead>
        <tr>
          <th>Nama Barang</th>
          <th>Harga</th>
          <th>Stok</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody id="stokTable"></tbody>
    </table>
  `;
  document.getElementById("content").innerHTML = html;
  renderStok();
}

function renderStok() {
  let tbody = document.getElementById("stokTable");
  tbody.innerHTML = "";

  barangList.forEach((b, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${b.nama}</td>
        <td>Rp${b.harga.toLocaleString()}</td>
        <td>${b.stok}</td>
        <td>
          <button onclick="editBarang(${i})">✏ Edit</button>
          <button class="btn-danger" onclick="hapusBarang(${i})">🗑 Hapus</button>
        </td>
      </tr>
    `;
  });
  saveBarang();
}

function formTambahBarang() {
  document.getElementById("content").innerHTML = `
    <h2>➕ Tambah Barang Baru</h2>
    <input type="text" id="namaBarang" placeholder="Nama Barang">
    <input type="number" id="hargaBarang" placeholder="Harga (Rp)">
    <input type="number" id="stokBarang" placeholder="Stok">
    <button onclick="tambahBarangBaru()" class="btn-primary">Simpan</button>
    <button onclick="showPage('stok')" class="btn">Batal</button>
  `;
}

function tambahBarangBaru() {
  const nama = document.getElementById("namaBarang").value.trim();
  const harga = parseInt(document.getElementById("hargaBarang").value);
  const stok = parseInt(document.getElementById("stokBarang").value);

  if (!nama || isNaN(harga) || isNaN(stok)) {
    alert("Isi semua data dengan benar!");
    return;
  }

  barangList.push({ nama, harga, stok });
  saveBarang();
  alert("✅ Barang berhasil ditambahkan!");
  showPage('stok');
}

function editBarang(index) {
  const b = barangList[index];
  const nama = prompt("Nama Barang:", b.nama);
  const harga = prompt("Harga Barang:", b.harga);
  const stok = prompt("Stok Barang:", b.stok);

  if (nama !== null && harga !== null && stok !== null) {
    barangList[index] = {
      nama: nama,
      harga: parseInt(harga),
      stok: parseInt(stok)
    };
    saveBarang();
    renderStok();
    alert("✅ Barang berhasil diupdate!");
  }
}

function hapusBarang(index) {
  if (confirm("Hapus barang ini?")) {
    barangList.splice(index, 1);
    saveBarang();
    renderStok();
  }
}
