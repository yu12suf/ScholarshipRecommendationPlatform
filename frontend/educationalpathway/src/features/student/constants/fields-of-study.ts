export interface FieldOption {
  value: string;
  label: string;
  group: string;
}

export const FIELDS_OF_STUDY: FieldOption[] = [
  // STEM
  { value: "Computer Science", label: "Computer Science", group: "STEM" },
  { value: "Information Technology", label: "Information Technology", group: "STEM" },
  { value: "Software Engineering", label: "Software Engineering", group: "STEM" },
  { value: "Data Science", label: "Data Science & Analytics", group: "STEM" },
  { value: "Artificial Intelligence", label: "Artificial Intelligence & Machine Learning", group: "STEM" },
  { value: "Cybersecurity", label: "Cybersecurity", group: "STEM" },
  { value: "Electrical Engineering", label: "Electrical Engineering", group: "STEM" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering", group: "STEM" },
  { value: "Civil Engineering", label: "Civil Engineering", group: "STEM" },
  { value: "Chemical Engineering", label: "Chemical Engineering", group: "STEM" },
  { value: "Aerospace Engineering", label: "Aerospace Engineering", group: "STEM" },
  { value: "Biomedical Engineering", label: "Biomedical Engineering", group: "STEM" },
  { value: "Environmental Engineering", label: "Environmental Engineering", group: "STEM" },
  { value: "Industrial Engineering", label: "Industrial Engineering", group: "STEM" },
  { value: "Petroleum Engineering", label: "Petroleum Engineering", group: "STEM" },
  { value: "Mathematics", label: "Mathematics", group: "STEM" },
  { value: "Statistics", label: "Statistics", group: "STEM" },
  { value: "Physics", label: "Physics", group: "STEM" },
  { value: "Chemistry", label: "Chemistry", group: "STEM" },
  { value: "Biology", label: "Biology", group: "STEM" },
  { value: "Biochemistry", label: "Biochemistry", group: "STEM" },
  { value: "Biotechnology", label: "Biotechnology", group: "STEM" },
  { value: "Neuroscience", label: "Neuroscience", group: "STEM" },
  { value: "Genomics", label: "Genomics & Molecular Biology", group: "STEM" },
  { value: "Nanotechnology", label: "Nanotechnology", group: "STEM" },
  { value: "Robotics", label: "Robotics & Automation", group: "STEM" },
  { value: "Geology", label: "Geology & Earth Sciences", group: "STEM" },

  // Health & Medicine
  { value: "Medicine", label: "Medicine (MBBS/MD)", group: "Health & Medicine" },
  { value: "Pharmacy", label: "Pharmacy", group: "Health & Medicine" },
  { value: "Nursing", label: "Nursing", group: "Health & Medicine" },
  { value: "Dentistry", label: "Dentistry", group: "Health & Medicine" },
  { value: "Public Health", label: "Public Health & Epidemiology", group: "Health & Medicine" },
  { value: "Global Health", label: "Global Health", group: "Health & Medicine" },
  { value: "Nutrition", label: "Nutrition & Dietetics", group: "Health & Medicine" },
  { value: "Veterinary Medicine", label: "Veterinary Medicine", group: "Health & Medicine" },
  { value: "Medical Laboratory Science", label: "Medical Laboratory Science", group: "Health & Medicine" },
  { value: "Optometry", label: "Optometry", group: "Health & Medicine" },
  { value: "Physiotherapy", label: "Physiotherapy", group: "Health & Medicine" },
  { value: "Radiology", label: "Radiology & Medical Imaging", group: "Health & Medicine" },

  // Business & Economics
  { value: "Business Administration", label: "Business Administration (MBA)", group: "Business & Economics" },
  { value: "Economics", label: "Economics", group: "Business & Economics" },
  { value: "Finance", label: "Finance", group: "Business & Economics" },
  { value: "Accounting", label: "Accounting & Auditing", group: "Business & Economics" },
  { value: "Marketing", label: "Marketing", group: "Business & Economics" },
  { value: "Management", label: "Management & Leadership", group: "Business & Economics" },
  { value: "International Business", label: "International Business", group: "Business & Economics" },
  { value: "Entrepreneurship", label: "Entrepreneurship & Innovation", group: "Business & Economics" },
  { value: "Supply Chain Management", label: "Supply Chain Management", group: "Business & Economics" },
  { value: "Human Resource Management", label: "Human Resource Management", group: "Business & Economics" },
  { value: "Banking and Finance", label: "Banking and Finance", group: "Business & Economics" },
  { value: "Development Economics", label: "Development Economics", group: "Business & Economics" },
  { value: "Agricultural Economics", label: "Agricultural Economics", group: "Business & Economics" },

  // Law & Political Science
  { value: "Law", label: "Law (LLB/LLM)", group: "Law & Political Science" },
  { value: "International Law", label: "International Law", group: "Law & Political Science" },
  { value: "Human Rights Law", label: "Human Rights Law", group: "Law & Political Science" },
  { value: "Political Science", label: "Political Science", group: "Law & Political Science" },
  { value: "International Relations", label: "International Relations & Diplomacy", group: "Law & Political Science" },
  { value: "Public Policy", label: "Public Policy", group: "Law & Political Science" },
  { value: "Public Administration", label: "Public Administration", group: "Law & Political Science" },
  { value: "Peace and Conflict Studies", label: "Peace and Conflict Studies", group: "Law & Political Science" },

  // Social Sciences & Humanities
  { value: "Sociology", label: "Sociology", group: "Social Sciences & Humanities" },
  { value: "Psychology", label: "Psychology", group: "Social Sciences & Humanities" },
  { value: "Anthropology", label: "Anthropology", group: "Social Sciences & Humanities" },
  { value: "History", label: "History", group: "Social Sciences & Humanities" },
  { value: "Philosophy", label: "Philosophy", group: "Social Sciences & Humanities" },
  { value: "Linguistics", label: "Linguistics & Language Studies", group: "Social Sciences & Humanities" },
  { value: "Literature", label: "Literature & Creative Writing", group: "Social Sciences & Humanities" },
  { value: "Communication Studies", label: "Communication & Media Studies", group: "Social Sciences & Humanities" },
  { value: "Journalism", label: "Journalism", group: "Social Sciences & Humanities" },
  { value: "Social Work", label: "Social Work", group: "Social Sciences & Humanities" },
  { value: "Gender Studies", label: "Gender & Women's Studies", group: "Social Sciences & Humanities" },
  { value: "African Studies", label: "African Studies", group: "Social Sciences & Humanities" },
  { value: "Cultural Studies", label: "Cultural Studies", group: "Social Sciences & Humanities" },

  // Education
  { value: "Education", label: "Education (General)", group: "Education" },
  { value: "Educational Leadership", label: "Educational Leadership & Administration", group: "Education" },
  { value: "Curriculum Development", label: "Curriculum Development", group: "Education" },
  { value: "Special Education", label: "Special Education", group: "Education" },
  { value: "Early Childhood Education", label: "Early Childhood Education", group: "Education" },
  { value: "TESOL", label: "TESOL / English Language Teaching", group: "Education" },
  { value: "Educational Technology", label: "Educational Technology", group: "Education" },

  // Agriculture & Environment
  { value: "Agriculture", label: "Agriculture & Agronomy", group: "Agriculture & Environment" },
  { value: "Food Science", label: "Food Science & Technology", group: "Agriculture & Environment" },
  { value: "Forestry", label: "Forestry & Natural Resource Management", group: "Agriculture & Environment" },
  { value: "Environmental Science", label: "Environmental Science", group: "Agriculture & Environment" },
  { value: "Climate Change", label: "Climate Change & Sustainability", group: "Agriculture & Environment" },
  { value: "Aquaculture", label: "Aquaculture & Fisheries", group: "Agriculture & Environment" },
  { value: "Animal Science", label: "Animal Science", group: "Agriculture & Environment" },
  { value: "Horticulture", label: "Horticulture", group: "Agriculture & Environment" },
  { value: "Water Resources", label: "Water Resources & Hydrology", group: "Agriculture & Environment" },

  // Arts & Design
  { value: "Architecture", label: "Architecture", group: "Arts & Design" },
  { value: "Urban Planning", label: "Urban & Regional Planning", group: "Arts & Design" },
  { value: "Graphic Design", label: "Graphic Design", group: "Arts & Design" },
  { value: "Fine Arts", label: "Fine Arts & Visual Arts", group: "Arts & Design" },
  { value: "Fashion Design", label: "Fashion Design", group: "Arts & Design" },
  { value: "Music", label: "Music", group: "Arts & Design" },
  { value: "Film Studies", label: "Film & Media Production", group: "Arts & Design" },
  { value: "Interior Design", label: "Interior Design", group: "Arts & Design" },

  // Other
  { value: "Tourism", label: "Tourism & Hospitality Management", group: "Other" },
  { value: "Sports Science", label: "Sports Science & Physical Education", group: "Other" },
  { value: "Library Science", label: "Library & Information Science", group: "Other" },
  { value: "Religious Studies", label: "Religious Studies & Theology", group: "Other" },
  { value: "Military Studies", label: "Military & Defense Studies", group: "Other" },
];

// Group options for react-select grouped format
export const FIELDS_OF_STUDY_GROUPED = FIELDS_OF_STUDY.reduce(
  (acc, field) => {
    const group = acc.find((g) => g.label === field.group);
    if (group) {
      group.options.push({ value: field.value, label: field.label });
    } else {
      acc.push({ label: field.group, options: [{ value: field.value, label: field.label }] });
    }
    return acc;
  },
  [] as { label: string; options: { value: string; label: string }[] }[]
);
