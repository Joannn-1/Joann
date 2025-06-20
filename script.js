// Fungsi untuk menyimpan data absensi ke LocalStorage
function saveAttendanceToLocalStorage(employeeId, attendanceTime, status) {
  // Ambil data absensi yang sudah ada dari LocalStorage atau buat array kosong jika belum ada
  let attendanceLogs = JSON.parse(localStorage.getItem("attendanceLogs")) || [];

  // Menambahkan absensi baru ke dalam array
  attendanceLogs.push({ employeeId, attendanceTime, status });

  // Simpan kembali data absensi ke LocalStorage
  localStorage.setItem("attendanceLogs", JSON.stringify(attendanceLogs));
}

// Fungsi untuk mengambil data absensi dari LocalStorage
function getAttendanceFromLocalStorage() {
  return JSON.parse(localStorage.getItem("attendanceLogs")) || [];
}

// Fungsi untuk memperbarui laporan absensi di tabel
function updateAttendanceReport() {
  let tbody = document.querySelector("#attendance-report tbody");
  tbody.innerHTML = ""; // Hapus data lama

  // Ambil data absensi dari LocalStorage
  let attendanceLogs = getAttendanceFromLocalStorage();

  // Menambahkan setiap data absensi ke tabel
  attendanceLogs.forEach((log) => {
    let row = document.createElement("tr");

    let cellId = document.createElement("td");
    cellId.textContent = log.employeeId;
    row.appendChild(cellId);

    let cellTime = document.createElement("td");
    cellTime.textContent = log.attendanceTime;
    row.appendChild(cellTime);

    let cellStatus = document.createElement("td");
    cellStatus.textContent = log.status;
    row.appendChild(cellStatus);

    tbody.appendChild(row);
  });
}

// Fungsi untuk membuat QR Code untuk ID Karyawan
function generateQRCode(employeeId) {
  let qrCode = new QRCode(document.getElementById("qrcode"), {
    text: employeeId, // Teks yang ingin dimasukkan ke QR Code
    width: 128, // Ukuran lebar QR Code
    height: 128, // Ukuran tinggi QR Code
    colorDark: "#000000", // Warna gelap QR Code
    colorLight: "#ffffff", // Warna latar belakang QR Code
    correctLevel: QRCode.CorrectLevel.H, // Level koreksi kesalahan (tinggi)
  });
}

// Fungsi untuk memulai scanner QR Code
function startQRCodeScanner() {
  function onScanSuccess(decodedText, decodedResult) {
    // Menampilkan ID Karyawan yang dipindai
    document.getElementById(
      "qr-result"
    ).innerText = `ID Karyawan: ${decodedText}`;

    // Ambil data absensi dan simpan ke LocalStorage
    let attendanceTime = new Date().toISOString();
    let status = "Masuk"; // Asumsikan absensi pertama adalah "Masuk"

    saveAttendanceToLocalStorage(decodedText, attendanceTime, status);

    // Perbarui laporan absensi
    updateAttendanceReport();
  }

  function onScanError(errorMessage) {
    // Handle error
  }

  // Memulai QR scanner
  const html5QrCode = new Html5Qrcode("qr-reader");
  html5QrCode
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      onScanSuccess,
      onScanError
    )
    .catch((err) => {
      console.error("QR scanner error:", err);
    });
}

// Event listener untuk form absensi
document
  .getElementById("attendance-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let employeeId = document.getElementById("employee-id").value;
    let attendanceTime = document.getElementById("attendance-time").value;

    // Validasi ID Karyawan
    if (!employeeId || !attendanceTime) {
      document.getElementById("attendance-status").textContent =
        "ID Karyawan dan Waktu Absensi wajib diisi!";
      return;
    }

    // Tentukan status absensi (Masuk atau Pulang)
    let status = "Masuk"; // Asumsikan absensi pertama adalah "Masuk"
    if (attendanceTime.includes("PM")) {
      status = "Pulang"; // Jika waktu lebih dari jam tertentu, status menjadi "Pulang"
    }

    // Simpan absensi ke LocalStorage
    saveAttendanceToLocalStorage(employeeId, attendanceTime, status);

    // Tampilkan status absensi
    document.getElementById(
      "attendance-status"
    ).textContent = `Absensi ${status} berhasil! Karyawan ID: ${employeeId}`;

    // Perbarui laporan absensi
    updateAttendanceReport();
  });

// Inisialisasi laporan saat pertama kali halaman dibuka
updateAttendanceReport();

// Menampilkan QR Code untuk ID Karyawan
generateQRCode("EMP001"); // Misalnya ID Karyawan adalah "EMP001"

// Menjalankan scanner QR Code
startQRCodeScanner();
