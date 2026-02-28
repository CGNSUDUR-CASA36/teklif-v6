/* ==============================================
   Teklif V6 - Application Logic
   Swissôtel Büyük Efes İzmir
   ============================================== */

// SHA-256 hashes (passwords are NOT stored in plaintext)
const AUTH_HASH = '20c0011102ebd410719d237fdf3f6592d49bb973c320bc3d49e70a8f4f2fcc2b';
const ADMIN_HASH = '77d35085133ce0628a6afb89d5b33f70bfbf2430befc3a22a4becdefa3be4b8f';
const AUTH_KEY = 'teklif_v6_auth';
const CONFIG_KEY = 'teklif_v6_config';

document.addEventListener('DOMContentLoaded', () => {
    // Check if already authenticated this session
    if (sessionStorage.getItem(AUTH_KEY) === AUTH_HASH || sessionStorage.getItem(AUTH_KEY) === ADMIN_HASH) {
        unlockApp();
    } else {
        showLogin();
    }
});

// ====== AUTHENTICATION ======
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function showLogin() {
    const overlay = document.getElementById('loginOverlay');
    const loginBtn = document.getElementById('loginBtn');
    const pwInput = document.getElementById('loginPassword');
    const errorEl = document.getElementById('loginError');
    const toggleBtn = document.getElementById('togglePassword');

    // Hide main app
    document.querySelector('.app-header').classList.add('auth-hidden');
    document.querySelector('.app-main').classList.add('auth-hidden');
    document.querySelector('.app-footer').classList.add('auth-hidden');
    overlay.classList.remove('hidden');

    // Focus password field
    setTimeout(() => pwInput.focus(), 300);

    // Login handler
    async function attemptLogin() {
        const pw = pwInput.value;
        if (!pw) return;

        const hash = await sha256(pw);

        if (hash === ADMIN_HASH) {
            // Admin login → redirect to admin panel
            sessionStorage.setItem(AUTH_KEY, ADMIN_HASH);
            window.location.href = 'admin.html';
            return;
        }

        if (hash === AUTH_HASH) {
            // Normal user login
            sessionStorage.setItem(AUTH_KEY, AUTH_HASH);
            errorEl.classList.remove('visible');
            overlay.classList.add('hidden');
            setTimeout(() => {
                unlockApp();
            }, 500);
        } else {
            // Wrong password
            errorEl.classList.remove('visible');
            void errorEl.offsetWidth; // Force reflow for animation restart
            errorEl.classList.add('visible');
            pwInput.value = '';
            pwInput.focus();
        }
    }

    loginBtn.addEventListener('click', attemptLogin);
    pwInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    // Toggle password visibility
    let pwVisible = false;
    toggleBtn.addEventListener('click', () => {
        pwVisible = !pwVisible;
        pwInput.type = pwVisible ? 'text' : 'password';
        toggleBtn.innerHTML = pwVisible
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
}

function unlockApp() {
    const overlay = document.getElementById('loginOverlay');
    overlay.classList.add('hidden');
    document.querySelector('.app-header').classList.remove('auth-hidden');
    document.querySelector('.app-main').classList.remove('auth-hidden');
    document.querySelector('.app-footer').classList.remove('auth-hidden');

    // Load admin config then initialize
    loadAdminConfig();
    initTabs();
    initTR();
    initEN();
    initCopyButtons();
}

// ====== LOAD ADMIN CONFIG ======
function loadAdminConfig() {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (!saved) return;
    try {
        const cfg = JSON.parse(saved);

        // Apply room names and m² to TR tables
        const trTable1Rows = document.querySelectorAll('#tr-section .proposal-table:nth-of-type(1) tbody tr');
        const trTable2Rows = document.querySelectorAll('#tr-section .proposal-table:nth-of-type(2) tbody tr');
        const trAllRows = [...(trTable1Rows || []), ...(trTable2Rows || [])];

        // Get all TR table rows directly
        const trTables = document.querySelectorAll('#tr-section .proposal-table');
        let trRowIndex = 0;
        trTables.forEach(table => {
            table.querySelectorAll('tbody tr').forEach(row => {
                trRowIndex++;
                const nameKey = 'cfg_tr_room' + trRowIndex;
                const m2Key = 'cfg_tr_m2_' + trRowIndex;
                if (cfg[nameKey]) {
                    const nameCell = row.querySelector('td:first-child');
                    if (nameCell) nameCell.textContent = cfg[nameKey];
                }
                if (cfg[m2Key]) {
                    const m2Badge = row.querySelector('.m2-badge');
                    if (m2Badge) m2Badge.textContent = cfg[m2Key] + ' m²';
                }
            });
        });

        // Get all EN table rows
        const enTables = document.querySelectorAll('#en-section .proposal-table');
        let enRowIndex = 0;
        enTables.forEach(table => {
            table.querySelectorAll('tbody tr').forEach(row => {
                enRowIndex++;
                const nameKey = 'cfg_en_room' + enRowIndex;
                const m2Key = 'cfg_en_m2_' + enRowIndex;
                if (cfg[nameKey]) {
                    const nameCell = row.querySelector('td:first-child');
                    if (nameCell) nameCell.textContent = cfg[nameKey];
                }
                if (cfg[m2Key]) {
                    const m2Badge = row.querySelector('.m2-badge');
                    if (m2Badge) m2Badge.textContent = cfg[m2Key] + ' m²';
                }
            });
        });

        // Apply price type texts
        if (cfg.cfg_nonref_tr) {
            const el = document.getElementById('tr_nonrefSection');
            if (el) el.textContent = cfg.cfg_nonref_tr;
        }
        if (cfg.cfg_flex_tr) {
            const el = document.getElementById('tr_flexSection');
            if (el) el.textContent = cfg.cfg_flex_tr;
        }
        if (cfg.cfg_corporate_tr) {
            const el = document.getElementById('tr_corporateSection');
            if (el) el.textContent = cfg.cfg_corporate_tr;
        }
        if (cfg.cfg_nonref_en) {
            const el = document.getElementById('en_nonrefSection');
            if (el) el.textContent = cfg.cfg_nonref_en;
        }
        if (cfg.cfg_flex_en) {
            const el = document.getElementById('en_flexSection');
            if (el) el.textContent = cfg.cfg_flex_en;
        }
        if (cfg.cfg_corporate_en) {
            const el = document.getElementById('en_corporateSection');
            if (el) el.textContent = cfg.cfg_corporate_en;
        }

    } catch (e) {
        console.warn('Config load error:', e);
    }
}

// Get configured price additions (from admin or defaults)
function getConfiguredAdditions() {
    const defaults = [0, 25, 100, 135, 150, 275, 325, 425];
    const saved = localStorage.getItem(CONFIG_KEY);
    if (!saved) return { tr: defaults, en: defaults };
    try {
        const cfg = JSON.parse(saved);
        const tr = defaults.map((d, i) => {
            const key = 'cfg_tr_add' + (i + 1);
            return cfg[key] !== undefined ? parseFloat(cfg[key]) : d;
        });
        const en = defaults.map((d, i) => {
            const key = 'cfg_en_add' + (i + 1);
            return cfg[key] !== undefined ? parseFloat(cfg[key]) : d;
        });
        return { tr, en };
    } catch (e) {
        return { tr: defaults, en: defaults };
    }
}

// ====== TOAST ======
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { info: 'ℹ️', success: '✅', error: '❌' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// ====== TAB NAVIGATION ======
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Deactivate all
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Activate selected
            btn.classList.add('active');
            document.getElementById(`${tabName}-section`).classList.add('active');
        });
    });
}

