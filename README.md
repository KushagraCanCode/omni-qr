# OmniQR — Universal Anything-to-QR Studio & Scanner

![OmniQR Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

**OmniQR** is an ultra-modern, high-performance web application designed to turn **every given thing** into high-resolution designer vector QR codes. Built with sleek glassmorphism, responsive live canvas rendering, audio recording capabilities, batch generation, and camera scanning.

---

## 🚀 Key Features

### 1. Turns "Every Given Thing" into a QR Code
OmniQR supports **15+ distinct content categories & protocols**:
- 🌐 **Website / URL**: Auto-detects `https://` with optional UTM Campaign Parameter Builder (`utm_source`, `utm_medium`, `utm_campaign`).
- 📝 **Plain Text / Secrets**: Multiline raw notes, Markdown snippets, passwords, and UTF-8 encoded text.
- 📶 **Wi-Fi Network**: Automatic mobile connection (`WIFI:S:...;T:WPA;P:...;H:false;;`) supporting WPA/WPA2/WPA3, WEP, Open networks, and hidden SSIDs.
- 📇 **Digital Contact Card (vCard 3.0)**: Full name, title, organization, phone, mobile, email, website, and office address that saves directly into iOS/Android contacts.
- 💳 **Instant UPI Payment**: Standard NPCI UPI payload (`upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...`) for instant scanning with Google Pay, PhonePe, Paytm, and BHIM.
- ⚡ **Crypto Wallets**: Bitcoin (`bitcoin:...`), Ethereum (`ethereum:...`), and Solana (`solana:...`) addresses with optional amounts and transfer notes.
- 💬 **WhatsApp & SMS**: One-tap chat initiation (`https://wa.me/...` and `sms:...`) with international country code and pre-filled message bodies.
- ✉️ **Email (RFC mailto)**: Destination address, Subject line, Body, and CC/BCC.
- 📞 **Phone Direct Dial**: Instant phone dialer (`tel:...`).
- 🅿️ **PayPal**: Instant PayPal.me payment link with custom amount.
- 📍 **Location & GPS**: Latitude/Longitude coordinates or searchable place names, with a **"Use My Current GPS Location"** one-click button.
- 📅 **Calendar Event (iCalendar / vEvent)**: Event title, start & end date/times, location, and description ready for Google/Apple Calendar.
- 📁 **File to QR**: Encodes lightweight documents, JSON, TXT, and icons directly into base64 Data URIs.
- 🎙️ **Voice Note to QR**: Record up to 6 seconds of voice audio through your browser microphone and encode it directly into the QR code!

---

### 2. QR Design Studio & Customization
- **Body Patterns**: Rounded dots, Crisp dots, Pill/Extra-rounded, Classy, Smooth classy-rounded, and Classic square.
- **Corner Eye Shapes**: Extra-rounded, Circular dots, and Square frames.
- **Color Modes**:
  - Curated palettes: Cyber Neon, Midnight Sapphire, Emerald Luxe, Sunset Coral, Royal Gold, Clean Monochrome, and Matrix Dark.
  - Two-tone linear & radial gradients with custom rotation angle.
  - Transparent alpha background toggle for design overlays.
- **Center Watermarks & Logos**:
  - Built-in SVG logos (Wi-Fi, WhatsApp, UPI Rupee, Bitcoin, Ethereum, Phone, Mail, Web, Star).
  - Custom logo upload (PNG/SVG) with automatic Error Correction escalation (Level H - 30%).
- **Call-to-Action Badges & Frames**:
  - Top "SCAN ME" banner.
  - Bottom "SCAN ME" banner.
  - Modern pill badge (e.g., "CONNECT TO WI-FI", "SCAN TO PAY").
  - Customizable banner text and colors.

---

### 3. Live Mockups & Multi-Format Exports
- **Live Mockup Switcher**:
  - **Flat**: Pure studio canvas.
  - **Phone**: Simulated smartphone lock screen.
  - **Stand**: Acrylic table tent / cafe stand mockup.
  - **Card**: Modern luxury business card layout.
- **High-Resolution Exports**:
  - PNG with custom resolution up to **4096px (Ultra 4K Print Ready)**.
  - Vector SVG for lossless infinite scaling.
  - JPEG format.
  - **Copy Image to Clipboard**: Directly copies the rendered PNG image into your OS clipboard.
  - **Print QR Card**: Formatted CSS print layout for physical paper output.

---

### 4. Scanner, Batch Engine & Saved Library
- **Live QR Scanner & Decoder**:
  - Webcam / mobile camera scanner powered by `html5-qrcode`.
  - Image file dropzone to decode existing QR images.
  - Smart payload analyzer (detects Wi-Fi passwords, contact cards, UPI amounts, and provides a **"Open in Studio & Re-Design"** button).
- **Batch Bulk Generator**:
  - Paste multi-line entries or CSV records (`Name, Payload`).
  - Batch generation queue with visual progress bar.
  - One-click **"Download All as ZIP"** powered by `JSZip`.
- **Saved Library / History**:
  - Persistent LocalStorage history with generated thumbnails and timestamps.

---

## 🛠️ Project Structure

```text
omni-qr/
├── index.html                   # Main application entry point
├── README.md                    # Project documentation
├── css/
│   ├── main.css                 # Design tokens, typography, glassmorphism, responsive grid
│   └── components.css           # Form controls, sliders, mockups, modals, badge styles
├── js/
│   ├── app.js                   # Application coordinator & event bindings
│   ├── qr-engine.js             # High-resolution rendering & frame composition
│   ├── generators.js            # Serializers for all 15 content types
│   ├── presets.js               # Palettes, preset SVG icons, and templates
│   ├── scanner.js               # Live camera & dropzone QR decoder
│   ├── batch.js                 # Multi-code generator & ZIP packager
│   └── history.js               # LocalStorage saved library manager
└── assets/
    └── vendor/                  # Standalone local offline vendor libraries
        ├── qr-code-styling.js
        ├── html5-qrcode.min.js
        ├── lucide.min.js
        └── jszip.min.js
```

---

## 💻 Running Locally

To run OmniQR locally:

```powershell
# Navigate to the project directory
cd C:\Users\ADMIN\.gemini\antigravity-ide\scratch\omni-qr

# Start a local static HTTP server
python -m http.server 3300

# Open in your browser:
# http://localhost:3300
```

> **Recommendation**: Set `C:\Users\ADMIN\.gemini\antigravity-ide\scratch\omni-qr` as your active workspace in Antigravity IDE for rapid editing and version control.
