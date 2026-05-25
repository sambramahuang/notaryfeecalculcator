# Notary Fee Calculator · Singapore

A client-side fee estimator for Singapore notarial services, based on the statutory fee schedule in **Schedule 1 of the Notaries Public Rules (Cap. 208, R1)**.

## Features

- **Witnessing / Execution** — individual or company signatories, multiple signers, exhibits
- **Certified True Copy (CTC)** — with or without seal, multi-page support
- Automatic inclusion of the mandatory **SAL Apostille** ($87.20 incl. GST) per SAL policy (effective 16 Sep 2021)
- Live fee breakdown with mandatory-fee tagging
- Multi-document scaling — fees recalculate across any number of documents
- Additional NC parties and special Notarial Certificate toggle

## Fee Schedule

| Item | Rate |
|---|---|
| Individual witnessing — 1st signatory | $40 |
| Individual witnessing — 2nd signatory | +$20 |
| Individual witnessing — each further | +$10 |
| Company execution (incl. NC) | $150 |
| Exhibit marked/attached | $10 each |
| Notarial Certificate | $75 |
| Additional party on NC | +$20 |
| Special Notarial Certificate | +$75 |
| CTC with seal — 1st page | $10 |
| CTC with seal — subsequent pages | $2/page |
| CTC without seal — 1st page | $5 |
| CTC without seal — subsequent pages | $1/page |
| SAL Apostille (mandatory, incl. GST) | $87.20 |

## Usage

Open `index.html` in any modern browser — no build step, no server required. For local development with MAMP, place the folder under `htdocs/` and navigate to `http://localhost/notaryfeecalculcator/`.

## Disclaimer

Estimates are based on statutory fees only. The notary's own professional fees may be higher. Additional charges may apply for travel, translation, urgency, or special circumstances. Fees exclude GST if the notary's practice is below the GST registration threshold.

## Files

```
index.html      markup and UI
style.css       styling (Playfair Display / DM Sans / DM Mono)
calculator.js   fee logic and DOM interaction
```