// ====== PRICE HIGHLIGHT ======
function highlightPrice(el) {
    if (!el) return;
    el.classList.add('price-highlight-anim');
    setTimeout(() => el.classList.remove('price-highlight-anim'), 600);
}

// ====== TURKISH SECTION ======
function initTR() {
    const isimInput = document.getElementById('tr_isimInput');
    const girisInput = document.getElementById('tr_girisInput');
    const cikisInput = document.getElementById('tr_cikisInput');
    const fiyatInput = document.getElementById('tr_fiyatInput');
    const fiyatType = document.getElementById('tr_fiyatType');
    const nameSpan = document.getElementById('tr_nameSpan');
    const girisDateSpan = document.getElementById('tr_girisDate');
    const cikisDateSpan = document.getElementById('tr_cikisDate');

    const priceSpans = [
        document.getElementById('tr_priceKlasik'),
        document.getElementById('tr_priceAdvantage'),
        document.getElementById('tr_priceExecCadde'),
        document.getElementById('tr_priceExecBahce'),
        document.getElementById('tr_priceExecDeniz'),
        document.getElementById('tr_priceBusinessBahce'),
        document.getElementById('tr_priceBusinessDeniz'),
        document.getElementById('tr_priceExecSuiteDeniz')
    ];

    const priceAdditions = getConfiguredAdditions().tr;

    const enableDiscountBtn = document.getElementById('tr_enableDiscountBtn');
    const discountInput = document.getElementById('tr_discountInput');
    const applyDiscountBtn = document.getElementById('tr_applyDiscountBtn');
    const discountInputs = Array.from({ length: 8 }, (_, i) =>
        document.getElementById('tr_priceInput' + (i + 1))
    );

    // Update proposal text in real-time
    function updateTR() {
        // Name
        if (nameSpan) {
            nameSpan.textContent = isimInput.value.trim() ? ' ' + isimInput.value.trim() : '';
        }
        // Dates
        if (girisDateSpan) girisDateSpan.textContent = girisInput.value || 'x.x.25';
        if (cikisDateSpan) cikisDateSpan.textContent = cikisInput.value || 'x.x.25';

        // Prices
        const base = parseFloat(fiyatInput.value);
        if (!isNaN(base)) {
            priceSpans.forEach((span, idx) => {
                if (span) {
                    span.textContent = (base + priceAdditions[idx]).toFixed(2);
                    highlightPrice(span);
                }
            });
        }

        // Price type sections
        const nonrefSection = document.getElementById('tr_nonrefSection');
        const flexSection = document.getElementById('tr_flexSection');
        const corporateSection = document.getElementById('tr_corporateSection');

        [nonrefSection, flexSection, corporateSection].forEach(s => {
            if (s) s.classList.remove('visible');
        });

        if (fiyatType.value === 'nonref' && nonrefSection) nonrefSection.classList.add('visible');
        if (fiyatType.value === 'flex' && flexSection) flexSection.classList.add('visible');
        if (fiyatType.value === 'corporate' && corporateSection) corporateSection.classList.add('visible');
    }

    [isimInput, girisInput, cikisInput, fiyatInput, fiyatType].forEach(el => {
        if (el) el.addEventListener('input', updateTR);
    });

    // Discount toggle
    let discountEnabled = false;
    if (enableDiscountBtn) {
        enableDiscountBtn.addEventListener('click', () => {
            discountEnabled = !discountEnabled;
            discountInput.disabled = !discountEnabled;
            discountInputs.forEach(inp => { if (inp) inp.disabled = !discountEnabled; });
            applyDiscountBtn.disabled = !discountEnabled;

            if (discountEnabled) {
                enableDiscountBtn.textContent = '🚫 İndirimi Pasifleştir';
                enableDiscountBtn.className = 'btn btn-danger';
            } else {
                enableDiscountBtn.textContent = '💰 İndirimi Aktifleştir';
                enableDiscountBtn.className = 'btn btn-success';
            }
        });
    }

    // Apply discount
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            const pct = parseFloat(discountInput.value);
            if (isNaN(pct) || pct < 0 || pct > 100) {
                showToast('Lütfen geçerli bir indirim oranı giriniz (0-100)', 'error');
                return;
            }
            const factor = (100 - pct) / 100;
            let applied = 0;
            discountInputs.forEach((inp, idx) => {
                if (inp && priceSpans[idx]) {
                    const v = parseFloat(inp.value);
                    if (!isNaN(v)) {
                        priceSpans[idx].textContent = (v * factor).toFixed(2);
                        highlightPrice(priceSpans[idx]);
                        applied++;
                    }
                }
            });
            if (applied > 0) {
                showToast(`%${pct} indirim ${applied} odaya uygulandı`, 'success');
            } else {
                showToast('Lütfen en az bir oda fiyatı giriniz', 'error');
            }
        });
    }

    updateTR();
}

