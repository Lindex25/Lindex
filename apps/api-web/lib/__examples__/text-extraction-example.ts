/**
 * Example Usage: Local Text Extraction
 *
 * This file demonstrates how to use the text-extraction module
 * for extracting text from PDFs and images locally.
 *
 * Run with: tsx lib/__examples__/text-extraction-example.ts
 */

import { extractTextFromFile } from '../text-extraction';
import * as fs from 'fs/promises';

async function main() {
  console.log('🔍 Text Extraction Examples\n');

  // ============================================================================
  // Example 1: Extract text from a PDF
  // ============================================================================
  try {
    console.log('Example 1: PDF Extraction');
    console.log('-------------------------');

    // Read PDF file
    const pdfBuffer = await fs.readFile('./example.pdf');

    // Extract text (all processing is local)
    const pdfText = await extractTextFromFile({
      buffer: pdfBuffer,
      mimeType: 'application/pdf',
      originalFilename: 'example.pdf',
    });

    console.log(`✓ Extracted ${pdfText.length} characters from PDF`);
    console.log(`First 200 chars: ${pdfText.substring(0, 200)}...\n`);
  } catch (error) {
    console.error('PDF extraction failed:', error);
  }

  // ============================================================================
  // Example 2: Extract text from an image (OCR)
  // ============================================================================
  try {
    console.log('Example 2: Image OCR');
    console.log('--------------------');

    // Read image file
    const imageBuffer = await fs.readFile('./example.png');

    // Extract text via OCR (all processing is local)
    const imageText = await extractTextFromFile({
      buffer: imageBuffer,
      mimeType: 'image/png',
      originalFilename: 'example.png',
    });

    console.log(`✓ Extracted ${imageText.length} characters from image`);
    console.log(`Text: ${imageText}\n`);
  } catch (error) {
    console.error('Image OCR failed:', error);
  }

  // ============================================================================
  // Example 3: Automatic type detection from filename
  // ============================================================================
  try {
    console.log('Example 3: Automatic Type Detection');
    console.log('------------------------------------');

    const buffer = await fs.readFile('./document.pdf');

    // MIME type is optional - will detect from filename
    const text = await extractTextFromFile({
      buffer,
      originalFilename: 'document.pdf', // .pdf extension detected
    });

    console.log(`✓ Auto-detected as PDF, extracted ${text.length} characters\n`);
  } catch (error) {
    console.error('Auto-detection failed:', error);
  }

  // ============================================================================
  // Example 4: Error handling for unsupported types
  // ============================================================================
  try {
    console.log('Example 4: Unsupported File Type');
    console.log('---------------------------------');

    const buffer = Buffer.from('Not a valid file');

    await extractTextFromFile({
      buffer,
      mimeType: 'application/msword', // Unsupported
      originalFilename: 'document.doc',
    });
  } catch (error) {
    console.log('✓ Correctly rejected unsupported type:');
    console.log(`  ${error instanceof Error ? error.message : error}\n`);
  }

  // ============================================================================
  // Example 5: Use in API route handler
  // ============================================================================
  console.log('Example 5: API Route Usage');
  console.log('--------------------------');
  console.log(`
// In your Next.js API route:
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Extract text locally (no external LLM calls)
  const text = await extractTextFromFile({
    buffer,
    mimeType: file.type,
    originalFilename: file.name,
  });

  // Now you can:
  // 1. Store text in database
  // 2. Chunk it for embeddings
  // 3. Process it further

  return Response.json({
    success: true,
    textLength: text.length
  });
}
  `);

  console.log('\n✅ All examples completed!');
  console.log('\n💡 Remember: All text extraction happens locally.');
  console.log('   No document bytes are sent to external LLMs or APIs.');
}

// Run examples
main().catch(console.error);


