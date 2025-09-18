# AI Question Generator Setup Guide

This guide will help you set up the AI-powered mass question generator feature.

## Prerequisites

1. **OpenAI API Account**: You need an OpenAI API account with access to GPT-4
2. **API Key**: Generate an API key from your OpenAI dashboard

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## How to Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account
3. Navigate to the API section
4. Click "Create new secret key"
5. Copy the generated key
6. Add it to your `.env.local` file

## Features

The AI Question Generator provides:

### 1. Curriculum Specification Input
- **Exam Board**: e.g., AQA, Edexcel, OCR
- **Specification Heading**: e.g., Computer Science A-Level
- **Topic**: e.g., Programming Fundamentals
- **Subtopic Heading**: e.g., Data Structures
- **Specification Content**: Detailed curriculum content
- **Supporting Text**: Additional context
- **Mark Scheme Content**: Assessment criteria

### 2. Question Type Selection
- Multiple Choice
- Fill in the Blank
- Matching
- Code Questions
- True/False
- Short Answer
- Essay Questions

### 3. AI Generation Process
- Uses GPT-4 to generate high-quality questions
- Creates questions based on curriculum specifications
- Generates appropriate difficulty levels
- Includes detailed explanations and model answers

### 4. Review and Edit
- Preview all generated questions
- Edit individual questions before saving
- Delete unwanted questions
- Modify question content, options, and answers

### 5. Database Integration
- Saves questions to your existing database structure
- Integrates with your current QuestionManager
- Maintains consistency with existing question types

## Usage

1. **Navigate** to the Super Panel → Question AI
2. **Fill in** the curriculum specification details
3. **Select** question types and quantities
4. **Click** "Generate Questions" to create questions using AI
5. **Review** the generated questions
6. **Edit** any questions that need modification
7. **Click** "Create All Questions" to save to database

## API Endpoint

The system uses `/api/generate-questions` endpoint which:
- Accepts curriculum specifications and question type requirements
- Calls OpenAI GPT-4 API
- Returns structured question data
- Handles errors gracefully

## Error Handling

The system includes comprehensive error handling:
- Form validation before generation
- API error handling
- Database error handling
- User-friendly error messages
- Toast notifications for success/failure

## Cost Considerations

- Each question generation request uses GPT-4 tokens
- Costs depend on the complexity and number of questions
- Monitor your OpenAI usage in the dashboard
- Consider implementing rate limiting for production use

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Ensure `OPENAI_API_KEY` is set in `.env.local`
   - Restart your development server after adding the key

2. **"Failed to generate questions"**
   - Check your OpenAI API key is valid
   - Ensure you have sufficient API credits
   - Check the console for detailed error messages

3. **"No questions were generated"**
   - Try with more detailed specification content
   - Ensure at least one question type is selected
   - Check that the curriculum specification is comprehensive

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your OpenAI API key and credits
3. Ensure all required fields are filled
4. Try with simpler curriculum specifications first

## Security Notes

- Never commit your API key to version control
- Use environment variables for all sensitive data
- Consider implementing rate limiting for production
- Monitor API usage to prevent unexpected costs