// ====== ENGLISH SECTION ======
function initEN() {
    const nameInput = document.getElementById('en_nameInput');
    const checkinInput = document.getElementById('en_checkinInput');
    const checkoutInput = document.getElementById('en_checkoutInput');
    const priceInput = document.getElementById('en_priceInput');
    const priceType = document.getElementById('en_priceType');
    const nameSpan = document.getElementById('en_nameSpan');
    const girisDateSpan = document.getElementById('en_girisDate');
    const cikisDateSpan = document.getElementById('en_cikisDate');

    const enPriceSpans = [
        document.getElementById('en_priceClassic'),
        document.getElementById('en_priceClassicGarden'),
        document.getElementById('en_priceExecCity'),
        document.getElementById('en_priceExecGarden'),
        document.getElementById('en_priceExecSea'),
        document.getElementById('en_priceBusinessGarden'),
        document.getElementById('en_priceBusinessSea'),
        document.getElementById('en_priceExecSuite')
    ];

    const priceAdditions = getConfiguredAdditions().en;

    const enableDiscountBtn = document.getElementById('en_enableDiscountBtn');
    const discountInput = document.getElementById('en_discountInput');
    const applyDiscountBtn = document.getElementById('en_applyDiscountBtn');
    const discountInputs = Array.from({ length: 8 }, (_, i) =>
        document.getElementById('en_priceInput' + (i + 1))
    );

    function updateEN() {
        if (nameSpan) {
            nameSpan.textContent = nameInput.value.trim() ? ' ' + nameInput.value.trim() : '';
        }
        if (girisDateSpan) girisDateSpan.textContent = checkinInput.value.trim() || 'x.x.25';
        if (cikisDateSpan) cikisDateSpan.textContent = checkoutInput.value.trim() || 'x.x.25';

        const base = parseFloat(priceInput.value);
        if (!isNaN(base)) {
            enPriceSpans.forEach((span, idx) => {
                if (span) {
                    span.textContent = (base + priceAdditions[idx]).toFixed(2);
                    highlightPrice(span);
                }
            });
        }

        const nonrefSection = document.getElementById('en_nonrefSection');
        const flexSection = document.getElementById('en_flexSection');
        const corporateSection = document.getElementById('en_corporateSection');

        [nonrefSection, flexSection, corporateSection].forEach(s => {
            if (s) s.classList.remove('visible');
        });

        if (priceType.value === 'nonref' && nonrefSection) nonrefSection.classList.add('visible');
        if (priceType.value === 'flex' && flexSection) flexSection.classList.add('visible');
        if (priceType.value === 'corporate' && corporateSection) corporateSection.classList.add('visible');
    }

    [nameInput, checkinInput, checkoutInput, priceInput, priceType].forEach(el => {
        if (el) el.addEventListener('input', updateEN);
    });

    // Discount toggle
    let discountEnabled = false;
    if (enableDiscountBtn) {
        enableDiscountBtn.addEventListener('click', () => {
            discountEnabled = !discountEnabled;
            discountInput.disabled = !discountEnabled;
            discountInputs.forEach(inp => { if (inp) inp.disabled = !discountEnabled; });
            applyDiscountBtn.disabled = !discountEnabled;

            if (discountEnabled) {
                enableDiscountBtn.textContent = '🚫 Disable Discount';
                enableDiscountBtn.className = 'btn btn-danger';
            } else {
                enableDiscountBtn.textContent = '💰 Enable Discount';
                enableDiscountBtn.className = 'btn btn-success';
            }
        });
    }

    // Apply discount
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            const pct = parseFloat(discountInput.value);
            if (isNaN(pct) || pct < 0 || pct > 100) {
                showToast('Please enter a valid discount rate (0-100)', 'error');
                return;
            }
            const factor = (100 - pct) / 100;
            let applied = 0;
            discountInputs.forEach((inp, idx) => {
                if (inp && enPriceSpans[idx]) {
                    const v = parseFloat(inp.value);
                    if (!isNaN(v)) {
                        enPriceSpans[idx].textContent = (v * factor).toFixed(2);
                        highlightPrice(enPriceSpans[idx]);
                        applied++;
                    }
                }
            });
            if (applied > 0) {
                showToast(`${pct}% discount applied to ${applied} rooms`, 'success');
            } else {
                showToast('Please enter at least one room price', 'error');
            }
        });
    }

    updateEN();
}

