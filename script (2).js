// ====== PENGATURAN ======
const WA_NUMBER = "6281234567890"; // ganti dengan nomor WhatsApp Anda (awali 62)
const CATS = ["Tenda", "Carrier", "Tidur", "Masak", "Aksesori"];
const DEFAULTS = [
  {id:1, name:"Tenda Dome 2 Orang", price:850000, cat:"Tenda", img:"", icon:"⛺", desc:"Ringan 2,1 kg, flysheet anti air 3.000 mm, mudah dipasang."},
  {id:2, name:"Carrier 60L", price:620000, cat:"Carrier", img:"", icon:"🎒", desc:"Sistem punggung adjustable, rain cover bawaan, tahan sobek."},
  {id:3, name:"Sleeping Bag Polar", price:240000, cat:"Tidur", img:"", icon:"🛌", desc:"Nyaman hingga 5°C, bahan lembut, dikemas ringkas."},
  {id:4, name:"Kompor Portable", price:180000, cat:"Masak", img:"", icon:"🔥", desc:"Api stabil, hemat gas, muat di saku carrier."},
];
const ADMIN_USER = "admin";
// Hash SHA-256 dari password. Password awal: puncak2026 (WAJIB diganti, lihat README)
const ADMIN_HASH = "6323460b8305d0b946c3980785295a4c86cfeb6dc686e7b471b968ffaab6a984";
// ========================

const KEY = "puncak-gear-products";
let products = JSON.parse(localStorage.getItem(KEY) || "null") || DEFAULTS;
let filter = "Semua";
let session = JSON.parse(sessionStorage.getItem("pg-session") || "null");
let isAdmin = session?.role === "admin";
const $ = s => document.querySelector(s);
const rp = n => "Rp " + Number(n).toLocaleString("id-ID");
const esc = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const save = () => localStorage.setItem(KEY, JSON.stringify(products));

