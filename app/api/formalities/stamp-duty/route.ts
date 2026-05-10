// app/api/formalities/stamp-duty/route.ts
import { NextResponse } from 'next/server';
import { calculateStampDuty } from '@/lib/data/govProcesses';

export async function POST(request: Request) {
  const body = await request.json();
  const { propertyValue, isFemale = false } = body;

  if (!propertyValue || propertyValue <= 0) {
    return NextResponse.json({ error: 'Invalid property value' }, { status: 400 });
  }

  const result = calculateStampDuty(propertyValue, isFemale);
  return NextResponse.json(result);
}
