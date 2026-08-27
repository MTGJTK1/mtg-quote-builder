# Document generation (Phase 6)

Server-side `.docx` generation via the `docx` npm package.

    shared.ts        row(), cont(), hr(), bulletRow(), plain() — the formatting
                     helpers that encode spec §3 (Times New Roman, 11pt body /
                     10.5pt T&Cs, 2in hanging-indent column, keepNext on the
                     pricing block, forced page break before Terms & Conditions,
                     centered "Page X of Y" footer)
    sponsorQuote.ts  port of generateSponsorQuote()
    internalDraft.ts port of generateInternalDraft()

**Formatting is verified by comparison, not by inspection.** Every formatting
bug found so far was caught by rendering output next to a real quote, so:

```bash
soffice --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 100 output.pdf page
# view page-1.jpg alongside a real uploaded quote
```

Requires LibreOffice and Poppler wherever this is tested. Not done until that
page-by-page comparison passes.

Generated files are not stored — regenerate on demand from `Quote.formData` so
a download always reflects the latest edits.
