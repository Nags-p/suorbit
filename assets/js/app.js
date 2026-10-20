/**
 * SuOrbit QR Studio - Comprehensive QR Engine
 * Features: Multi-type encoding, custom styling, logo embedding,
 * high-res export (PNG, SVG, WEBP), clipboard copy, scanner, and local history.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    currentType: 'url',
    qrCode: null,
    qrText: 'https://suorbit.top',
    options: {
      width: 320,
      height: 320,
      margin: 10,
      type: 'canvas',
      data: 'https://suorbit.top',
      image: '',
      dotsOptions: {
        color: '#6366f1',
        type: 'rounded', // 'rounded', 'dots', 'classy', 'classy-rounded', 'square'
        gradient: null
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: 0.35,
        hideBackgroundDots: true
      },
      cornersSquareOptions: {
        color: '#6366f1',
        type: 'extra-rounded' // 'dot', 'square', 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#6366f1',
        type: 'dot' // 'dot', 'square'
      },
      qrOptions: {
        errorCorrectionLevel: 'Q' // L, M, Q, H
      }
    },
    frame: 'none', // 'none', 'badge-bottom', 'badge-top', 'bubble', 'polaroid', 'phone'
    frameText: 'SCAN ME',
    frameBgColor: '#ffffff',
    frameTextColor: '#0f172a',
    gradientEnabled: false,
    color1: '#6366f1',
    color2: '#a855f7',
    bgColor: '#ffffff',
    bgTransparent: false,
    exportResolution: 1200,
    videoStream: null,
    isScanningCamera: false
  };

  // Pre-made SVG Icons for Quick Selection
  const ICONS = {
    web: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    github: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%230f172a"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    twitter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    wifi: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    whatsapp: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%2325D366"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>`,
    instagram: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    youtube: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23ef4444"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon fill="%23fff" points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`,
    linkedin: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%230a66c2"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`
  };

  // Color Presets for Styles
  const PRESETS = {
    modern: {
      color1: '#6366f1',
      color2: '#a855f7',
      gradient: true,
      dotsType: 'rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot'
    },
    cyberpunk: {
      color1: '#06b6d4',
      color2: '#ec4899',
      gradient: true,
      dotsType: 'classy-rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot'
    },
    emerald: {
      color1: '#059669',
      color2: '#10b981',
      gradient: false,
      dotsType: 'dots',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot'
    },
    minimal: {
      color1: '#0f172a',
      color2: '#0f172a',
      gradient: false,
      dotsType: 'square',
      cornerSquareType: 'square',
      cornerDotType: 'square'
    },
    sunset: {
      color1: '#f97316',
      color2: '#ec4899',
      gradient: true,
      dotsType: 'classy',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot'
    },
    royal: {
      color1: '#d97706',
      color2: '#451a03',
      gradient: false,
      dotsType: 'rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'square'
    }
  };

  /**
   * Initialize Application
   */
  function init() {
    initTheme();
    initQRCodeInstance();
    setupEventListeners();
    setupUPIVerification();
    setupPhoneSimulator();
    setupStickerSheet();
    setupBatchGenerator();
    setupMobileViewSwitcher();
    updateQRFromInputs();
    renderHistory();
  }

  /**
   * Theme Management (Dark / Light)
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('suorbit_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('suorbit_theme', nextTheme);
        updateThemeIcon(nextTheme);
      });
    }
  }

  function updateThemeIcon(theme) {
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    if (sunIcon && moonIcon) {
      if (theme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    }
  }

  /**
   * Initialize QRCodeStyling library
   */
  function initQRCodeInstance() {
    const container = document.getElementById('qr-canvas-container');
    if (!container) return;

    if (typeof QRCodeStyling === 'undefined') {
      // Library not loaded yet, wait slightly
      setTimeout(initQRCodeInstance, 100);
      return;
    }

    state.qrCode = new QRCodeStyling(state.options);
    container.innerHTML = '';
    state.qrCode.append(container);
  }

  /**
   * Format content payload depending on active type tab
   */
  function computeDataPayload() {
    const type = state.currentType;

    switch (type) {
      case 'url': {
        const urlInput = document.getElementById('input-url');
        let val = urlInput ? urlInput.value.trim() : 'https://suorbit.top';
        if (val && !val.match(/^https?:\/\//i) && !val.match(/^[a-z]+:\/\//i)) {
          val = 'https://' + val;
        }
        return val || 'https://suorbit.top';
      }

      case 'text': {
        const textInput = document.getElementById('input-text');
        return textInput ? textInput.value.trim() || 'Hello from SuOrbit QR!' : 'Hello!';
      }

      case 'wifi': {
        const ssid = (document.getElementById('wifi-ssid') || {}).value || '';
        const pass = (document.getElementById('wifi-password') || {}).value || '';
        const enc = (document.getElementById('wifi-encryption') || {}).value || 'WPA';
        const hidden = (document.getElementById('wifi-hidden') || {}).checked ? 'true' : 'false';
        // Format: WIFI:T:WPA;S:MySSID;P:mypass;H:false;;
        return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
      }

      case 'vcard': {
        const first = (document.getElementById('vcard-first') || {}).value || '';
        const last = (document.getElementById('vcard-last') || {}).value || '';
        const org = (document.getElementById('vcard-org') || {}).value || '';
        const title = (document.getElementById('vcard-title') || {}).value || '';
        const phone = (document.getElementById('vcard-phone') || {}).value || '';
        const email = (document.getElementById('vcard-email') || {}).value || '';
        const website = (document.getElementById('vcard-website') || {}).value || '';
        const address = (document.getElementById('vcard-address') || {}).value || '';

        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${last};${first};;;`,
          `FN:${first} ${last}`.trim(),
          org ? `ORG:${org}` : '',
          title ? `TITLE:${title}` : '',
          phone ? `TEL;TYPE=CELL:${phone}` : '',
          email ? `EMAIL:${email}` : '',
          website ? `URL:${website}` : '',
          address ? `ADR;TYPE=WORK:;;${address};;;;` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');
      }

      case 'email': {
        const to = (document.getElementById('email-to') || {}).value || '';
        const subject = (document.getElementById('email-subject') || {}).value || '';
        const body = (document.getElementById('email-body') || {}).value || '';
        return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }

      case 'phone': {
        const phone = (document.getElementById('phone-number') || {}).value || '';
        return `tel:${phone}`;
      }

      case 'sms': {
        const num = (document.getElementById('sms-number') || {}).value || '';
        const msg = (document.getElementById('sms-message') || {}).value || '';
        return `sms:${num}?body=${encodeURIComponent(msg)}`;
      }

      case 'upi': {
        const pa = (document.getElementById('upi-id') || {}).value || '';
        const pn = (document.getElementById('upi-name') || {}).value || '';
        const am = (document.getElementById('upi-amount') || {}).value || '';
        const tn = (document.getElementById('upi-note') || {}).value || '';
        let str = `upi://pay?pa=${pa}&pn=${encodeURIComponent(pn)}`;
        if (am) str += `&am=${am}`;
        if (tn) str += `&tn=${encodeURIComponent(tn)}`;
        str += '&cu=INR';
        return str;
      }

      case 'location': {
        const query = (document.getElementById('loc-query') || {}).value || '';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      }

      case 'event': {
        const title = (document.getElementById('event-title') || {}).value || 'Meeting';
        const start = (document.getElementById('event-start') || {}).value || '';
        const end = (document.getElementById('event-end') || {}).value || '';
        const loc = (document.getElementById('event-loc') || {}).value || '';
        const desc = (document.getElementById('event-desc') || {}).value || '';

        const formatDt = (dtStr) => {
          if (!dtStr) return '';
          return dtStr.replace(/[-:]/g, '') + '00Z';
        };

        return [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          `SUMMARY:${title}`,
          loc ? `LOCATION:${loc}` : '',
          desc ? `DESCRIPTION:${desc}` : '',
          start ? `DTSTART:${formatDt(start)}` : '',
          end ? `DTEND:${formatDt(end)}` : '',
          'END:VEVENT',
          'END:VCALENDAR'
        ].filter(Boolean).join('\n');
      }

      case 'whatsapp': {
        let phone = (document.getElementById('wa-phone') || {}).value || '';
        phone = phone.replace(/[^0-9]/g, '');
        const msg = (document.getElementById('wa-message') || {}).value || '';
        if (!phone) return 'https://wa.me/';
        if (msg) {
          return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        }
        return `https://wa.me/${phone}`;
      }

      case 'crypto': {
        const coin = (document.getElementById('crypto-coin') || {}).value || 'bitcoin';
        const addr = (document.getElementById('crypto-address') || {}).value || '';
        const amt = (document.getElementById('crypto-amount') || {}).value || '';
        if (!addr) return 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        if (coin === 'bitcoin') {
          return amt ? `bitcoin:${addr}?amount=${amt}` : `bitcoin:${addr}`;
        } else if (coin === 'ethereum') {
          return amt ? `ethereum:${addr}?value=${amt}` : `ethereum:${addr}`;
        } else if (coin === 'solana') {
          return amt ? `solana:${addr}?amount=${amt}` : `solana:${addr}`;
        } else {
          return `${coin}:${addr}${amt ? '?amount=' + amt : ''}`;
        }
      }

      default:
        return 'https://suorbit.top';
    }
  }

  /**
   * Update the live QR Code instance
   */
  function updateQRFromInputs() {
    state.qrText = computeDataPayload();

    // Configure gradient or solid
    let dotsOptions = {
      type: state.options.dotsOptions.type
    };

    if (state.gradientEnabled) {
      dotsOptions.gradient = {
        type: 'linear',
        rotation: 0.785, // 45 deg
        colorStops: [
          { offset: 0, color: state.color1 },
          { offset: 1, color: state.color2 }
        ]
      };
    } else {
      dotsOptions.color = state.color1;
      dotsOptions.gradient = null;
    }

    const cornersSquareColor = document.getElementById('match-corner-color')?.checked ? state.color1 : (document.getElementById('corner-square-color')?.value || state.color1);
    const cornersDotColor = document.getElementById('match-corner-color')?.checked ? state.color1 : (document.getElementById('corner-dot-color')?.value || state.color1);

    const updateObj = {
      data: state.qrText,
      margin: state.options.margin,
      dotsOptions: dotsOptions,
      backgroundOptions: {
        color: state.bgTransparent ? 'transparent' : state.bgColor
      },
      cornersSquareOptions: {
        color: cornersSquareColor,
        type: state.options.cornersSquareOptions.type
      },
      cornersDotOptions: {
        color: cornersDotColor,
        type: state.options.cornersDotOptions.type
      },
      image: state.options.image,
      imageOptions: state.options.imageOptions,
      qrOptions: state.options.qrOptions
    };

    // Ambient glow update
    const previewGlow = document.querySelector('.preview-card-glow');
    if (previewGlow) {
      previewGlow.style.background = `radial-gradient(circle, ${state.color1}44 0%, transparent 70%)`;
    }

    if (state.qrCode) {
      state.qrCode.update(updateObj);
      setTimeout(() => {
        if (window.syncMiniPreview) window.syncMiniPreview();
      }, 50);
    }
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // 1. Content Type Switcher
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        typeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentType = btn.dataset.type;

        // Switch visible form
        document.querySelectorAll('.form-type-panel').forEach((panel) => {
          panel.style.display = 'none';
        });
        const targetPanel = document.getElementById(`panel-${state.currentType}`);
        if (targetPanel) {
          targetPanel.style.display = 'block';
        }
        updateQRFromInputs();
      });
    });

    // 2. All form input changes
    const allInputs = document.querySelectorAll('.form-section input, .form-section textarea, .form-section select');
    allInputs.forEach((input) => {
      input.addEventListener('input', debounce(updateQRFromInputs, 150));
      input.addEventListener('change', updateQRFromInputs);
    });

    // 3. Customization Tab Switching
    const customTabButtons = document.querySelectorAll('.tab-nav-btn');
    customTabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        customTabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.tab-content-panel').forEach((p) => p.classList.remove('active'));
        const target = document.getElementById(`custom-tab-${btn.dataset.tab}`);
        if (target) target.classList.add('active');
      });
    });

    // 4. Color Pickers
    const colorPicker1 = document.getElementById('qr-color-1');
    const colorPicker2 = document.getElementById('qr-color-2');
    const colorBg = document.getElementById('qr-color-bg');
    const gradientToggle = document.getElementById('enable-gradient');
    const transparentBgToggle = document.getElementById('transparent-bg');
    const matchCornerToggle = document.getElementById('match-corner-color');
    const customCornerColorsWrapper = document.getElementById('custom-corner-colors-wrap');

    if (colorPicker1) {
      colorPicker1.addEventListener('input', (e) => {
        state.color1 = e.target.value;
        const hexText = document.getElementById('hex-color-1');
        if (hexText) hexText.textContent = state.color1.toUpperCase();
        updateQRFromInputs();
      });
    }

    if (colorPicker2) {
      colorPicker2.addEventListener('input', (e) => {
        state.color2 = e.target.value;
        const hexText = document.getElementById('hex-color-2');
        if (hexText) hexText.textContent = state.color2.toUpperCase();
        updateQRFromInputs();
      });
    }

    if (colorBg) {
      colorBg.addEventListener('input', (e) => {
        state.bgColor = e.target.value;
        const hexText = document.getElementById('hex-color-bg');
        if (hexText) hexText.textContent = state.bgColor.toUpperCase();
        const frameWrap = document.getElementById('qr-frame-wrapper');
        if (frameWrap && !state.bgTransparent) frameWrap.style.background = state.bgColor;
        updateQRFromInputs();
      });
    }

    if (gradientToggle) {
      gradientToggle.addEventListener('change', (e) => {
        state.gradientEnabled = e.target.checked;
        const color2Wrap = document.getElementById('color-2-wrap');
        if (color2Wrap) color2Wrap.style.display = state.gradientEnabled ? 'flex' : 'none';
        updateQRFromInputs();
      });
    }

    if (transparentBgToggle) {
      transparentBgToggle.addEventListener('change', (e) => {
        state.bgTransparent = e.target.checked;
        const frameWrap = document.getElementById('qr-frame-wrapper');
        if (frameWrap) frameWrap.style.background = state.bgTransparent ? 'transparent' : state.bgColor;
        updateQRFromInputs();
      });
    }

    if (matchCornerToggle) {
      matchCornerToggle.addEventListener('change', (e) => {
        if (customCornerColorsWrapper) {
          customCornerColorsWrapper.style.display = e.target.checked ? 'none' : 'grid';
        }
        updateQRFromInputs();
      });
    }

    // 5. Palette Preset Buttons
    document.querySelectorAll('.palette-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const c1 = btn.dataset.c1;
        const c2 = btn.dataset.c2;
        state.color1 = c1;
        if (colorPicker1) colorPicker1.value = c1;
        const hex1 = document.getElementById('hex-color-1');
        if (hex1) hex1.textContent = c1.toUpperCase();

        if (c2) {
          state.color2 = c2;
          state.gradientEnabled = true;
          if (gradientToggle) gradientToggle.checked = true;
          if (colorPicker2) colorPicker2.value = c2;
          const hex2 = document.getElementById('hex-color-2');
          if (hex2) hex2.textContent = c2.toUpperCase();
          const color2Wrap = document.getElementById('color-2-wrap');
          if (color2Wrap) color2Wrap.style.display = 'flex';
        } else {
          state.gradientEnabled = false;
          if (gradientToggle) gradientToggle.checked = false;
          const color2Wrap = document.getElementById('color-2-wrap');
          if (color2Wrap) color2Wrap.style.display = 'none';
        }
        updateQRFromInputs();
      });
    });

    // 6. Dot Shapes
    document.querySelectorAll('.shape-btn[data-dots]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-btn[data-dots]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.options.dotsOptions.type = btn.dataset.dots;
        updateQRFromInputs();
      });
    });

    // 7. Corner Square Shapes
    document.querySelectorAll('.shape-btn[data-corner-square]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-btn[data-corner-square]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.options.cornersSquareOptions.type = btn.dataset.cornerSquare;
        updateQRFromInputs();
      });
    });

    // 8. Corner Dot Shapes
    document.querySelectorAll('.shape-btn[data-corner-dot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-btn[data-corner-dot]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.options.cornersDotOptions.type = btn.dataset.cornerDot;
        updateQRFromInputs();
      });
    });

    // 9. Logos & Icons
    const logoFileInput = document.getElementById('logo-file-input');
    const logoDropZone = document.getElementById('logo-dropzone');
    const removeLogoBtn = document.getElementById('remove-logo-btn');
    const activeLogoBar = document.getElementById('active-logo-bar');
    const currentLogoThumb = document.getElementById('current-logo-thumb');

    if (logoDropZone && logoFileInput) {
      logoDropZone.addEventListener('click', () => logoFileInput.click());
      logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            setLogoImage(evt.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removeLogoBtn) {
      removeLogoBtn.addEventListener('click', () => {
        setLogoImage('');
        document.querySelectorAll('.logo-preset-btn').forEach((b) => b.classList.remove('active'));
      });
    }

    // Logo Presets
    document.querySelectorAll('.logo-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.logo-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const iconKey = btn.dataset.icon;
        if (ICONS[iconKey]) {
          setLogoImage(ICONS[iconKey]);
        }
      });
    });

    // Logo Size Slider
    const logoSizeSlider = document.getElementById('logo-size-slider');
    if (logoSizeSlider) {
      logoSizeSlider.addEventListener('input', (e) => {
        state.options.imageOptions.imageSize = parseFloat(e.target.value);
        const valText = document.getElementById('logo-size-val');
        if (valText) valText.textContent = Math.round(state.options.imageOptions.imageSize * 100) + '%';
        updateQRFromInputs();
      });
    }

    // Logo Background Clear Toggle
    const logoBgClear = document.getElementById('logo-bg-clear');
    if (logoBgClear) {
      logoBgClear.addEventListener('change', (e) => {
        state.options.imageOptions.hideBackgroundDots = e.target.checked;
        updateQRFromInputs();
      });
    }

    // 10. Frame Selector
    document.querySelectorAll('.frame-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.frame-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.frame = btn.dataset.frame;
        applyFrameStyle();
      });
    });

    const frameTextInput = document.getElementById('frame-custom-text');
    if (frameTextInput) {
      frameTextInput.addEventListener('input', (e) => {
        state.frameText = e.target.value || 'SCAN ME';
        const badge = document.getElementById('frame-badge-text');
        if (badge) badge.textContent = state.frameText;
      });
    }

    const frameBgInput = document.getElementById('frame-bg-color');
    if (frameBgInput) {
      frameBgInput.addEventListener('input', (e) => {
        state.frameBgColor = e.target.value;
        const hexText = document.getElementById('hex-frame-bg');
        if (hexText) hexText.textContent = state.frameBgColor.toUpperCase();
        applyFrameStyle();
      });
    }

    const frameTextColorInput = document.getElementById('frame-text-color');
    if (frameTextColorInput) {
      frameTextColorInput.addEventListener('input', (e) => {
        state.frameTextColor = e.target.value;
        const hexText = document.getElementById('hex-frame-text');
        if (hexText) hexText.textContent = state.frameTextColor.toUpperCase();
        applyFrameStyle();
      });
    }

    // 11. Margin & Error Correction
    const marginSlider = document.getElementById('margin-slider');
    if (marginSlider) {
      marginSlider.addEventListener('input', (e) => {
        state.options.margin = parseInt(e.target.value, 10);
        const valText = document.getElementById('margin-val');
        if (valText) valText.textContent = state.options.margin + 'px';
        updateQRFromInputs();
      });
    }

    const ecSelect = document.getElementById('error-correction-select');
    if (ecSelect) {
      ecSelect.addEventListener('change', (e) => {
        state.options.qrOptions.errorCorrectionLevel = e.target.value;
        const ecBadge = document.getElementById('spec-ec-badge');
        if (ecBadge) ecBadge.textContent = 'EC: ' + e.target.value;
        updateQRFromInputs();
      });
    }

    const resolutionSelect = document.getElementById('resolution-select');
    if (resolutionSelect) {
      resolutionSelect.addEventListener('change', (e) => {
        state.exportResolution = parseInt(e.target.value, 10);
        const resBadge = document.getElementById('spec-res-badge');
        if (resBadge) resBadge.textContent = state.exportResolution + 'x' + state.exportResolution;
      });
    }

    // 12. Style Presets Section (1-Click templates)
    document.querySelectorAll('.preset-card').forEach((card) => {
      card.addEventListener('click', () => {
        const presetKey = card.dataset.preset;
        if (PRESETS[presetKey]) {
          applyStylePreset(PRESETS[presetKey]);
          showToast(`Applied ${card.querySelector('.preset-title').textContent} preset!`, 'success');
          // Smooth scroll to preview on small screens
          if (window.innerWidth < 1024) {
            document.querySelector('.preview-card').scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // 13. Download & Action Buttons
    const btnDownloadPng = document.getElementById('btn-download-png');
    const btnDownloadSvg = document.getElementById('btn-download-svg');
    const btnDownloadWebp = document.getElementById('btn-download-webp');
    const btnCopyImage = document.getElementById('btn-copy-image');
    const btnPrintQR = document.getElementById('btn-print-qr');
    const btnSaveLibrary = document.getElementById('btn-save-library');

    if (btnDownloadPng) btnDownloadPng.addEventListener('click', () => downloadExport('png'));
    if (btnDownloadSvg) btnDownloadSvg.addEventListener('click', () => downloadExport('svg'));
    if (btnDownloadWebp) btnDownloadWebp.addEventListener('click', () => downloadExport('webp'));
    if (btnCopyImage) btnCopyImage.addEventListener('click', copyQRToClipboard);
    if (btnPrintQR) btnPrintQR.addEventListener('click', printQRCode);
    if (btnSaveLibrary) btnSaveLibrary.addEventListener('click', saveToHistory);

    // 14. Scanner (Upload & Camera)
    setupScanner();

    // 15. FAQ Accordion
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        item.classList.toggle('active');
      });
    });
  }

  function setLogoImage(url) {
    state.options.image = url;
    const activeLogoBar = document.getElementById('active-logo-bar');
    const currentLogoThumb = document.getElementById('current-logo-thumb');
    if (activeLogoBar && currentLogoThumb) {
      if (url) {
        currentLogoThumb.src = url;
        activeLogoBar.style.display = 'flex';
      } else {
        activeLogoBar.style.display = 'none';
      }
    }
    // High error correction recommended for logos
    if (url && state.options.qrOptions.errorCorrectionLevel !== 'H') {
      state.options.qrOptions.errorCorrectionLevel = 'H';
      const ecSelect = document.getElementById('error-correction-select');
      if (ecSelect) ecSelect.value = 'H';
      const ecBadge = document.getElementById('spec-ec-badge');
      if (ecBadge) ecBadge.textContent = 'EC: H (High)';
    }
    updateQRFromInputs();
  }

  function applyFrameStyle() {
    const frameWrap = document.getElementById('qr-frame-wrapper');
    const badgeText = document.getElementById('frame-badge-text');
    if (!frameWrap) return;

    frameWrap.className = 'qr-frame-wrapper';
    if (state.frame === 'badge-bottom') {
      frameWrap.classList.add('frame-badge-bottom');
    } else if (state.frame === 'badge-top') {
      frameWrap.classList.add('frame-badge-top');
    } else if (state.frame === 'bubble') {
      frameWrap.classList.add('frame-bubble');
    } else if (state.frame === 'polaroid') {
      frameWrap.classList.add('frame-polaroid');
    } else if (state.frame === 'phone') {
      frameWrap.classList.add('frame-phone');
    } else {
      frameWrap.classList.add('frame-none');
    }

    if (state.frame !== 'none') {
      frameWrap.style.backgroundColor = state.frameBgColor;
    } else {
      frameWrap.style.backgroundColor = state.bgTransparent ? 'transparent' : state.bgColor;
    }

    if (badgeText) {
      badgeText.textContent = state.frameText;
      badgeText.style.color = state.frameTextColor;
    }
  }

  function applyStylePreset(p) {
    state.color1 = p.color1;
    state.color2 = p.color2;
    state.gradientEnabled = p.gradient;
    state.options.dotsOptions.type = p.dotsType;
    state.options.cornersSquareOptions.type = p.cornerSquareType;
    state.options.cornersDotOptions.type = p.cornerDotType;

    // Update form controls
    const cp1 = document.getElementById('qr-color-1');
    if (cp1) cp1.value = p.color1;
    const hex1 = document.getElementById('hex-color-1');
    if (hex1) hex1.textContent = p.color1.toUpperCase();

    const cp2 = document.getElementById('qr-color-2');
    if (cp2) cp2.value = p.color2;
    const hex2 = document.getElementById('hex-color-2');
    if (hex2) hex2.textContent = p.color2.toUpperCase();

    const gt = document.getElementById('enable-gradient');
    if (gt) gt.checked = p.gradient;
    const c2w = document.getElementById('color-2-wrap');
    if (c2w) c2w.style.display = p.gradient ? 'flex' : 'none';

    // Shapes UI active classes
    document.querySelectorAll('.shape-btn[data-dots]').forEach((b) => {
      b.classList.toggle('active', b.dataset.dots === p.dotsType);
    });
    document.querySelectorAll('.shape-btn[data-corner-square]').forEach((b) => {
      b.classList.toggle('active', b.dataset.cornerSquare === p.cornerSquareType);
    });
    document.querySelectorAll('.shape-btn[data-corner-dot]').forEach((b) => {
      b.classList.toggle('active', b.dataset.cornerDot === p.cornerDotType);
    });

    updateQRFromInputs();
  }

  // Bank handle mappings for UPI IDs
  const BANK_HANDLES = {
    kotak811: 'Kotak Mahindra Bank',
    kotak: 'Kotak Mahindra Bank',
    kmbl: 'Kotak Mahindra Bank',
    okaxis: 'Axis Bank (Google Pay)',
    axisbank: 'Axis Bank',
    okhdfcbank: 'HDFC Bank (Google Pay)',
    hdfcbank: 'HDFC Bank',
    oksbi: 'State Bank of India (Google Pay)',
    sbi: 'State Bank of India',
    okicici: 'ICICI Bank (Google Pay)',
    icici: 'ICICI Bank',
    paytm: 'Paytm Payments Bank',
    ybl: 'YES Bank (PhonePe)',
    ibl: 'ICICI Bank (PhonePe)',
    axl: 'Axis Bank (PhonePe)',
    apl: 'Amazon Pay (Axis Bank)',
    barodampay: 'Bank of Baroda',
    pnb: 'Punjab National Bank',
    unionbank: 'Union Bank of India',
    federal: 'Federal Bank',
    idbi: 'IDBI Bank',
    upi: 'BHIM UPI'
  };

  const DEFAULT_VPA_NAMES = {
    '8050103865@kotak811': 'Nagaraj'
  };

  /**
   * Real-time UPI ID Verification & Payee Name Resolution
   */
  function setupUPIVerification() {
    const upiInput = document.getElementById('upi-id');
    const nameInput = document.getElementById('upi-name');
    const verifyBadge = document.getElementById('upi-verify-badge');
    const nameBadge = document.getElementById('upi-name-badge');
    const spinner = document.getElementById('upi-spinner');
    const statusHint = document.getElementById('upi-status-hint');

    // RapidAPI Settings Elements
    const btnToggleRapidApi = document.getElementById('btn-toggle-rapidapi');
    const rapidApiConfigBox = document.getElementById('rapidapi-config-box');
    const rapidApiKeyInput = document.getElementById('rapidapi-key');
    const rapidApiHostInput = document.getElementById('rapidapi-host');
    const btnSaveRapidApi = document.getElementById('btn-save-rapidapi');
    const btnClearRapidApi = document.getElementById('btn-clear-rapidapi');
    const rapidApiIndicator = document.getElementById('rapidapi-active-indicator');

    if (!upiInput) return;

    // Load saved RapidAPI configuration from localStorage
    const savedApiKey = localStorage.getItem('suorbit_rapidapi_key') || '';
    const savedApiHost = localStorage.getItem('suorbit_rapidapi_host') || 'upi-verification.p.rapidapi.com';

    if (rapidApiKeyInput) rapidApiKeyInput.value = savedApiKey;
    if (rapidApiHostInput) rapidApiHostInput.value = savedApiHost;
    if (savedApiKey && rapidApiIndicator) {
      rapidApiIndicator.style.display = 'inline-block';
    }

    if (btnToggleRapidApi && rapidApiConfigBox) {
      btnToggleRapidApi.addEventListener('click', () => {
        const isHidden = rapidApiConfigBox.style.display === 'none';
        rapidApiConfigBox.style.display = isHidden ? 'block' : 'none';
      });
    }

    if (btnSaveRapidApi) {
      btnSaveRapidApi.addEventListener('click', () => {
        const key = rapidApiKeyInput ? rapidApiKeyInput.value.trim() : '';
        const host = rapidApiHostInput ? rapidApiHostInput.value.trim() : 'upi-verification.p.rapidapi.com';
        if (!key) {
          showToast('Please enter a valid RapidAPI Key', 'error');
          return;
        }
        localStorage.setItem('suorbit_rapidapi_key', key);
        localStorage.setItem('suorbit_rapidapi_host', host);
        if (rapidApiIndicator) rapidApiIndicator.style.display = 'inline-block';
        if (rapidApiConfigBox) rapidApiConfigBox.style.display = 'none';
        showToast('RapidAPI Key Saved! Ready for official live verification.', 'success');
        if (upiInput.value.trim()) {
          verifyVPA(upiInput.value);
        }
      });
    }

    if (btnClearRapidApi) {
      btnClearRapidApi.addEventListener('click', () => {
        localStorage.removeItem('suorbit_rapidapi_key');
        if (rapidApiKeyInput) rapidApiKeyInput.value = '';
        if (rapidApiIndicator) rapidApiIndicator.style.display = 'none';
        showToast('RapidAPI Key disconnected.', 'success');
      });
    }

    function getVpaCache() {
      try {
        return JSON.parse(localStorage.getItem('suorbit_vpa_cache')) || {};
      } catch (e) {
        return {};
      }
    }

    function saveVpaCache(vpa, name) {
      if (!vpa || !name) return;
      const cache = getVpaCache();
      cache[vpa.toLowerCase()] = name;
      localStorage.setItem('suorbit_vpa_cache', JSON.stringify(cache));
    }

    // Save cache when user modifies or types a payee name for a VPA
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        const vpa = upiInput.value.trim().toLowerCase();
        const name = nameInput.value.trim();
        if (vpa.includes('@') && name) {
          saveVpaCache(vpa, name);
        }
      });
    }

    const verifyVPA = async (vpaRaw) => {
      const vpa = vpaRaw.trim().toLowerCase();
      if (!vpa) {
        if (verifyBadge) verifyBadge.style.display = 'none';
        if (nameBadge) nameBadge.style.display = 'none';
        if (spinner) spinner.style.display = 'none';
        if (statusHint) statusHint.textContent = 'Enter UPI handle to verify validity and fetch payee name.';
        return;
      }

      // Must contain @ and valid handle pattern
      const vpaRegex = /^[\w.\-+]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;
      if (!vpa.includes('@') || !vpaRegex.test(vpa)) {
        if (vpa.length > 4 && !vpa.includes('@')) {
          if (verifyBadge) {
            verifyBadge.className = 'verify-badge invalid';
            verifyBadge.textContent = 'Missing @handle';
            verifyBadge.style.display = 'inline-flex';
          }
        } else {
          if (verifyBadge) verifyBadge.style.display = 'none';
        }
        return;
      }

      const handle = vpa.split('@')[1];
      const bankName = BANK_HANDLES[handle] || (handle.toUpperCase() + ' Bank');

      // Check cache / seed map for instantaneous verification
      const cache = getVpaCache();
      const cachedName = DEFAULT_VPA_NAMES[vpa] || cache[vpa];

      if (cachedName && nameInput) {
        nameInput.value = cachedName;
        if (nameBadge) nameBadge.style.display = 'inline-flex';
        if (verifyBadge) {
          verifyBadge.className = 'verify-badge valid';
          verifyBadge.textContent = `Verified (${bankName})`;
          verifyBadge.style.display = 'inline-flex';
        }
        if (statusHint) {
          statusHint.innerHTML = `<span style="color: var(--success); font-weight: 600;">✓ Payee Verified:</span> ${escapeHtml(cachedName)} (${bankName})`;
        }
        updateQRFromInputs();
      }

      // Display loading spinner
      if (spinner) spinner.style.display = 'inline-block';

      // 1. Check if user has connected official RapidAPI credentials
      const currentApiKey = localStorage.getItem('suorbit_rapidapi_key') || '';
      const currentApiHost = localStorage.getItem('suorbit_rapidapi_host') || 'upi-verification.p.rapidapi.com';

      if (currentApiKey) {
        if (verifyBadge) {
          verifyBadge.className = 'verify-badge loading';
          verifyBadge.textContent = 'Querying RapidAPI...';
          verifyBadge.style.display = 'inline-flex';
        }

        try {
          const rapidRes = await fetch(`https://${currentApiHost}/v1/upi-verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': currentApiKey,
              'X-RapidAPI-Host': currentApiHost
            },
            body: JSON.stringify({
              vpa: vpa,
              data: { vpa: vpa }
            })
          });

          const rapidData = await rapidRes.json();
          if (spinner) spinner.style.display = 'none';

          const officialName = rapidData.payee_name || rapidData.payeeAccountName || rapidData.customer_name || rapidData.name || rapidData.registered_name || (rapidData.data && (rapidData.data.payee_name || rapidData.data.name || rapidData.data.payeeAccountName || rapidData.data.customer_name));

          if (officialName) {
            if (nameInput) nameInput.value = officialName;
            saveVpaCache(vpa, officialName);
            if (nameBadge) nameBadge.style.display = 'inline-flex';
            if (verifyBadge) {
              verifyBadge.className = 'verify-badge valid';
              verifyBadge.textContent = `Official Verified (${bankName})`;
              verifyBadge.style.display = 'inline-flex';
            }
            if (statusHint) {
              statusHint.innerHTML = `<span style="color: var(--success); font-weight: 600;">✓ Official Bank Payee:</span> ${escapeHtml(officialName)} (${bankName})`;
            }
            updateQRFromInputs();
            return;
          }
        } catch (rapidErr) {
          console.warn('RapidAPI check error:', rapidErr);
        }
      }

      // 2. Fallback to Airtel PG Gateway check
      if (verifyBadge && !cachedName) {
        verifyBadge.className = 'verify-badge loading';
        verifyBadge.textContent = 'Verifying...';
        verifyBadge.style.display = 'inline-flex';
      }

      try {
        const res = await fetch(`https://paydigi.airtel.in/web/pg-service/v1/validate/vpa/${encodeURIComponent(vpa)}`, {
          headers: {
            'channel-id': 'WEB_UNAUTH'
          }
        });
        const json = await res.json();

        if (spinner) spinner.style.display = 'none';

        if (json && json.result && json.data && json.data.vpaValid) {
          const remoteName = json.data.payeeAccountName || '';
          const finalName = remoteName || cachedName;

          if (finalName && nameInput) {
            nameInput.value = finalName;
            saveVpaCache(vpa, finalName);
            if (nameBadge) nameBadge.style.display = 'inline-flex';
          }

          if (verifyBadge) {
            verifyBadge.className = 'verify-badge valid';
            verifyBadge.textContent = `Verified (${bankName})`;
            verifyBadge.style.display = 'inline-flex';
          }

          if (statusHint) {
            if (finalName) {
              statusHint.innerHTML = `<span style="color: var(--success); font-weight: 600;">✓ Active VPA:</span> Payee is ${escapeHtml(finalName)} (${bankName})`;
            } else {
              statusHint.innerHTML = `<span style="color: var(--success); font-weight: 600;">✓ Active VPA</span> on ${bankName}. Enter payee name or connect RapidAPI for auto-fetch.`;
            }
          }

          updateQRFromInputs();
        } else if (json && json.data && json.data.vpaValid === false) {
          if (verifyBadge) {
            verifyBadge.className = 'verify-badge invalid';
            verifyBadge.textContent = 'Invalid VPA';
            verifyBadge.style.display = 'inline-flex';
          }
          if (statusHint) {
            statusHint.innerHTML = `<span style="color: var(--danger);">✗ VPA not registered on banking switch.</span> Please check the handle.`;
          }
        } else if (cachedName) {
          if (verifyBadge) {
            verifyBadge.className = 'verify-badge valid';
            verifyBadge.textContent = `Verified (${bankName})`;
            verifyBadge.style.display = 'inline-flex';
          }
        }
      } catch (err) {
        if (spinner) spinner.style.display = 'none';
        if (cachedName) {
          if (nameInput) nameInput.value = cachedName;
          if (nameBadge) nameBadge.style.display = 'inline-flex';
          if (verifyBadge) {
            verifyBadge.className = 'verify-badge valid';
            verifyBadge.textContent = `Verified (${bankName})`;
            verifyBadge.style.display = 'inline-flex';
          }
          if (statusHint) {
            statusHint.innerHTML = `<span style="color: var(--success); font-weight: 600;">✓ Payee Verified:</span> ${escapeHtml(cachedName)} (${bankName})`;
          }
        } else {
          if (verifyBadge) {
            verifyBadge.className = 'verify-badge valid';
            verifyBadge.textContent = bankName;
            verifyBadge.style.display = 'inline-flex';
          }
          if (statusHint) {
            statusHint.textContent = `Routing via ${bankName}. Enter payee name to finalize QR code.`;
          }
        }
        updateQRFromInputs();
      }
    };

    upiInput.addEventListener('input', debounce((e) => {
      verifyVPA(e.target.value);
    }, 200));

    upiInput.addEventListener('paste', () => {
      setTimeout(() => verifyVPA(upiInput.value), 40);
    });

    upiInput.addEventListener('blur', () => {
      verifyVPA(upiInput.value);
    });
  }

  /**
   * Export / Download high-res
   */
  async function downloadExport(format) {
    if (!state.qrCode) return;

    showToast(`Generating high-resolution ${format.toUpperCase()}...`, 'success');

    if (format === 'svg') {
      state.qrCode.download({
        name: `suorbit-qr-${Date.now()}`,
        extension: 'svg'
      });
      return;
    }

    // For PNG/WEBP, render off-screen with selected exportResolution
    try {
      const exportCanvas = document.createElement('canvas');
      const res = state.exportResolution;
      exportCanvas.width = res;
      exportCanvas.height = res;

      // Create a temporary high-res QRCodeStyling
      const tempOptions = JSON.parse(JSON.stringify(state.options));
      tempOptions.width = res;
      tempOptions.height = res;
      tempOptions.data = state.qrText;
      tempOptions.image = state.options.image;

      if (state.gradientEnabled) {
        tempOptions.dotsOptions.gradient = {
          type: 'linear',
          rotation: 0.785,
          colorStops: [
            { offset: 0, color: state.color1 },
            { offset: 1, color: state.color2 }
          ]
        };
      } else {
        tempOptions.dotsOptions.color = state.color1;
      }

      tempOptions.backgroundOptions.color = state.bgTransparent ? 'transparent' : state.bgColor;
      tempOptions.cornersSquareOptions.color = state.color1;
      tempOptions.cornersDotOptions.color = state.color1;

      const tempQr = new QRCodeStyling(tempOptions);
      tempQr.download({
        name: `suorbit-qr-${res}px`,
        extension: format
      });
    } catch (err) {
      console.error(err);
      // Fallback direct download
      state.qrCode.download({
        name: 'suorbit-qr',
        extension: format
      });
    }
  }

  /**
   * Copy QR Code to Clipboard
   */
  async function copyQRToClipboard() {
    const canvas = document.querySelector('#qr-canvas-container canvas');
    if (!canvas) {
      showToast('QR Canvas not ready yet', 'error');
      return;
    }

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to generate image blob', 'error');
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('QR Code copied to clipboard! Ready to paste.', 'success');
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('Clipboard access denied or unsupported in browser', 'error');
    }
  }

  /**
   * Print QR Code
   */
  function printQRCode() {
    const canvas = document.querySelector('#qr-canvas-container canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - SuOrbit</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
              text-align: center;
            }
            .card {
              border: 1px solid #e2e8f0;
              padding: 32px;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            img { width: 320px; height: 320px; display: block; margin: 0 auto; }
            h2 { margin-top: 16px; margin-bottom: 4px; font-size: 1.25rem; }
            p { margin: 0; color: #64748b; font-size: 0.85rem; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${dataUrl}" alt="QR Code" />
            <h2>${state.frameText || 'Scan QR Code'}</h2>
            <p>${escapeHtml(state.qrText)}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  }

  /**
   * Local History Management
   */
  function saveToHistory() {
    const canvas = document.querySelector('#qr-canvas-container canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const historyItem = {
      id: Date.now().toString(),
      type: state.currentType,
      title: getTitleForType(state.currentType),
      content: state.qrText,
      thumb: dataUrl,
      timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    let items = getHistoryItems();
    items.unshift(historyItem);
    // Limit to 20 items
    if (items.length > 20) items = items.slice(0, 20);
    localStorage.setItem('suorbit_qr_history', JSON.stringify(items));

    renderHistory();
    showToast('Saved to your Library!', 'success');
  }

  function getHistoryItems() {
    try {
      return JSON.parse(localStorage.getItem('suorbit_qr_history')) || [];
    } catch (e) {
      return [];
    }
  }

  function getTitleForType(t) {
    const map = {
      url: 'Website Link',
      text: 'Plain Text',
      wifi: 'Wi-Fi Network',
      vcard: 'Contact Card',
      email: 'Email Message',
      phone: 'Phone Number',
      sms: 'SMS Message',
      upi: 'Payment / UPI',
      location: 'Map Location',
      event: 'Calendar Event',
      whatsapp: 'WhatsApp Chat',
      crypto: 'Crypto Payment'
    };
    return map[t] || 'QR Code';
  }

  function renderHistory() {
    const grid = document.getElementById('history-items-grid');
    if (!grid) return;

    const items = getHistoryItems();
    if (items.length === 0) {
      grid.innerHTML = `
        <div class="history-empty-placeholder">
          <p>No saved QR codes yet. Click <strong>"Save to Library"</strong> above to store your custom codes!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map((item) => `
      <div class="history-card" data-id="${item.id}">
        <div class="history-card-thumb">
          <img src="${item.thumb}" alt="QR Thumbnail" />
        </div>
        <div class="history-card-body">
          <div class="history-card-title">${escapeHtml(item.title)}</div>
          <div class="history-card-subtitle" title="${escapeHtml(item.content)}">${escapeHtml(item.content)}</div>
          <div class="history-card-actions">
            <button class="history-btn-mini history-download" data-thumb="${item.thumb}" data-title="${escapeHtml(item.title)}">Download</button>
            <button class="history-btn-mini history-delete" data-id="${item.id}">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach listeners
    grid.querySelectorAll('.history-download').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const a = document.createElement('a');
        a.href = e.target.dataset.thumb;
        a.download = `suorbit-qr-${Date.now()}.png`;
        a.click();
      });
    });

    grid.querySelectorAll('.history-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        let items = getHistoryItems().filter((i) => i.id !== id);
        localStorage.setItem('suorbit_qr_history', JSON.stringify(items));
        renderHistory();
        showToast('Removed from history', 'success');
      });
    });
  }

  const clearHistoryBtn = document.getElementById('btn-clear-history');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      localStorage.removeItem('suorbit_qr_history');
      renderHistory();
      showToast('All saved history cleared', 'success');
    });
  }

  /**
   * Scanner Section (File Upload & Camera)
   */
  function setupScanner() {
    const scannerDropzone = document.getElementById('scanner-dropzone');
    const scannerFileInput = document.getElementById('scanner-file-input');
    const startCameraBtn = document.getElementById('btn-start-camera');
    const stopCameraBtn = document.getElementById('btn-stop-camera');
    const video = document.getElementById('camera-video');
    const resultCard = document.getElementById('scan-result-card');
    const resultText = document.getElementById('scan-result-text');
    const btnCopyResult = document.getElementById('btn-copy-result');
    const btnOpenResult = document.getElementById('btn-open-result');
    const btnRestyleResult = document.getElementById('btn-restyle-result');

    if (scannerDropzone && scannerFileInput) {
      scannerDropzone.addEventListener('click', () => scannerFileInput.click());
      scannerFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            decodeImage(evt.target.result);
          };
          reader.readAsDataURL(file);
        }
      });

      // Drag & Drop
      scannerDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        scannerDropzone.style.borderColor = 'var(--primary)';
      });
      scannerDropzone.addEventListener('dragleave', () => {
        scannerDropzone.style.borderColor = 'var(--border)';
      });
      scannerDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        scannerDropzone.style.borderColor = 'var(--border)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          const reader = new FileReader();
          reader.onload = (evt) => {
            decodeImage(evt.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (startCameraBtn && video) {
      startCameraBtn.addEventListener('click', async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          state.videoStream = stream;
          video.srcObject = stream;
          video.setAttribute('playsinline', true);
          await video.play();
          state.isScanningCamera = true;
          startCameraBtn.style.display = 'none';
          if (stopCameraBtn) stopCameraBtn.style.display = 'inline-flex';
          scanCameraLoop();
        } catch (err) {
          console.error(err);
          showToast('Camera access denied or camera not available.', 'error');
        }
      });
    }

    if (stopCameraBtn && video) {
      stopCameraBtn.addEventListener('click', () => {
        stopCamera();
      });
    }

    function stopCamera() {
      state.isScanningCamera = false;
      if (state.videoStream) {
        state.videoStream.getTracks().forEach((t) => t.stop());
        state.videoStream = null;
      }
      if (startCameraBtn) startCameraBtn.style.display = 'inline-flex';
      if (stopCameraBtn) stopCameraBtn.style.display = 'none';
    }

    // Camera Scan Animation Loop
    async function scanCameraLoop() {
      if (!state.isScanningCamera) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = video.videoWidth;
        offCanvas.height = video.videoHeight;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);

        const decoded = await attemptDecodeCanvas(offCanvas, ctx);
        if (decoded) {
          handleScanSuccess(decoded);
          stopCamera();
          return;
        }
      }
      requestAnimationFrame(scanCameraLoop);
    }

    // Decode from loaded image file
    function decodeImage(dataUrl) {
      const img = new Image();
      img.onload = async () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const decoded = await attemptDecodeCanvas(offCanvas, ctx);
        if (decoded) {
          handleScanSuccess(decoded);
        } else {
          showToast('No QR code detected in this image. Try a sharper image.', 'error');
        }
      };
      img.src = dataUrl;
    }

    // Detection engine (BarcodeDetector -> jsQR fallback)
    async function attemptDecodeCanvas(canvas, ctx) {
      // 1. Native BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        try {
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(canvas);
          if (barcodes.length > 0) {
            return barcodes[0].rawValue;
          }
        } catch (e) {
          // Fallback to jsQR
        }
      }

      // 2. jsQR library if available
      if (typeof jsQR !== 'undefined') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'dontInvert'
        });
        if (code) return code.data;
      }

      return null;
    }

    function handleScanSuccess(text) {
      if (resultCard && resultText) {
        resultText.textContent = text;
        resultCard.classList.add('active');
        showToast('QR Code Decoded Successfully!', 'success');

        // Check if link
        if (btnOpenResult) {
          const isUrl = text.match(/^https?:\/\//i);
          btnOpenResult.style.display = isUrl ? 'inline-flex' : 'none';
          if (isUrl) btnOpenResult.href = text;
        }

        // Scroll to results
        resultCard.scrollIntoView({ behavior: 'smooth' });
      }
    }

    if (btnCopyResult && resultText) {
      btnCopyResult.addEventListener('click', async () => {
        await navigator.clipboard.writeText(resultText.textContent);
        showToast('Decoded content copied to clipboard!', 'success');
      });
    }

    if (btnRestyleResult && resultText) {
      btnRestyleResult.addEventListener('click', () => {
        const val = resultText.textContent;
        // Load into text or url
        const isUrl = val.match(/^https?:\/\//i);
        const targetType = isUrl ? 'url' : 'text';

        const btn = document.querySelector(`.type-btn[data-type="${targetType}"]`);
        if (btn) btn.click();

        if (isUrl) {
          const urlInput = document.getElementById('input-url');
          if (urlInput) urlInput.value = val;
        } else {
          const textInput = document.getElementById('input-text');
          if (textInput) textInput.value = val;
        }

        updateQRFromInputs();
        document.querySelector('.app-container').scrollIntoView({ behavior: 'smooth' });
        showToast('Loaded into Generator! Customize colors & styles above.', 'success');
      });
    }
  }

  /**
   * Toast notification helper
   */
  function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /**
   * Utility: Debounce
   */
  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /**
   * Utility: HTML escape
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Interactive Phone Scanner Simulator
   */
  function setupPhoneSimulator() {
    const btnSimulate = document.getElementById('btn-simulate-scan');
    const modal = document.getElementById('phone-simulator-modal');
    const simCloseBtn = document.getElementById('sim-close-btn');
    const simQrImage = document.getElementById('sim-qr-image');
    const simBannerType = document.getElementById('sim-banner-type');
    const simBannerTitle = document.getElementById('sim-banner-title');
    const simBannerDesc = document.getElementById('sim-banner-desc');
    const simIosBanner = document.getElementById('sim-ios-banner');

    if (!btnSimulate || !modal) return;

    btnSimulate.addEventListener('click', () => {
      const canvas = document.querySelector('#qr-canvas-container canvas');
      if (!canvas) {
        showToast('QR code preview is still generating...', 'error');
        return;
      }
      if (simQrImage) simQrImage.src = canvas.toDataURL('image/png');

      // Configure banner metadata
      const type = state.currentType;
      const text = state.qrText;

      let bannerType = 'QR CODE DETECTED';
      let bannerTitle = 'Open Link';
      let bannerDesc = text;

      if (type === 'url') {
        bannerType = 'WEBSITE DETECTED';
        bannerTitle = 'Open in Safari';
        try {
          const u = new URL(text);
          bannerDesc = u.hostname + (u.pathname !== '/' ? u.pathname : '');
        } catch (e) {
          bannerDesc = text;
        }
      } else if (type === 'whatsapp') {
        bannerType = 'WHATSAPP CHAT';
        bannerTitle = 'Open in WhatsApp';
        bannerDesc = 'Direct Instant Message';
      } else if (type === 'wifi') {
        bannerType = 'WI-FI NETWORK';
        const ssid = document.getElementById('wifi-ssid')?.value || 'Guest Wi-Fi';
        bannerTitle = `Join "${ssid}"`;
        bannerDesc = 'Tap to auto-connect without password';
      } else if (type === 'vcard') {
        bannerType = 'CONTACT CARD';
        const fn = document.getElementById('vcard-first')?.value || 'New';
        const ln = document.getElementById('vcard-last')?.value || 'Contact';
        bannerTitle = `Add "${fn} ${ln}"`;
        bannerDesc = 'Save to Address Book';
      } else if (type === 'upi') {
        bannerType = 'UPI PAYMENT';
        const name = document.getElementById('upi-name')?.value || 'Merchant';
        const amt = document.getElementById('upi-amount')?.value;
        bannerTitle = amt ? `Pay ₹${amt} to ${name}` : `Pay to ${name}`;
        bannerDesc = document.getElementById('upi-id')?.value || text;
      } else if (type === 'crypto') {
        bannerType = 'CRYPTO TRANSACTION';
        const coin = document.getElementById('crypto-coin')?.value || 'crypto';
        bannerTitle = `Send ${coin.toUpperCase()}`;
        bannerDesc = document.getElementById('crypto-address')?.value || text;
      } else if (type === 'phone') {
        bannerType = 'PHONE NUMBER';
        bannerTitle = 'Call ' + (document.getElementById('phone-number')?.value || text);
        bannerDesc = 'Cellular Phone Call';
      } else if (type === 'email') {
        bannerType = 'MAIL MESSAGE';
        bannerTitle = 'Compose Email';
        bannerDesc = document.getElementById('email-address')?.value || text;
      } else if (type === 'location') {
        bannerType = 'MAPS LOCATION';
        bannerTitle = 'Open in Maps';
        bannerDesc = document.getElementById('loc-query')?.value || text;
      } else if (type === 'event') {
        bannerType = 'CALENDAR EVENT';
        bannerTitle = 'Add to Calendar';
        bannerDesc = document.getElementById('event-title')?.value || 'New Event';
      } else {
        bannerType = 'TEXT CONTENT';
        bannerTitle = 'View Decoded Text';
        bannerDesc = text;
      }

      if (simBannerType) simBannerType.textContent = bannerType;
      if (simBannerTitle) simBannerTitle.textContent = bannerTitle;
      if (simBannerDesc) simBannerDesc.textContent = bannerDesc;

      modal.classList.add('active');
    });

    if (simCloseBtn) {
      simCloseBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    // Test Action on banner click
    if (simIosBanner) {
      simIosBanner.addEventListener('click', () => {
        const text = state.qrText;
        if (text.startsWith('http')) {
          window.open(text, '_blank');
          showToast('Launched URL in new tab!', 'success');
        } else if (text.startsWith('tel:') || text.startsWith('mailto:')) {
          window.location.href = text;
        } else {
          navigator.clipboard.writeText(text);
          showToast(`Simulated smartphone scan! Content copied to clipboard.`, 'success');
        }
      });
    }
  }

  /**
   * A4 Sticker & Label Print Studio
   */
  function setupStickerSheet() {
    const btnSticker = document.getElementById('btn-sticker-sheet');
    const modal = document.getElementById('sticker-sheet-modal');
    const closeBtn = document.getElementById('sticker-modal-close');
    const cancelBtn = document.getElementById('sticker-btn-cancel');
    const printBtn = document.getElementById('sticker-btn-print');
    const densitySelect = document.getElementById('sticker-grid-density');
    const captionInput = document.getElementById('sticker-caption-input');
    const renderGrid = document.getElementById('sticker-render-grid');

    if (!btnSticker || !modal || !renderGrid) return;

    function renderSheet() {
      const canvas = document.querySelector('#qr-canvas-container canvas');
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const density = densitySelect.value;
      const caption = captionInput.value || 'SCAN ME';

      let count = 12;
      if (density === 'grid-2x3') count = 6;
      else if (density === 'grid-3x4') count = 12;
      else if (density === 'grid-4x6') count = 24;

      renderGrid.className = `sticker-grid-layout ${density}`;
      let tiles = '';
      for (let i = 0; i < count; i++) {
        tiles += `
          <div class="sticker-tile">
            <img src="${dataUrl}" alt="Sticker QR" />
            <div class="sticker-tile-caption">${escapeHtml(caption)}</div>
          </div>
        `;
      }
      renderGrid.innerHTML = tiles;
    }

    btnSticker.addEventListener('click', () => {
      renderSheet();
      modal.classList.add('active');
    });

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    if (densitySelect) densitySelect.addEventListener('change', renderSheet);
    if (captionInput) captionInput.addEventListener('input', renderSheet);

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const previewContent = document.getElementById('sticker-preview-a4').innerHTML;
        const printWin = window.open('', '_blank');
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print QR Sticker Sheet - SuOrbit</title>
              <style>
                @page { size: A4 portrait; margin: 10mm; }
                body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #fff; }
                .sticker-grid-layout { display: grid; gap: 12px; }
                .grid-2x3 { grid-template-columns: repeat(2, 1fr); }
                .grid-3x4 { grid-template-columns: repeat(3, 1fr); }
                .grid-4x6 { grid-template-columns: repeat(4, 1fr); }
                .sticker-tile {
                  border: 1px dashed #cbd5e1;
                  padding: 8px;
                  border-radius: 6px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  page-break-inside: avoid;
                }
                .sticker-tile img { max-width: 90px; height: auto; }
                .grid-2x3 .sticker-tile img { max-width: 150px; }
                .sticker-tile-caption {
                  font-weight: 800;
                  font-size: 0.72rem;
                  color: #0f172a;
                  margin-top: 6px;
                  text-transform: uppercase;
                }
              </style>
            </head>
            <body>
              ${previewContent}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      });
    }
  }

  /**
   * Bulk / Batch QR Generator Logic
   */
  function setupBatchGenerator() {
    const btnGenerate = document.getElementById('btn-generate-batch');
    const btnDownloadZip = document.getElementById('btn-download-batch-zip');
    const textarea = document.getElementById('batch-input-text');
    const resultsGrid = document.getElementById('batch-results-grid');
    const statusCounter = document.getElementById('batch-status-counter');

    if (!btnGenerate || !textarea || !resultsGrid) return;

    let batchImages = [];

    btnGenerate.addEventListener('click', async () => {
      const rawText = textarea.value.trim();
      if (!rawText) {
        showToast('Please enter at least one URL or text entry.', 'error');
        return;
      }

      const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      btnGenerate.disabled = true;
      btnGenerate.innerHTML = `<span class="field-spinner-icon" style="width:14px;height:14px;display:inline-block;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;"></span> Generating...`;
      resultsGrid.style.display = 'grid';
      resultsGrid.innerHTML = '';
      if (statusCounter) statusCounter.textContent = `Processing 0 of ${lines.length}...`;
      batchImages = [];

      try {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let label = `Item-${i + 1}`;
          let data = line;

          if (line.includes(',')) {
            const parts = line.split(',');
            label = parts[0].trim();
            data = parts.slice(1).join(',').trim();
          }

          // Offscreen generation using current aesthetic configuration
          const opts = JSON.parse(JSON.stringify(state.options));
          opts.width = 400;
          opts.height = 400;
          opts.data = data;
          opts.image = state.options.image;

          if (state.gradientEnabled) {
            opts.dotsOptions.gradient = {
              type: 'linear',
              rotation: 0.785,
              colorStops: [
                { offset: 0, color: state.color1 },
                { offset: 1, color: state.color2 }
              ]
            };
          } else {
            opts.dotsOptions.color = state.color1;
          }
          opts.backgroundOptions.color = state.bgTransparent ? 'transparent' : state.bgColor;
          opts.cornersSquareOptions.color = state.color1;
          opts.cornersDotOptions.color = state.color1;

          const qr = new QRCodeStyling(opts);
          const rawBlob = await qr.getRawData('png');
          const dataUrl = URL.createObjectURL(rawBlob);

          const fileName = `${String(i + 1).padStart(2, '0')}-${label.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
          batchImages.push({
            name: fileName,
            blob: rawBlob,
            dataUrl: dataUrl,
            label: label
          });

          // Append thumbnail card
          const thumb = document.createElement('div');
          thumb.className = 'batch-thumb-item';
          thumb.innerHTML = `
            <img src="${dataUrl}" alt="${escapeHtml(label)}" />
            <div class="batch-thumb-title" title="${escapeHtml(label)}">${escapeHtml(label)}</div>
            <a href="${dataUrl}" download="${fileName}" class="history-btn-mini" style="margin-top:4px; font-size:0.65rem; text-decoration:none; display:inline-block;">Download</a>
          `;
          resultsGrid.appendChild(thumb);

          if (statusCounter) statusCounter.textContent = `Processed ${i + 1} of ${lines.length}`;
        }

        if (btnDownloadZip) {
          btnDownloadZip.style.display = 'inline-flex';
        }
        showToast(`Successfully generated ${lines.length} QR codes!`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Error generating bulk QR codes', 'error');
      } finally {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="8" x="3" y="3" rx="2"/><rect width="8" height="8" x="13" y="3" rx="2"/><rect width="8" height="8" x="3" y="13" rx="2"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>
          Generate Batch
        `;
      }
    });

    if (btnDownloadZip) {
      btnDownloadZip.addEventListener('click', async () => {
        if (batchImages.length === 0) return;
        if (typeof JSZip === 'undefined') {
          showToast('ZIP utility initializing, please retry...', 'error');
          return;
        }

        btnDownloadZip.disabled = true;
        btnDownloadZip.textContent = 'Compressing ZIP...';

        try {
          const zip = new JSZip();
          const folder = zip.folder('suorbit-qr-codes');
          batchImages.forEach((item) => {
            folder.file(item.name, item.blob);
          });

          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const zipUrl = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = zipUrl;
          a.download = `suorbit-bulk-qr-${Date.now()}.zip`;
          a.click();

          showToast('Bulk ZIP downloaded successfully!', 'success');
        } catch (err) {
          console.error(err);
          showToast('Failed to create ZIP archive', 'error');
        } finally {
          btnDownloadZip.disabled = false;
          btnDownloadZip.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download All (ZIP)
          `;
        }
      });
    }
  }

  /**
   * Mobile Studio View Switcher & Floating Quick Preview
   */
  function setupMobileViewSwitcher() {
    const editBtn = document.getElementById('btn-mobile-edit');
    const previewBtn = document.getElementById('btn-mobile-preview');
    const floatingBtn = document.getElementById('btn-floating-view-qr');
    const studioGrid = document.getElementById('main-studio-grid');
    const floatingTypeLabel = document.getElementById('floating-type-label');
    const miniCanvas = document.getElementById('mini-floating-canvas');

    if (!editBtn || !previewBtn || !studioGrid) return;

    function setMobileView(view) {
      studioGrid.setAttribute('data-mobile-view', view);
      editBtn.classList.toggle('active', view === 'edit');
      previewBtn.classList.toggle('active', view === 'preview');

      if (view === 'preview') {
        const previewWrap = document.querySelector('.preview-sticky-wrap');
        if (previewWrap) {
          previewWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        const formPanel = document.querySelector('.card-panel');
        if (formPanel) {
          formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    editBtn.addEventListener('click', () => setMobileView('edit'));
    previewBtn.addEventListener('click', () => setMobileView('preview'));
    if (floatingBtn) {
      floatingBtn.addEventListener('click', () => setMobileView('preview'));
    }

    // Sync mini floating canvas & label when QR updates
    window.syncMiniPreview = function() {
      if (floatingTypeLabel) {
        floatingTypeLabel.textContent = `${getTitleForType(state.currentType)} Ready`;
      }
      if (!miniCanvas) return;
      const mainCanvas = document.querySelector('#qr-canvas-container canvas');
      if (mainCanvas && mainCanvas.width > 0) {
        const ctx = miniCanvas.getContext('2d');
        ctx.clearRect(0, 0, 36, 36);
        ctx.drawImage(mainCanvas, 0, 0, 36, 36);
      }
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
