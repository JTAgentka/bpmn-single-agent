import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'output');

// Ensure output directory exists
async function ensureOutputDirectory() {
  try {
    await fs.access(OUTPUT_DIR);
  } catch {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureOutputDirectory();
    
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('file');
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name required' }, { status: 400 });
    }
    
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Consolidated storage GET error:', error);
    return NextResponse.json({ error: 'Failed to load consolidated data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureOutputDirectory();
    
    const body = await request.json();
    const { file, data } = body;
    
    if (!file || !data) {
      return NextResponse.json({ error: 'File name and data required' }, { status: 400 });
    }
    
    const filePath = path.join(OUTPUT_DIR, file);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Consolidated session data saved successfully'
    });
  } catch (error) {
    console.error('Consolidated storage POST error:', error);
    return NextResponse.json({ error: 'Failed to save consolidated data' }, { status: 500 });
  }
}