# Milestone 1: CSS Parser — Parser Design Decisions

CSS INSIGHT extracts CSS rules, selectors, declarations, properties, colors, at-rules, and comments into structured JSON. These details help developers understand and inspect stylesheets efficiently. The parser uses tinycss2 to process CSS while preserving meaningful information. One edge case considered is malformed CSS, which should produce a diagnostic instead of crashing the application.

---

### What I Extract
- CSS rules and selectors
- Property-value declarations
- Colors, at-rules, and comments
- Structured JSON and diagnostics

### Why I Chose These Details
Structured information helps developers inspect stylesheets, understand their contents, and identify potential issues. Decomposing rules into discrete selectors and declarations allows granular analysis of specificity, duplicate properties, and stylesheet footprint.

### Edge Case Considered
Malformed CSS may contain missing braces, invalid declarations, or incomplete rules. The parser should handle such input gracefully and provide useful diagnostics rather than crashing. Using tinycss2's non-fatal error recovery, invalid declarations or syntax errors generate diagnostic warnings while remaining valid rules continue to be parsed cleanly.
