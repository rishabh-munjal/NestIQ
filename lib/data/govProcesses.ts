// lib/data/govProcesses.ts
// Karnataka / Bangalore government property formality steps

export interface GovStep {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  icon: string;
  duration: string;       // estimated time
  cost: string;           // estimated cost
  documents: string[];
  officialPortal?: string;
  portalLabel?: string;
  tips: string[];
  warnings?: string[];
  isOnline: boolean;
  department: string;
}

export const govSteps: GovStep[] = [
  {
    id: 'rera-check',
    step: 1,
    title: 'RERA Verification',
    subtitle: 'Verify the property / project is registered under Karnataka RERA',
    icon: '🔍',
    duration: '30 minutes',
    cost: 'Free',
    documents: [
      'Project name or RERA registration number',
      'Builder / developer name',
    ],
    officialPortal: 'https://rera.karnataka.gov.in',
    portalLabel: 'K-RERA Portal',
    tips: [
      'Always cross-verify the RERA number on K-RERA portal — never trust builder-provided PDFs alone',
      'Check if project completion date matches what builder promised',
      'View all approved plans and specifications on the portal',
      'Any delay in project must be communicated to RERA by builder',
    ],
    warnings: [
      'Plots in gated communities may be exempt from RERA — verify separately',
      'Resale properties are not covered by RERA',
    ],
    isOnline: true,
    department: 'Karnataka Real Estate Regulatory Authority (K-RERA)',
  },
  {
    id: 'title-verification',
    step: 2,
    title: 'Title Verification & EC',
    subtitle: 'Get an Encumbrance Certificate to confirm clear title',
    icon: '📜',
    duration: '3-7 business days',
    cost: '₹200 - ₹500',
    documents: [
      'Property address details',
      'Survey number / khata number',
      'Period for which EC is required (usually 15-30 years)',
    ],
    officialPortal: 'https://kaveri.karnataka.gov.in',
    portalLabel: 'Kaveri Online Services',
    tips: [
      'Get EC for minimum 15 years to ensure no mortgage or legal disputes',
      'Form-15 means property has encumbrances; Form-16 means clear title',
      'Hire a lawyer to review EC — ₹5,000-10,000 is well worth it',
      'Also check for any pending litigation on MCA/court portals',
    ],
    warnings: [
      'Never buy a property with Form-15 EC without legal advice',
      'Verify the seller is the actual registered owner per EC records',
    ],
    isOnline: true,
    department: 'Sub-Registrar Office / Inspector General of Registration',
  },
  {
    id: 'khata-certificate',
    step: 3,
    title: 'Khata Certificate',
    subtitle: 'Obtain BBMP/Gram Panchayat Khata to confirm property records',
    icon: '🏛️',
    duration: '7-15 business days',
    cost: '₹125 - ₹500 + 2% of property value as assessment',
    documents: [
      'Sale deed (notarized copy)',
      'Property tax receipts (last 3 years)',
      'Encumbrance Certificate',
      'Application form from BBMP ARO office',
      'Aadhar Card + PAN Card',
    ],
    officialPortal: 'https://bbmpcitizen.in',
    portalLabel: 'BBMP Citizen Portal',
    tips: [
      'Khata A means property is fully assessed and legal — preferred',
      'Khata B means property is in a revenue record but may have issues',
      'For new properties: Khata transfer happens after registration',
      'You can also apply at BBMP ARO (Assistant Revenue Officer) office',
    ],
    warnings: [
      'Khata B properties cannot get building plan approval or BESCOM connection',
      'Avoid properties with only Khata B unless you understand the implications',
    ],
    isOnline: false,
    department: 'BBMP (Bruhat Bengaluru Mahanagara Palike)',
  },
  {
    id: 'stamp-duty',
    step: 4,
    title: 'Stamp Duty Calculation',
    subtitle: 'Calculate and pay Karnataka stamp duty and registration charges',
    icon: '🧮',
    duration: '1 day (payment) + 1-2 days (registration appointment)',
    cost: '5.6% of guidance value + 1% registration + 0.5% surcharge',
    documents: [
      'Draft sale deed',
      'Guidance value from Department of Stamps & Registration',
      'PAN Cards of buyer and seller',
      'Aadhar Cards',
      'Passport size photos',
    ],
    officialPortal: 'https://igr.karnataka.gov.in',
    portalLabel: 'IGR Karnataka',
    tips: [
      'Stamp duty is payable on GUIDANCE VALUE or ACTUAL price — whichever is higher',
      'Women buyers get 1% concession on stamp duty in Karnataka',
      'Payment can be done online via SHCIL or offline at designated banks',
      'Franking: Banks can imprint stamp duty value on sale deed paper',
    ],
    warnings: [
      'Stamp duty evasion is a criminal offense — always pay on actual market value',
      'Guidance values are updated quarterly — check latest before calculation',
    ],
    isOnline: true,
    department: 'Department of Stamps & Registration, Karnataka',
  },
  {
    id: 'sale-deed-registration',
    step: 5,
    title: 'Sale Deed Registration',
    subtitle: 'Execute and register the sale deed at Sub-Registrar Office',
    icon: '✍️',
    duration: '1-3 hours (appointment day)',
    cost: 'Included in Step 4 (registration charges 1%)',
    documents: [
      'Stamped sale deed (2 original copies)',
      'Encumbrance Certificate',
      'Khata Certificate',
      'PAN Cards (buyer + seller)',
      'Aadhar Cards (buyer + seller)',
      'Passport photos (3 each)',
      'Two witnesses with ID proof',
      'Demand Draft for registration fee',
    ],
    officialPortal: 'https://kaveri.karnataka.gov.in',
    portalLabel: 'Book SRO Appointment',
    tips: [
      'Book appointment on Kaveri portal 3-5 days in advance',
      'Both buyer and seller MUST be present in person',
      'NRI sellers need special power of attorney',
      'Original documents are submitted and scanned at SRO',
    ],
    warnings: [
      'If seller is NRI, TDS of 20% is applicable — deduct before payment',
      "Property is legally yours ONLY after registration — don't pay full amount before this",
    ],
    isOnline: false,
    department: 'Sub-Registrar Office (SRO)',
  },
  {
    id: 'khata-transfer',
    step: 6,
    title: 'Khata Transfer',
    subtitle: 'Transfer Khata to buyer\'s name in BBMP records after registration',
    icon: '🔄',
    duration: '30-60 days',
    cost: '2% of property value as betterment charges + ₹125 application fee',
    documents: [
      'Registered sale deed (original)',
      'Previous Khata certificate',
      'Encumbrance Certificate (post-registration)',
      'Property tax receipts (no arrears)',
      'Application form',
      'Aadhar + PAN',
    ],
    officialPortal: 'https://bbmpcitizen.in',
    portalLabel: 'BBMP Citizen Portal',
    tips: [
      'Apply within 3 months of registration to avoid complications',
      'Betterment charges can sometimes be negotiated if property is old',
      'Track application status on BBMP portal using application number',
      'New Khata certificate usually arrives by post',
    ],
    warnings: [
      'Without Khata transfer, property tax receipts will still be in seller\'s name',
      'Ensure seller clears ALL pending property taxes before transfer',
    ],
    isOnline: false,
    department: 'BBMP ARO (Assistant Revenue Officer)',
  },
  {
    id: 'utility-transfer',
    step: 7,
    title: 'Utility Transfers',
    subtitle: 'Transfer electricity, water, and other utility connections',
    icon: '⚡',
    duration: '7-15 days per utility',
    cost: '₹500 - ₹2,000 per utility (processing fees)',
    documents: [
      'Registered sale deed',
      'New Khata certificate',
      'ID proof of buyer',
      'Previous utility bills (in seller\'s name)',
    ],
    officialPortal: 'https://bescom.karnataka.gov.in',
    portalLabel: 'BESCOM Portal',
    tips: [
      'BESCOM electricity: Apply at nearest BESCOM customer care with docs',
      'BWSSB water: Visit nearest BWSSB office with property documents',
      'Gas: Contact your gas utility provider directly',
      'Ensure seller gives NOC for all utility transfers',
    ],
    isOnline: false,
    department: 'BESCOM / BWSSB / Gas Utility',
  },
];

// Karnataka Stamp Duty Calculator
export function calculateStampDuty(
  propertyValue: number,
  isFemale: boolean = false
): {
  guidanceValue: number;
  stampDuty: number;
  registrationFee: number;
  surcharge: number;
  total: number;
  breakdown: { label: string; amount: number }[];
} {
  // Stamp duty rates in Karnataka (2024-25)
  let stampDutyRate = 0.056; // 5.6%
  if (isFemale) stampDutyRate = 0.046; // 4.6% for women

  const registrationRate = 0.01; // 1%
  const surchargeRate = 0.005;   // 0.5%

  const stampDuty = Math.round(propertyValue * stampDutyRate);
  const registrationFee = Math.round(propertyValue * registrationRate);
  const surcharge = Math.round(propertyValue * surchargeRate);
  const total = stampDuty + registrationFee + surcharge;

  return {
    guidanceValue: propertyValue,
    stampDuty,
    registrationFee,
    surcharge,
    total,
    breakdown: [
      { label: `Stamp Duty (${(stampDutyRate * 100).toFixed(1)}%)`, amount: stampDuty },
      { label: 'Registration Fee (1%)', amount: registrationFee },
      { label: 'Surcharge (0.5%)', amount: surcharge },
    ],
  };
}
