function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const msg = document.getElementById('error-msg');

  if (u === "admin" && p === "admin123") {
    window.location.href = "dashboard.html"; // langsung ke dashboard
  } else {
    msg.innerText = "❌ Username atau password salah!";
  }
}
