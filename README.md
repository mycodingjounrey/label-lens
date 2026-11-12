# LabelLens 🔎

A small, browser-based annotation QA workspace for reviewing text labels, flagging ambiguous examples, and tracking a labeling batch. Built as a portfolio project for data labeling and annotation roles.

## Try it

Open [`index.html`](index.html) in a browser. No build step, account, or server required. The demo starts with sample product-feedback examples; your changes are saved in that browser's local storage.

## What it demonstrates

- **Annotation workflow:** inspect examples, change sentiment labels, approve decisions, or flag edge cases for review.
- **Quality awareness:** see review progress, low-confidence items, and a clearly described heuristic consistency estimate.
- **Guidelines-first labeling:** consult the built-in positive / negative / neutral decision guide and rationale examples.
- **Data handling:** import JSON or CSV batches and export a JSON review report or CSV dataset.
- **Portfolio-ready UI:** responsive dashboard, search, filters, status indicators, and accessible form labels.

## Import formats

JSON can be an array of objects or a LabelLens report containing an `examples` array:

```json
[
  {
    "id": "example-001",
    "text": "The onboarding was easy to follow.",
    "label": "Positive",
    "confidence": 0.9,
    "status": "unreviewed",
    "note": ""
  }
]
```

CSV accepts `text` (or `example` / `content`), `label`, `confidence`, `status`, and `note` columns. Labels are `Positive`, `Negative`, or `Neutral`. Unrecognized labels default to `Neutral`; confidence should be between 0 and 1.

## Important note about the metric

“Label consistency” is a **demo heuristic**, calculated from confidence and review status. It is not inter-annotator agreement and should not be represented as a validated quality metric. Real agreement measurement requires independently labeled overlapping examples and a defined statistic (for example, Cohen's kappa for two annotators).

## Tech

Vanilla HTML, CSS, and JavaScript. Data remains in browser local storage unless a user explicitly imports or exports a file. Google Fonts are loaded from Google Fonts when online; the app falls back to system fonts.

## Ideas to extend

- Add a second annotator's labels and calculate disagreement / Cohen's kappa.
- Version guidelines and link decisions to a specific rule.
- Add keyboard shortcuts and batch navigation.
- Create a blind review mode that hides the original label until after a decision.

## License

MIT
