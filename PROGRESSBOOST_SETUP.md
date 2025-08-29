# ProgressBoost Setup Guide

## Overview

ProgressBoost is a spaced repetition feature for students that provides weekly practice questions based on the topics covered in their class. It automatically selects questions with the following difficulty distribution:
- 10 easy questions
- 5 medium questions  
- 1 hard question

## Features

- **Student-only access**: Only students can access ProgressBoost (teachers are redirected)
- **Class-based questions**: Questions are selected from topics that have been marked as covered by the teacher
- **Weekly sessions**: Students can complete one session per week per class
- **Progress tracking**: Tracks completion status and allows students to continue practicing
- **Motivational completion**: Shows a congratulatory message when the weekly session is completed

## Database Setup

Before using ProgressBoost, you need to create the required database table. Run the following SQL script in your Supabase SQL editor:

```sql
-- Run the contents of database-setup.sql in your Supabase SQL editor
```

The script will:
1. Create the `progress_boost_sessions` table
2. Add appropriate indexes for performance
3. Set up Row Level Security (RLS) policies
4. Create triggers for automatic timestamp updates

## Usage

### For Students

1. Navigate to the ProgressBoost page (available in the navigation menu)
2. Select your class (if you're in multiple classes)
3. Answer the questions that appear
4. Complete the weekly session to see the congratulatory message
5. Continue practicing additional questions if desired

### For Teachers

1. Use the Coverage page to mark topics as covered for your class
2. Students will only see questions from topics that have been marked as covered
3. Monitor student progress through the existing analytics features

## Technical Details

### File Structure

```
app/progress-boost/
├── page.tsx              # Server component with access control
└── ProgressBoostClient.tsx  # Client component with main logic

components/ui/
└── progress.tsx          # Progress bar component

database-setup.sql        # Database setup script
```

### Key Components

- **Access Control**: Server-side check ensures only students can access the page
- **Question Selection**: Automatically selects questions based on difficulty targets and covered topics
- **Session Management**: Tracks weekly sessions per student per class
- **Progress Tracking**: Shows completion percentage and difficulty breakdown
- **Error Handling**: Gracefully handles missing database tables

### Database Schema

```sql
progress_boost_sessions (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id),
  class_id UUID REFERENCES classes(id),
  total_questions INTEGER,
  questions_answered INTEGER,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Troubleshooting

### "ProgressBoost is not set up yet" Error

This error appears when the database table hasn't been created. Run the SQL setup script in your Supabase dashboard.

### "No topics have been covered" Error

This appears when no topics have been marked as covered for the student's class. Teachers need to use the Coverage page to mark topics as covered.

### Navigation Not Showing

Ensure the user is logged in as a student (not a teacher). ProgressBoost only appears in navigation for student accounts.

## Future Enhancements

Potential improvements for the ProgressBoost feature:

1. **Adaptive difficulty**: Adjust question difficulty based on student performance
2. **Spaced repetition algorithm**: Implement more sophisticated spacing intervals
3. **Analytics dashboard**: Show ProgressBoost completion rates for teachers
4. **Custom targets**: Allow teachers to set custom question counts per difficulty
5. **Export functionality**: Allow students to export their ProgressBoost history
