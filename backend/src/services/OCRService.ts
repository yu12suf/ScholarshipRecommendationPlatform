import { GoogleGenerativeAI } from "@google/generative-ai";
import configs from "../config/configs.js";

const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY!);
const geminiModelName = configs.GEMINI_MODEL || "gemini-2.5-flash";

export interface ExtractedProfileData {
  personalInfo: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    countryOfResidence?: string;
    city?: string;
  };
  academicInfo: {
    currentEducationLevel?: string;
    degreeSeeking?: string;
    fieldOfStudy?: string[];
    previousUniversity?: string;
    graduationYear?: number;
    gpa?: number;
    languageTestType?: string;
    testScore?: string;
    researchArea?: string;
    proposedResearchTopic?: string;
  };
  preferenceInfo: {
    preferredDegreeLevel?: string[];
    preferredFundingType?: string;
    studyMode?: string;
    preferredCountries?: string[];
    preferredUniversities?: Array<{ name: string; country: string }>;
    familyIncomeRange?: string;
    needsFinancialSupport?: boolean;
  };
  workExperience: Array<{
    organizationName?: string;
    jobTitle?: string;
    yearsOfExperience?: number;
  }>;
  academicHistory: Array<{
    institution: string;
    degree: string;
    year: string | number;
  }>;
  skills: string[];
  rawText?: string;
  confidence: number;
}

export class OCRService {
  private static normalizeGPA(gpa: any, scale: string = "4.0"): number | undefined {
    if (gpa === null || gpa === undefined) return undefined;
    
    const numGPA = typeof gpa === 'string' ? parseFloat(gpa) : gpa;
    if (isNaN(numGPA)) return undefined;
    
    if (scale === "5.0") {
      return Math.round((numGPA / 5) * 4 * 100) / 100;
    } else if (scale === "100") {
      return Math.round((numGPA / 100) * 4 * 100) / 100;
    }
    return numGPA;
  }

  private static parseDate(dateStr: string): string | undefined {
    if (!dateStr) return undefined;
    
    try {
      const formats = [
        /^(\d{4})-(\d{2})-(\d{2})$/,
        /^(\d{2})\/(\d{2})\/(\d{4})$/,
        /^(\d{2})-(\d{2})-(\d{4})$/,
        /^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/,
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      }
      
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error("[OCRService] Date parse error:", e);
    }
    return undefined;
  }

  private static parseName(fullName: string): { firstName: string; lastName: string } {
    if (!fullName) return { firstName: "", lastName: "" };
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    
    if (fullName.includes(',')) {
      const commaParts = fullName.split(',').map(p => p.trim());
      return { firstName: commaParts[1] || "", lastName: commaParts[0] || "" };
    }
    
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }

  private static extractGender(genderStr: string): string | undefined {
    if (!genderStr) return undefined;
    
    const normalized = genderStr.toLowerCase().trim();
    const genderMap: Record<string, string> = {
      'male': 'Male', 'm': 'Male', 'man': 'Male',
      'female': 'Female', 'f': 'Female', 'woman': 'Female',
      'other': 'Other', 'non-binary': 'Other', 'prefer not to say': 'Prefer not to say',
    };
    
    return genderMap[normalized];
  }

  private static extractEducationLevel(levelStr: string): string | undefined {
    if (!levelStr) return undefined;
    
    const normalized = levelStr.toLowerCase().trim();
    const levelMap: Record<string, string> = {
      'high school': 'High School', 'highschool': 'High School', 'secondary': 'High School',
      'grade 12': 'High School', 'grade 11': 'High School', 'grade 10': 'High School',
      'bachelor': "Bachelor's", 'bachelors': "Bachelor's", 'undergraduate': "Bachelor's",
      'bs': "Bachelor's", 'ba': "Bachelor's", 'b.sc': "Bachelor's", 'b.a': "Bachelor's",
      'bsc': "Bachelor's", 'baccalaureate': "Bachelor's",
      'master': "Master's", 'masters': "Master's", 'msc': "Master's", 'm.sc': "Master's",
      'ma': "Master's", 'm.a': "Master's", 'mba': "Master's", 'ms': "Master's",
      'phd': 'PhD', 'doctorate': 'PhD', 'doctoral': 'PhD', 'md': 'PhD', 'doctor': 'PhD',
    };
    
    return levelMap[normalized];
  }

