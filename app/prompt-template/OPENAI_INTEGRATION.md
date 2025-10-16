# OpenAI Resume Analysis Integration

## Overview
The Prompt Template module now uses OpenAI's GPT-4 Vision API to analyze uploaded resume PDFs in real-time and generate personalized interview prompt templates.

## How It Works

### 1. File Upload
- User uploads a resume PDF via drag & drop or file selection
- File is validated (PDF/DOCX, max 10MB)

### 2. OpenAI Analysis
- Resume is sent to OpenAI GPT-4 Vision API
- AI extracts structured information:
  - Candidate personal info (name, email, phone, location)
  - Work experience (companies, roles, duration, responsibilities)
  - Technical skills, soft skills, and tools
  - Education and certifications
  - Projects and technologies used
  - Career level assessment (junior/mid/senior/lead)
  - Industry experience

### 3. Template Generation
- Extracted data is used to generate personalized interview questions
- Questions are tailored to the candidate's specific experience and skills
- Technical questions focus on their primary technologies
- Behavioral questions reference their actual projects

### 4. Template Preview & Save
- Generated template is previewed with analysis summary
- User can save the template to the library
- Template is named using the PDF filename

## API Endpoint

### POST `/api/analyze-resume`
- **Input**: FormData with resume file
- **Output**: JSON with structured resume analysis
- **Model**: GPT-4 Vision (gpt-4o)
- **Max Tokens**: 2000
- **Temperature**: 0.1 (for consistent results)

## Error Handling
- Network errors fall back to mock data
- Invalid files show appropriate error messages
- OpenAI API errors are logged and handled gracefully
- Progress indicators show real-time analysis steps

## Security
- OpenAI API key is embedded in the API route
- File uploads are validated and sanitized
- No sensitive data is stored permanently

## Usage Example

```typescript
// Upload resume and analyze
const formData = new FormData();
formData.append('file', resumeFile);

const response = await fetch('/api/analyze-resume', {
  method: 'POST',
  body: formData,
});

const { analysis } = await response.json();
// analysis contains structured resume data
```

## Generated Template Structure

Each generated template includes:
- **Interviewer Instructions**: AI personality and behavior guidelines
- **Greeting Message**: Personalized opening for the candidate
- **Default Questions**: General interview questions (5 questions)
- **Technical Questions**: Role-specific technical questions (3-4 questions)
- **Feedback Templates**: Positive, neutral, and encouragement responses
- **Closing Message**: Personalized interview conclusion
- **Error Messages**: Handling for technical issues

## Benefits
- **Real-time Analysis**: No manual data entry required
- **Personalized Questions**: Questions tailored to each candidate
- **Consistent Quality**: AI ensures comprehensive coverage
- **Time Saving**: Instant template generation
- **Scalable**: Handles any resume format and content
