# BD Website — Structure, Naming & Design-Fit

*How the BD offering maps onto the `interactive-scroll-imagery` design: what the menu is, one page per buyer team, and how the cinematic style flexes to carry text-heavy, scannable content.*

Companion to `bd/positioning-synthesis.md` (the strategy rationale). This file is the build spec.

---

## 0. The throughline (must land on every page)

One sentence the whole site should reinforce, everywhere:

> **We predict the hard-to-model synergistic interactions that decide modern combination therapies — in the complex, evolving diseases where they matter most: cancers, immune diseases and neurological diseases.**

Why it's the spine:
- It names our **moat** — *synergistic* interactions are exactly where conventional models and lab brute-force break down, and where the therapeutic upside is largest.
- It names our **domain** — the three disease families we focus on (oncology, immunology, neurology), which also happens to be the internal pipeline arc.
- It's the honest scope: not "all of biology," but the hardest, highest-value slice of it.

**Where it shows up:** homepage hero + mission (Company page), a one-line restatement near the top of every Solutions page, and the framing of the Pipeline page. Every buyer page is a *specialisation* of this one claim, not a separate story. Keep the wording tight and consistent so it reads as a single company with a sharp focus.

---

## 1. Can the cinematic scroll style carry text-heavy content?

**Yes — but by reusing the design *language*, not the sticky-scroll *mechanic*, on the solution pages.**

The current homepage is a 600vh "journey": crossfading full-bleed scenes, one big serif line + one stat per beat, glass data panels, a paper "validation report" excerpt, a pipeline diagram. That format is a **narrative device** — it's deliberately low-density (≈30 words per scene) and high-emotion. Perfect for the homepage's linear "why us."

BD solution content is the opposite: **reference content**. A BD/CI/S&E reader usually arrives mid-context (a link off the leave-behind, a QR at a conference, a forwarded email) wanting to *scan* — "does this help my Phase III go/no-go? where's the worked example? who's it for? how do I start a conversation?" Forcing that into sticky crossfades would (a) hide content from scanning, (b) be slow to build and maintain per page, (c) fight the reader's intent.

So we run **two page archetypes on one design system:**

| Archetype | Used for | Scroll grammar |
|---|---|---|
| **Narrative** | Homepage | Keep the existing 600vh sticky "journey" as-is |
| **Solution** | The four team pages | Short cinematic hero → normal-flow, scannable sections that *reuse the same components* with `reveal`-on-scroll (no sticky crossfade) |

Everything visual stays continuous — same CSS tokens (`--bg`, `--accent:#F08AB8`, Source Serif display, Geist Mono eyebrows), same components (`.panel`, `.report`, `.pipe`, `.statline`, `.scene`/`.scene-scrim`, `.section`/`.section-bg`, `.cta`, `.reveal`). Only the *layout rhythm* changes: from one-idea-per-viewport to dense, sectioned, scannable.

The cinematic texture survives on solution pages through (1) a documentary-still **hero** and (2) occasional full-bleed **scrim section-headers** between content blocks — not by making every paragraph a sticky beat.

---

## 2. The reusable component kit (already built on the branch)

These exist in the current bundle and are exactly what makes the dense pages feel on-brand. Reuse, don't reinvent:

- **`.scene` + `.scene-scrim`** — full-bleed image with dark gradient scrim → page heroes and section headers.
- **`.layer-text`** — eyebrow + serif `h2` (with `.accent` italic) + serif body + `.statline`. → every text block.
- **`.statline`** (`.n` big serif number + `.l` label) → KPI bands ("87% prospective", "−40% patients").
- **`.panel`** (glass card: title, tag, SVG chart, legend, note) → data exhibits.
- **`.report`** (cream "paper" excerpt with highlight + callout) → **the killer asset**: a mechanistic verdict / diligence memo / validation excerpt anchored to a live example. This one component does most of the persuasive work on the BD pages.
- **`.pipe`** (labelled progress bars) → pipeline / sequence / readout-timing exhibits.
- **`.cta`** (pill button) and **`.section` / `.section-bg`** (scrim-image standard section).

