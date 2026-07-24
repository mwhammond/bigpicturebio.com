# Big Picture Bio — visual language directions

## The opportunity

The colour palette, editorial typography and Müller-curve metaphor are distinctive. The
problem is not the raw material; it is that the Müller is currently acting mainly as
wallpaper. It establishes mood, but does not yet show the product thinking.

The strongest reference sites make one scientific or computational object feel alive:
it has coordinates, states, responses and consequences. Big Picture Bio has richer
material than a protein render:

- evolving populations — Müller ribbons;
- causal and potentiating interactions — nodes and edges;
- thousands of candidate combinations — a search field;
- efficacy versus complexity — a Pareto frontier;
- timing and order — a sequence rail;
- failure modes — risk fractures and flags;
- multiple anatomical sites — linked miniature Müllers;
- clinical consequence — predicted and observed survival.

These should become one coherent visual grammar rather than a collection of charts.

## What currently makes the site feel older

1. **The hero is a background, not an event.** The large uninterrupted pink areas read
   as a textile or editorial gradient before they read as a biological population.
2. **The meaning is hidden.** The colours are not visibly tied to populations, events,
   risks or treatment decisions in the hero.
3. **The type is doing all the storytelling.** The thin serif and frequent italics are
   elegant, but when they carry the whole page the result feels literary rather than
   computational.
4. **The page rhythm is repetitive.** Large dark and pale blocks, text columns, cards
   and reveal-on-scroll transitions create a conventional brochure cadence.
5. **The existing charts are exhibits, not a system.** Survival, Pareto, landscape and
   verdict charts already exist in `assets/site.js`, but they do not visibly transform
   into one another or share a persistent model state.

## A single visual grammar

Every visual should be constructed from the same small set of primitives:

| Model idea | Visual primitive | Motion |
|---|---|---|
| Population dynamics | ribbons / stacked fields | split, contract, reseed, clear |
| Mechanism | nodes + typed edges | trace, gate, potentiate, antagonise |
| Combination search | point cloud | spawn, test, reject, converge |
| Pareto optimisation | frontier line + selected point | settle onto frontier |
| Temporal sequence | coloured rails + playhead | dose, pause, overlap, switch |
| Risk | red fracture / flag / interrupted edge | surface at the relevant state |
| Multiple sites | linked miniature ribbon stacks | respond differently, then reconcile |
| Survival | stepped curves + confidence ghosts | separate over time |
| Uncertainty | halo / ghost path | sharpen or widen as evidence changes |

The palette then has meaning:

- the existing amber–coral–pink–mauve–plum spectrum is **biology**;
- a restrained ice blue or periwinkle is **model state / selection**;
- a sharp warm red is **risk / contradiction**;
- graphite, warm white and hairline grey are the stage.

Colour should live inside the model objects, not wash over every section.

## Direction 1 — The instrumented Müller

### Idea

Keep the most ownable asset, but turn it from a backdrop into a live scientific
instrument. The Müller sits in a bounded model viewport with a time axis, sparse labels,
events and a moving playhead. The visitor can see which population is changing and why.

### Hero behaviour

1. Begin at a mixed, treatment-resistant baseline.
2. A candidate combination appears as two or three small component tokens.
3. A vertical playhead moves through the Müller.
4. Population labels appear only at the moments that matter.
5. The resistant band splits, briefly expands, then collapses.
6. The outcome resolves to durable control, with a small survival projection beside it.

Cursor movement can scrub a few months either side of the current state. Scroll advances
the actual narrative. There is no autoplaying spectacle that competes with the copy.

### Strengths

- Most ownable to Big Picture Bio.
- Fastest route from the current site.
- Makes “turning months into decades” visible rather than decorative.
- Works in SVG/canvas and remains light enough for a static multi-page site.

### Risk

If every annotation is visible at once it becomes a dashboard. Use editorial scale,
cropping and progressive disclosure.

## Direction 2 — The combination constellation

### Idea

Lead with the search and reasoning process. Components, cell states, delivery constraints
and risks form a sparse constellation. Typed edges trace as the model reasons. Thousands
of faint candidate points sit behind the active graph.

### Hero behaviour

1. Three component tokens enter the field.
2. Edges trace through relevant cell states.
3. A contradiction or risk fractures one path.
4. Alternative combinations bloom as a point cloud.
5. The cloud rotates or collapses into a Pareto frontier.
6. One candidate is selected and passed into the Müller simulation.

### Strengths

- Feels unmistakably computational and contemporary.
- Expresses both reasoning and scale.
- Naturally supplies heroes for Platform, Competitive Intelligence and diligence pages.
- Closest to the energy of Decoding Bio without copying its radial graphic.

### Risk

Network graphics are a generic AI trope. Typed edges, biological state labels and the
transformation into a real treatment trajectory are essential to make it proprietary.

## Direction 3 — The multi-site treatment atlas

### Idea

Use delicate linework to describe the body as a connected system rather than an
anatomical illustration. Three to five abstract sites hold miniature Müller fields.
Treatment sequence travels between them; different sites respond at different speeds;
risk hotspots interrupt the flow.

### Hero behaviour

1. A sparse topology draws itself.
2. Miniature Müller stacks appear at the primary lesion, marrow, liver and immune
   compartment.
3. A sequence rail advances along the bottom.
4. One site fails to clear and becomes the highlighted design constraint.
5. The optimised sequence changes the shape of every site at once.

