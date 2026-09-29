/**
 * OMNIQR — Batch QR Code Generator & ZIP Downloader
 * Generates tens or hundreds of QR codes from CSV or multi-line text input.
 */

export class BatchQRGenerator {
  constructor(engineConfig) {
    this.baseConfig = engineConfig;
  }

  parseInput(text) {
    if (!text) return [];
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    return lines.map((line, index) => {
      // Check if CSV format: name,payload or just payload
      if (line.includes(',')) {
        const parts = line.split(',');
        return {
          id: index + 1,
          name: parts[0].trim(),
          data: parts.slice(1).join(',').trim()
        };
      }
      return {
        id: index + 1,
        name: `QR_${index + 1}`,
        data: line
      };
    });
  }

  async generateBatch(items, onProgress) {
    const results = [];
    const total = items.length;

    for (let i = 0; i < total; i++) {
      const item = items[i];
      try {
        const qr = new QRCodeStyling({
          ...this.baseConfig,
          width: 512,
          height: 512,
          data: item.data
        });

        const blob = await qr.getRawData('png');
        const url = URL.createObjectURL(blob);

        results.push({
          ...item,
          blob,
          url
        });
      } catch (err) {
        console.error('Batch item error:', item, err);
      }

      if (onProgress) {
        onProgress(i + 1, total);
      }
    }

    return results;
  }

  async downloadAsZip(results, zipName = 'omni-batch-qrs.zip') {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip library not found');
    }

    const zip = new JSZip();
    const folder = zip.folder('qrcodes');

    results.forEach((item, index) => {
      const cleanName = (item.name || `qr_${index + 1}`).replace(/[^a-z0-9_-]/gi, '_');
      folder.file(`${cleanName}.png`, item.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = zipName;
    a.click();
  }
}