---

## 3. Naming — frame by the buyer's team

You were right to push on this: "franchise team" is real vocabulary but it's not the *function that buys*. Reframed around the team that owns the decision (validated against how pharma actually names these — BD&L, Search & Evaluation, Competitive Intelligence, Lifecycle Management, Corporate Development):

| Page (menu item) | The team that buys | The one-line promise | Lead proof |
|---|---|---|---|
| **Clinical Development** | Global Project Leaders, Clinical Dev Plan owners, biometrics | *Design the trial that reads out.* | 87% prospective endpoint prediction |
| **Competitive Intelligence** | CI, Portfolio Strategy, TA strategy | *Know what becomes standard of care — mechanistically.* | Called the Regeneron Ph III miss |
| **Investment & partnering DD** | BD&L / Search & Evaluation / Corporate Development **and** VCs (all stages) / hedge funds running investment DD | *Diligence that isn't a coin toss — for a deal or a position.* | Mechanistic asset verdict |
| **Lifecycle & Franchise Strategy** | Lifecycle Management, franchise/TA leads, asset teams, Discovery | *Keep your asset the standard of care.* | Generative combination + resistance map |
| **Platform & Payload Strategy** | Preclinical **platform / delivery** biotechs — viral vectors, ADCs, LNP, cell therapy (e.g. Stratosvir) | *Point your platform at the right target.* | Generative payload/target search + resistance map |

Notes on the choices:

- **"Franchise"** stays in the *title* of page 4 because it's the word your advisory board used and franchise/TA leaders will self-identify — but the *function* doing the work is **Lifecycle Management / Asset Strategy**, so the page speaks to both. If you'd rather one word, use **"Lifecycle Strategy."**
- **Investment & partnering DD is one page — framed by the *action*, not the customer.** It merges what were two audiences (pharma BD&L / S&E / Corp Dev doing deal diligence, and VCs / hedge funds doing investment DD) because they're hiring the model for the *same job*: a mechanistic verdict on whether an asset works and beats SoC. The page splits into two short audience lanes — *partnering / M&A* and *investing* — but tells one story. Naming it by the action ("investment & partnering DD") matches the rest of the menu, which are all actions/teams, and sidesteps the "is this about *our* investors?" confusion.
- **It stays distinct from Competitive Intelligence:** CI answers *"where is the field going?"*; Investment & partnering DD answers *"is this specific asset worth a deal or a position, and will it beat SoC?"*
- **No "certification" language** anywhere — no one will believe an independent stamp yet. It's positioned as *the same mechanistic rigour applied to the deal / buy / back / hold decision.*
- **Discovery** ("better bets raise their profile") is folded into **Lifecycle & Franchise Strategy** as a second entry point (design novel combinations for an *early* asset vs. extend a *marketed/late* one).
- **Platform & Payload Strategy is a different audience.** The other four sell to *pharma pipeline teams* deciding on their own molecules; this one sells to *platform/delivery biotechs* (viral vectors, ADCs, LNP, cell therapy) — Stratosvir asked us to find the best cargo for their vaccinia vector, and we've heard the same from other vector companies. Same engine (generative search + resistance map), different question. Sits in the same flat Solutions list. Title alternatives if "Platform & Payload" doesn't land: **"Payload Selection"**, **"Modality Positioning"**, **"Preclinical Asset Positioning."**

---

## 4. Menu & information architecture

Current nav is wordmark-only. Proposed top nav (applies to every page, `position:fixed`, reusing `.nav`):

```
Big Picture Bio       Solutions ▾       Pipeline       Company       Contact

  Solutions ▾
  ├ Clinical Development
  ├ Competitive Intelligence
  ├ Investment & partnering DD
  ├ Lifecycle & Franchise Strategy
  └ Platform & Payload Strategy
```

