// ============================================================
// AP EAPCET College Predictor — Core Type Definitions
// ============================================================

// Branch code to full name mapping
export const BRANCH_NAMES = {
  AGR: "Agricultural Engineering",
  AI: "Artificial Intelligence",
  AID: "AI & Data Science",
  AIM: "AI & Machine Learning",
  ASE: "Aerospace Engineering",
  AUT: "Automobile Engineering",
  BDT: "Big Data Technology",
  BIO: "Biotechnology",
  CAD: "Computer Aided Design",
  CAI: "Computer Science (AI)",
  CBA: "Computer Business Analytics",
  CBC: "Cyber Security",
  CCC: "Cloud Computing",
  CDA: "Computer Science (Data Analytics)",
  CHE: "Chemical Engineering",
  CIA: "CS & AI",
  CIC: "CS & Info Security",
  CIT: "CS & Information Technology",
  CIV: "Civil Engineering",
  CN: "Computer Networking",
  CS: "Computer Science",
  CSB: "CS & Business Systems",
  CSBS: "CS & Business Systems",
  CSC: "Computer Science (Cyber Security)",
  CSD: "CS & Design",
  CSE: "Computer Science & Engineering",
  CSEB: "CSE (Blockchain)",
  CSER: "CSE (Regional)",
  CSG: "CS & Gaming",
  CSM: "CSE (AI & ML)",
  CSO: "CS & IoT",
  CSS: "CS & Systems",
  CST: "CS & Technology",
  CSW: "CS (Web Technology)",
  DS: "Data Science",
  EBM: "Electronics & Biomedical",
  ECA: "ECE (Advanced Communication)",
  ECE: "Electronics & Communication Engineering",
  ECES: "ECE (Signal Processing)",
  ECM: "Electronics & Computer Engineering",
  ECT: "ECE (VLSI Technology)",
  ECV: "ECE (VLSI Design)",
  EEE: "Electrical & Electronics Engineering",
  EIE: "Electronics & Instrumentation Engineering",
  EII: "EIE (Industrial)",
  EVT: "Electric Vehicle Technology",
  FDE: "Food Technology",
  FDT: "Food Technology",
  GDT: "Geo-Informatics",
  GIN: "Geo-Informatics",
  INF: "Information Technology",
  IOT: "Internet of Things",
  IST: "Information Science & Technology",
  MAD: "Mobile Application Development",
  MAU: "Mechanical (Automation)",
  MEC: "Mechanical Engineering",
  MET: "Metallurgical Engineering",
  MII: "Mining Engineering (Industrial)",
  MIN: "Mining Engineering",
  MMM: "Mineral & Metallurgical Engineering",
  MMT: "Materials & Metallurgy",
  MRB: "Mechatronics & Robotics",
  NAM: "Naval Architecture & Marine",
  PEE: "Petroleum Engineering",
  PET: "Petrochemical Engineering",
  PHD: "Pharmaceutical Engineering",
  PHM: "Pharmacy",
  RBT: "Robotics Engineering",
  SWE: "Software Engineering",
};

// District code to full name mapping
export const DISTRICT_NAMES = {
  ATP: "Anantapur",
  CTR: "Chittoor",
  EG: "East Godavari",
  GTR: "Guntur",
  KDP: "Kadapa",
  KNL: "Kurnool",
  KRI: "Krishna",
  NLR: "Nellore",
  PKS: "Prakasam",
  SKL: "Srikakulam",
  VSP: "Visakhapatnam",
  VZM: "Vizianagaram",
  WG: "West Godavari",
};

// Region groupings for proximity matching
export const REGION_GROUPS = {
  AU: ["EG", "WG", "KRI", "GTR", "PKS"], // Andhra University region
  SVU: ["CTR", "ATP", "KDP", "KNL", "NLR"], // SV University region
  SW: ["VSP", "VZM", "SKL"], // North Andhra / Swarnandhra region
};

// College type mapping
export const COLLEGE_TYPE_MAP = {
  PVT: "Private",
  UNIV: "University",
  SF: "Self Finance",
  SS: "Self Supporting",
  PU: "Private University",
};

// Category to cutoff column mapping
export function getCutoffKey(category, gender) {
  const genderSuffix = gender === "Male" ? "BOYS" : "GIRLS";
  switch (category) {
    case "OC":
      return `OC_${genderSuffix}`;
    case "SC":
      return `SC_${genderSuffix}`;
    case "ST":
      return `ST_${genderSuffix}`;
    case "BC-A":
      return `BCA_${genderSuffix}`;
    case "BC-B":
      return `BCB_${genderSuffix}`;
    case "BC-C":
      return `BCC_${genderSuffix}`;
    case "BC-D":
      return `BCD_${genderSuffix}`;
    case "BC-E":
      return `BCE_${genderSuffix}`;
    case "EWS":
      return `EWS_${genderSuffix}`;
    default:
      return `OC_${genderSuffix}`;
  }
}

// Fee budget ranges
export const FEE_RANGES = [
  { label: "Any Fee", value: 0 },
  { label: "Under ₹40,000", value: 40000 },
  { label: "Under ₹60,000", value: 60000 },
  { label: "Under ₹80,000", value: 80000 },
  { label: "Under ₹1,00,000", value: 100000 },
  { label: "Under ₹1,50,000", value: 150000 },
  { label: "Under ₹2,00,000", value: 200000 },
];

// Categories list
export const CATEGORIES = [
  { label: "OC (Open Category)", value: "OC" },
  { label: "EWS (Economically Weaker Section)", value: "EWS" },
  { label: "BC-A", value: "BC-A" },
  { label: "BC-B", value: "BC-B" },
  { label: "BC-C", value: "BC-C" },
  { label: "BC-D", value: "BC-D" },
  { label: "BC-E", value: "BC-E" },
  { label: "SC (Scheduled Caste)", value: "SC" },
  { label: "ST (Scheduled Tribe)", value: "ST" },
];
