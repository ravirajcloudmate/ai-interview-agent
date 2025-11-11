import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


export async function POST(request: NextRequest) {
  console.log('🚀 PDF Analysis API called');
  
  try {
    // Parse form data
    let formData;
    try {
      formData = await request.formData();
      console.log('✅ FormData parsed successfully');
    } catch (formError) {
      console.error('❌ FormData parse error:', formError);
      return NextResponse.json(
        { error: 'Invalid form data. Please ensure you are sending a proper multipart/form-data request.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('❌ No file in request');
      return NextResponse.json(
        { error: 'No file provided. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    console.log('📄 File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    let buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log('✅ File converted to buffer, size:', buffer.length);
    } catch (bufferError) {
      console.error('❌ Buffer conversion error:', bufferError);
      return NextResponse.json(
        { error: 'Failed to process file. Please try again.' },
        { status: 500 }
      );
    }

    // Extract text from PDF
    // Dynamic import to handle CommonJS module in ESM context
    // pdf-parse exports PDFParse as a class that needs to be instantiated
    const pdfParseModule = await import('pdf-parse') as any;
    // Access PDFParse class from the module exports
    const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default || pdfParseModule;
    // Instantiate PDFParse with buffer data and extract text
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const pdfText = textResult.text;
    
    // Clean up parser resources
    await parser.destroy();

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
    }

    // Analyze with OpenAI
    // Try gpt-4 first (as it was working before), then fallback to other models
    let completion;
    let analysis;
    
    const systemPrompt = `You are an expert resume analyzer. Extract structured information from the resume text and return it in JSON format with these fields:
          - candidateInfo: {name, email, phone, location}
          - skills: array of technical skills
          - experience: array of {company, role, duration, responsibilities}
          - education: array of {degree, institution, year}
          - projects: array of {name, description, technologies}
    - summary: brief professional summary

IMPORTANT: Return ONLY valid JSON object, no markdown formatting, no code blocks, no explanations. Start with { and end with }.`;

    const userPrompt = `Analyze this resume and extract structured information:\n\n${pdfText.substring(0, 4000)}`;

    // Try gpt-4 first (as it was working before)
    let modelUsed = null;
    let jsonParseError = null;

    try {
      console.log('🔄 Trying gpt-4 with json_object (as it was working before)...');
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      modelUsed = 'gpt-4';
      console.log('✅ gpt-4 with json_object worked!');
    } catch (gpt4Error: any) {
      console.log(`⚠️ gpt-4 error:`, {
        code: gpt4Error?.code,
        status: gpt4Error?.status,
        param: gpt4Error?.param,
        message: gpt4Error?.message,
        type: gpt4Error?.type
      });
      
      // If json_object is not supported, try other models that support it
      if (gpt4Error?.code === 'invalid_request_error' && gpt4Error?.param === 'response_format') {
        console.log('⚠️ gpt-4 doesn\'t support json_object anymore, trying models that do...');
        const modelsWithJsonSupport = ['gpt-4o', 'gpt-4-turbo', 'gpt-4-turbo-preview', 'gpt-4o-mini', 'gpt-3.5-turbo-1106'];
        
        for (const model of modelsWithJsonSupport) {
          try {
            console.log(`🔄 Trying model: ${model}`);
            completion = await openai.chat.completions.create({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
            modelUsed = model;
            console.log(`✅ ${model} worked!`);
            break;
          } catch (modelError: any) {
            console.log(`⚠️ ${model} failed:`, {
              code: modelError?.code,
              status: modelError?.status,
              message: modelError?.message
            });
            if (model === modelsWithJsonSupport[modelsWithJsonSupport.length - 1]) {
              // Last model failed, try gpt-4 without json_object
              console.log('⚠️ All json_object models failed, trying gpt-4 without json_object...');
              completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                  { 
                    role: 'system', 
                    content: systemPrompt + '\n\nCRITICAL: Your response must be ONLY a valid JSON object. Do not include any markdown code blocks, explanations, or text outside the JSON object.'
                  },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.3
              });
              modelUsed = 'gpt-4 (no json_object)';
            }
            continue;
          }
        }
      } else {
        // Other error (like model not found, API key issue, etc.)
        throw gpt4Error;
      }
    }

    // Ensure we have a completion
    if (!completion) {
      throw new Error('Failed to get completion from any available model');
    }

    // Parse the response
    const responseContent = completion.choices[0].message.content || '{}';
    console.log(`✅ Model used: ${modelUsed}`);
    console.log(`📝 Response preview: ${responseContent.substring(0, 200)}...`);

    try {
      // Try to parse JSON directly
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from markdown code blocks or text
      jsonParseError = parseError;
      console.warn('⚠️ Direct JSON parse failed, trying to extract JSON from response...');
      
      // Try to extract JSON from markdown code blocks (```json ... ```)
      const jsonMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[1]);
          console.log('✅ Extracted JSON from markdown code block');
        } catch (e) {
          // Try to find JSON object in the text
          const jsonObjectMatch = responseContent.match(/\{[\s\S]*\}/);
          if (jsonObjectMatch) {
            try {
              analysis = JSON.parse(jsonObjectMatch[0]);
              console.log('✅ Extracted JSON object from text');
            } catch (finalError) {
              throw new Error(`Failed to parse JSON from response. Original error: ${jsonParseError}. Response: ${responseContent.substring(0, 500)}`);
            }
          } else {
            throw new Error(`No valid JSON found in response. Response: ${responseContent.substring(0, 500)}`);
          }
        }
      } else {
        // Try to find JSON object directly in text
        const jsonObjectMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          try {
            analysis = JSON.parse(jsonObjectMatch[0]);
            console.log('✅ Extracted JSON object from text');
          } catch (finalError) {
            throw new Error(`Failed to parse JSON from response. Original error: ${jsonParseError}. Response: ${responseContent.substring(0, 500)}`);
          }
        } else {
          throw new Error(`No valid JSON found in response. Response: ${responseContent.substring(0, 500)}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      extractedText: pdfText.substring(0, 1000) // First 1000 chars for reference
    });

  } catch (error: any) {
    console.error('❌ Resume analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}