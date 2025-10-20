// Utility Function
const formatRupiah = (n) => "Rp" + new Intl.NumberFormat('id-ID').format(n || 0);
const toDMY = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const todayISO = () => new Date().toISOString().split("T")[0];

// LocalStorage Data
let barang = JSON.parse(localStorage.getItem("bsv_barang")) || [];
let transaksi = JSON.parse(localStorage.getItem("bsv_transaksi")) || [];
let keuangan = JSON.parse(localStorage.getItem("bsv_keuangan")) || [];
let keranjang = [];

// Simpan Data
const saveBarang = () => localStorage.setItem("bsv_barang", JSON.stringify(barang));
const saveTransaksi = () => localStorage.setItem("bsv_transaksi", JSON.stringify(transaksi));
const saveKeuangan = () => localStorage.setItem("bsv_keuangan", JSON.stringify(keuangan));

// Logout
function logout() {
  window.location.href = "index.html";
}

// Navigasi Page
function showPage(page) {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`page-${page}`).style.display = "block";
  document.getElementById(`btn-${page}`).classList.add("active");

  if (page == "transaksi") renderBarang();
  if (page == "stok") renderStok();
  if (page == "laporan") showLaporan();
  if (page == "keuangan") renderKeuangan();
}

// ========== 1. TRANSAKSI ==========
function renderBarang() {
  const select = document.getElementById("transaksiBarang");
  select.innerHTML = barang.length
    ? barang.map((b, i) => `<option value="${i}">${b.nama} - ${formatRupiah(b.harga)} (Stok ${b.stok})</option>`).join("")
    : `<option>(Belum ada barang)</option>`;
}

function addToCart() {
  const idx = document.getElementById("transaksiBarang").value;
  const qty = parseInt(document.getElementById("transaksiQty").value);

  if (!barang[idx] || qty <= 0) return alert("Barang/Qty tidak valid!");
  if (barang[idx].stok < qty) return alert("Stok tidak cukup!");

  barang[idx].stok -= qty;
  keranjang.push({
    nama: barang[idx].nama,
    harga: barang[idx].harga,
    qty,
    total: barang[idx].harga * qty
  });

  saveBarang();
  renderKeranjang();
}

function renderKeranjang() {
  const tbody = document.getElementById("cartTable");
  let total = 0;
  tbody.innerHTML = keranjang.map((k, i) => {
    total += k.total;
    return `
      <tr>
        <td>${k.nama}</td>
        <td>${k.qty}</td>
        <td class="right">${formatRupiah(k.harga)}</td>
        <td class="right">${formatRupiah(k.total)}</td>
        <td><button class="btn-danger" onclick="hapusItem(${i})">x</button></td>
      </tr>
    `;
  }).join("");
  document.getElementById("cartTotal").innerText = formatRupiah(total);
}

function hapusItem(i) {
  const item = keranjang[i];
  const b = barang.find(b => b.nama === item.nama);
  if (b) b.stok += item.qty;
  keranjang.splice(i, 1);
  saveBarang();
  renderKeranjang();
}

function saveTransaction() {
  if (!keranjang.length) return alert("Keranjang kosong!");
  const iso = document.getElementById("transaksiTanggal").value || todayISO();
  const tgl = toDMY(iso);
  const jam = new Date().toLocaleTimeString("id-ID");
  const total = keranjang.reduce((a, b) => a + b.total, 0);

  transaksi.push({ tgl, jam, total });
  saveTransaksi();
  keranjang = [];
  renderKeranjang();
  alert("✅ Transaksi tersimpan!");
}