  private static extractDegreeSeeking(degreeStr: string): string | undefined {
    return this.extractEducationLevel(degreeStr);
  }

  private static extractLanguageTest(testStr: string): string | undefined {
    if (!testStr) return undefined;
    
    const normalized = testStr.toLowerCase().trim();
    const testMap: Record<string, string> = {
      'ielts': 'IELTS', 'ielts academic': 'IELTS', 'ielts general': 'IELTS',
      'toefl': 'TOEFL', 'toefl ibt': 'TOEFL', 'toefl pbt': 'TOEFL', 'toefl itp': 'TOEFL',
      'duolingo': 'Duolingo', 'det': 'Duolingo', 'duolingo english test': 'Duolingo',
      'Cambridge': 'Cambridge', 'cae': 'Cambridge', 'cpe': 'Cambridge', 'fce': 'Cambridge',
      'pte': 'PTE', 'pearson': 'PTE',
    };
    
    return testMap[normalized];
  }

  private static extractFundingType(fundingStr: string): string | undefined {
    if (!fundingStr) return undefined;
    
    const normalized = fundingStr.toLowerCase().trim();
    const fundingMap: Record<string, string> = {
      'fully funded': 'Fully Funded', 'full scholarship': 'Fully Funded', 
      'full funding': 'Fully Funded', '100%': 'Fully Funded', '100 percent': 'Fully Funded',
      'fully scholarship': 'Fully Funded', 'scholarship': 'Fully Funded',
      'partially funded': 'Partially Funded', 'partial scholarship': 'Partially Funded',
      'partial': 'Partially Funded', 'half': 'Partially Funded',
      'tuition only': 'Tuition Only', 'tuition': 'Tuition Only', 'self-funded': 'Tuition Only',
      'self funded': 'Tuition Only',
    };
    
    return fundingMap[normalized];
  }

  private static extractStudyMode(modeStr: string): string | undefined {
    if (!modeStr) return undefined;
    
    const normalized = modeStr.toLowerCase().trim();
    const modeMap: Record<string, string> = {
      'on-campus': 'On-Campus', 'oncampus': 'On-Campus', 'physical': 'On-Campus',
      'in-person': 'On-Campus', 'offline': 'On-Campus', 'face to face': 'On-Campus',
      'online': 'Online', 'virtual': 'Online', 'remote': 'Online', 'e-learning': 'Online',
      'hybrid': 'Hybrid', 'blended': 'Hybrid', 'mixed': 'Hybrid',
    };
    
    return modeMap[normalized];
  }

  private static extractIncomeRange(incomeStr: string): string | undefined {
    if (!incomeStr) return undefined;
    
    const normalized = incomeStr.toLowerCase().trim();
    const incomeMap: Record<string, string> = {
      'under $10,000': '< $10,000', 'below $10,000': '< $10,000', 
      'less than 10000': '< $10,000', 'under 10000': '< $10,000',
      '$10,000 - $30,000': '$10,000 - $30,000', '10000-30000': '$10,000 - $30,000',
      '10k - 30k': '$10,000 - $30,000',
      '$30,000 - $50,000': '$30,000 - $50,000', '30000-50000': '$30,000 - $50,000',
      '30k - 50k': '$30,000 - $50,000',
      'over $50,000': '> $50,000', 'above $50,000': '> $50,000',
      'more than 50000': '> $50,000', 'over 50k': '> $50,000',
    };
    
    return incomeMap[normalized];
  }

