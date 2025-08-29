-- ProgressBoost Database Setup
-- Run this script in your Supabase SQL editor to create the necessary table

-- Create progress_boost_sessions table
CREATE TABLE IF NOT EXISTS progress_boost_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL DEFAULT 0,
    questions_answered INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_boost_sessions_student_id ON progress_boost_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_boost_sessions_class_id ON progress_boost_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_progress_boost_sessions_created_at ON progress_boost_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_progress_boost_sessions_student_class_date ON progress_boost_sessions(student_id, class_id, created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE progress_boost_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only see their own sessions
CREATE POLICY "Students can view own progress boost sessions" ON progress_boost_sessions
    FOR SELECT USING (auth.uid() = student_id);

-- Policy: Students can insert their own sessions
CREATE POLICY "Students can insert own progress boost sessions" ON progress_boost_sessions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Policy: Students can update their own sessions
CREATE POLICY "Students can update own progress boost sessions" ON progress_boost_sessions
    FOR UPDATE USING (auth.uid() = student_id);

-- Policy: Teachers can view sessions for their classes
CREATE POLICY "Teachers can view progress boost sessions for their classes" ON progress_boost_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = progress_boost_sessions.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_progress_boost_sessions_updated_at 
    BEFORE UPDATE ON progress_boost_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE progress_boost_sessions IS 'Tracks weekly ProgressBoost sessions for students';
COMMENT ON COLUMN progress_boost_sessions.student_id IS 'Reference to the student user';
COMMENT ON COLUMN progress_boost_sessions.class_id IS 'Reference to the class';
COMMENT ON COLUMN progress_boost_sessions.total_questions IS 'Total number of questions in this session';
COMMENT ON COLUMN progress_boost_sessions.questions_answered IS 'Number of questions answered so far';
COMMENT ON COLUMN progress_boost_sessions.completed_at IS 'Timestamp when session was completed (null if ongoing)';
COMMENT ON COLUMN progress_boost_sessions.created_at IS 'Timestamp when session was created';
COMMENT ON COLUMN progress_boost_sessions.updated_at IS 'Timestamp when session was last updated';