- **Home** = the cinematic narrative (the "why" — the world model). Unchanged.
- **Solutions ▾** = the five pages, one flat list, each named by the *action/team* it serves. *(pharma teams, platform biotechs, and — on the Investment & partnering DD page — VCs / hedge funds.)*
- **Pipeline** = what we're actually working on — focus + partnerships + internal programmes (§6c). Proof of traction.
- **Company** (replaces "Team") = §6a — mid-length mission + the forthcoming *Cell* paper + team.
- **Contact** = existing section, promoted to a nav anchor.
- **Approach** = deeper "how the model works / validation" page. **Stub the route, keep it OUT of the nav until it has content** (Mark imports the outline from the other repo). A visible-but-empty menu item reads worse than no item; add it back to the nav when populated.

Each Solutions item is a real page with its own URL (good for SEO, and so a leave-behind / email can deep-link a reader straight to the relevant page). Down to **five** top-level nav items now that investor + BD/M&A are one page — comfortable.

> **Build decision — settled:** **plain static multi-page.** One HTML file per route, sharing a nav/footer partial. Simplest for SEO, deep-linking and per-page OG images; no app logic needs an SPA.
>
> **Keeping the "highly dynamic" feel (Mark's ask):** static multi-page ≠ static-*feeling*. Each page still carries the full motion system — the animated Muller background, `reveal`-on-scroll, the cinematic hero, hover/CTA transitions. "Static" only means *no client-side router / no SPA framework*, not "no animation." Two things to get right so it doesn't feel like a flat brochure:
> 1. **Shared motion library** — factor the Muller/reveal/scroll JS into one included script every page loads, so all five pages animate identically.
> 2. **Between-page continuity** — add a fast fade/scrim transition on nav clicks (and consider view-transitions API where supported) so moving between pages feels like moving *within* one cinematic world, not a hard reload.

---

## 5. Solution-page template (applies to all four)

Same skeleton every page, swap the content. Top-to-bottom:

1. **Hero (cinematic, short — ~90vh, not 600vh).**
   `.scene` image + `.scene-scrim` + `.layer-text`: mono eyebrow (the team name) → serif `h2` promise line (accent italic on the verb) → one `.statline` proof number → `.cta` "Start a conversation." This is the only "cinematic beat" — it sets tone, then the page gets dense.

2. **The decision (framing).** 2–3 sentence serif block in the reader's own words — the job they're doing and why it's hard today. Reuse `.layer-text` typography in normal flow.

3. **What we deliver.** A short, scannable deliverables list (3–5 items) — concrete outputs, not capabilities.

4. **Worked example (the centrepiece).** A `.report` paper excerpt anchored to a *live, named* discourse example (see §6), with the highlight + callout carrying the punchline (predicted vs. actual, or the verdict). This is what a BD reader screenshots into their deck.

5. **The exhibit.** One `.panel` chart or `.pipe` diagram relevant to the page (e.g. predicted-vs-actual survival for Clinical Dev; Pareto efficacy-vs-complexity for Lifecycle; a landscape/SoC-timeline for CI; an asset-verdict scorecard for Investment & partnering DD).

6. **KPI band.** A row of `.statline`s = the metrics this team is measured on (see per-page below).

7. **Who this is for.** A compact role strip (the specific titles that buy — GPLs, CI leads, S&E, LCM…), so the reader self-identifies.

8. **What we're modelling now.** The live-discourse strip (shared across pages, lightly tailored) — proof of currency. Reuse mono type on a `.section-bg` scrim band.

9. **CTA / contact.** Reuse the warm-gradient `.contact` block → `partnerships@bigpicturebio.com`.

---

## 5a. The lead magnet — "your hardest question, answered in 24 hours"

A single, genuinely compelling offer on every Solutions page, **tailored per audience** (the Investment & partnering DD page runs one offer covering both its lanes). This is the primary email-capture mechanism and it doubles as the top of the sales funnel — the answer *is* the sales conversation.

**The mechanic:** a short form — work email + one free-text box for their question (+ optional asset/indication). We reply within 24 hours with a real, mechanistic mini-answer. Manual to start; **automate over the MCP later** (see the Investment & partnering DD page's investment lane in §6) once volume justifies it. The offer is framed as *"one question, one answer, no obligation"* — low friction, high signal.

**Placement:** its own band near the foot of each page, above the contact CTA. Reuse a `.panel` (glass) for the form on the dark pages; keep it to two fields so it doesn't feel like a gated whitepaper.

**Tailored offer per page** (headline → what they submit → what we send back):

| Page | Offer headline | They send | They get back (24h) |
|---|---|---|---|
| Clinical Development | *Send us your toughest trial-design question.* | The trial / design decision they're weighing | A predicted-endpoint read + the one experiment that moves the odds |
| Competitive Intelligence | *Name the read-out you're worried about.* | A competitor asset / upcoming catalyst | A mechanistic take on whether it changes practice |
| Investment & partnering DD | *Give us the asset you're weighing.* | A partner / target / company / ticker | A mechanistic verdict — where it wins, what it needs |
| Lifecycle & Franchise Strategy | *Tell us the asset you want to defend.* | A marketed / late-stage asset | One combination or sequence idea + the rationale |
| Platform & Payload Strategy | *Tell us what your platform delivers.* | The modality + a target space | A candidate payload/target shortlist for a lead |

**Build / ops notes:**
- The site is on **Vercel** (`vercel.json` present) → capture via a Vercel serverless function or a form service (Formspree/Basin). No CMS needed.
- **Privacy:** work-email + a question is personal data — add a one-line consent note ("we'll only use this to answer your question") and a link to a short privacy note. Don't pre-tick anything; don't ask for more than email + question.
- **Fulfilment SLA:** "within 24 hours" is a promise — only ship the offer when someone owns the reply queue. Consider "one free question per company" to bound load early.
- **Funnel value:** every submission is a qualified lead *and* a live example of the model working — some (anonymised, with permission) become the next worked-example `.report` on that page.

---

## 6. Per-page copy (draft, buyer-facing)

Each page below is written as real page copy — a hero line, a subhead, a hook paragraph, a benefit-led "what you get", and a proof line — ready to drop in and refine. Internal build notes are in *[square-bracket italics]* and don't appear on the page. Tone throughout: confident, specific, never talking down to the buyer about their own asset or technology.

### Clinical Development
> **Eyebrow:** For Clinical Development
>
> **Hero:** See the read-out before you run the trial.
>
> **Subhead:** We predict your endpoint — OS, PFS, tox — with 87% prospective accuracy, then help you design the trial that clears it.

Phase-to-phase success sits near 20%, and most of that risk is settled before the first patient is dosed — in the line you chose, the population you enrolled, the dose you escalated to. Our reasoning model reads those choices the way the biology will, so you commit to the design that wins rather than the one you hope will.

**What you get**
- The predicted endpoint for your trial exactly as designed — with a confidence level you can take into a committee.
- The design changes that lift probability of success while cutting patient numbers, time and cost.
- The single in-vitro or in-vivo experiment that moves your odds the most — so your budget buys the result that actually matters.
- Statistics built for combinations and sequences, not a monotherapy test applied to a synergy.

**Proof:** 87% prospective on ASCO read-outs — it flagged the Regeneron Phase III miss before the market did.

*[Exhibit: predicted-vs-actual survival `.panel`. Worked example: reuse the Regeneron `.report`. Live anchors: BiTE dose step-up / CRS; "2nd-line signal → 1st-line win."]*

### Competitive Intelligence
> **Eyebrow:** For Competitive Intelligence
>
> **Hero:** Read the field by its mechanism, not its press releases.
>
> **Subhead:** Know what becomes standard of care — and what a rival's combination does to your franchise — before the abstract drops.

Your team already tracks every catalyst and every conference. The gap is mechanism: which of these read-outs will actually change practice, and which is noise. We model the biology beneath the headline, so your next portfolio review runs on what will happen — not on what was announced.

**What you get**
- Mechanistic calls on what becomes standard of care, and when.
- A clear line on what a competitor's combination means for each of your assets.
- What your trials will have to beat by the time they launch — so nothing reaches the market already obsolete.
- Every answer traceable to the biology and the trial design behind it — ready to defend in the room.

**Proof:** the model called the Regeneron Phase III miss that erased £9B in a single day.

*[Worked example: a "why TOPO fails in PDAC" or "CD47 rebound in breast" `.report`. Live anchors: post-GLP-1 world; oral SERDs; immuno-vs-onco transfer.]*

### Investment & partnering DD
> **Eyebrow:** For Investment & Partnering DD
>
> **Hero:** Turn "coin toss until clinical" into a verdict.
>
> **Subhead:** A mechanistic read on whether an asset works — in which setting, which population, and whether it still beats standard of care at launch. For anyone weighing a partnership, an acquisition, or an investment.

Diligence today leans on the seller's data and a conviction that only resolves years later in the clinic. Modern therapies increasingly turn on synergistic interactions that are genuinely hard to model — exactly where a data room and a KOL call run out of road. We give you the missing half: a mechanistic verdict on the asset itself — where it wins, what it needs beside it, and whether it will still be standard-of-care-beating by the time it reads out. Your conviction rests on the science, not the narrative around the deal or the raise.

**What you get**
- A clear verdict: where the asset works, and where it won't.
- What it needs to win — the combination, sequence or setting your thesis depends on.
- Translation risk called early — whether a read-out in one population will hold in another.
- A beat-standard-of-care assessment against the projected launch date, not today's.

**Two lanes, one engine.** The page splits into two short audience blocks:

- **Partnering & M&A** *(BD&L · Search & Evaluation · Corporate Development).* De-risk an in-licensing or acquisition target before terms: does the asset's mechanism support the thesis, and what does the deal actually need to work.
- **Investment DD** *(VCs across every stage · hedge funds · crossover).* The same rigour applied to a position — buy / back / hold — assessing the science behind the ticker. **At the speed and scale you work:** query the model programmatically over **MCP** to run the same diligence across a watchlist, a sub-sector, or a whole fund's pipeline, and refresh it as catalysts move. Start with one question; scale to standing coverage. *(Examples to come.)*

**Proof:** *[a named verdict or translation call — e.g. Harmoni-6 → Western squamous lung; or a mechanistic call on a public asset ahead of a catalyst.]*

*[Worked example: an asset-verdict `.report`. KPI band: downside caught pre-clinic; deal/position conviction; diligence turnaround. Note: keep any performance/return language out of the investment lane — this is scientific diligence, not investment advice.]*

### Lifecycle & Franchise Strategy
> **Eyebrow:** For Lifecycle & Franchise Strategy
>
> **Hero:** Keep your asset the standard everyone else is measured against.
>
> **Subhead:** The combination, sequence and setting that keep your molecule first-line — one step ahead of the backbone.

The molecules that define a decade rarely do it alone. We search tens of thousands of combinations and sequences to find the few that extend your asset's lead, predict the survival benefit each delivers, and map the resistance before the disease finds it — so your franchise stays the one everyone else has to beat.

**What you get**
- A shortlist of designed regimens — combination, sequence, dose, setting — each with a predicted OS/PFS benefit.
- Co-optimised for the whole picture: efficacy, tolerability, delivery and clinical simplicity.
- A resistance map of known and predicted escape routes, so the regimen holds as the disease evolves.
- The same engine whether you're extending a marketed asset or designing the combination for an early one.

**Proof:** we search tens of thousands of combinations and surface the handful no screen would have found.

*[Worked example: KRAS-backbone augmentation, or IO-sequencing design, as a `.report`. Exhibit: Pareto efficacy-vs-complexity `.panel`.]*

### Platform & Payload Strategy
> **Eyebrow:** For Platform & Payload Strategy
>
> **Hero:** Your platform can deliver almost anything. We tell you what to deliver first.
>
> **Subhead:** The payload, target and indication that turn your delivery technology into a clinical winner.

You've built a platform that can carry a wide range of cargo to a wide range of targets — and that range is exactly what makes the first commitment hard. We search the payload × target × indication space against your platform's real strengths and hand you the lead that's most likely to work in patients, so your first programme is your best shot, not your fastest guess.

**What you get**
- A ranked shortlist of payloads and targets matched to what your platform does best.
- The indication where your technology wins first — the cleanest path to a clinical signal.
- A predicted effect and a resistance map for each candidate, so your lead holds up over time.
- The one experiment that de-risks your lead choice before you commit the programme.

**Proof:** Stratosvir came to us to find the best cargo for their vaccinia vector — and we hear the same question from vector companies across the field.

*[Tone: founders / CSOs — plainer and faster than the pharma pages. Worked example: a cargo-selection `.report`, anonymised as needed.]*

---

## 6a. Company page (replaces "Team")

"Team" alone reads early. A **Company** page carries more weight and gives visitors a reason to trust:

1. **Mission (mid-length).** A ~120–180 word version of the vision — longer than the homepage line, shorter than a manifesto. The "why combination therapy, why a world model, why now" story in prose.
2. **The science — the *Cell* paper.** A featured band for the forthcoming *Cell* publication: title, one-line finding, and a link/"read the paper" CTA (stub the link until it's live). This is major credibility — give it real estate, reuse the `.report` paper component for a figure/abstract excerpt. *(Confirm embargo/timing before publishing anything about it.)*
3. **Team.** The existing `.team-grid` (Kerstin, Mark) + `.advisors` (Garry, Duncan) — unchanged.
4. **Backing / partners** (optional) — investors/partners once nameable; otherwise omit.
5. **Contact** hand-off.

---

## 6b. Updates / announcements

Yes — worth having, and low-cost. Two-tier approach:

- **Global footer "Latest" strip** (every page): the 2–3 most recent items — fundraise, *Cell* paper, a new post — each a dated one-liner linking out. Keeps the site feeling *alive* (reinforces the "dynamic" ask) and gives repeat visitors a reason to notice change.
- **Optional `/updates` page** later: a simple reverse-chronological list (announcements + blog posts). Static multi-page makes this trivial — one HTML file, hand-added entries — no CMS needed to start. Don't build the page yet; ship the footer strip first and grow into the page when there are ≥3–4 items.

The **global footer** (new, shared across all pages) should also carry: wordmark + one-line positioning, the Solutions links, Pipeline / Company / Contact, `partnerships@` + `kerstin@`, and copyright. This replaces the current single-email footer. *(This is also where the "Latest" strip and, later, an `/updates` link live.)*

---

## 6c. Pipeline page

The traction/proof page. Overlaps the homepage's "Pipeline & partnerships" scene — treat that scene as the **teaser**, this page as the **full table**. Content seeded directly from the current pipeline slide:

> **Eyebrow:** Pipeline & Partnerships
>
> **Hero:** Ten programmes in design or terms, pre-launch.
>
> **Subhead:** First pilot deal signed with a biotech · top-10 pharma in early discussion · a growing internal pipeline.

**Our focus, stated plainly.** We deliberately go narrow: the synergistic interactions that are hardest to model, in complex, evolving diseases — cancers, immune diseases and neurological diseases. Today that means **repurposing post-Phase 2 assets into better combinations**, **designing novel assets and combinations**, and **partnering** across those three disease families.

**Partnerships table** *(reuse/extend the existing pipeline component; partners anonymised exactly as in the current slide):*

| Partner | Indication | Approach | Stage |
|---|---|---|---|
| Biotech 01 | Osteosarcoma | Novel-target small molecule | Design |
| Biotech 01 | Esophageal | Novel-target small molecule | Design |
| Biotech 02 | Prostate | Phase 2+ combination via viral delivery | Design |
| Biotech 03 | Pancreatic | Matrix-degradation biologic + existing drug | Design |
| Biotech 03 | Prostate | Matrix-degradation biologic + existing drug | Design |
| Biotech 04 | Pancreatic | Resistance-modifying small-molecule combo | Design |
| Pharma 01–04 | *scope tbd* | Top-10 · oncology BD discussion | Early discussion |
| Internal | *TBD within 6 months* | Common pan-cancer strategies from a programme-level hallmark map | Scoping |

*[This is real traction data — confirm what's safe to show publicly. Anonymised partner labels (as above) are the safe default; the "first pilot deal signed" and "top-10 pharma" lines are strong and probably fine, but check before launch. This page is also a natural stop for an Investor reader — cross-link the two.]*

---

## 7. Things to reconcile before building

**Resolved:**
- **Throughline:** every page reinforces one claim — hard-to-model *synergistic* interactions in complex, evolving diseases (oncology, immunology, neurology). See §0.
- **Number:** lead with **87%** everywhere (site + deck).
- **Multi-page:** plain static multi-page, shared nav/footer, motion library on every page; between-page fade to keep it feeling dynamic.
- **Solutions pages:** **five**, one flat list — Clinical Development, Competitive Intelligence, Investment & partnering DD, Lifecycle & Franchise, Platform & Payload. Discovery folded into Lifecycle.
- **Investment & partnering DD:** one Solutions page merging deal diligence (BD&L / S&E / Corp Dev) and investment DD (VCs / hedge funds), split into two lanes; MCP-scale access lives in the investment lane. Named by the *action* to match the rest of the menu and avoid the "our own investors?" confusion.
- **Pipeline page:** traction + focus + partnerships table, seeded from the current slide (§6c).
- **Lead magnet:** "your hardest question, answered in 24h," tailored per page; manual first, MCP-automated later (§5a).
- **Approach:** stub the route, keep out of nav until it has content — Mark imports the outline later.
- **Company** page replaces Team (mission + *Cell* paper + team).
- **Updates:** global footer "Latest" strip now; optional `/updates` page later.
- **Examples:** any are fine for now (use the live anchors in §6); revisit which are safe to name publicly before launch.

**Still open:**
- **Platform page title** — "Platform & Payload Strategy" vs. "Payload Selection" / "Modality Positioning" / "Preclinical Asset Positioning."
- **Lead-magnet ops** — who owns the 24h reply queue, and do we cap at one free question per company at launch.
- **Investment & partnering DD page** — which named public examples we can show, and when the MCP access is real vs. "coming."
- **Pipeline page** — confirm what traction is safe to state publicly (anonymised partners assumed; "first pilot deal" / "top-10 pharma" lines to check).
- **Cell paper** — confirm embargo/timing before anything about it goes on a public page.
- **Company page extras** — name backers/partners yet, or omit for now?

---

## 8. Suggested build order

1. Lock this structure + naming (this doc).
2. **Extract shared partials** from the current single bundle → a reusable `nav` (Solutions dropdown + Pipeline / Company / Contact), `footer` (with "Latest" strip), and the **motion library** (Muller + reveal + page-transition JS) every page includes. This is the multi-page skeleton.
3. Update the **homepage** to use the shared nav/footer, set 87% everywhere, and sharpen the throughline (§0) in the hero.
4. Build **one** solution page end-to-end (recommend **Clinical Development** — strongest existing exhibit, the Regeneron `.report`) as the template, including the between-page fade and the §5a lead-magnet block wired to a form handler.
5. Clone the template for the other four Solutions pages, swapping content from §6.
6. Build the **Pipeline** page (§6c). *(Investment & partnering DD is built in step 5 as one of the Solutions pages.)*
7. Build the **Company** page (§6a); stub the empty **Approach** route + optional `/updates`.
8. Produce the leave-behind deck from the locked page copy (deck outline in `positioning-synthesis.md`).
