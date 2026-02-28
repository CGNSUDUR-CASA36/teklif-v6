/* ==============================================
   Teklif V6 - Application Logic
   Swissôtel Büyük Efes İzmir
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initTR();
    initEN();
    initCopyButtons();
});

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

    const priceAdditions = [0, 25, 100, 135, 150, 275, 325, 425];

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

    const priceAdditions = [0, 25, 100, 135, 150, 275, 325, 425];

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

// ====== COPY TO CLIPBOARD ======
function initCopyButtons() {
    // TR Copy
    const trCopyBtn = document.getElementById('trCopyBtn');
    if (trCopyBtn) {
        trCopyBtn.addEventListener('click', () => {
            const proposalEl = document.getElementById('tr-proposal');
            copyProposalText(proposalEl, trCopyBtn, 'Teklif metni kopyalandı!');
        });
    }

    // EN Copy
    const enCopyBtn = document.getElementById('enCopyBtn');
    if (enCopyBtn) {
        enCopyBtn.addEventListener('click', () => {
            const proposalEl = document.getElementById('en-proposal');
            copyProposalText(proposalEl, enCopyBtn, 'Offer text copied!');
        });
    }
}

function copyProposalText(el, btn, successMsg) {
    if (!el) return;

    // Get text content with proper formatting
    const text = extractFormattedText(el);

    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalHTML = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><polyline points="20 6 9 17 4 12"/></svg> <span>Kopyalandı!</span>`;

        showToast(successMsg, 'success');

        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalHTML;
        }, 2000);
    }).catch(() => {
        showToast('Kopyalama başarısız oldu', 'error');
    });
}

function extractFormattedText(el) {
    let text = '';
    const children = el.childNodes;

    children.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            const classList = node.classList;

            // Skip hidden info banners
            if (classList.contains('info-banner') && !classList.contains('visible')) {
                return;
            }

            if (tag === 'p' || tag === 'div') {
                text += extractInnerText(node) + '\n\n';
            } else if (tag === 'table') {
                text += extractTableText(node) + '\n\n';
            } else if (tag === 'hr') {
                text += '─'.repeat(40) + '\n\n';
            } else {
                text += extractInnerText(node);
            }
        }
    });

    return text.trim();
}

function extractInnerText(el) {
    let text = '';
    el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'BR') {
                text += '\n';
            } else if (node.tagName === 'A') {
                text += node.textContent + ' (' + node.href + ')';
            } else {
                text += extractInnerText(node);
            }
        }
    });
    return text;
}

function extractTableText(table) {
    let text = '';
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, idx) => {
        const cells = row.querySelectorAll('th, td');
        const cellTexts = [];
        cells.forEach(cell => {
            // For price cells, just get the price value and EUR suffix
            const priceVal = cell.querySelector('.price-value');
            if (priceVal) {
                const suffix = cell.querySelector('.price-suffix');
                cellTexts.push(priceVal.textContent + ' ' + (suffix ? suffix.textContent : ''));
            } else {
                cellTexts.push(cell.textContent.trim());
            }
        });
        text += cellTexts.join('  |  ') + '\n';
        if (idx === 0) {
            text += '─'.repeat(60) + '\n';
        }
    });
    return text;
}