// ====== COPY TO CLIPBOARD (Rich HTML for Outlook) ======

// Inline style constants for email compatibility
const EMAIL_STYLES = {
    wrapper: 'font-family: Georgia, "Times New Roman", serif; font-size: 15px; color: #1e293b; line-height: 1.75; max-width: 700px;',
    paragraph: 'margin: 0 0 14px 0; font-family: Georgia, "Times New Roman", serif; font-size: 15px; color: #1e293b; line-height: 1.75;',
    strong: 'font-weight: 700; color: #1a2332;',
    link: 'color: #2563eb; text-decoration: none;',
    bannerBase: 'margin: 16px 0; padding: 14px 18px; border-radius: 6px; font-family: "Segoe UI", Arial, sans-serif; font-size: 14px; line-height: 1.6;',
    bannerNonref: 'background-color: #eff6ff; border-left: 4px solid #2563eb; color: #1e40af;',
    bannerFlex: 'background-color: #f0fdf4; border-left: 4px solid #059669; color: #065f46;',
    bannerCorporate: 'background-color: #fefce8; border-left: 4px solid #d97706; color: #92400e;',
    commission: 'margin: 16px 0; padding: 12px 16px; background-color: #fef9f0; border: 1px dashed rgba(200,165,90,0.4); border-radius: 6px; font-family: "Segoe UI", Arial, sans-serif; font-size: 14px; color: #475569;',
    table: 'width: 100%; border-collapse: collapse; margin: 20px 0; font-family: "Segoe UI", Arial, sans-serif; font-size: 14px;',
    th: 'background-color: #1a2332; color: #ffffff; font-weight: 600; padding: 12px 16px; text-align: left; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid #1a2332;',
    td: 'padding: 12px 16px; border: 1px solid #e2e8f0; vertical-align: middle; color: #1e293b;',
    tdAlt: 'padding: 12px 16px; border: 1px solid #e2e8f0; vertical-align: middle; color: #1e293b; background-color: #f8fafc;',
    tdName: 'font-weight: 600; color: #1e293b;',
    m2Badge: 'display: inline-block; background-color: #eff6ff; color: #1e40af; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;',
    priceValue: 'font-weight: 700; color: #a88a3e; font-size: 15px;',
    priceSuffix: 'color: #64748b; font-size: 13px;',
    lounge: 'margin: 20px 0; padding: 16px 20px; background-color: #fef9f0; border: 1px solid rgba(200,165,90,0.2); border-radius: 8px; font-family: "Segoe UI", Arial, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6;',
    loungeStrong: 'color: #a88a3e; font-weight: 700;',
    dangerText: 'color: #dc2626; font-weight: 700;',
    infoItem: 'margin: 0 0 8px 0; padding: 4px 0 4px 20px; font-family: Georgia, "Times New Roman", serif; font-size: 14px; color: #1e293b; line-height: 1.6;',
    bullet: 'color: #c8a55a; margin-right: 8px;'
};

