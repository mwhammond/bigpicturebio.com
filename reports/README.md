# Example reports (PDF downloads)

Each Solutions page has a "Download example report" card that email-gates a
**pre-made** PDF. Drop the finished PDFs in this directory using the exact
filenames below — the download links and the email capture are already wired
(see `assets/site.js` → `initLeadmag`, and `api/lead.js`).

| Solutions page | PDF filename (must match) | First-guess example |
|---|---|---|
| Clinical Development | `clinical-development-fianlimab.pdf` | Regeneron fianlimab (LAG-3) melanoma read-out prediction |
| Market Intelligence | `market-intelligence-pdac-adc.pdf` | Why TOPO-payload ADCs underperform in PDAC / next SoC |
| Investment & Partnering DD | `investment-dd-translation.pdf` | East-Asian read-out → Western squamous-lung translation verdict |
| Lifecycle & Franchise | `lifecycle-kras-backbone.pdf` | Extending a KRAS-inhibitor backbone |
| Platform & Payload | `platform-cargo-selection.pdf` | Cargo selection for an oncolytic virus (public T-VEC template) |
| Optimal Indication Selection | `indication-selection-msi.pdf` | Finding the indication where a mechanism wins (MSI-high) |

**These example topics are first guesses** taken from each page's worked
example. Swap them for whichever predicted-trial reports you'd rather showcase —
just update the `data-report` / `data-file` attributes on that page's
`form.lm-report` and the copy in the download card, then rename the PDF to match.

Until a PDF is added, its download link will 404 (the email is still captured).
