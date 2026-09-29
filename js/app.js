/**
 * OMNIQR — Main Application Orchestrator
 * Connects generators, design studio, live preview canvas, scanner,
 * batch engine, and history persistence.
 */

import { PALETTES, PRESET_ICONS, svgToDataUrl } from './presets.js';
import { GENERATORS } from './generators.js';
import { QREngine } from './qr-engine.js';
import { QRScanner } from './scanner.js';
import { QRHistoryManager } from './history.js';
import { BatchQRGenerator } from './batch.js';

class OmniQRApp {
  constructor() {
    this.currentType = 'url';
    this.currentMockup = 'flat';
    this.soundEnabled = true;
    this.audioContext = null;

    // Default QR styling configuration
    this.qrConfig = {
      width: 320,
      height: 320,
      data: 'https://antigravity.google',
      margin: 10,
      qrOptions: {
        errorCorrectionLevel: 'Q'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.35,
        margin: 6,
        crossOrigin: 'anonymous'
      },
      dotsOptions: {
        type: 'rounded',
        color: '#8b5cf6',
        gradient: null
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#8b5cf6'
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#8b5cf6'
      },
      image: null
    };

    this.frameConfig = {
      style: 'none',
      text: 'SCAN ME',
      color: '#8b5cf6',
      textColor: '#ffffff'
    };

    // State for audio recording
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordedAudioUrl = null;
    this.recordTimer = null;
    this.recordSeconds = 0;

    // Debounce timer for smooth typing
    this.renderDebounceTimer = null;

    // Components
    this.engine = null;
    this.scanner = null;
  }

  init() {
    // 1. Initialize Engine on DOM
    const liveCanvas = document.getElementById('qr-live-canvas');
    this.engine = new QREngine(liveCanvas, this.qrConfig);

    // 2. Setup Scanner
    this.scanner = new QRScanner('scanner-viewport', (decodedText, analysis) => {
      this.handleScanSuccess(decodedText, analysis);
    });

    // 3. Setup UI Components & Listeners
    this.setupIcons();
    this.setupTheme();
    this.setupSound();
    this.setupTypeSelector();
    this.setupStudioTabs();
    this.setupFormListeners();
    this.setupStyleControls();
    this.setupMockupViews();
    this.setupExportActions();
    this.setupAudioRecorder();
    this.setupModals();
    this.setupBatchGenerator();
    this.setupHistory();

    // 4. Initial Render
    this.updateQR();
  }

  setupIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /* Audio Haptic Feedback */
  setupSound() {
    const btn = document.getElementById('btn-sound-toggle');
    const icon = document.getElementById('sound-icon');

    btn.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      btn.classList.toggle('active', this.soundEnabled);
      icon.setAttribute('data-lucide', this.soundEnabled ? 'volume-2' : 'volume-x');
      this.setupIcons();
      this.showToast(this.soundEnabled ? 'Sound enabled' : 'Sound muted', 'info');
    });
  }

  playBeep(freq = 600, duration = 0.05) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    } catch (e) {}
  }

  /* Theme Toggle (Dark / Light) */
  setupTheme() {
    const btn = document.getElementById('btn-theme-toggle');
    const icon = document.getElementById('theme-icon');
    const savedTheme = localStorage.getItem('omni_theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    icon.setAttribute('data-lucide', savedTheme === 'dark' ? 'sun' : 'moon');
    this.setupIcons();

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('omni_theme', next);
      icon.setAttribute('data-lucide', next === 'dark' ? 'sun' : 'moon');
      this.setupIcons();
      this.playBeep(800, 0.04);
    });
  }

  /* Category Filter & Type Selector */
  setupTypeSelector() {
    const categoryPills = document.querySelectorAll('#category-pills .category-pill');
    const typeButtons = document.querySelectorAll('#type-cards-grid .type-btn');
    const searchInput = document.getElementById('type-search-input');

    // Category Filter
    categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-cat');

        typeButtons.forEach(btn => {
          const btnCat = btn.getAttribute('data-cat');
          const isMatch = cat === 'all' || btnCat === cat;
          btn.style.display = isMatch ? 'flex' : 'none';
        });
        this.playBeep(520, 0.03);
      });
    });

    // Search Filter
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      typeButtons.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        const matches = text.includes(query);
        btn.style.display = matches ? 'flex' : 'none';
      });
    });

    // Type Selection
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        this.setType(type);
      });
    });
  }

  setType(type) {
    if (!GENERATORS[type]) return;
    this.currentType = type;

    // Highlight button
    document.querySelectorAll('#type-cards-grid .type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });

    // Show corresponding form
    document.querySelectorAll('#tab-content-container .form-section').forEach(form => {
      form.style.display = 'none';
    });

    const activeForm = document.getElementById(`form-${type}`);
    if (activeForm) {
      activeForm.style.display = 'flex';
    }

    // Auto-suggest contextual logo if none selected
    if (!this.qrConfig.image) {
      if (['wifi', 'whatsapp', 'upi', 'phone', 'email'].includes(type)) {
        this.applyPresetLogo(type);
      }
    }

    this.playBeep(700, 0.04);
    this.updateQR();
  }

  /* Left Panel Tabs: Content vs Style */
  setupStudioTabs() {
    const tabContentBtn = document.getElementById('tab-btn-content');
    const tabStyleBtn = document.getElementById('tab-btn-style');
    const contentArea = document.getElementById('tab-content-container');
    const styleArea = document.getElementById('tab-style-container');
    const panelTitle = document.getElementById('panel-title-text');
    const panelIcon = document.getElementById('panel-state-icon');

    tabContentBtn.addEventListener('click', () => {
      tabContentBtn.classList.add('active');
      tabStyleBtn.classList.remove('active');
      contentArea.style.display = 'block';
      styleArea.style.display = 'none';
      panelTitle.textContent = 'QR Content Configuration';
      panelIcon.setAttribute('data-lucide', 'sliders-horizontal');
      this.setupIcons();
      this.playBeep(650, 0.03);
    });

    tabStyleBtn.addEventListener('click', () => {
      tabStyleBtn.classList.add('active');
      tabContentBtn.classList.remove('active');
      contentArea.style.display = 'none';
      styleArea.style.display = 'flex';
      panelTitle.textContent = 'Visual Styling & Designer Frame';
      panelIcon.setAttribute('data-lucide', 'palette');
      this.setupIcons();
      this.playBeep(650, 0.03);
    });
  }

  /* Listen to form inputs for live sync */
  setupFormListeners() {
    const inputs = document.querySelectorAll('#tab-content-container input, #tab-content-container textarea, #tab-content-container select');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.debounceUpdate());
      input.addEventListener('change', () => this.debounceUpdate());
    });

    // Hidden Wi-Fi Toggle
    const wifiToggle = document.getElementById('wifi-hidden-toggle');
    wifiToggle.addEventListener('click', () => {
      wifiToggle.classList.toggle('active');
      this.updateQR();
    });

    // GPS Current Location
    const btnGps = document.getElementById('btn-get-current-gps');
    btnGps.addEventListener('click', () => {
      if (navigator.geolocation) {
        this.showToast('Locating GPS coordinates...', 'info');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            document.getElementById('loc-lat').value = pos.coords.latitude.toFixed(6);
            document.getElementById('loc-lng').value = pos.coords.longitude.toFixed(6);
            this.showToast('Current GPS coordinates applied!', 'success');
            this.updateQR();
          },
          (err) => {
            this.showToast('Could not access GPS location', 'error');
          }
        );
      } else {
        this.showToast('Geolocation is not supported by your browser', 'error');
      }
    });

    // File to Data URI
    const fileDropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const fileStatus = document.getElementById('file-status');

    fileDropzone.addEventListener('click', () => fileInput.click());
    fileDropzone.addEventListener('dragover', (e) => { e.preventDefault(); fileDropzone.style.borderColor = 'var(--accent-primary)'; });
    fileDropzone.addEventListener('dragleave', () => { fileDropzone.style.borderColor = ''; });
    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.style.borderColor = '';
      if (e.dataTransfer.files.length) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        this.handleFileUpload(fileInput.files[0]);
      }
    });
  }

  handleFileUpload(file) {
    if (file.size > 2500) {
      this.showToast('File too large for direct QR encoding (limit ~2.5KB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fileDataUrl = e.target.result;
      this.fileName = file.name;
      const statusEl = document.getElementById('file-status');
      statusEl.textContent = `Encoded: ${file.name} (${file.size} bytes)`;
      this.showToast(`Encoded ${file.name} to QR!`, 'success');
      this.updateQR();
    };
    reader.readAsDataURL(file);
  }

  /* Audio Voice Note Recorder */
  setupAudioRecorder() {
    const recordBtn = document.getElementById('btn-record-voice');
    const statusText = document.getElementById('record-status-text');
    const timerText = document.getElementById('record-timer-text');
    const audioPlayback = document.getElementById('audio-playback');

    let isRecording = false;

    recordBtn.addEventListener('click', async () => {
      if (!isRecording) {
        // Start recording
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
          this.audioChunks = [];

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.audioChunks.push(e.data);
          };

          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
            stream.getTracks().forEach(t => t.stop());

            const reader = new FileReader();
            reader.onloadend = () => {
              this.recordedAudioUrl = reader.result;
              audioPlayback.src = URL.createObjectURL(blob);
              audioPlayback.style.display = 'block';
              this.showToast('Voice note recorded & baked into QR code!', 'success');
              this.updateQR();
            };
            reader.readAsDataURL(blob);
          };

          this.mediaRecorder.start();
          isRecording = true;
          recordBtn.classList.add('recording');
          statusText.textContent = 'Recording Voice... Speak now!';
          this.recordSeconds = 0;

          this.recordTimer = setInterval(() => {
            this.recordSeconds++;
            timerText.textContent = `Recording: 00:0${this.recordSeconds} / 00:06`;
            if (this.recordSeconds >= 6) {
              // auto stop after 6 seconds to keep QR payload compact
              stopRecording();
            }
          }, 1000);

        } catch (err) {
          console.error(err);
          this.showToast('Microphone access denied or unavailable', 'error');
        }
      } else {
        stopRecording();
      }
    });

    const stopRecording = () => {
      if (this.mediaRecorder && isRecording) {
        this.mediaRecorder.stop();
        isRecording = false;
        recordBtn.classList.remove('recording');
        statusText.textContent = 'Recording Complete';
        clearInterval(this.recordTimer);
      }
    };
  }

  /* Style Controls */
  setupStyleControls() {
    // 1. Curated Palettes List
    const paletteContainer = document.getElementById('palette-buttons-list');
    PALETTES.forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.className = `palette-btn ${idx === 0 ? 'active' : ''}`;
      btn.title = p.name;
      btn.style.background = p.isGradient 
        ? `linear-gradient(135deg, ${p.colorDark} 0%, ${p.gradientColor2} 100%)`
        : p.colorDark;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyPalette(p);
      });
      paletteContainer.appendChild(btn);
    });

    // 2. Body Dots Selector
    const dotChips = document.querySelectorAll('#dot-style-grid .style-chip');
    dotChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dotChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.qrConfig.dotsOptions.type = chip.getAttribute('data-dot');
        this.playBeep(600, 0.03);
        this.updateQR();
      });
    });

    // 3. Corner Square Frame
    const cornerSquareChips = document.querySelectorAll('#corner-square-grid .style-chip');
    cornerSquareChips.forEach(chip => {
      chip.addEventListener('click', () => {
        cornerSquareChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.qrConfig.cornersSquareOptions.type = chip.getAttribute('data-corner-square');
        this.playBeep(600, 0.03);
        this.updateQR();
      });
    });

    // 4. Corner Dot
    const cornerDotChips = document.querySelectorAll('#corner-dot-grid .style-chip');
    cornerDotChips.forEach(chip => {
      chip.addEventListener('click', () => {
        cornerDotChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.qrConfig.cornersDotOptions.type = chip.getAttribute('data-corner-dot');
        this.playBeep(600, 0.03);
        this.updateQR();
      });
    });

    // 5. Gradient Mode Toggle
    const gradToggle = document.getElementById('gradient-mode-toggle');
    const color2Container = document.getElementById('color-2-container');
    gradToggle.addEventListener('click', () => {
      gradToggle.classList.toggle('active');
      const isGrad = gradToggle.classList.contains('active');
      color2Container.style.display = isGrad ? 'flex' : 'none';
      this.updateColorsFromInputs();
    });

    // 6. Color Pickers & Hex Text Sync
    const col1 = document.getElementById('qr-color-1');
    const col1Text = document.getElementById('qr-color-1-val');
    col1.addEventListener('input', () => { col1Text.value = col1.value.toUpperCase(); this.updateColorsFromInputs(); });
    col1Text.addEventListener('change', () => { col1.value = col1Text.value; this.updateColorsFromInputs(); });

    const col2 = document.getElementById('qr-color-2');
    const col2Text = document.getElementById('qr-color-2-val');
    col2.addEventListener('input', () => { col2Text.value = col2.value.toUpperCase(); this.updateColorsFromInputs(); });
    col2Text.addEventListener('change', () => { col2.value = col2Text.value; this.updateColorsFromInputs(); });

    const bgCol = document.getElementById('qr-bg-color');
    const bgColText = document.getElementById('qr-bg-color-val');
    bgCol.addEventListener('input', () => { bgColText.value = bgCol.value.toUpperCase(); this.updateColorsFromInputs(); });
    bgColText.addEventListener('change', () => { bgCol.value = bgColText.value; this.updateColorsFromInputs(); });

    // Transparent Background Toggle
    const transToggle = document.getElementById('transparent-bg-toggle');
    transToggle.addEventListener('click', () => {
      transToggle.classList.toggle('active');
      this.updateColorsFromInputs();
    });

    // 7. Preset Logos Grid
    const logoBtns = document.querySelectorAll('#preset-logos-grid .logo-preset-btn');
    logoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        logoBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const logoKey = btn.getAttribute('data-logo');
        this.applyPresetLogo(logoKey);
      });
    });

    // Custom Logo File Upload
    const logoDropzone = document.getElementById('logo-dropzone');
    const logoFileInput = document.getElementById('logo-file-input');
    logoDropzone.addEventListener('click', () => logoFileInput.click());
    logoFileInput.addEventListener('change', () => {
      if (logoFileInput.files.length) {
        const file = logoFileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          this.qrConfig.image = e.target.result;
          this.qrConfig.qrOptions.errorCorrectionLevel = 'H';
          this.showToast('Custom logo applied with High Error Correction', 'success');
          this.updateQR();
        };
        reader.readAsDataURL(file);
      }
    });

    // 8. Call to Action Frames
    const frameOptions = document.querySelectorAll('#frame-selector-grid .frame-card-option');
    const frameCustomControls = document.getElementById('frame-custom-controls');
    frameOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        frameOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const frameStyle = opt.getAttribute('data-frame');
        this.frameConfig.style = frameStyle;
        frameCustomControls.style.display = frameStyle !== 'none' ? 'block' : 'none';
        this.playBeep(620, 0.03);
        this.updateQR();
      });
    });

    const frameTextInput = document.getElementById('frame-text-input');
    frameTextInput.addEventListener('input', () => {
      this.frameConfig.text = frameTextInput.value || 'SCAN ME';
      this.updateQR();
    });

    const frameColorPicker = document.getElementById('frame-color-picker');
    const frameColorVal = document.getElementById('frame-color-val');
    frameColorPicker.addEventListener('input', () => {
      frameColorVal.value = frameColorPicker.value.toUpperCase();
      this.frameConfig.color = frameColorPicker.value;
      this.updateQR();
    });
    frameColorVal.addEventListener('change', () => {
      frameColorPicker.value = frameColorVal.value;
      this.frameConfig.color = frameColorVal.value;
      this.updateQR();
    });
  }

  applyPalette(p) {
    const col1 = document.getElementById('qr-color-1');
    const col1Text = document.getElementById('qr-color-1-val');
    const col2 = document.getElementById('qr-color-2');
    const col2Text = document.getElementById('qr-color-2-val');
    const bgCol = document.getElementById('qr-bg-color');
    const bgColText = document.getElementById('qr-bg-color-val');
    const gradToggle = document.getElementById('gradient-mode-toggle');
    const color2Container = document.getElementById('color-2-container');

    col1.value = p.colorDark;
    col1Text.value = p.colorDark.toUpperCase();
    bgCol.value = p.colorLight;
    bgColText.value = p.colorLight.toUpperCase();

    if (p.isGradient) {
      gradToggle.classList.add('active');
      color2Container.style.display = 'flex';
      col2.value = p.gradientColor2;
      col2Text.value = p.gradientColor2.toUpperCase();
    } else {
      gradToggle.classList.remove('active');
      color2Container.style.display = 'none';
    }

    this.updateColorsFromInputs();
  }

  updateColorsFromInputs() {
    const isGrad = document.getElementById('gradient-mode-toggle').classList.contains('active');
    const isTrans = document.getElementById('transparent-bg-toggle').classList.contains('active');
    const c1 = document.getElementById('qr-color-1').value;
    const c2 = document.getElementById('qr-color-2').value;
    const bg = isTrans ? 'rgba(0,0,0,0)' : document.getElementById('qr-bg-color').value;

    if (isGrad) {
      this.qrConfig.dotsOptions = {
        ...this.qrConfig.dotsOptions,
        color: c1,
        gradient: {
          type: 'linear',
          rotation: 45,
          colorStops: [
            { offset: 0, color: c1 },
            { offset: 1, color: c2 }
          ]
        }
      };
    } else {
      this.qrConfig.dotsOptions = {
        ...this.qrConfig.dotsOptions,
        color: c1,
        gradient: null
      };
    }

    this.qrConfig.cornersSquareOptions.color = c1;
    this.qrConfig.cornersDotOptions.color = c1;
    this.qrConfig.backgroundOptions.color = bg;

    // Update container background if flat
    const renderBox = document.getElementById('qr-render-box');
    renderBox.style.background = isTrans ? 'transparent' : bg;

    this.updateQR();
  }

  applyPresetLogo(key) {
    if (key === 'none' || !PRESET_ICONS[key]) {
      this.qrConfig.image = null;
      this.qrConfig.qrOptions.errorCorrectionLevel = 'Q';
    } else {
      this.qrConfig.image = svgToDataUrl(PRESET_ICONS[key]);
      this.qrConfig.qrOptions.errorCorrectionLevel = 'H';
    }
    this.updateQR();
  }

  /* Mockup Views (Flat, Phone, Tent, Card) */
  setupMockupViews() {
    const mockupBtns = document.querySelectorAll('.view-mode-btn');
    const stageWrapper = document.getElementById('qr-stage-wrapper');
    const renderBox = document.getElementById('qr-render-box');

    mockupBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mockupBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mockup');
        this.currentMockup = mode;

        // Reset classes
        stageWrapper.className = 'qr-canvas-wrapper';
        renderBox.className = 'qr-render-target';

        if (mode === 'phone') {
          stageWrapper.classList.add('mockup-phone');
        } else if (mode === 'tent') {
          stageWrapper.classList.add('mockup-tent');
        } else if (mode === 'card') {
          stageWrapper.classList.add('mockup-card');
        }
        this.playBeep(650, 0.03);
      });
    });
  }

  /* Extract current payload from active form */
  getCurrentData() {
    const type = this.currentType;

    switch (type) {
      case 'url':
        return {
          url: document.getElementById('url-input').value,
          utmSource: document.getElementById('url-utm-source').value,
          utmMedium: document.getElementById('url-utm-medium').value,
          utmCampaign: document.getElementById('url-utm-campaign').value
        };

      case 'text':
        return { text: document.getElementById('text-input').value };

      case 'wifi':
        return {
          ssid: document.getElementById('wifi-ssid').value,
          password: document.getElementById('wifi-password').value,
          encryption: document.getElementById('wifi-encryption').value,
          hidden: document.getElementById('wifi-hidden-toggle').classList.contains('active')
        };

      case 'vcard':
        return {
          firstName: document.getElementById('vcard-fn').value,
          lastName: document.getElementById('vcard-ln').value,
          org: document.getElementById('vcard-org').value,
          title: document.getElementById('vcard-title').value,
          mobile: document.getElementById('vcard-mobile').value,
          email: document.getElementById('vcard-email').value,
          website: document.getElementById('vcard-url').value,
          address: document.getElementById('vcard-addr').value
        };

      case 'upi':
        return {
          vpa: document.getElementById('upi-vpa').value,
          name: document.getElementById('upi-name').value,
          amount: document.getElementById('upi-amount').value,
          note: document.getElementById('upi-note').value
        };

      case 'crypto':
        return {
          coin: document.getElementById('crypto-coin').value,
          address: document.getElementById('crypto-address').value,
          amount: document.getElementById('crypto-amount').value
        };

      case 'whatsapp':
        return {
          phone: document.getElementById('wa-phone').value,
          message: document.getElementById('wa-message').value
        };

      case 'email':
        return {
          to: document.getElementById('email-to').value,
          subject: document.getElementById('email-subject').value,
          body: document.getElementById('email-body').value
        };

      case 'phone':
        return { phone: document.getElementById('phone-input').value };

      case 'sms':
        return {
          phone: document.getElementById('sms-phone').value,
          message: document.getElementById('sms-message').value
        };

      case 'paypal':
        return {
          username: document.getElementById('paypal-user').value,
          amount: document.getElementById('paypal-amount').value
        };

      case 'location':
        return {
          latitude: document.getElementById('loc-lat').value,
          longitude: document.getElementById('loc-lng').value,
          query: document.getElementById('loc-query').value
        };

      case 'event':
        return {
          title: document.getElementById('evt-title').value,
          start: document.getElementById('evt-start').value,
          end: document.getElementById('evt-end').value,
          location: document.getElementById('evt-loc').value
        };

      case 'file':
        return {
          dataUrl: this.fileDataUrl,
          fileName: this.fileName
        };

      case 'audio':
        return {
          audioUrl: this.recordedAudioUrl,
          duration: `${this.recordSeconds}s`
        };

      default:
        return {};
    }
  }

  debounceUpdate() {
    clearTimeout(this.renderDebounceTimer);
    this.renderDebounceTimer = setTimeout(() => this.updateQR(), 150);
  }

  /* Main Sync & Render */
  updateQR() {
    const rawData = this.getCurrentData();
    const generator = GENERATORS[this.currentType] || GENERATORS.url;
    const serializedPayload = generator.serialize(rawData);

    this.currentPayload = serializedPayload;
    this.qrConfig.data = serializedPayload;

    // Update Frame Badges
    const badgeTop = document.getElementById('badge-top');
    const badgeBottom = document.getElementById('badge-bottom');

    badgeTop.className = 'qr-frame-badge pos-top';
    badgeBottom.className = 'qr-frame-badge pos-bottom';
    badgeTop.style.background = this.frameConfig.color;
    badgeBottom.style.background = this.frameConfig.color;
    badgeTop.style.color = this.frameConfig.textColor;
    badgeBottom.style.color = this.frameConfig.textColor;

    if (this.frameConfig.style === 'scan-me-top') {
      badgeTop.textContent = this.frameConfig.text;
      badgeTop.classList.add('visible');
    } else if (this.frameConfig.style === 'scan-me-bottom') {
      badgeBottom.textContent = this.frameConfig.text;
      badgeBottom.classList.add('visible');
    } else if (this.frameConfig.style === 'badge') {
      badgeBottom.textContent = this.frameConfig.text;
      badgeBottom.style.borderRadius = '9999px';
      badgeBottom.style.maxWidth = '80%';
      badgeBottom.style.margin = '0.75rem auto 0';
      badgeBottom.classList.add('visible');
    }

    // Pass to Engine
    this.engine.update(this.qrConfig, this.frameConfig);

    // Update Stats Meter
    const byteLen = new TextEncoder().encode(serializedPayload).length;
    document.getElementById('meta-chars').textContent = `${serializedPayload.length} chars`;
    document.getElementById('meta-bytes').textContent = `${byteLen} B`;
    document.getElementById('meta-ecc').textContent = `${this.qrConfig.qrOptions.errorCorrectionLevel === 'H' ? 'High (30%)' : 'Quarter (25%)'}`;
  }

  /* Export Actions */
  setupExportActions() {
    const getRes = () => parseInt(document.getElementById('export-resolution-select').value, 10) || 1024;

    // 1. Download PNG
    document.getElementById('btn-download-png').addEventListener('click', async () => {
      this.showToast('Generating high-res PNG...', 'info');
      await this.engine.downloadPNG(`omni-qr-${Date.now()}.png`, getRes());
      this.playBeep(900, 0.08);
      this.showToast('PNG Downloaded!', 'success');
      this.saveToHistorySilent();
    });

    // 2. Download SVG
    document.getElementById('btn-download-svg').addEventListener('click', async () => {
      await this.engine.downloadSVG(`omni-qr-${Date.now()}.svg`);
      this.playBeep(900, 0.08);
      this.showToast('Vector SVG Downloaded!', 'success');
      this.saveToHistorySilent();
    });

    // 3. Download JPEG
    document.getElementById('btn-download-jpeg').addEventListener('click', async () => {
      await this.engine.downloadJPEG(`omni-qr-${Date.now()}.jpg`, getRes());
      this.playBeep(900, 0.08);
      this.showToast('JPEG Downloaded!', 'success');
    });

    // 4. Copy to Clipboard
    const copyBtn = document.getElementById('btn-copy-clipboard');
    const copyIcon = document.getElementById('copy-icon');
    copyBtn.addEventListener('click', async () => {
      try {
        await this.engine.copyToClipboard(getRes());
        copyIcon.setAttribute('data-lucide', 'check');
        this.setupIcons();
        this.playBeep(1000, 0.06);
        this.showToast('Image copied to clipboard!', 'success');
        setTimeout(() => {
          copyIcon.setAttribute('data-lucide', 'copy');
          this.setupIcons();
        }, 2000);
      } catch (err) {
        console.error(err);
        this.showToast('Clipboard copy failed (browser permission needed)', 'error');
      }
    });

    // 5. Print QR Card
    document.getElementById('btn-print-qr').addEventListener('click', () => {
      this.engine.print();
    });

    // 6. Save to Library
    document.getElementById('btn-save-history').addEventListener('click', async () => {
      await this.saveToHistorySilent(true);
    });
  }

  async saveToHistorySilent(showNotification = false) {
    try {
      const canvas = await this.engine.getCompositeCanvas(256);
      const thumbUrl = canvas ? canvas.toDataURL('image/png') : '';
      const generator = GENERATORS[this.currentType] || GENERATORS.url;
      const title = generator.title(this.getCurrentData());

      QRHistoryManager.saveItem({
        title,
        type: this.currentType,
        payload: this.currentPayload,
        thumbUrl,
        config: { ...this.qrConfig }
      });

      if (showNotification) {
        this.playBeep(850, 0.05);
        this.showToast('Saved to your QR Library!', 'success');
      }
    } catch (e) {
      console.warn('History save issue', e);
    }
  }

  /* Modals Management */
  setupModals() {
    const bindModal = (openBtnId, modalId, closeBtnId, onOpen, onClose) => {
      const openBtn = document.getElementById(openBtnId);
      const modal = document.getElementById(modalId);
      const closeBtn = document.getElementById(closeBtnId);

      openBtn.addEventListener('click', () => {
        modal.classList.add('open');
        this.playBeep(600, 0.03);
        if (onOpen) onOpen();
      });

      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        if (onClose) onClose();
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
          if (onClose) onClose();
        }
      });
    };

    // Scanner Modal
    bindModal('btn-open-scanner', 'scanner-modal', 'scanner-modal-close', null, () => {
      this.scanner.stopCamera();
    });

    // Scanner actions
    const startCamBtn = document.getElementById('btn-start-camera');
    startCamBtn.addEventListener('click', async () => {
      try {
        await this.scanner.startCamera();
        startCamBtn.innerHTML = '<i data-lucide="camera-off"></i> Stop Camera';
        this.setupIcons();
      } catch (e) {
        this.showToast('Camera error: ' + (e.message || 'Permission denied'), 'error');
      }
    });

    const uploadScanFileBtn = document.getElementById('btn-upload-scan-file');
    const scanFileInput = document.getElementById('scan-file-input');
    uploadScanFileBtn.addEventListener('click', () => scanFileInput.click());
    scanFileInput.addEventListener('change', async () => {
      if (scanFileInput.files.length) {
        try {
          this.showToast('Decoding QR image...', 'info');
          await this.scanner.decodeImageFile(scanFileInput.files[0]);
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      }
    });

    // Batch Modal
    bindModal('btn-open-batch', 'batch-modal', 'batch-modal-close');

    // History Modal
    bindModal('btn-open-history', 'history-modal', 'history-modal-close', () => {
      this.renderHistoryGrid();
    });

    // Brand Home reload
    document.getElementById('brand-home-btn').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  handleScanSuccess(decodedText, analysis) {
    this.playBeep(950, 0.1);
    this.scanner.stopCamera();

    const resultBox = document.getElementById('scanner-result-box');
    const labelEl = document.getElementById('scan-result-label');
    const payloadEl = document.getElementById('scan-result-payload');
    const openLinkBtn = document.getElementById('btn-open-scan-link');
    const sendStudioBtn = document.getElementById('btn-send-to-studio');

    resultBox.classList.add('visible');
    labelEl.textContent = `Decoded: ${analysis.label}`;
    payloadEl.textContent = decodedText;

    if (analysis.type === 'url') {
      openLinkBtn.style.display = 'inline-flex';
      openLinkBtn.href = decodedText;
    } else {
      openLinkBtn.style.display = 'none';
    }

    sendStudioBtn.onclick = () => {
      document.getElementById('scanner-modal').classList.remove('open');
      this.loadPayloadIntoStudio(decodedText, analysis);
    };

    document.getElementById('btn-copy-scan-result').onclick = () => {
      navigator.clipboard.writeText(decodedText);
      this.showToast('Result copied to clipboard!', 'success');
    };
  }

  loadPayloadIntoStudio(text, analysis) {
    if (analysis.type === 'url') {
      this.setType('url');
      document.getElementById('url-input').value = text;
    } else if (analysis.type === 'wifi') {
      this.setType('wifi');
      document.getElementById('wifi-ssid').value = analysis.data.ssid || '';
      document.getElementById('wifi-password').value = analysis.data.password || '';
      document.getElementById('wifi-encryption').value = analysis.data.encryption || 'WPA';
    } else if (analysis.type === 'upi') {
      this.setType('upi');
      document.getElementById('upi-vpa').value = analysis.data.vpa || '';
      document.getElementById('upi-name').value = analysis.data.name || '';
      document.getElementById('upi-amount').value = analysis.data.amount || '';
    } else {
      this.setType('text');
      document.getElementById('text-input').value = text;
    }
    this.updateQR();
    this.showToast('Loaded into studio! Ready to re-style.', 'success');
  }

  /* Batch Generator */
  setupBatchGenerator() {
    const runBtn = document.getElementById('btn-run-batch');
    const inputArea = document.getElementById('batch-input-area');
    const previewGrid = document.getElementById('batch-preview-grid');
    const progressWrapper = document.getElementById('batch-progress-wrapper');
    const progressFill = document.getElementById('batch-progress-fill');
    const footer = document.getElementById('batch-modal-footer');
    const downloadZipBtn = document.getElementById('btn-download-batch-zip');

    let batchResults = [];
    const batchEngine = new BatchQRGenerator(this.qrConfig);

    runBtn.addEventListener('click', async () => {
      const items = batchEngine.parseInput(inputArea.value);
      if (!items.length) {
        this.showToast('Please enter at least one URL or text item', 'error');
        return;
      }

      runBtn.disabled = true;
      progressWrapper.style.display = 'block';
      previewGrid.style.display = 'grid';
      previewGrid.innerHTML = '';
      footer.style.display = 'none';

      batchResults = await batchEngine.generateBatch(items, (done, total) => {
        const pct = Math.round((done / total) * 100);
        progressFill.style.width = `${pct}%`;
        document.getElementById('batch-counter-text').textContent = `Processing: ${done} of ${total}`;
      });

      // Render cards
      batchResults.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
          <div class="history-thumb"><img src="${item.url}" alt="${item.name}"></div>
          <div class="history-title">${item.name}</div>
        `;
        previewGrid.appendChild(card);
      });

      runBtn.disabled = false;
      footer.style.display = 'flex';
      this.playBeep(900, 0.08);
      this.showToast(`Generated ${batchResults.length} QR codes!`, 'success');
    });

    downloadZipBtn.addEventListener('click', async () => {
      this.showToast('Packaging ZIP archive...', 'info');
      await batchEngine.downloadAsZip(batchResults);
      this.showToast('Batch ZIP downloaded!', 'success');
    });
  }

  /* History & Saved Library */
  setupHistory() {
    const clearBtn = document.getElementById('btn-clear-all-history');
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your saved QR library?')) {
        QRHistoryManager.clearAll();
        this.renderHistoryGrid();
        this.showToast('Library cleared', 'info');
      }
    });
  }

  renderHistoryGrid() {
    const grid = document.getElementById('history-items-grid');
    const countBadge = document.getElementById('history-count-badge');
    const list = QRHistoryManager.getHistory();

    countBadge.textContent = `${list.length} saved codes`;
    grid.innerHTML = '';

    if (!list.length) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
          <i data-lucide="bookmark" style="width: 32px; height: 32px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p>No saved QR codes yet.<br>Click "Save to My Library" on any generated QR code to keep it here!</p>
        </div>
      `;
      this.setupIcons();
      return;
    }

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-card';
      const dt = new Date(item.timestamp).toLocaleDateString();

      card.innerHTML = `
        <div class="history-thumb">
          <img src="${item.thumbUrl || ''}" alt="${item.title}">
        </div>
        <div class="history-title" title="${item.title}">${item.title}</div>
        <div class="history-date">${dt} • ${item.type.toUpperCase()}</div>
      `;

      card.addEventListener('click', () => {
        document.getElementById('history-modal').classList.remove('open');
        this.loadPayloadIntoStudio(item.payload, { type: item.type, label: item.title, data: {} });
      });

      grid.appendChild(card);
    });

    this.setupIcons();
  }

  /* Toast Notification */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-circle';

    toast.innerHTML = `<i data-lucide="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    this.setupIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.omniQR = new OmniQRApp();
  window.omniQR.init();
});