  /**
   * Main extraction method - processes document and extracts all profile data
   * Includes automatic retry with exponential backoff for 503 errors
   */
  static async extractProfileFromDocument(
    fileBuffer: Buffer,
    mimeType: string,
    maxRetries: number = 3
  ): Promise<ExtractedProfileData> {
    console.log("[OCRService] Starting extraction, mimeType:", mimeType, "size:", fileBuffer.length);
    
    const model = genAI.getGenerativeModel({
      model: geminiModelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    // Enhanced prompt for comprehensive extraction
    const prompt = `You are an expert document parser specializing in extracting student profile information from academic documents, ID cards, transcripts, CVs, and any personal documents.

TASK: Extract ALL available information from this document that could be used to fill a student profile. Be THOROUGH - extract every piece of relevant information you can find.

IMPORTANT: 
1. Look for EVERY piece of personal information: names, addresses, phone numbers, emails, dates of birth, etc.
2. Look for EVERY academic detail: schools, universities, degrees, GPA, graduation dates, courses, etc.
3. Look for ID documents: national ID, passport, driver's license - extract all personal data from these
4. Look for transcripts: extract course names, grades, credit hours, semester info
5. Look for CVs: extract work experience, skills, education history, languages, certifications

Return EXACTLY this JSON structure (use null for missing fields):
{
  "personalInfo": {
    "fullName": "Complete name as written",
    "firstName": "First/given name",
    "lastName": "Last/family name", 
    "email": "Email address",
    "phoneNumber": "Phone with country code if available",
    "dateOfBirth": "Date of birth",
    "gender": "Gender if stated",
    "nationality": "Nationality or citizenship",
    "countryOfResidence": "Current country",
    "city": "Current city",
    "address": "Full address if found"
  },
  "academicInfo": {
    "currentEducationLevel": "Current level (high school, bachelor, master, phd)",
    "degreeSeeking": "Degree pursuing (bachelor, master, phd)",
    "fieldOfStudy": ["Array of majors/minors"],
    "previousUniversity": "University/college name",
    "currentUniversity": "Current university name",
    "graduationYear": "Year of graduation (number)",
    "enrollmentYear": "Year started",
    "gpa": "GPA as number",
    "gpaScale": "Scale used (4.0, 5.0, 100, etc)",
    "languageTestType": "Test type (ielts, toefl, duolingo, etc)",
    "testScore": "Test score",
    "researchArea": "Research area/field",
    "proposedResearchTopic": "Research topic"
  },
  "preferenceInfo": {
    "preferredDegreeLevel": ["Array of desired degrees"],
    "preferredFundingType": "Funding type (fully funded, partially, etc)",
    "studyMode": "Preferred mode (online, on-campus, hybrid)",
    "preferredCountries": ["Array of countries"],
    "preferredUniversities": [{"name": "University", "country": "Country"}],
    "familyIncomeRange": "Family income range",
    "needsFinancialSupport": true/false
  },
  "workExperience": [
    {
      "organizationName": "Company/organization",
      "jobTitle": "Position/title",
      "yearsOfExperience": "Duration in years",
      "startDate": "Start date",
      "endDate": "End date",
      "description": "Job description"
    }
  ],
  "academicHistory": [
    {
      "institution": "School/university name",
      "degree": "Degree obtained",
      "fieldOfStudy": "Major/minor",
      "startDate": "Start date",
      "year": "Year",
      "gpa": "GPA at this level"
    }
  ],
  "skills": ["Skills, languages, certifications, achievements"],
  "documents": {
    "idNumber": "ID number from document",
    "passportNumber": "Passport number",
    "documentType": "Type of document"
  }
}

EXTRACTION RULES:
- For names: extract full name, first name, last name separately
- For GPA: extract BOTH the number AND the scale if mentioned
- For dates: extract in original format (we'll normalize later)
- For addresses: extract all parts (street, city, country)
- For phone: include country code if visible
- For universities: note if it's previous or current
- For transcripts: extract individual course grades too
- For ID cards: extract ALL text visible - name, ID number, expiry, DOB, address, etc.
- For CVs: extract EVERYTHING - personal statement, references, etc.

BE VERY THOROUGH - extract information from:
- Headers and footers
- Small text
- Tables and forms
- Stamps and markings
- Photo captions
- Watermarks

Return valid JSON only.`;

    let base64Data: string;
    let actualMimeType = mimeType;

    const fileSizeMB = fileBuffer.length / (1024 * 1024);
    console.log("[OCRService] File size:", fileSizeMB.toFixed(2), "MB");

    if (mimeType === 'application/pdf') {
      base64Data = fileBuffer.toString("base64");
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      base64Data = fileBuffer.toString("base64");
    } else if (mimeType.startsWith('image/')) {
      base64Data = fileBuffer.toString("base64");
    } else {
      base64Data = fileBuffer.toString("base64");
    }

    let lastError: any = null;
    
    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[OCRService] Attempt ${attempt} of ${maxRetries}`);
        
        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType: actualMimeType,
            },
          },
          prompt,
        ]);

        const rawResponse = result.response.text();
        console.log("[OCRService] Raw Gemini response length:", rawResponse.length);
        console.log("[OCRService] Raw response preview:", rawResponse.substring(0, 1000));
        
        let extracted;
        try {
          extracted = JSON.parse(rawResponse);
        } catch (parseError: any) {
          console.error("[OCRService] JSON parse error:", parseError.message);
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              extracted = JSON.parse(jsonMatch[0]);
              console.log("[OCRService] Successfully extracted JSON from response");
            } catch (e2: any) {
              console.error("[OCRService] Failed to extract JSON:", e2.message);
              return this.getEmptyExtractedData();
            }
          } else {
            return this.getEmptyExtractedData();
          }
        }
        
        const processedData = this.processExtractedData(extracted, fileBuffer.toString('utf-8'));
        console.log("[OCRService] Processed data:", JSON.stringify(processedData, null, 2));
        
      return processedData;
        
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || '';
        
        console.error(`[OCRService] Attempt ${attempt} failed:`, errorMsg);
        
        // Check if it's a retryable error (503, rate limit, etc.)
        const isRetryable = 
          errorMsg.includes('503') || 
          errorMsg.includes('Service Unavailable') ||
          errorMsg.includes('high demand') ||
          errorMsg.includes('429') ||
          errorMsg.includes('rate limit');
        
        if (isRetryable && attempt < maxRetries) {
          // Exponential backoff: wait 2, 4, 8 seconds
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`[OCRService] Retrying in ${waitTime/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // If not retryable or max retries reached, return empty data
        console.error("[OCRService] All retry attempts failed or error is not retryable");
        break;
      }
    }
    
    // All retries failed
    console.error("[OCRService] Final error after all retries:", lastError?.message);
    return this.getEmptyExtractedData();
  }

  /**
   * Process and normalize extracted data
   */
  private static processExtractedData(extracted: any, rawText?: string): ExtractedProfileData {
    const data: ExtractedProfileData = {
      personalInfo: {},
      academicInfo: {},
      preferenceInfo: {},
      workExperience: [],
      academicHistory: [],
      skills: [],
      confidence: 0.85,
      rawText
    };

    // Process Personal Info
    if (extracted.personalInfo) {
      const pi = extracted.personalInfo;
      
      if (pi.fullName && !pi.firstName && !pi.lastName) {
        const nameParts = this.parseName(pi.fullName);
        data.personalInfo.firstName = nameParts.firstName;
        data.personalInfo.lastName = nameParts.lastName;
      } else {
        data.personalInfo.firstName = pi.firstName;
        data.personalInfo.lastName = pi.lastName;
      }
      
      data.personalInfo.fullName = pi.fullName || `${pi.firstName || ''} ${pi.lastName || ''}`.trim();
      data.personalInfo.email = pi.email;
      data.personalInfo.phoneNumber = pi.phoneNumber;
      data.personalInfo.dateOfBirth = pi.dateOfBirth ? this.parseDate(pi.dateOfBirth) : undefined;
      data.personalInfo.gender = pi.gender ? this.extractGender(pi.gender) : undefined;
      data.personalInfo.nationality = pi.nationality;
      data.personalInfo.countryOfResidence = pi.countryOfResidence;
      data.personalInfo.city = pi.city;
    }

    // Process Academic Info
    if (extracted.academicInfo) {
      const ai = extracted.academicInfo;
      
      data.academicInfo.currentEducationLevel = ai.currentEducationLevel 
        ? this.extractEducationLevel(ai.currentEducationLevel) 
        : undefined;
      data.academicInfo.degreeSeeking = ai.degreeSeeking 
        ? this.extractDegreeSeeking(ai.degreeSeeking) 
        : undefined;
      data.academicInfo.fieldOfStudy = Array.isArray(ai.fieldOfStudy) ? ai.fieldOfStudy : undefined;
      data.academicInfo.previousUniversity = ai.previousUniversity || ai.currentUniversity;
      data.academicInfo.graduationYear = ai.graduationYear 
        ? (typeof ai.graduationYear === 'number' ? ai.graduationYear : parseInt(ai.graduationYear as string)) 
        : undefined;
      data.academicInfo.gpa = ai.gpaScale 
        ? this.normalizeGPA(ai.gpa, ai.gpaScale) 
        : this.normalizeGPA(ai.gpa);
      data.academicInfo.languageTestType = ai.languageTestType 
        ? this.extractLanguageTest(ai.languageTestType) 
        : undefined;
      data.academicInfo.testScore = ai.testScore;
      data.academicInfo.researchArea = ai.researchArea;
      data.academicInfo.proposedResearchTopic = ai.proposedResearchTopic;
    }

    // Process Preference Info
    if (extracted.preferenceInfo) {
      const pref = extracted.preferenceInfo;
      
      data.preferenceInfo.preferredDegreeLevel = Array.isArray(pref.preferredDegreeLevel) 
        ? pref.preferredDegreeLevel.map((d: string) => this.extractEducationLevel(d) || d).filter(Boolean) 
        : undefined;
      data.preferenceInfo.preferredFundingType = pref.preferredFundingType 
        ? this.extractFundingType(pref.preferredFundingType) 
        : undefined;
      data.preferenceInfo.studyMode = pref.studyMode 
        ? this.extractStudyMode(pref.studyMode) 
        : undefined;
      data.preferenceInfo.preferredCountries = Array.isArray(pref.preferredCountries) 
        ? pref.preferredCountries 
        : undefined;
      data.preferenceInfo.preferredUniversities = Array.isArray(pref.preferredUniversities) 
        ? pref.preferredUniversities 
        : undefined;
      data.preferenceInfo.familyIncomeRange = pref.familyIncomeRange 
        ? this.extractIncomeRange(pref.familyIncomeRange) 
        : undefined;
      data.preferenceInfo.needsFinancialSupport = pref.needsFinancialSupport;
    }

    // Process Work Experience
    if (Array.isArray(extracted.workExperience)) {
      data.workExperience = extracted.workExperience.map((exp: any) => ({
        organizationName: exp.organizationName,
        jobTitle: exp.jobTitle,
        yearsOfExperience: exp.yearsOfExperience 
          ? (typeof exp.yearsOfExperience === 'number' ? exp.yearsOfExperience : parseInt(exp.yearsOfExperience as string))
          : undefined
      }));
    }

    // Process Academic History
    if (Array.isArray(extracted.academicHistory)) {
      data.academicHistory = extracted.academicHistory.map((ah: any) => ({
        institution: ah.institution,
        degree: ah.degree,
        year: ah.year
      }));
    }

    // Process Skills
    if (Array.isArray(extracted.skills)) {
      data.skills = extracted.skills;
    }

    // Process Documents (ID numbers, etc.)
    if (extracted.documents) {
      // Store in personal info if found
      if (extracted.documents.idNumber) {
        data.personalInfo.firstName = data.personalInfo.firstName || extracted.documents.idNumber;
      }
    }

    // Calculate confidence
    const filledFields = [
      data.personalInfo.fullName,
      data.personalInfo.email,
      data.personalInfo.phoneNumber,
      data.personalInfo.dateOfBirth,
      data.personalInfo.nationality,
      data.personalInfo.countryOfResidence,
      data.personalInfo.city,
      data.academicInfo.currentEducationLevel,
      data.academicInfo.fieldOfStudy,
      data.academicInfo.previousUniversity,
      data.academicInfo.gpa,
      data.academicHistory.length > 0,
      data.skills.length > 0,
      data.workExperience.length > 0,
    ].filter(Boolean).length;

    data.confidence = Math.min(0.95, 0.2 + (filledFields / 14) * 0.8);

    return data;
  }

  private static getEmptyExtractedData(): ExtractedProfileData {
    return {
      personalInfo: {},
      academicInfo: {},
      preferenceInfo: {},
      workExperience: [],
      academicHistory: [],
      skills: [],
      confidence: 0,
    };
  }

  /**
   * Convert extracted data to ProfileFormValues format
   */
  static toProfileFormValues(extracted: ExtractedProfileData): any {
    const values: any = {};

    console.log("[OCRService] Converting to profile form values, extracted:", JSON.stringify(extracted, null, 2));

    if (extracted.personalInfo) {
      console.log("[OCRService] Processing personalInfo:", extracted.personalInfo);
      
      if (extracted.personalInfo.fullName) {
        values.fullName = extracted.personalInfo.fullName;
        console.log("[OCRService] Added fullName:", values.fullName);
      }
      if (extracted.personalInfo.email) values.email = extracted.personalInfo.email;
      if (extracted.personalInfo.phoneNumber) {
        values.phoneNumber = extracted.personalInfo.phoneNumber;
        console.log("[OCRService] Added phoneNumber:", values.phoneNumber);
      }
      if (extracted.personalInfo.dateOfBirth) values.dateOfBirth = extracted.personalInfo.dateOfBirth;
      if (extracted.personalInfo.gender) {
        values.gender = extracted.personalInfo.gender;
        console.log("[OCRService] Added gender:", values.gender);
      }
      if (extracted.personalInfo.nationality) {
        values.nationality = extracted.personalInfo.nationality;
        console.log("[OCRService] Added nationality:", values.nationality);
      }
      if (extracted.personalInfo.countryOfResidence) values.countryOfResidence = extracted.personalInfo.countryOfResidence;
      if (extracted.personalInfo.city) values.city = extracted.personalInfo.city;
    }

    if (extracted.academicInfo) {
      if (extracted.academicInfo.currentEducationLevel) values.currentEducationLevel = extracted.academicInfo.currentEducationLevel;
      if (extracted.academicInfo.degreeSeeking) values.degreeSeeking = extracted.academicInfo.degreeSeeking;
      if (extracted.academicInfo.fieldOfStudy && extracted.academicInfo.fieldOfStudy.length > 0) values.fieldOfStudyInput = extracted.academicInfo.fieldOfStudy;
      if (extracted.academicInfo.previousUniversity) values.previousUniversity = extracted.academicInfo.previousUniversity;
      if (extracted.academicInfo.graduationYear) values.graduationYear = extracted.academicInfo.graduationYear;
      if (extracted.academicInfo.gpa) values.gpa = extracted.academicInfo.gpa;
      if (extracted.academicInfo.languageTestType) values.languageTestType = extracted.academicInfo.languageTestType;
      if (extracted.academicInfo.testScore) values.testScore = extracted.academicInfo.testScore;
      if (extracted.academicInfo.researchArea) values.researchArea = extracted.academicInfo.researchArea;
      if (extracted.academicInfo.proposedResearchTopic) values.proposedResearchTopic = extracted.academicInfo.proposedResearchTopic;
    }

    if (extracted.preferenceInfo) {
      if (extracted.preferenceInfo.preferredDegreeLevel) values.preferredDegreeLevel = extracted.preferenceInfo.preferredDegreeLevel;
      if (extracted.preferenceInfo.preferredFundingType) values.preferredFundingType = extracted.preferenceInfo.preferredFundingType;
      if (extracted.preferenceInfo.studyMode) values.studyMode = extracted.preferenceInfo.studyMode;
      if (extracted.preferenceInfo.preferredCountries) values.preferredCountries = extracted.preferenceInfo.preferredCountries;
      if (extracted.preferenceInfo.preferredUniversities) values.preferredUniversities = extracted.preferenceInfo.preferredUniversities;
      if (extracted.preferenceInfo.familyIncomeRange) values.familyIncomeRange = extracted.preferenceInfo.familyIncomeRange;
      if (extracted.preferenceInfo.needsFinancialSupport !== undefined) values.needsFinancialSupport = extracted.preferenceInfo.needsFinancialSupport;
    }

    if (extracted.workExperience && extracted.workExperience.length > 0) {
      values.workExperience = extracted.workExperience.map(exp => ({
        organizationName: exp.organizationName || "",
        jobTitle: exp.jobTitle || "",
        yearsOfExperience: exp.yearsOfExperience || 0,
      }));
    }

    // Add academic history as work experience if no work experience
    if (extracted.academicHistory && extracted.academicHistory.length > 0 && (!values.workExperience || values.workExperience.length === 0)) {
      values.workExperience = extracted.academicHistory.map(ah => ({
        organizationName: ah.institution,
        jobTitle: ah.degree,
        yearsOfExperience: typeof ah.year === 'number' ? new Date().getFullYear() - ah.year : 0,
      }));
    }

    console.log("[OCRService] Final profile form values:", JSON.stringify(values, null, 2));
    console.log("[OCRService] Non-empty fields count:", Object.keys(values).filter(k => values[k] !== undefined && values[k] !== null && values[k] !== '').length);
    
    return values;
  }
}

export default OCRService;