# IT Palugada Photobooth — Event Station 📸

Aplikasi Web Photobooth modern, responsif, dan estetik yang dirancang untuk kebutuhan event, wedding, festival, maupun kiosk photobooth interaktif.

Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

---

## ✨ Fitur Utama

- **🎬 Fullscreen Video Splash Screen**: Tampilan awal interaktif dengan latar video loop modern dan tombol standby kiosk.
- **📸 Kamera & Capture Otomatis**: Mendukung live preview WebRTC, mirror view, countdown 3 detik visual, serta flash shutter effect.
- **🎨 Filter Visual**: Normal, Black & White (Noir), Sepia Vintage, dan Glow effect.
- **📐 Layout & Strips Fleksibel**:
  - Photostrip 4 Pose (2 × 6")
  - Photostrip 3 Pose (2 × 6")
  - Grid 2 × 2 Postcard (4 × 6")
- **🎀 Pilihan Tema Bingkai**: Dark Minimalist, Vintage Cream, Sweet Pink, and Classic White.
- **✨ Dekorasi Stiker & Emoji**: Fitur tempel stiker emoji lucu langsung pada canvas photostrip.
- **📱 QR Code & Mobile Download**: QR Code instan di layar untuk di-scan dan diunduh langsung lewat smartphone tamu.
- **🖼️ Dashboard & Galeri Event**: Menyimpan riwayat foto sesi, lengkap dengan tanggal, ukuran file, dan tombol download resolusi tinggi.
- **⚡ Vercel & Offline Ready**: Dilengkapi dual-mode penyimpanan (Backend API lokal / LocalStorage fallback untuk hosting statis di Vercel).

---

## 🚀 Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js versi 18 atau lebih baru.

### 2. Jalankan Mode Lengkap (Frontend + Backend Server)

```bash
# Terminal 1: Jalankan Backend API & WebSocket (Port 3000 / 3443)
npm start

# Terminal 2: Jalankan Frontend Kiosk (Port 5173)
npm run dev
```

Buka browser di:
- **Frontend Kiosk**: [http://localhost:5173](http://localhost:5173) (atau HTTPS jika sertifikat lokal tersedia: [https://localhost:5173](https://localhost:5173))
- **Galeri & Backend**: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment ke Vercel

Aplikasi ini sudah dikonfigurasi dengan file `vercel.json` dan siap di-deploy langsung ke Vercel:

1. Push repository ini ke GitHub.
2. Buka dashboard [Vercel](https://vercel.com/) dan pilih **Add New Project**.
3. Import repository `photobooth`.
4. Vercel akan otomatis mendeteksi konfigurasi `vercel.json` (Framework: Vite, Build command: `npm run build --prefix frontend`, Output: `frontend/dist`).
5. Klik **Deploy**!

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, shadcn/ui components
- **Utilities**: `canvas-confetti`, `qrcode`, HTML5 Canvas Rendering
- **Backend (Opsional/Lokal)**: Node.js HTTP/HTTPS & WebSocket Server

---

© IT Palugada — All Rights Reserved.
