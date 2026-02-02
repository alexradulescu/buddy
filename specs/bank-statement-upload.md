# Bank Statement Upload Feature Spec

## Overview

Add the ability to upload PDF or CSV bank statement files and have the AI automatically extract and process expenses. The extracted data flows into the existing AI processing pipeline, maintaining the same behavior as the current "AI Import" tab.

## Goals

- Allow users to upload bank statement files instead of manually copying/pasting text
- Automatically extract transaction data from PDF and CSV files
- Filter out non-expense transactions (income, refunds, transfers)
- Reuse existing AI categorization and duplicate detection logic
- Provide visibility into extracted text for debugging

## Supported Banks & Formats

| Bank | PDF | CSV | Credit Card |
|------|-----|-----|-------------|
| DBS  | ✓   | ✓   | ✓           |
| UOB  | ✓   | ✓   | ✓           |

- Currency: SGD (foreign currencies may appear in descriptions but amounts are in SGD)
- PDFs are text-based (digitally generated, not scanned)

## Transaction Filtering Rules

**Include:**
- All expense transactions
- Cash/ATM withdrawals
- Ambiguous transactions (user decides during review)

**Exclude:**
- Income/credits
- Refunds (e.g., "REFUND - AMAZON")
- Internal transfers between own accounts

## User Flow

1. User navigates to Expenses page → "Upload" tab (new)
2. User selects a PDF or CSV file (single file, max 5MB)
3. File is uploaded to server for processing
4. Server extracts text from file (library-based for PDF, raw for CSV)
5. Extracted text is sent to existing AI pipeline (`/api/completion`)
6. AI returns categorized expenses (same as current AI Import)
7. User sees preview with:
   - Expandable accordion showing raw extracted text (for debugging)
   - Same preview/edit UI as current AI Import
   - Duplicate detection highlighting (existing logic)
8. User can edit/delete individual transactions in preview
9. User confirms → expenses saved to database
10. Success toast shown, UI stays on Upload tab for additional files

## Technical Architecture

### File Processing Flow

```
[Browser]                    [Server]                      [AI]
    |                            |                           |
    |-- Upload file ------------>|                           |
    |                            |-- Extract text            |
    |                            |   (pdf-parse for PDF,     |
    |                            |    raw for CSV)           |
    |                            |                           |
    |                            |-- Send to /api/completion |-->
    |                            |                           |
    |<-- Return extracted text --|<-- Categorized expenses --|
    |    + expenses              |                           |
    |                            |                           |
    |-- User confirms ---------->|                           |
    |                            |-- Save to InstantDB       |
```

### New API Endpoint

**`POST /api/upload-statement`**

Request:
- Content-Type: `multipart/form-data`
- Body: `file` (PDF or CSV, max 5MB)

Response:
```json
{
  "extractedText": "string (raw text from file)",
  "expenses": [
    {
      "date": "yyyy-MM-dd",
      "amount": "number",
      "description": "string",
      "categoryId": "string"
    }
  ],
  "duplicates": ["expense indices that match existing data"]
}
```

Errors:
- 400: File too large (>5MB)
- 400: Unsupported file type
- 422: Failed to extract text from file
- 500: AI processing error

### PDF Extraction

- Use `pdf-parse` or similar library for server-side text extraction
- Log extracted text for debugging (server logs)
- If extraction produces empty/garbled text, return 422 error
- Let AI determine bank format automatically (no bank-specific parsers)

### CSV Handling

- Send raw CSV content directly to AI (structured data is easier to parse)
- AI determines column mapping automatically

## UI Components

### New "Upload" Tab

Location: `/src/routes/expenses-page.tsx` - add as third tab

Components needed:
1. **File Input** (Mantine FileInput)
   - Accept: `.pdf, .csv`
   - Max size: 5MB (validate client-side, show error proactively)
   - Single file only

2. **Extracted Text Accordion**
   - Collapsed by default
   - Label: "Show extracted text"
   - Contains raw text from file extraction
   - Helps user debug if results look wrong

3. **Preview Section**
   - Reuse existing AI Import preview component
   - Same edit/delete capabilities
   - Same duplicate highlighting

4. **Action Buttons**
   - "Process File" (or auto-process on upload)
   - "Save Expenses" / "Cancel" (same as AI Import)

### States

1. **Empty** - File input shown, no file selected
2. **Uploading** - File selected, processing in progress (show spinner)
3. **Preview** - Extracted text + expenses shown, awaiting confirmation
4. **Success** - Toast notification, return to empty state
5. **Error** - Error message displayed, return to empty state

## File Size Validation

- **Client-side**: Check file size before upload, show error immediately if >5MB
- **Server-side**: Validate again, return 400 if exceeded
- Error message: "File is too large. Maximum size is 5MB."

## Logging Requirements

Server-side logging for debugging:
- Log file type and size received
- Log extracted text (or first N characters if very long)
- Log AI request/response
- Log any errors with stack traces

## Success Criteria

1. User can upload DBS/UOB PDF statement and see extracted expenses
2. User can upload DBS/UOB CSV statement and see extracted expenses
3. Expenses are correctly categorized using existing AI logic
4. Duplicates are detected and highlighted
5. User can review, edit, and confirm expenses (same as AI Import)
6. Extracted text is visible in accordion for debugging
7. Appropriate errors shown for oversized/invalid files
8. Success toast after saving, UI ready for next upload

## Out of Scope (Future Enhancements)

- Drag-and-drop file upload
- Multiple file upload at once
- Bank-specific parsers for improved accuracy
- OCR for scanned/image-based PDFs
- Automatic bank detection
- File upload history

## Dependencies

- `pdf-parse` or equivalent PDF text extraction library
- Existing `/api/completion` endpoint (no changes needed)
- Existing expense preview components (reuse)
- Existing duplicate detection logic (reuse)
