import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Parse body safely
    let country = "";
    try {
      const body = await request.json();
      country = body.country;
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!country) {
      return NextResponse.json({ universities: [] });
    }

    console.log(`[University Proxy] Request for: ${country}`);

    // 2. Attempt to fetch from external API
    try {
      const url = `https://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`;
      
      // Use a shorter timeout to fail fast and trigger fallback
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return NextResponse.json({ 
            universities: data.slice(0, 100).map((u: any) => ({ name: u.name })) 
          });
        }
      }
      
      console.warn(`[University Proxy] API returned empty or error for ${country}. Using fallback.`);
    } catch (fetchError: any) {
      console.error(`[University Proxy] Fetch failed: ${fetchError.message}`);
      // Fall through to fallback
    }

    // 3. FALLBACK: If API is down, provide common universities so user isn't stuck
    const fallbacks: Record<string, string[]> = {
      "Ethiopia": ["Addis Ababa University", "Haramaya University", "Jimma University", "Bahir Dar University", "Arba Minch University"],
      "United States": ["Harvard University", "Stanford University", "MIT", "UC Berkeley", "Columbia University"],
      "United Kingdom": ["University of Oxford", "University of Cambridge", "Imperial College London", "UCL"],
      "Canada": ["University of Toronto", "UBC", "McGill University", "University of Waterloo"]
    };

    const fallbackList = (fallbacks[country] || ["Other University"]).map(name => ({ name }));
    
    return NextResponse.json({ 
      universities: fallbackList,
      isFallback: true,
      countryFetched: country
    });

  } catch (error: any) {
    console.error('Fatal Proxy Error:', error);
    return NextResponse.json({ 
      universities: [], 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
