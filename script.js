/* ========= Utility ========= */
const $ = id => document.getElementById(id);
const fmt = n => new Intl.NumberFormat('id-ID').format(n || 0);
const today = () => new Date().toISOString().split('T')[0];

/* ========= Local Storage Data ========= */
let users = JSON.parse(localStorage.getItem("users")) || [
  { username: "admin", password: "admin123" }
];
let barang = JSON.parse(localStorage.getItem("barang")) || [];
let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
let keuangan = JSON.parse(localStorage.getItem("keuangan")) || [];

/* ========= Simpan Data ke LocalStorage ========= */
function save() {
  localStorage.setItem("barang", JSON.stringify(barang));
  localStorage.setItem("transaksi", JSON.stringify(transaksi));
  localStorage.setItem("keuangan", JSON.stringify(keuangan));
  localStorage.setItem("users", JSON.stringify(users));
}

/* ========= Login ========= */
function login() {
  const user = $("username").value.trim();
  const pass = $("password").value.trim();

  const found = users.find(u => u.username === user && u.password === pass);
  if (!found) {
    $("errorMsg").innerText = "❌ Username atau Password salah!";
  } else {
    window.location.href = "dashboard.html";
  }
}

/* ========= Logout ========= */
function logout() {
  window.location.href = "index.html";
}

/* ========= Navigasi Tab ========= */
function showPage(page) {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.querySelectorAll(".nav button").forEach(btn => btn.classList.remove("active"));
  $(`tab-${page}`)?.classList?.add("active");
  $(`sec-${page}`)?.style?.setProperty("display", "block");
}

/* ========= Transaksi ========= */
function loadBarang() {
  const select = $("trxBarang");
  select.innerHTML = barang.length
    ? barang.map((b, i) => `<option value="${i}">${b.nama} (Stok ${b.stok}) - Rp${fmt(b.harga)}</option>`).join("")
    : "<option disabled>Belum ada barang</option>";
}

function tambahKeranjang() {
  const idx = $("trxBarang").value;
  const qty = parseInt($("trxQty").value);
  if (!barang[idx] || qty <= 0) return alert("Barang/QTY tidak valid");
  if (barang[idx].stok < qty) return alert("Stok tidak cukup!");

  barang[idx].stok -= qty;
  keranjang.push({
    nama: barang[idx].nama,
    harga: barang[idx].harga,
    qty,
    total: barang[idx].harga * qty
  });

  save();
  renderKeranjang();
  loadBarang();
}

let keranjang = [];
function renderKeranjang() {
  const div = $("keranjang");
  if (!keranjang.length) {
    div.innerHTML = "<p>Keranjang kosong...</p>";
    $("subtotal").innerText = "Rp0";
    return;
  }
  let sub = 0;
  div.innerHTML = `
    <table>
      <tr><th>Barang</th><th>Qty</th><th>Harga</th><th>Total</th><th></th></tr>
      ${keranjang.map((k, i) => {
        sub += k.total;
        return `<tr>
          <td>${k.nama}</td>
          <td>${k.qty}</td>
          <td>Rp${fmt(k.harga)}</td>
          <td>Rp${fmt(k.total)}</td>
          <td><button onclick="hapusItem(${i})">X</button></td>
        </tr>`;
      }).join("")}
    </table>`;
  $("subtotal").innerText = "Rp" + fmt(sub);
}

function hapusItem(i) {
  barang.find(b => b.nama === keranjang[i].nama).stok += keranjang[i].qty;
  keranjang.splice(i, 1);
  save();
  renderKeranjang();
  loadBarang();
}

function simpanTransaksi() {
  if (!keranjang.length) return alert("Keranjang kosong");
  const tgl = $("trxTanggal").value || today();
  transaksi.push({
    id: Date.now(),
    tanggal: tgl,
    items: keranjang,
    total: keranjang.reduce((a, b) => a + b.total, 0)
  });
  keranjang = [];
  save();
  alert("✅ Transaksi disimpan!");
  renderKeranjang();
  tampilLaporan();
}

/* ========= Stok ========= */
function renderStok() {
  const div = $("stokList");
  if (!barang.length) {
    div.innerHTML = "<p>Stok kosong</p>";
    return;
  }
  div.innerHTML = `
    <table>
      <tr><th>Barang</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr>
      ${barang.map((b, i) => `
        <tr>
          <td>${b.nama}</td>
          <td>Rp${fmt(b.harga)}</td>
          <td>${b.stok}</td>
          <td><button onclick="hapusBarang(${i})">Hapus</button></td>
        </tr>`).join("")}
    </table>`;
}

function tambahBarang() {
  const nama = $("namaBarang").value.trim();
  const harga = parseInt($("hargaJual").value);
  const stok = parseInt($("stokBarang").value);

  if (!nama || !harga) return alert("Nama dan Harga wajib diisi!");

  barang.push({ nama, harga, stok });
  save();
  $("namaBarang").value = $("hargaJual").value = $("stokBarang").value = "";
  loadBarang(); renderStok();
}

function hapusBarang(i) {
  if (confirm("Yakin hapus barang?")) {
    barang.splice(i, 1);
    save();
    loadBarang();
    renderStok();
  }
}

/* ========= Laporan ========= */
function tampilLaporan() {
  const div = $("laporanList");
  if (!transaksi.length) {
    div.innerHTML = "<p>Belum ada transaksi</p>";
    return;
  }
  let html = `
    <table>
      <tr><th>Tanggal</th><th>Total</th></tr>
      ${transaksi.map(t => `
        <tr>
          <td>${t.tanggal}</td>
          <td>Rp${fmt(t.total)}</td>
        </tr>`).join("")}
    </table>`;
  div.innerHTML = html;
}

/* ========= Keuangan ========= */
function tambahKeuangan() {
  const tgl = $("keuTanggal").value || today();
  const jenis = $("keuJenis").value;
  const ket = $("keuKet").value;
  const nominal = parseInt($("keuNominal").value);

  if (!nominal) return alert("Nominal wajib diisi");

  keuangan.push({ id: Date.now(), tgl, jenis, ket, nominal });
  save();
  $("keuKet").value = $("keuNominal").value = "";
  tampilKeuangan();
}

function tampilKeuangan() {
  const div = $("keuanganList");
  if (!keuangan.length) {
    div.innerHTML = "<p>Belum ada data keuangan</p>";
    return;
  }
  div.innerHTML = `
    <table>
      <tr><th>Tanggal</th><th>Jenis</th><th>Keterangan</th><th>Nominal</th></tr>
      ${keuangan.map(k => `
        <tr>
          <td>${k.tgl}</td>
          <td>${k.jenis}</td>
          <td>${k.ket}</td>
          <td>Rp${fmt(k.nominal)}</td>
        </tr>`).join("")}
    </table>`;
}
