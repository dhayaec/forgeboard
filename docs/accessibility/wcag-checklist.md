# Accessibility — Phase 15

Target: **WCAG 2.2 Level AA**.

## Perceivable

- [x] Semantic HTML (header, main, nav, footer in layouts)
- [x] Alt text on images (next/image requires `alt` prop)
- [ ] Color contrast ≥ 4.5:1 for body text (verify in design tokens)
- [ ] Color is not the only indicator (icons + color for status)
- [ ] Captions / transcripts for video

## Operable

- [x] All interactive elements are buttons or links (no clickable divs)
- [x] Focus styles visible (Tailwind focus-visible utilities)
- [ ] Skip-to-content link
- [ ] Modals trap focus and restore on close
- [ ] No keyboard traps
- [ ] Logical tab order

## Understandable

- [x] Form labels associated with inputs (label + htmlFor)
- [x] Error messages associated with form fields
- [ ] Language attribute on html
- [ ] Consistent navigation across pages

## Robust

- [x] ARIA only when semantic HTML is insufficient
- [x] Live regions for toast notifications
- [ ] Tested with screen readers (NVDA / VoiceOver)

## Implementation Notes

- Use `focus-visible:ring-2 focus-visible:ring-ring` on all interactive elements.
- All form errors use `aria-invalid` and `aria-describedby`.
- Modal dialogs use `role="dialog"` with `aria-modal="true"` and `aria-labelledby`.
- Reduced motion: respect `prefers-reduced-motion` in animations.
- Tests: `tests/e2e/a11y.spec.ts` runs axe-core against key pages.