function initCopyButtons() {
    const trCopyBtn = document.getElementById('trCopyBtn');
    if (trCopyBtn) {
        trCopyBtn.addEventListener('click', () => {
            const proposalEl = document.getElementById('tr-proposal');
            copyAsRichHTML(proposalEl, trCopyBtn, 'Teklif metni kopyalandı!');
        });
    }
    const enCopyBtn = document.getElementById('enCopyBtn');
    if (enCopyBtn) {
        enCopyBtn.addEventListener('click', () => {
            const proposalEl = document.getElementById('en-proposal');
            copyAsRichHTML(proposalEl, enCopyBtn, 'Offer text copied!');
        });
    }
}

function copyAsRichHTML(proposalEl, btn, successMsg) {
    if (!proposalEl) return;

    const emailHTML = generateEmailHTML(proposalEl);
    const plainText = proposalEl.innerText;

    // Modern Clipboard API — writes both HTML and plain text
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const htmlBlob = new Blob([emailHTML], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });

        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': htmlBlob,
                'text/plain': textBlob
            })
        ]).then(() => {
            showCopySuccess(btn, successMsg);
        }).catch(() => {
            fallbackRichCopy(emailHTML, btn, successMsg);
        });
    } else {
        fallbackRichCopy(emailHTML, btn, successMsg);
    }
}