### Strengths

- Most artistic and most differentiated from molecule-led biotech.
- Communicates systems biology and multi-site reasoning immediately.
- Excellent for Pipeline, Clinical Development and the company story.

### Risk

More conceptual than the other directions. The model labels and outcome need to stay
concrete so it does not become “beautiful anatomy wallpaper”.

## Direction 4 — The decision theatre

### Idea

Art-direct the model outputs as a live decision surface: a selected combination in the
centre, with survival, Pareto, temporal sequence, risk and confidence views orbiting it.
Views expand and rearrange as the reader moves through the page.

### Hero behaviour

The hero begins with one concise verdict. On scroll, its supporting evidence assembles:
mechanism graph, risk flag, sequence, survival projection and confidence. The page feels
like watching a scientific committee arrive at a defensible decision.

### Strengths

- Most product-like and most directly relevant to pharma buyers.
- Reuses the charts already present in `assets/site.js`.
- Maps cleanly onto the five Solutions pages.

### Risk

Can drift into SaaS-dashboard territory. Keep the number of panes low, the scale bold and
the composition asymmetrical.

## Recommended direction

Use a hybrid of **Direction 1 and Direction 2**, with Direction 3 reserved as a strong
secondary motif.

The homepage hero should be an **instrumented Müller** because that is the clearest,
most ownable expression of the promise. The next major section should transform that
same visual into a **combination constellation and Pareto field**, showing how the
outcome was designed. The multi-site atlas should appear later, when the story expands
from tumour dynamics to whole-system modelling.

This produces a simple narrative:

> Observe the disease → reason across interactions → search combinations → select the
> Pareto candidate → optimise sequence → surface risks → simulate every site → project
> survival.

## Homepage storyboard

### 1. Hero — see the disease change

Copy occupies roughly 40% of the screen. A large, bounded model viewport occupies the
rest. The Müller has sparse axes and population labels. A slow playhead and tiny state
changes make it feel live before the visitor scrolls.

### 2. Why combinations are hard — see the interactions

The ribbons narrow into labelled nodes. Synergy, feedback and temporal dependence are
demonstrated as three short changes in one graph, replacing the current three explanatory
text columns.

### 3. What the model does — see the search

The graph recedes into a cloud of candidate combinations. Most candidates fail quietly.
The surviving points settle onto a Pareto frontier.

### 4. How it designs — see the sequence

The selected point expands into a temporal rail: order, overlap, pauses and site-specific
delivery. A risk fracture appears at the exact point the original schedule fails.

### 5. Why it matters — see the clinical consequence

The sequence feeds back into the Müller and then into a survival plot. Predicted and
observed curves align. The report excerpt becomes supporting evidence rather than the
first place where the model feels concrete.

### 6. Solutions — five views of the same engine

Do not use five generic cards. Each offering becomes a view switch on the same model:

- Clinical Development — survival + trial levers;
- Competitive Intelligence — mechanism landscape;
- Investment & partnering — verdict + confidence;
- Lifecycle — Pareto + resistance;
- Platform & Payload — graph + ranked search field.

## Art direction rules

### Typography

- Let Geist or another clean grotesk carry most large declarative headlines.
- Retain Source Serif for the human promise and one italic word, such as “decades”.
- Keep Geist Mono for coordinates, states, counts and evidence labels.
- Avoid setting complete paragraphs in italic; it reinforces the older editorial feel.

### Composition

- Prefer one large scientific object over a full-bleed background.
- Crop the object at the viewport edge and allow labels to sit outside it.
- Use asymmetry, negative space and one clear focal point.
- Replace repeated equal-width card rows with one primary view and two small supporting
  signals.

### Motion

- Motion must explain a model transition, not simply announce that an element entered.
- Use slow idle drift only on the active scientific object.
- Use one purposeful transformation per section.
- Avoid scroll-jacking; use a sticky model viewport with normal copy scroll beside it.
- Provide a reduced-motion version and static mobile frames.

### Surface

- Use graphite and warm white as foundations.
- Use the full palette only inside biology.
- Add faint grids, coordinates and hairlines for technical texture.
- Keep glow local to active nodes or selected candidates.
- If grain is used, keep it extremely subtle; heavy grain will push the palette back
  towards a retro look.

## Practical implementation in the current site

The current static architecture is sufficient. No framework or heavy 3D engine is
required.

1. Add a shared visual module that renders:
   `muller`, `network`, `pareto`, `sequence`, `risk`, `multisite`, `survival`.
2. Use SVG for labelled graphs and lines; canvas for large point fields and soft
   particles.
3. Keep one shared model state so the visuals transform rather than reset in each
   section.
4. Expose the same modules through `data-visual` attributes on the five solution pages.
5. Render deterministic static frames for mobile and `prefers-reduced-motion`.

The existing `concept.html` is a useful direction-zero prototype: it proves the palette
can support a living Müller, network, Pareto and multi-site system. The next iteration
should connect those motifs into one continuous cause-and-effect story and make their
scientific meaning visible.

## Best next step

Build three hero studies using identical copy and palette:

1. instrumented Müller;
2. combination constellation;
3. multi-site atlas.

Judge them on five things: ownability, immediate comprehension, perceived technical
depth, emotional impact and mobile clarity. Only after choosing the hero should the
visual grammar be propagated through the rest of the site.
