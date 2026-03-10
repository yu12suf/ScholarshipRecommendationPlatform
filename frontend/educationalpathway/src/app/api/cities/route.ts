import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { country } = await request.json();

    if (!country) {
      return NextResponse.json({ cities: [] });
    }

    const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ country }),
    });

    if (!response.ok) {
      // Return empty array instead of failing hard to improve UX
      console.warn(`Failed to fetch cities for ${country} from CountriesNow API`);
      return NextResponse.json({ cities: [] });
    }

    const data = await response.json();
    
    // CountriesNow returns { error: boolean, msg: string, data: string[] }
    // Our frontend expects { cities: string[] }
    return NextResponse.json({ cities: data.data || [] });
  } catch (error) {
    console.error('Error in /api/cities:', error);
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}
