/**
 * OMNIQR — Live QR Scanner & Decoder Module
 * Uses Html5Qrcode to scan via webcam or decode dropped image files,
 * with intelligent payload analysis.
 */

export class QRScanner {
  constructor(viewportId, onDecodedCallback) {
    this.viewportId = viewportId;
    this.onDecoded = onDecodedCallback;
    this.scannerInstance = null;
    this.isScanning = false;
  }

  async startCamera() {
    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('Html5Qrcode library not loaded');
    }

    if (this.isScanning) return;

    if (!this.scannerInstance) {
      this.scannerInstance = new Html5Qrcode(this.viewportId);
    }

    const config = {
      fps: 15,
      qrbox: { width: 220, height: 220 },
      aspectRatio: 1.0
    };

    try {
      await this.scannerInstance.start(
        { facingMode: 'environment' },
        config,
        (decodedText, decodedResult) => {
          this.handleDecoded(decodedText, decodedResult);
        },
        (errorMessage) => {
          // ignore frame read errors
        }
      );
      this.isScanning = true;
    } catch (err) {
      console.error('Camera start failed:', err);
      throw err;
    }
  }

  async stopCamera() {
    if (this.scannerInstance && this.isScanning) {
      try {
        await this.scannerInstance.stop();
        this.isScanning = false;
      } catch (err) {
        console.warn('Stop error:', err);
      }
    }
  }

  async decodeImageFile(file) {
    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('Html5Qrcode library not loaded');
    }

    if (!this.scannerInstance) {
      this.scannerInstance = new Html5Qrcode(this.viewportId);
    }

    try {
      const decodedText = await this.scannerInstance.scanFile(file, true);
      this.handleDecoded(decodedText);
      return decodedText;
    } catch (err) {
      console.error('File scan error:', err);
      throw new Error('Could not find a valid QR code in this image');
    }
  }

  handleDecoded(text, rawResult) {
    const analysis = this.analyzePayload(text);
    if (this.onDecoded) {
      this.onDecoded(text, analysis);
    }
  }

  /**
   * Intelligently parses decoded string
   */
  analyzePayload(text) {
    const str = (text || '').trim();

    // 1. Wi-Fi
    if (str.startsWith('WIFI:')) {
      const ssidMatch = str.match(/S:([^;]+)/);
      const passMatch = str.match(/P:([^;]+)/);
      const typeMatch = str.match(/T:([^;]+)/);
      return {
        type: 'wifi',
        label: 'Wi-Fi Network',
        icon: 'wifi',
        data: {
          ssid: ssidMatch ? ssidMatch[1] : '',
          password: passMatch ? passMatch[1] : '',
          encryption: typeMatch ? typeMatch[1] : 'WPA'
        }
      };
    }

    // 2. vCard
    if (str.startsWith('BEGIN:VCARD')) {
      const fnMatch = str.match(/FN:([^\r\n]+)/);
      const orgMatch = str.match(/ORG:([^\r\n]+)/);
      const telMatch = str.match(/TEL[^:]*:([^\r\n]+)/);
      const emailMatch = str.match(/EMAIL[^:]*:([^\r\n]+)/);
      return {
        type: 'vcard',
        label: 'Contact Card (vCard)',
        icon: 'contact',
        data: {
          fullName: fnMatch ? fnMatch[1] : 'Contact',
          org: orgMatch ? orgMatch[1] : '',
          phone: telMatch ? telMatch[1] : '',
          email: emailMatch ? emailMatch[1] : ''
        }
      };
    }

    // 3. UPI Payment
    if (str.startsWith('upi://pay')) {
      try {
        const url = new URL(str);
        return {
          type: 'upi',
          label: 'UPI Payment Request',
          icon: 'credit-card',
          data: {
            vpa: url.searchParams.get('pa') || '',
            name: url.searchParams.get('pn') || '',
            amount: url.searchParams.get('am') || '',
            note: url.searchParams.get('tn') || ''
          }
        };
      } catch (e) {
        // fallback
      }
    }

    // 4. URL
    if (/^https?:\/\//i.test(str)) {
      return {
        type: 'url',
        label: 'Website Link',
        icon: 'globe',
        data: { url: str }
      };
    }

    // 5. Email (mailto)
    if (str.startsWith('mailto:')) {
      return {
        type: 'email',
        label: 'Email Address',
        icon: 'mail',
        data: { email: str.replace(/^mailto:/, '').split('?')[0] }
      };
    }

    // 6. Phone Call (tel:)
    if (str.startsWith('tel:')) {
      return {
        type: 'phone',
        label: 'Phone Number',
        icon: 'phone',
        data: { phone: str.replace(/^tel:/, '') }
      };
    }

    // 7. SMS
    if (str.startsWith('sms:')) {
      return {
        type: 'sms',
        label: 'SMS Message',
        icon: 'message-square',
        data: { phone: str.replace(/^sms:/, '').split('?')[0] }
      };
    }

    // 8. Crypto
    if (str.startsWith('bitcoin:') || str.startsWith('ethereum:') || str.startsWith('solana:')) {
      return {
        type: 'crypto',
        label: 'Crypto Address',
        icon: 'coins',
        data: { address: str }
      };
    }

    // Default plain text
    return {
      type: 'text',
      label: 'Plain Text',
      icon: 'file-text',
      data: { text: str }
    };
  }
}