// ========== 2. STOK BARANG ==========
function renderStok() {
  const div = document.getElementById("stokTable");
  if (!barang.length) return div.innerHTML = "<p>Belum ada barang</p>";

  div.innerHTML = `
    <table class="table">
      <thead>
        <tr><th>Nama</th><th>Beli</th><th>Jual</th><th>Stok</th><th>Aksi</th></tr>
      </thead>
      <tbody>
        ${barang.map((b, i) => `
          <tr>
            <td>${b.nama}</td>
            <td>${formatRupiah(b.hbeli || 0)}</td>
            <td>${formatRupiah(b.harga)}</td>
            <td>${b.stok}</td>
            <td>
              <button onclick="editBarang(${i})">✏</button>
              <button class="btn-danger" onclick="hapusBarang(${i})">🗑</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function addBarang() {
  const nama = document.getElementById("stokNama").value;
  const hbeli = parseInt(document.getElementById("stokBeli").value);
  const harga = parseInt(document.getElementById("stokJual").value);
  const stok = parseInt(document.getElementById("stokQty").value);

  if (!nama) return alert("Nama barang wajib!");

  barang.push({ nama, hbeli: hbeli || 0, harga: harga || 0, stok: stok || 0 });
  saveBarang();
  renderStok();
}

function editBarang(i) {
  const b = barang[i];
  const nama = prompt("Nama:", b.nama);
  const hb = parseInt(prompt("Harga Beli:", b.hbeli));
  const hj = parseInt(prompt("Harga Jual:", b.harga));
  const st = parseInt(prompt("Stok:", b.stok));

  barang[i] = {
    nama: nama || b.nama,
    hbeli: isNaN(hb) ? b.hbeli : hb,
    harga: isNaN(hj) ? b.harga : hj,
    stok: isNaN(st) ? b.stok : st
  };

  saveBarang();
  renderStok();
}

function hapusBarang(i) {
  if (confirm("Yakin hapus barang?")) {
    barang.splice(i, 1);
    saveBarang();
    renderStok();
  }
}

// ========== 3. LAPORAN ==========
function showLaporan(data = transaksi) {
  const div = document.getElementById("laporanTable");
  if (!data.length) return div.innerHTML = "<p>Belum ada laporan</p>";

  let map = {};
  data.forEach(r => {
    if (!map[r.tgl]) map[r.tgl] = 0;
    map[r.tgl] += r.total;
  });

  let html = `<table class="table">
    <thead><tr><th>Tanggal</th><th>Total</th></tr></thead>
    <tbody>`;
  for (const t in map) {
    html += `<tr><td>${t}</td><td class="right">${formatRupiah(map[t])}</td></tr>`;
  }
  html += "</tbody></table>";

  div.innerHTML = html;
}

function filterLaporan() {
  const t = document.getElementById("filterTanggal").value;
  if (!t) return showLaporan();
  showLaporan(transaksi.filter(x => x.tgl === toDMY(t)));
}

// ========== 4. Pemasukan & Pengeluaran ==========
function addKeuangan() {
  const iso = document.getElementById("keuTanggal").value || todayISO();
  const tgl = toDMY(iso);
  const jenis = document.getElementById("keuJenis").value;
  const ket = document.getElementById("keuKeterangan").value;
  const nominal = parseInt(document.getElementById("keuNominal").value);

  if (!nominal) return alert("Nominal wajib diisi!");

  keuangan.push({ tgl, jenis, ket, nominal, id: Date.now() });
  saveKeuangan();
  renderKeuangan();
}

function renderKeuangan(data = keuangan) {
  const div = document.getElementById("keuanganTable");
  if (!data.length) return div.innerHTML = "<p>Belum ada data keuangan</p>";

  let pemasukan = 0, pengeluaran = 0;
  let html = `
    <table class="table">
      <thead>
        <tr><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th>Jumlah</th><th>Aksi</th></tr>
      </thead>
      <tbody>
  `;
  data.forEach(e => {
    if (e.jenis === "pemasukan") pemasukan += e.nominal;
    if (e.jenis === "pengeluaran") pengeluaran += e.nominal;
    html += `
      <tr>
        <td>${e.tgl}</td>
        <td>${e.ket}</td>
        <td>${e.jenis}</td>
        <td class="right">${formatRupiah(e.nominal)}</td>
        <td>
          <button onclick="editKeuangan(${e.id})">✏</button>
          <button class="btn-danger" onclick="hapusKeuangan(${e.id})">🗑</button>
        </td>
      </tr>`;
  });
  html += "</tbody></table>";

  div.innerHTML = html;
  document.getElementById("keuanganSummary").innerHTML =
    `Total Masuk: <b>${formatRupiah(pemasukan)}</b> • Total Keluar: <b>${formatRupiah(pengeluaran)}</b> • Saldo: <b>${formatRupiah(pemasukan - pengeluaran)}</b>`;
}

function filterKeuangan() {
  const t = document.getElementById("keuFilterTanggal").value;
  if (!t) return renderKeuangan();
  renderKeuangan(keuangan.filter(x => x.tgl === toDMY(t)));
}

function editKeuangan(id) {
  const e = keuangan.find(x => x.id === id);
  if (!e) return;

  const tgl = prompt("Tanggal dd/mm/yyyy:", e.tgl);
  const ket = prompt("Keterangan:", e.ket);
  const jenis = prompt("Jenis (pemasukan/pengeluaran):", e.jenis);
  const nominal = parseInt(prompt("Nominal:", e.nominal));

  if (tgl) e.tgl = tgl;
  if (ket) e.ket = ket;
  if (jenis) e.jenis = jenis;
  if (!isNaN(nominal)) e.nominal = nominal;

  saveKeuangan();
  renderKeuangan();
}

function hapusKeuangan(id) {
  if (confirm("Hapus data ini?")) {
    keuangan = keuangan.filter(x => x.id !== id);
    saveKeuangan();
    renderKeuangan();
  }
}
