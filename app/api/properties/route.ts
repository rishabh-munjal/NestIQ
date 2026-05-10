// app/api/properties/route.ts
import { NextResponse } from 'next/server';
import { propertyListings } from '@/lib/data/propertyListings';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areaId = searchParams.get('areaId');
  const bhk = searchParams.get('bhk');
  const type = searchParams.get('type');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let filtered = [...propertyListings];

  if (areaId) filtered = filtered.filter(p => p.areaId === areaId);
  if (bhk) filtered = filtered.filter(p => p.bhk === bhk);
  if (type) filtered = filtered.filter(p => p.type === type);
  if (minPrice) filtered = filtered.filter(p => p.price >= parseInt(minPrice));
  if (maxPrice) filtered = filtered.filter(p => p.price <= parseInt(maxPrice));

  return NextResponse.json({ properties: filtered, total: filtered.length });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Validate required fields
  const required = ['title', 'areaId', 'areaName', 'type', 'bhk', 'price', 'sqft', 'sellerName', 'sellerPhone'];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  const newListing = {
    ...body,
    id: `p-${Date.now()}`,
    postedAt: new Date().toISOString(),
    status: 'Available',
    isVerified: false,
    pricePerSqft: Math.round(body.price / body.sqft),
  };

  return NextResponse.json({ success: true, property: newListing }, { status: 201 });
}
