/* =============================================
   NOTARY FEE CALCULATOR · SINGAPORE
   Fee schedule: Notaries Public Rules (Cap. 208, R1)
   SAL Apostille: $87.20 incl. GST (mandatory)
   ============================================= */

// ── FEE CONSTANTS ────────────────────────────
const FEES = {
  // Witnessing / Execution
  witnessing_individual_first:    40.00,
  witnessing_individual_second:   20.00,
  witnessing_individual_further:  10.00,
  witnessing_company:            150.00,  // inclusive of Notarial Certificate
  exhibit_per:                    10.00,

  // Certified True Copies
  ctc_seal_first:                 10.00,
  ctc_seal_subsequent:             2.00,
  ctc_noseal_first:                5.00,
  ctc_noseal_subsequent:           1.00,

  // Notarial Certificate
  notarial_certificate:           75.00,
  nc_additional_party:            20.00,
  special_nc:                     75.00,

  // SAL Apostille (mandatory, incl. GST — paid to SAL, not notary)
  sal_apostille:                  87.20,
};

// ── STATE ────────────────────────────────────
const state = {
  service:     'witnessing',   // 'witnessing' | 'ctc'
  signatory:   'individual',   // 'individual' | 'company'
  signers:     1,
  exhibits:    0,
  sealReq:     'yes',          // 'yes' | 'no'
  pages:       1,
  docs:        1,
  ncParties:   0,
  specialNC:   false,
};

// ── DOM REFS ──────────────────────────────────
const $ = id => document.getElementById(id);

const els = {
  serviceRadios:    document.querySelectorAll('input[name="service"]'),
  signatoryRadios:  document.querySelectorAll('input[name="signatory"]'),
  sealRadios:       document.querySelectorAll('input[name="sealRequired"]'),
  witnessingOpts:   $('witnessingOptions'),
  ctcOpts:          $('ctcOptions'),
  addlSignersGrp:   $('additionalSignersGroup'),

  signersCount:     $('signersCount'),
  signersMinus:     $('signersMinus'),
  signersPlus:      $('signersPlus'),

  exhibitsCount:    $('exhibitsCount'),
  exhibitsMinus:    $('exhibitsMinus'),
  exhibitsPlus:     $('exhibitsPlus'),

  pagesCount:       $('pagesCount'),
  pagesMinus:       $('pagesMinus'),
  pagesPlus:        $('pagesPlus'),

  docsCount:        $('docsCount'),
  docsMinus:        $('docsMinus'),
  docsPlus:         $('docsPlus'),

  ncPartiesCount:   $('ncPartiesCount'),
  ncPartiesMinus:   $('ncPartiesMinus'),
  ncPartiesPlus:    $('ncPartiesPlus'),

  specialNC:        $('specialNC'),
  breakdownList:    $('breakdownList'),
  totalAmount:      $('totalAmount'),
  resetBtn:         $('resetBtn'),
};

// ── STEPPER HELPER ────────────────────────────
function makeStepper(minusEl, plusEl, countEl, stateKey, min = 0, max = 99) {
  minusEl.addEventListener('click', () => {
    if (state[stateKey] > min) { state[stateKey]--; countEl.textContent = state[stateKey]; render(); }
  });
  plusEl.addEventListener('click', () => {
    if (state[stateKey] < max) { state[stateKey]++; countEl.textContent = state[stateKey]; render(); }
  });
}

// ── RADIO CARD HIGHLIGHT ──────────────────────
function bindRadioCards(radios, onChange) {
  radios.forEach(radio => {
    const card = radio.closest('.radio-card');
    radio.addEventListener('change', () => {
      radios.forEach(r => r.closest('.radio-card').classList.remove('active'));
      card.classList.add('active');
      onChange(radio.value);
    });
  });
}

// ── CALCULATE ────────────────────────────────
function calculate() {
  const lines = [];
  let total = 0;

  const add = (label, amount, mandatory = false, note = null) => {
    lines.push({ label, amount, mandatory, note });
    total += amount;
  };

  const docs = state.docs;

  if (state.service === 'witnessing') {

    if (state.signatory === 'company') {
      // Company execution — witnessing fee includes NC
      const fee = FEES.witnessing_company * docs;
      add(`Company execution × ${docs} doc${docs > 1 ? 's' : ''}`, fee, false, 'Inclusive of Notarial Certificate');
    } else {
      // Individual witnessing
      let witnessFee = 0;
      const s = state.signers;
      if (s >= 1) witnessFee += FEES.witnessing_individual_first;
      if (s >= 2) witnessFee += FEES.witnessing_individual_second;
      if (s >= 3) witnessFee += (s - 2) * FEES.witnessing_individual_further;
      const totalWitness = witnessFee * docs;
      add(
        `Witnessing — ${s} signator${s > 1 ? 'ies' : 'y'} × ${docs} doc${docs > 1 ? 's' : ''}`,
        totalWitness
      );

      // Notarial Certificate (not for company — included above)
      const ncFee = FEES.notarial_certificate * docs;
      add(`Notarial Certificate × ${docs}`, ncFee, true);
    }

    // Exhibits
    if (state.exhibits > 0) {
      const exhibitFee = FEES.exhibit_per * state.exhibits * docs;
      add(`Exhibits × ${state.exhibits} × ${docs} doc${docs > 1 ? 's' : ''}`, exhibitFee);
    }

  } else {
    // CTC
    const sealYes = state.sealReq === 'yes';
    const firstPageFee = sealYes ? FEES.ctc_seal_first : FEES.ctc_noseal_first;
    const subsFee = sealYes ? FEES.ctc_seal_subsequent : FEES.ctc_noseal_subsequent;
    const pages = state.pages;
    const pageFee = (firstPageFee + Math.max(0, pages - 1) * subsFee) * docs;
    add(
      `CTC (${sealYes ? 'seal' : 'no seal'}) — ${pages} page${pages > 1 ? 's' : ''} × ${docs} doc${docs > 1 ? 's' : ''}`,
      pageFee
    );

    // NC for CTC
    const ncFee = FEES.notarial_certificate * docs;
    add(`Notarial Certificate × ${docs}`, ncFee, true);
  }

  // Additional NC parties
  if (state.ncParties > 0) {
    const ncPFee = FEES.nc_additional_party * state.ncParties * docs;
    add(`Additional NC parties × ${state.ncParties} × ${docs}`, ncPFee);
  }

  // Prepared NC
  if (state.specialNC) {
    const snFee = FEES.special_nc * docs;
    add(`Notarial Certificate (prepared) × ${docs}`, snFee);
  }

  // SAL Apostille — mandatory
  const salFee = FEES.sal_apostille * docs;
  add(`SAL Apostille × ${docs}`, salFee, true, 'Incl. GST · paid to SAL');

  return { lines, total };
}