// Fallback: use a hidden div + execCommand to preserve rich formatting
function fallbackRichCopy(html, btn, successMsg) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.style.cssText = 'position:fixed; left:-9999px; top:0; opacity:0;';
    document.body.appendChild(temp);

    const range = document.createRange();
    range.selectNodeContents(temp);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    try {
        document.execCommand('copy');
        showCopySuccess(btn, successMsg);
    } catch (e) {
        showToast('Kopyalama başarısız oldu', 'error');
    }

    sel.removeAllRanges();
    document.body.removeChild(temp);
}

function showCopySuccess(btn, successMsg) {
    const originalHTML = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><polyline points="20 6 9 17 4 12"/></svg> <span>Kopyalandı!</span>`;
    showToast(successMsg, 'success');
    setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = originalHTML;
    }, 2000);
}

// ====== EMAIL HTML GENERATOR ======
function generateEmailHTML(proposalEl) {
    let html = `<div style="${EMAIL_STYLES.wrapper}">`;

    const children = proposalEl.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const cl = child.classList;

        // Skip hidden info banners
        if (cl.contains('info-banner') && !cl.contains('visible')) continue;

        if (child.tagName === 'P') {
            html += renderParagraph(child);
        } else if (cl.contains('info-banner')) {
            html += renderBanner(child);
        } else if (cl.contains('commission-note')) {
            html += renderCommission(child);
        } else if (child.tagName === 'TABLE') {
            html += renderTable(child);
        } else if (cl.contains('lounge-info')) {
            html += renderLounge(child);
        } else if (cl.contains('info-item')) {
            html += renderInfoItem(child);
        }
    }

    html += '</div>';
    return html;
}

function renderParagraph(el) {
    return `<p style="${EMAIL_STYLES.paragraph}">${renderInline(el)}</p>`;
}

function renderInline(el) {
    let html = '';
    for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            html += escapeHTML(node.textContent);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName;
            if (tag === 'SPAN') {
                const cl = node.classList;
                if (cl.contains('dynamic-value') || cl.contains('price-value')) {
                    html += `<strong style="${EMAIL_STYLES.strong}">${escapeHTML(node.textContent)}</strong>`;
                } else if (cl.contains('price-suffix')) {
                    html += `<span style="${EMAIL_STYLES.priceSuffix}">${escapeHTML(node.textContent)}</span>`;
                } else if (cl.contains('m2-badge')) {
                    html += `<span style="${EMAIL_STYLES.m2Badge}">${escapeHTML(node.textContent)}</span>`;
                } else {
                    html += renderInline(node);
                }
            } else if (tag === 'STRONG' || tag === 'B') {
                const inlineColor = node.style.color;
                let style = EMAIL_STYLES.strong;
                if (inlineColor) style += ` color: ${inlineColor};`;
                html += `<strong style="${style}">${renderInline(node)}</strong>`;
            } else if (tag === 'A') {
                html += `<a href="${node.href}" style="${EMAIL_STYLES.link}">${escapeHTML(node.textContent)}</a>`;
            } else if (tag === 'BR') {
                html += '<br>';
            } else {
                html += renderInline(node);
            }
        }
    }
    return html;
}

function renderBanner(el) {
    let typeStyle = '';
    if (el.classList.contains('nonref')) typeStyle = EMAIL_STYLES.bannerNonref;
    else if (el.classList.contains('flex')) typeStyle = EMAIL_STYLES.bannerFlex;
    else if (el.classList.contains('corporate')) typeStyle = EMAIL_STYLES.bannerCorporate;
    return `<div style="${EMAIL_STYLES.bannerBase} ${typeStyle}">${renderInline(el)}</div>`;
}

function renderCommission(el) {
    return `<div style="${EMAIL_STYLES.commission}">${renderInline(el)}</div>`;
}

function renderTable(tableEl) {
    let html = `<table style="${EMAIL_STYLES.table}" cellpadding="0" cellspacing="0">`;

    // Thead
    const thead = tableEl.querySelector('thead');
    if (thead) {
        html += '<thead>';
        for (const row of thead.rows) {
            html += '<tr>';
            for (const cell of row.cells) {
                html += `<th style="${EMAIL_STYLES.th}">${escapeHTML(cell.textContent)}</th>`;
            }
            html += '</tr>';
        }
        html += '</thead>';
    }

    // Tbody
    const tbody = tableEl.querySelector('tbody');
    if (tbody) {
        html += '<tbody>';
        for (let r = 0; r < tbody.rows.length; r++) {
            const row = tbody.rows[r];
            const isAlt = r % 2 === 1;
            html += '<tr>';
            for (let c = 0; c < row.cells.length; c++) {
                const cell = row.cells[c];
                let cellStyle = isAlt ? EMAIL_STYLES.tdAlt : EMAIL_STYLES.td;

                // First column: room name (bold)
                if (c === 0) {
                    cellStyle += ' ' + EMAIL_STYLES.tdName;
                    html += `<td style="${cellStyle}">${escapeHTML(cell.textContent.trim())}</td>`;
                }
                // Second column: m2
                else if (c === 1) {
                    const badge = cell.querySelector('.m2-badge');
                    const badgeText = badge ? badge.textContent : cell.textContent.trim();
                    html += `<td style="${cellStyle} text-align:center;"><span style="${EMAIL_STYLES.m2Badge}">${escapeHTML(badgeText)}</span></td>`;
                }
                // Third column: price
                else {
                    const priceVal = cell.querySelector('.price-value');
                    const priceSuffix = cell.querySelector('.price-suffix');
                    let priceHTML = '';
                    if (priceVal) {
                        priceHTML += `<span style="${EMAIL_STYLES.priceValue}">${escapeHTML(priceVal.textContent)}</span> `;
                    }
                    if (priceSuffix) {
                        priceHTML += `<span style="${EMAIL_STYLES.priceSuffix}">${escapeHTML(priceSuffix.textContent)}</span>`;
                    }
                    if (!priceVal && !priceSuffix) {
                        priceHTML = escapeHTML(cell.textContent.trim());
                    }
                    html += `<td style="${cellStyle}">${priceHTML}</td>`;
                }
            }
            html += '</tr>';
        }
        html += '</tbody>';
    }

    html += '</table>';
    return html;
}

function renderLounge(el) {
    let inner = '';
    for (const child of el.children) {
        if (child.tagName === 'P') {
            inner += `<p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">${renderLoungeInline(child)}</p>`;
        }
    }
    return `<div style="${EMAIL_STYLES.lounge}">${inner}</div>`;
}

function renderLoungeInline(el) {
    let html = '';
    for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            html += escapeHTML(node.textContent);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'STRONG' || node.tagName === 'B') {
                const inlineColor = node.style.color;
                if (inlineColor && inlineColor.includes('danger')) {
                    html += `<strong style="${EMAIL_STYLES.dangerText}">${renderLoungeInline(node)}</strong>`;
                } else if (inlineColor) {
                    html += `<strong style="font-weight:700; color:${inlineColor};">${renderLoungeInline(node)}</strong>`;
                } else {
                    html += `<strong style="${EMAIL_STYLES.loungeStrong}">${renderLoungeInline(node)}</strong>`;
                }
            } else if (node.tagName === 'BR') {
                html += '<br>';
            } else {
                html += renderLoungeInline(node);
            }
        }
    }
    return html;
}

function renderInfoItem(el) {
    return `<p style="${EMAIL_STYLES.infoItem}"><span style="${EMAIL_STYLES.bullet}">●</span> ${renderInline(el)}</p>`;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