function render() {
  $("#filters").innerHTML = ["Semua", ...CATS].map(c =>
    `<button class="${c === filter ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
  const list = products.filter(p => filter === "Semua" || p.cat === filter);
  $("#grid").innerHTML = list.length ? list.map(p => {
    const bg = p.img ? `style="background-image:url('${encodeURI(p.img).replace(/'/g, "%27")}')"` : "";
    const msg = encodeURIComponent(`Halo, saya mau pesan ${p.name} (${rp(p.price)})${session ? " atas nama " + session.name : ""}`);
    return `<article class="card">
      <div class="thumb" ${bg}>${p.img ? "" : (p.icon || "🏔️")}</div>
      <div class="body"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
      <div class="price">${rp(p.price)}</div>
      <div class="row"><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${WA_NUMBER}?text=${msg}">Pesan</a>
      ${isAdmin ? `<button class="del" data-id="${p.id}" aria-label="Hapus ${esc(p.name)}">Hapus</button>` : ""}</div></div></article>`;
  }).join("") : "<p>Belum ada produk di kategori ini. Tambahkan lewat formulir di bawah.</p>";
}

$("#filters").onclick = e => { if (e.target.dataset.c) { filter = e.target.dataset.c; render(); } };
$("#grid").onclick = e => {
  const id = e.target.dataset.id;
  if (isAdmin && id && confirm("Hapus produk ini?")) { products = products.filter(p => p.id != id); save(); render(); }
};
$("select[name=cat]").innerHTML = CATS.map(c => `<option>${c}</option>`).join("");

// Kecilkan gambar agar muat di localStorage
const shrink = file => new Promise(res => {
  const r = new FileReader();
  r.onload = () => { const i = new Image(); i.onload = () => {
    const k = Math.min(1, 640 / i.width), c = document.createElement("canvas");
    c.width = i.width * k; c.height = i.height * k;
    c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
    res(c.toDataURL("image/jpeg", .75)); }; i.src = r.result; };
  r.readAsDataURL(file);
});

$("#form").onsubmit = async e => {
  e.preventDefault();
  if (!isAdmin) return;
  const f = e.target, d = new FormData(f), file = d.get("file");
  const img = file && file.size ? await shrink(file) : (d.get("url") || "");
  products.unshift({id: Date.now(), name: d.get("name"), price: +d.get("price"), cat: d.get("cat"), desc: d.get("desc"), img});
  try { save(); } catch { alert("Penyimpanan penuh. Gunakan gambar lebih kecil atau URL gambar."); products.shift(); return; }
  f.reset(); filter = "Semua"; render(); location.hash = "#produk";
};

// Parallax pegunungan saat scroll
const rs = document.querySelectorAll(".r");
addEventListener("scroll", () => {
  const y = Math.min(scrollY, 700);
  rs.forEach((r, i) => r.style.transform = `translateY(${y * (0.05 + i * 0.09)}px)`);
}, {passive: true});


// ===== Login & daftar =====
const sha256 = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))]
  .map(b => b.toString(16).padStart(2, "0")).join("");
const USERS_KEY = "pg-users";
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const salt = () => [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, "0")).join("");
const NEED_HTTPS = "Login butuh HTTPS. Buka lewat GitHub Pages atau localhost.";

function setSession(x) {
  session = x; isAdmin = x?.role === "admin";
  x ? sessionStorage.setItem("pg-session", JSON.stringify(x)) : sessionStorage.removeItem("pg-session");
}
function applyAuth() {
  document.querySelectorAll(".admin-only").forEach(el => el.hidden = !isAdmin);
  $("#who").textContent = session ? "Halo, " + session.name : "";
  $("#loginBtn").textContent = session ? "Keluar" : "Masuk / Daftar";
  render();
}
function showForm(id) {
  ["loginForm", "regForm"].forEach(f => $("#" + f).hidden = f !== id);
  $("#loginErr").textContent = $("#regErr").textContent = "";
}
$("#loginBtn").onclick = () => {
  if (session) { setSession(null); applyAuth(); location.hash = "#top"; }
  else { showForm("loginForm"); $("#loginDlg").showModal(); }
};
document.querySelectorAll("[data-close]").forEach(b => b.onclick = () => $("#loginDlg").close());
document.querySelectorAll("[data-show]").forEach(b => b.onclick = () => showForm(b.dataset.show));

let fails = 0;
$("#loginForm").onsubmit = async e => {
  e.preventDefault();
  const d = new FormData(e.target), err = $("#loginErr"), u = d.get("user").trim().toLowerCase(), p = d.get("pass");
  if (!crypto.subtle) { err.textContent = NEED_HTTPS; return; }
  if (fails >= 3) await new Promise(r => setTimeout(r, fails * 1500)); // jeda setelah salah berulang
  let ok = null;
  if (u === ADMIN_USER) { if (await sha256(p) === ADMIN_HASH) ok = {user: u, name: "Admin", role: "admin"}; }
  else {
    const x = getUsers().find(x => x.user === u);
    if (x && await sha256(x.salt + p) === x.hash) ok = {user: u, name: x.name, role: "user"};
  }
  if (!ok) { fails++; err.textContent = "Username atau password salah."; return; }
  fails = 0; setSession(ok); e.target.reset(); $("#loginDlg").close(); applyAuth();
  if (isAdmin) location.hash = "#tambah";
};

$("#regForm").onsubmit = async e => {
  e.preventDefault();
  const d = new FormData(e.target), err = $("#regErr"), u = d.get("user").trim().toLowerCase(), p = d.get("pass");
  if (!crypto.subtle) { err.textContent = NEED_HTTPS; return; }
  if (p !== d.get("pass2")) { err.textContent = "Ulangi password dengan sama persis."; return; }
  const users = getUsers();
  if (u === ADMIN_USER || users.some(x => x.user === u)) { err.textContent = "Username sudah dipakai. Pilih yang lain."; return; }
  const name = d.get("name").trim(), s = salt();
  users.push({user: u, name, salt: s, hash: await sha256(s + p)});
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  setSession({user: u, name, role: "user"}); e.target.reset(); $("#loginDlg").close(); applyAuth();
};

applyAuth();
