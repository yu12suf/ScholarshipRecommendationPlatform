import { useState, useEffect } from "react";

export interface CountryData {
  name: string;
  flag: string;
  code: string;
}

export interface UniversityData {
  name: string;
  country: string;
}

export const useGeoData = () => {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // General cache for cities and universities to prevent duplicate calls
  const [citiesCache, setCitiesCache] = useState<Record<string, string[]>>({});
  const [universitiesCache, setUniversitiesCache] = useState<Record<string, UniversityData[]>>({});

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,cca2");
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();
        
        const formatted: CountryData[] = data.map((c: any) => ({
          name: c.name.common,
          flag: c.flags.svg || c.flags.png || "",
          code: c.cca2,
        }));
        
        formatted.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(formatted);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const getCitiesForCountry = async (countryName: string): Promise<string[]> => {
    if (!countryName) return [];
    if (citiesCache[countryName]) return citiesCache[countryName];

    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: countryName }),
      });
      const data = await res.json();
      
      const cities = data.error ? [] : data.data;
      setCitiesCache((prev) => ({ ...prev, [countryName]: cities }));
      return cities;
    } catch (error) {
      console.error(`Error fetching cities for ${countryName}:`, error);
      return [];
    }
  };

  const getUniversitiesForCountry = async (countryName: string): Promise<UniversityData[]> => {
    if (!countryName) return [];
    if (universitiesCache[countryName]) return universitiesCache[countryName];

    try {
      const res = await fetch(`http://universities.hipolabs.com/search?country=${encodeURIComponent(countryName)}`);
      if (!res.ok) throw new Error(`Failed to fetch universities for ${countryName}`);
      
      const data = await res.json();
      const unis: UniversityData[] = data.map((u: any) => ({
        name: u.name,
        country: u.country,
      }));

      // Remove duplicates based on name
      const uniqueUnis = Array.from(new Map(unis.map(item => [item.name, item])).values());
      uniqueUnis.sort((a, b) => a.name.localeCompare(b.name));

      setUniversitiesCache((prev) => ({ ...prev, [countryName]: uniqueUnis }));
      return uniqueUnis;
    } catch (error) {
      console.error(`Error fetching universities for ${countryName}:`, error);
      return [];
    }
  };

  return {
    countries,
    loadingCountries,
    getCitiesForCountry,
    getUniversitiesForCountry,
  };
};
