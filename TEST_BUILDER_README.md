# Test Builder Component

## Overview
A new component located at `/app/testbuilder/page.tsx` that allows teachers to generate PDF tests from questions in the database.

## Features

### 1. Topic Selection
- Dropdown to select any topic from the database
- Topics are ordered by topic number
- Shows topic number and name (e.g., "4-NS - Number Systems")

### 2. Question Loading
- Automatically loads all questions associated with the selected topic
- Fetches questions through subtopic links
- Shows loading state while fetching

### 3. PDF Generation
- **Grouped by Question Type**: Questions are organized into sections by type
  - Multiple Choice
  - True/False
  - Fill in the Blank
  - Matching
  - Short Answer
  - Essay
  - Code/SQL/Algorithm
  
- **Sorted by Difficulty**: Within each type, questions are ordered:
  1. Low difficulty (easiest)
  2. Medium difficulty
  3. High difficulty (hardest)

- **Automatic Pagination**: Questions flow across multiple pages automatically

- **Opens in New Tab**: PDF opens automatically in a new browser tab

### 4. Preview
- Live preview of questions before generating PDF
- Shows question count per type
- Color-coded difficulty badges:
  - Green: Low difficulty
  - Yellow: Medium difficulty
  - Red: High difficulty

## PDF Contents

Each PDF includes:
- **Header**: Topic name, generation date, total question count
- **Question Sections**: Grouped by type with headers
- **Question Details**:
  - Question number and difficulty level
  - Full question text
  - Answer options (for multiple choice, fill-in-the-blank)
  - Matching pairs (for matching questions)
  - Starter code (for code questions)
  
## Usage

1. Navigate to `/testbuilder` in your browser
2. Select a topic from the dropdown
3. Review the question preview
4. Click "Generate PDF"
5. PDF opens automatically in a new tab

## Technical Details

### Dependencies Added
- `jspdf`: PDF generation library
- `jspdf-autotable`: Table support for jsPDF (installed but can be used for future enhancements)

### Data Flow
1. Fetches all topics from `topics` table
2. When topic selected, gets all subtopics for that topic
3. Finds all questions linked to those subtopics via `subtopic_question_link` table
4. Fetches full question details with type-specific data
5. Transforms data into consistent format
6. Groups by type and sorts by difficulty
7. Generates PDF with jsPDF

### Files Modified/Created
- ✅ Created: `/app/testbuilder/page.tsx` - Main component
- ✅ Created: `TEST_BUILDER_README.md` - Documentation
- ✅ Modified: `package.json` - Added jspdf dependencies

## Future Enhancements (Optional)

Potential features that could be added:
- [ ] Answer key generation (separate PDF with answers)
- [ ] Customizable question selection (filter by subtopic, difficulty)
- [ ] Export to Word document format
- [ ] Add school name/header customization
- [ ] Include images in questions (if stored in database)
- [ ] Print-friendly styling options
- [ ] Save test templates for reuse

