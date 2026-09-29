/**
 * OMNIQR — Universal Content Serializers
 * Turns every given digital format into standard QR payloads
 */

export const GENERATORS = {
  // 1. Website / URL
  url: {
    serialize(data) {
      let raw = (data.url || '').trim();
      if (!raw) return 'https://example.com';
      if (!/^https?:\/\//i.test(raw)) {
        raw = 'https://' + raw;
      }
      // Optional UTM Builder
      if (data.utmSource || data.utmMedium || data.utmCampaign) {
        try {
          const urlObj = new URL(raw);
          if (data.utmSource) urlObj.searchParams.set('utm_source', data.utmSource);
          if (data.utmMedium) urlObj.searchParams.set('utm_medium', data.utmMedium);
          if (data.utmCampaign) urlObj.searchParams.set('utm_campaign', data.utmCampaign);
          return urlObj.toString();
        } catch (e) {
          return raw;
        }
      }
      return raw;
    },
    title(data) {
      return data.url || 'Web Link';
    }
  },

  // 2. Plain Text / Code / Secret
  text: {
    serialize(data) {
      return data.text || 'Hello from OmniQR!';
    },
    title(data) {
      const txt = (data.text || '').trim();
      return txt ? (txt.length > 25 ? txt.slice(0, 25) + '...' : txt) : 'Plain Text';
    }
  },

  // 3. Wi-Fi Network (Standard Mobile Auto-Connect format)
  wifi: {
    serialize(data) {
      const ssid = (data.ssid || '').trim();
      const pass = data.password || '';
      const type = data.encryption || 'WPA'; // WPA, WEP, nopass
      const hidden = !!data.hidden;
      // Escape special characters in SSID & password: \ ; , : "
      const esc = (s) => s.replace(/([\\;,:"])/g, '\\$1');
      return `WIFI:S:${esc(ssid)};T:${type};P:${esc(pass)};H:${hidden};;`;
    },
    title(data) {
      return `Wi-Fi: ${data.ssid || 'Network'}`;
    }
  },

  // 4. vCard 3.0 (Digital Business Card)
  vcard: {
    serialize(data) {
      const firstName = (data.firstName || '').trim();
      const lastName = (data.lastName || '').trim();
      const org = (data.org || '').trim();
      const title = (data.title || '').trim();
      const phone = (data.phone || '').trim();
      const mobile = (data.mobile || '').trim();
      const email = (data.email || '').trim();
      const website = (data.website || '').trim();
      const address = (data.address || '').trim();
      const note = (data.note || '').trim();

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName};;;`,
        `FN:${firstName} ${lastName}`.trim()
      ];

      if (org) lines.push(`ORG:${org}`);
      if (title) lines.push(`TITLE:${title}`);
      if (phone) lines.push(`TEL;TYPE=WORK,VOICE:${phone}`);
      if (mobile) lines.push(`TEL;TYPE=CELL,VOICE:${mobile}`);
      if (email) lines.push(`EMAIL;TYPE=PREF,INTERNET:${email}`);
      if (website) lines.push(`URL:${website}`);
      if (address) lines.push(`ADR;TYPE=WORK:;;${address.replace(/,/g, ';')};;;;`);
      if (note) lines.push(`NOTE:${note}`);
      lines.push('END:VCARD');

      return lines.join('\n');
    },
    title(data) {
      const name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      return name ? `Contact: ${name}` : 'vCard Contact';
    }
  },

  // 5. Email (RFC mailto)
  email: {
    serialize(data) {
      const to = (data.to || '').trim();
      const params = [];
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
      if (data.cc) params.push(`cc=${encodeURIComponent(data.cc)}`);
      if (data.bcc) params.push(`bcc=${encodeURIComponent(data.bcc)}`);
      const query = params.length ? `?${params.join('&')}` : '';
      return `mailto:${to}${query}`;
    },
    title(data) {
      return `Email: ${data.to || 'Recipient'}`;
    }
  },

  // 6. WhatsApp Chat
  whatsapp: {
    serialize(data) {
      let num = (data.phone || '').replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(data.message || '');
      return `https://wa.me/${num}${msg ? '?text=' + msg : ''}`;
    },
    title(data) {
      return `WhatsApp: ${data.phone || 'Chat'}`;
    }
  },

  // 7. SMS Message
  sms: {
    serialize(data) {
      const num = (data.phone || '').trim();
      const msg = encodeURIComponent(data.message || '');
      return `sms:${num}${msg ? '?body=' + msg : ''}`;
    },
    title(data) {
      return `SMS: ${data.phone || 'Message'}`;
    }
  },

  // 8. Phone Direct Dial
  phone: {
    serialize(data) {
      const num = (data.phone || '').trim();
      return `tel:${num}`;
    },
    title(data) {
      return `Call: ${data.phone || 'Number'}`;
    }
  },

  // 9. UPI Instant Payment (NPCI UPI Standard)
  upi: {
    serialize(data) {
      const pa = (data.vpa || '').trim(); // Virtual Payment Address e.g. name@upi
      const pn = encodeURIComponent((data.name || 'Merchant').trim());
      const am = (data.amount || '').trim();
      const cu = (data.currency || 'INR').trim();
      const tn = encodeURIComponent((data.note || 'Payment').trim());

      let upiStr = `upi://pay?pa=${pa}&pn=${pn}&cu=${cu}`;
      if (am) upiStr += `&am=${am}`;
      if (tn) upiStr += `&tn=${tn}`;
      return upiStr;
    },
    title(data) {
      return `UPI Pay: ${data.vpa || 'Recipient'} (${data.amount ? '₹' + data.amount : ''})`;
    }
  },

  // 10. Crypto (Bitcoin, Ethereum, Solana)
  crypto: {
    serialize(data) {
      const type = data.coin || 'bitcoin';
      const address = (data.address || '').trim();
      const amount = (data.amount || '').trim();
      const label = encodeURIComponent(data.label || '');

      if (type === 'bitcoin') {
        let uri = `bitcoin:${address}`;
        const params = [];
        if (amount) params.push(`amount=${amount}`);
        if (label) params.push(`label=${label}`);
        if (params.length) uri += `?${params.join('&')}`;
        return uri;
      } else if (type === 'ethereum') {
        let uri = `ethereum:${address}`;
        const params = [];
        if (amount) params.push(`value=${amount}`);
        if (params.length) uri += `?${params.join('&')}`;
        return uri;
      } else if (type === 'solana') {
        let uri = `solana:${address}`;
        if (amount) uri += `?amount=${amount}`;
        return uri;
      }
      return address;
    },
    title(data) {
      return `${(data.coin || 'Crypto').toUpperCase()}: ${data.address ? data.address.slice(0, 10) + '...' : ''}`;
    }
  },

  // 11. PayPal
  paypal: {
    serialize(data) {
      const user = (data.username || '').trim().replace(/^@/, '');
      const amount = (data.amount || '').trim();
      return `https://paypal.me/${user}${amount ? '/' + amount : ''}`;
    },
    title(data) {
      return `PayPal: @${data.username || 'User'}`;
    }
  },

  // 12. Location / GPS Coordinates
  location: {
    serialize(data) {
      const lat = (data.latitude || '').trim();
      const lng = (data.longitude || '').trim();
      const query = (data.query || '').trim();

      if (query && (!lat || !lng)) {
        return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
      }
      return `https://www.google.com/maps?q=${lat},${lng}`;
    },
    title(data) {
      return data.query ? `Map: ${data.query}` : `GPS: ${data.latitude}, ${data.longitude}`;
    }
  },

  // 13. Calendar Event (iCal vEvent standard)
  event: {
    serialize(data) {
      const title = (data.title || 'Event').trim();
      const loc = (data.location || '').trim();
      const desc = (data.description || '').trim();
      
      const formatDT = (dtStr) => {
        if (!dtStr) return '';
        const dt = new Date(dtStr);
        return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const dtStart = formatDT(data.start);
      const dtEnd = formatDT(data.end);

      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//OmniQR Studio//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${title}`
      ];

      if (dtStart) lines.push(`DTSTART:${dtStart}`);
      if (dtEnd) lines.push(`DTEND:${dtEnd}`);
      if (loc) lines.push(`LOCATION:${loc}`);
      if (desc) lines.push(`DESCRIPTION:${desc}`);
      lines.push('END:VEVENT');
      lines.push('END:VCALENDAR');

      return lines.join('\n');
    },
    title(data) {
      return `Event: ${data.title || 'Calendar'}`;
    }
  },

  // 14. File to Data URI
  file: {
    serialize(data) {
      return data.dataUrl || 'data:text/plain;charset=utf-8,Empty%20File';
    },
    title(data) {
      return `File: ${data.fileName || 'Payload'}`;
    }
  },

  // 15. Audio Voice Note (Record Voice -> Data URL)
  audio: {
    serialize(data) {
      return data.audioUrl || 'data:audio/wav;base64,';
    },
    title(data) {
      return `Voice Note (${data.duration || '0s'})`;
    }
  }
};