// ── RENDER ───────────────────────────────────
function render() {
  const { lines, total } = calculate();

  els.breakdownList.innerHTML = '';

  lines.forEach((line, i) => {
    const item = document.createElement('div');
    item.className = 'breakdown-item';

    const labelWrap = document.createElement('div');
    labelWrap.className = 'item-label-wrap';

    const labelEl = document.createElement('span');
    labelEl.className = 'item-label';
    labelEl.textContent = line.label;
    if (line.note) {
      const noteEl = document.createElement('span');
      noteEl.style.cssText = 'font-size:0.68rem;color:var(--ink-faint);font-family:var(--font-mono);';
      noteEl.textContent = line.note;
      labelWrap.appendChild(labelEl);
      labelWrap.appendChild(noteEl);
    } else {
      labelWrap.appendChild(labelEl);
    }

    if (line.mandatory) {
      const tag = document.createElement('span');
      tag.className = 'item-mandatory';
      tag.textContent = 'mandatory';
      labelWrap.appendChild(tag);
    }

    const amountEl = document.createElement('span');
    amountEl.className = 'item-amount';
    amountEl.textContent = `$${line.amount.toFixed(2)}`;

    item.appendChild(labelWrap);
    item.appendChild(amountEl);
    els.breakdownList.appendChild(item);
  });

  els.totalAmount.textContent = `$${total.toFixed(2)}`;
}

// ── SHOW/HIDE SECTIONS ───────────────────────
function updateVisibility() {
  if (state.service === 'witnessing') {
    els.witnessingOpts.classList.remove('hidden');
    els.ctcOpts.classList.add('hidden');
    els.addlSignersGrp.classList.toggle('hidden', state.signatory === 'company');
  } else {
    els.witnessingOpts.classList.add('hidden');
    els.ctcOpts.classList.remove('hidden');
  }
}

// ── EVENT BINDINGS ────────────────────────────
bindRadioCards(els.serviceRadios, val => {
  state.service = val;
  updateVisibility();
  render();
});

bindRadioCards(els.signatoryRadios, val => {
  state.signatory = val;
  updateVisibility();
  render();
});

bindRadioCards(els.sealRadios, val => {
  state.sealReq = val;
  render();
});

makeStepper(els.signersMinus, els.signersPlus, els.signersCount, 'signers', 1);
makeStepper(els.exhibitsMinus, els.exhibitsPlus, els.exhibitsCount, 'exhibits', 0);
makeStepper(els.pagesMinus,    els.pagesPlus,    els.pagesCount,    'pages',   1);
makeStepper(els.docsMinus,     els.docsPlus,     els.docsCount,     'docs',    1);
makeStepper(els.ncPartiesMinus, els.ncPartiesPlus, els.ncPartiesCount, 'ncParties', 0);

els.specialNC.addEventListener('change', () => {
  state.specialNC = els.specialNC.checked;
  render();
});

els.resetBtn.addEventListener('click', () => {
  state.service   = 'witnessing';
  state.signatory = 'individual';
  state.signers   = 1;
  state.exhibits  = 0;
  state.sealReq   = 'yes';
  state.pages     = 1;
  state.docs      = 1;
  state.ncParties = 0;
  state.specialNC = false;

  // Reset UI
  document.querySelector('input[name="service"][value="witnessing"]').checked = true;
  document.querySelector('input[name="signatory"][value="individual"]').checked = true;
  document.querySelector('input[name="sealRequired"][value="yes"]').checked = true;
  document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
  document.querySelector('input[name="service"][value="witnessing"]').closest('.radio-card').classList.add('active');
  document.querySelector('input[name="signatory"][value="individual"]').closest('.radio-card').classList.add('active');
  document.querySelector('input[name="sealRequired"][value="yes"]').closest('.radio-card').classList.add('active');

  els.signersCount.textContent  = 1;
  els.exhibitsCount.textContent = 0;
  els.pagesCount.textContent    = 1;
  els.docsCount.textContent     = 1;
  els.ncPartiesCount.textContent = 0;
  els.specialNC.checked = false;

  updateVisibility();
  render();
});

// ── INIT ──────────────────────────────────────
updateVisibility();
render();
