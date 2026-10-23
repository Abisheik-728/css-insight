# Milestone 1: CSS Parser — Architecture & Decision Rationale

CSS INSIGHT extracts qualified style rules, individual selectors, declaration properties/values, `!important` flags, at-rules (`@media`, `@supports`, `@keyframes`), detectable colors, and source line numbers to provide structural analytics and diagnostic intelligence for modern stylesheets.
A genuine CSS parser (`tinycss2`) is used instead of regex or string splitting because regular expressions fail on nested blocks, quoted strings, comments, and complex functional notations like `calc()`, `var()`, and `:is()`.
For edge cases such as duplicate declarations (e.g., vendor fallbacks like `display: -webkit-flex` followed by `display: flex`), our parser preserves every declaration in its original sequence while proactively flagging duplicates in a dedicated diagnostics registry.
