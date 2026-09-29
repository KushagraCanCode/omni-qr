/**
 * OMNIQR — High Performance QR Code Studio Engine
 * Wraps QRCodeStyling with high-resolution canvas rendering,
 * frame composition, SVG/PNG exports, and clipboard copy.
 */

export class QREngine {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.config = {
      width: 320,
      height: 320,
      data: 'https://example.com',
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
      ...options
    };

    this.frameConfig = {
      style: 'none', // 'none' | 'scan-me-top' | 'scan-me-bottom' | 'badge' | 'card'
      text: 'SCAN ME',
      color: '#8b5cf6',
      textColor: '#ffffff'
    };

    this.qrInstance = null;
    this.init();
  }

  init() {
    if (typeof QRCodeStyling === 'undefined') {
      console.warn('QRCodeStyling library not loaded yet');
      return;
    }
    this.qrInstance = new QRCodeStyling(this.config);
    this.render();
  }

  render() {
    if (!this.qrInstance) return;
    this.container.innerHTML = '';
    this.qrInstance.append(this.container);
  }

  update(newConfig, frameConfig) {
    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
    }
    if (frameConfig) {
      this.frameConfig = { ...this.frameConfig, ...frameConfig };
    }

    if (this.qrInstance) {
      this.qrInstance.update(this.config);
    } else {
      this.init();
    }
  }

  /**
   * Generates a composite canvas at requested export resolution (512, 1024, 2048, etc.)
   * including any active CTA frames, badges, or card styling.
   */
  async getCompositeCanvas(targetResolution = 1024) {
    if (!this.qrInstance) return null;

    // 1. Get raw QR code as Blob
    const rawQrBlob = await this.qrInstance.getRawData('png');
    const qrImg = await this.loadImageFromBlob(rawQrBlob);

    const frame = this.frameConfig.style;
    const padding = Math.round(targetResolution * 0.08); // margin
    const qrSize = targetResolution;

    let totalWidth = qrSize + (padding * 2);
    let totalHeight = qrSize + (padding * 2);

    let bannerHeight = 0;
    if (frame === 'scan-me-top' || frame === 'scan-me-bottom' || frame === 'badge') {
      bannerHeight = Math.round(targetResolution * 0.16);
      totalHeight += bannerHeight;
    } else if (frame === 'card') {
      bannerHeight = Math.round(targetResolution * 0.28);
      totalHeight += bannerHeight;
    }

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    // Smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Background fill
    ctx.fillStyle = this.config.backgroundOptions.color || '#ffffff';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Frame Drawing
    const qrX = padding;
    let qrY = padding;

    if (frame === 'scan-me-top') {
      // Banner at top
      ctx.fillStyle = this.frameConfig.color;
      this.roundRect(ctx, padding, padding, qrSize, bannerHeight - 12, 14);
      ctx.fill();

      ctx.fillStyle = this.frameConfig.textColor;
      ctx.font = `bold ${Math.round(bannerHeight * 0.38)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.frameConfig.text, padding + (qrSize / 2), padding + ((bannerHeight - 12) / 2));

      qrY = padding + bannerHeight;
    } else if (frame === 'scan-me-bottom') {
      qrY = padding;
      const bannerY = qrY + qrSize + 12;

      ctx.fillStyle = this.frameConfig.color;
      this.roundRect(ctx, padding, bannerY, qrSize, bannerHeight - 12, 14);
      ctx.fill();

      ctx.fillStyle = this.frameConfig.textColor;
      ctx.font = `bold ${Math.round(bannerHeight * 0.38)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.frameConfig.text, padding + (qrSize / 2), bannerY + ((bannerHeight - 12) / 2));
    } else if (frame === 'badge') {
      qrY = padding;
      const pillW = Math.round(qrSize * 0.7);
      const pillH = bannerHeight - 15;
      const pillX = padding + (qrSize - pillW) / 2;
      const pillY = qrY + qrSize + 15;

      ctx.fillStyle = this.frameConfig.color;
      this.roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
      ctx.fill();

      ctx.fillStyle = this.frameConfig.textColor;
      ctx.font = `bold ${Math.round(pillH * 0.42)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.frameConfig.text, padding + (qrSize / 2), pillY + (pillH / 2));
    }

    // Draw the QR Code image
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    return canvas;
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  loadImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Export to PNG with selected resolution
   */
  async downloadPNG(filename = 'omni-qr.png', resolution = 1024) {
    const canvas = await this.getCompositeCanvas(resolution);
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = filename;
    a.href = dataUrl;
    a.click();
  }

  /**
   * Export to SVG (lossless vector)
   */
  async downloadSVG(filename = 'omni-qr.svg') {
    if (!this.qrInstance) return;
    await this.qrInstance.download({ name: filename.replace(/\.svg$/i, ''), extension: 'svg' });
  }

  /**
   * Export to JPEG
   */
  async downloadJPEG(filename = 'omni-qr.jpg', resolution = 1024) {
    const canvas = await this.getCompositeCanvas(resolution);
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.download = filename;
    a.href = dataUrl;
    a.click();
  }

  /**
   * Copy high-res PNG image directly to clipboard
   */
  async copyToClipboard(resolution = 1024) {
    const canvas = await this.getCompositeCanvas(resolution);
    if (!canvas) throw new Error('Canvas not ready');

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob'));
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 'image/png');
    });
  }

  /**
   * Print formatted QR Card
   */
  print() {
    window.print();
  }
}
