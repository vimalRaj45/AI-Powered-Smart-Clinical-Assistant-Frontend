export interface IcdChapter {
  chapterNumber: string;
  codeRange: string;
  title: string;
  icon: string;
  description: string;
  codes: {
    code: string;
    description: string;
    category: string;
    billable: boolean;
  }[];
}

export interface CptProcedureItem {
  code: string;
  description: string;
  category: string;
  basePrice: number;
}

export const ICD_10_CHAPTERS: IcdChapter[] = [
  {
    chapterNumber: 'Chapter 1',
    codeRange: 'A00-B99',
    title: 'Certain infectious and parasitic diseases',
    icon: 'bi-virus',
    description: 'Infectious, parasitic, bacterial, and viral systemic infections',
    codes: [
      { code: 'A01.0', description: 'Typhoid fever, unspecified', category: 'Infectious Diseases', billable: true },
      { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified', category: 'Infectious Diseases', billable: true },
      { code: 'A15.0', description: 'Tuberculosis of lung', category: 'Respiratory Infections', billable: true },
      { code: 'A90', description: 'Dengue fever [classical dengue]', category: 'Viral Fevers', billable: true },
      { code: 'B34.9', description: 'Viral infection, unspecified', category: 'Viral Fevers', billable: true },
      { code: 'B37.0', description: 'Candidal stomatitis (Oral thrush)', category: 'Fungal Infections', billable: true },
      { code: 'B54', description: 'Unspecified malaria', category: 'Parasitic Diseases', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 2',
    codeRange: 'C00-D49',
    title: 'Neoplasms (Malignant & Benign)',
    icon: 'bi-shield-shaded',
    description: 'Malignant, in situ, and benign neoplasms across organ systems',
    codes: [
      { code: 'D12.6', description: 'Benign neoplasm of colon, unspecified', category: 'Digestive Neoplasms', billable: true },
      { code: 'D25.9', description: 'Leiomyoma of uterus, unspecified (Fibroid)', category: 'Female Genital Neoplasms', billable: true },
      { code: 'D17.9', description: 'Benign lipomatous neoplasm, unspecified (Lipoma)', category: 'Skin & Subcutaneous', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 3',
    codeRange: 'D50-D89',
    title: 'Diseases of the blood and blood-forming organs',
    icon: 'bi-droplet-half',
    description: 'Anemias, coagulation defects, and immune disorders',
    codes: [
      { code: 'D50.9', description: 'Iron deficiency anemia, unspecified', category: 'Nutritional Anemias', billable: true },
      { code: 'D64.9', description: 'Anemia, unspecified', category: 'Hematology', billable: true },
      { code: 'D69.6', description: 'Thrombocytopenia, unspecified', category: 'Platelet Disorders', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 4',
    codeRange: 'E00-E89',
    title: 'Endocrine, nutritional and metabolic diseases',
    icon: 'bi-fire',
    description: 'Diabetes, thyroid disorders, obesity, hyperlipidemia, and metabolic syndromes',
    codes: [
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Diabetes Mellitus', billable: true },
      { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Diabetes Mellitus', billable: true },
      { code: 'E11.69', description: 'Type 2 diabetes mellitus with other specified complication', category: 'Diabetes Mellitus', billable: true },
      { code: 'E03.9', description: 'Hypothyroidism, unspecified', category: 'Thyroid Disorders', billable: true },
      { code: 'E66.9', description: 'Obesity, unspecified', category: 'Metabolic & Nutritional', billable: true },
      { code: 'E78.5', description: 'Hyperlipidemia, unspecified', category: 'Lipid Disorders', billable: true },
      { code: 'E86.0', description: 'Dehydration', category: 'Volume Depletion', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 5',
    codeRange: 'F01-F99',
    title: 'Mental, Behavioral and Neurodevelopmental disorders',
    icon: 'bi-person-heart',
    description: 'Anxiety, depression, mood disorders, and stress reactions',
    codes: [
      { code: 'F41.1', description: 'Generalized anxiety disorder (GAD)', category: 'Anxiety Disorders', billable: true },
      { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Depressive Disorders', billable: true },
      { code: 'F51.01', description: 'Primary insomnia', category: 'Sleep Disorders', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 6',
    codeRange: 'G00-G99',
    title: 'Diseases of the nervous system',
    icon: 'bi-cpu',
    description: 'Migraine, headaches, neuropathies, epilepsy, and CNS disorders',
    codes: [
      { code: 'G43.909', description: 'Migraine, unspecified, not intractable, without status migrainosus', category: 'Headache Syndromes', billable: true },
      { code: 'G44.209', description: 'Tension-type headache, unspecified, not intractable', category: 'Headache Syndromes', billable: true },
      { code: 'G47.33', description: 'Obstructive sleep apnea (adult) (pediatric)', category: 'Sleep Apnea', billable: true },
      { code: 'G62.9', description: 'Polyneuropathy, unspecified (Diabetic peripheral neuropathy)', category: 'Neuropathies', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 7',
    codeRange: 'H00-H59',
    title: 'Diseases of the eye and adnexa',
    icon: 'bi-eye',
    description: 'Conjunctivitis, dry eye, cataract, and refractive disorders',
    codes: [
      { code: 'H10.9', description: 'Unspecified conjunctivitis (Pink eye)', category: 'Conjunctival Diseases', billable: true },
      { code: 'H04.123', description: 'Dry eye syndrome, bilateral', category: 'Lacrimal System', billable: true },
      { code: 'H00.019', description: 'Hordeolum externum (Stye), unspecified eye', category: 'Eyelid Disorders', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 8',
    codeRange: 'H60-H95',
    title: 'Diseases of the ear and mastoid process',
    icon: 'bi-ear',
    description: 'Otitis media, otitis externa, tinnitus, and cerumen impaction',
    codes: [
      { code: 'H66.90', description: 'Otitis media, unspecified, unspecified ear', category: 'Middle Ear Infections', billable: true },
      { code: 'H60.90', description: 'Otitis externa, unspecified, unspecified ear (Swimmer ear)', category: 'External Ear', billable: true },
      { code: 'H61.20', description: 'Impacted cerumen, unspecified ear (Ear wax blockage)', category: 'External Ear', billable: true },
      { code: 'H93.19', description: 'Tinnitus, unspecified ear', category: 'Hearing & Ear Disorders', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 9',
    codeRange: 'I00-I99',
    title: 'Diseases of the circulatory system',
    icon: 'bi-heart-pulse',
    description: 'Hypertension, coronary artery disease, arrhythmias, and heart failure',
    codes: [
      { code: 'I10', description: 'Essential (primary) hypertension', category: 'Hypertensive Diseases', billable: true },
      { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery (CAD)', category: 'Ischemic Heart Disease', billable: true },
      { code: 'I20.9', description: 'Angina pectoris, unspecified', category: 'Ischemic Heart Disease', billable: true },
      { code: 'I48.91', description: 'Unspecified atrial fibrillation', category: 'Arrhythmias', billable: true },
      { code: 'I50.9', description: 'Heart failure, unspecified', category: 'Heart Failure', billable: true },
      { code: 'I87.2', description: 'Venous insufficiency (chronic) (peripheral) (Varicose veins)', category: 'Vascular Disorders', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 10',
    codeRange: 'J00-J99',
    title: 'Diseases of the respiratory system',
    icon: 'bi-wind',
    description: 'Upper respiratory infections, asthma, bronchitis, COPD, and pneumonia',
    codes: [
      { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified (URI / Common cold)', category: 'Acute Upper Respiratory', billable: true },
      { code: 'J02.9', description: 'Acute pharyngitis, unspecified (Sore throat)', category: 'Acute Upper Respiratory', billable: true },
      { code: 'J01.90', description: 'Acute sinusitis, unspecified', category: 'Sinus Infections', billable: true },
      { code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Bronchial Infections', billable: true },
      { code: 'J45.909', description: 'Unspecified asthma, uncomplicated', category: 'Asthma & Airway', billable: true },
      { code: 'J44.9', description: 'Chronic obstructive pulmonary disease (COPD), unspecified', category: 'Chronic Lower Respiratory', billable: true },
      { code: 'J18.9', description: 'Pneumonia, unspecified organism', category: 'Lower Respiratory Infections', billable: true },
      { code: 'J30.9', description: 'Allergic rhinitis, unspecified (Hay fever)', category: 'Allergic Airway', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 11',
    codeRange: 'K00-K95',
    title: 'Diseases of the digestive system',
    icon: 'bi-patch-check',
    description: 'GERD, gastritis, peptic ulcers, IBS, hepatitis, and constipation',
    codes: [
      { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis (GERD)', category: 'Esophageal Diseases', billable: true },
      { code: 'K29.70', description: 'Gastritis, unspecified, without bleeding', category: 'Gastric Disorders', billable: true },
      { code: 'K58.9', description: 'Irritable bowel syndrome without diarrhea (IBS)', category: 'Functional Bowel Disorders', billable: true },
      { code: 'K59.00', description: 'Constipation, unspecified', category: 'Functional Bowel Disorders', billable: true },
      { code: 'K76.0', description: 'Fatty (change of) liver, not elsewhere classified (NAFLD)', category: 'Liver Diseases', billable: true },
      { code: 'K80.20', description: 'Calculus of gallbladder without cholecystitis (Gallstones)', category: 'Biliary System', billable: true },
      { code: 'K64.9', description: 'Hemorrhoids, unspecified (Piles)', category: 'Anorectal Disorders', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 12',
    codeRange: 'L00-L99',
    title: 'Diseases of the skin and subcutaneous tissue',
    icon: 'bi-hand-index-thumb',
    description: 'Dermatitis, eczema, cellulitis, urticaria, and fungal skin infections',
    codes: [
      { code: 'L20.9', description: 'Atopic dermatitis, unspecified (Eczema)', category: 'Dermatitis & Eczema', billable: true },
      { code: 'L23.9', description: 'Allergic contact dermatitis, unspecified cause', category: 'Dermatitis & Eczema', billable: true },
      { code: 'L50.9', description: 'Urticaria, unspecified (Hives / Allergies)', category: 'Allergic Skin Conditions', billable: true },
      { code: 'L03.90', description: 'Cellulitis, unspecified', category: 'Bacterial Skin Infections', billable: true },
      { code: 'L70.0', description: 'Acne vulgaris', category: 'Sebaceous Disorders', billable: true },
      { code: 'B35.9', description: 'Dermatophytosis, unspecified (Ringworm / Tinea)', category: 'Fungal Skin Infections', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 13',
    codeRange: 'M00-M99',
    title: 'Diseases of the musculoskeletal system and connective tissue',
    icon: 'bi-activity',
    description: 'Osteoarthritis, back pain, spondylosis, gout, and tendonitis',
    codes: [
      { code: 'M25.561', description: 'Pain in right knee', category: 'Joint Pain & Arthropathy', billable: true },
      { code: 'M25.562', description: 'Pain in left knee', category: 'Joint Pain & Arthropathy', billable: true },
      { code: 'M17.9', description: 'Osteoarthritis of knee, unspecified', category: 'Osteoarthritis', billable: true },
      { code: 'M54.50', description: 'Low back pain, unspecified (Lumbago)', category: 'Spine & Back Disorders', billable: true },
      { code: 'M54.2', description: 'Cervicalgia (Neck pain)', category: 'Spine & Back Disorders', billable: true },
      { code: 'M47.812', description: 'Spondylosis without myelopathy or radiculopathy, cervical region', category: 'Spondylosis', billable: true },
      { code: 'M10.9', description: 'Gout, unspecified (Hyperuricemia arthritis)', category: 'Metabolic Arthropathies', billable: true },
      { code: 'M79.1', description: 'Myalgia (Muscle aches and pains)', category: 'Soft Tissue Disorders', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 14',
    codeRange: 'N00-N99',
    title: 'Diseases of the genitourinary system',
    icon: 'bi-droplet',
    description: 'UTIs, renal calculi (kidney stones), BPH, and pelvic pain',
    codes: [
      { code: 'N39.0', description: 'Urinary tract infection, site not specified (UTI)', category: 'Urinary System Infections', billable: true },
      { code: 'N20.1', description: 'Calculus of ureter / kidney stone (Renal colic)', category: 'Urolithiasis', billable: true },
      { code: 'N40.0', description: 'Benign prostatic hyperplasia without lower urinary tract symptoms (BPH)', category: 'Male Genital Disorders', billable: true },
      { code: 'N94.6', description: 'Dysmenorrhea, unspecified (Painful periods)', category: 'Female Genital Disorders', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 18',
    codeRange: 'R00-R99',
    title: 'Symptoms, signs and abnormal clinical and laboratory findings',
    icon: 'bi-clipboard2-pulse',
    description: 'Fever, cough, chest pain, dizziness, malaise, and general signs',
    codes: [
      { code: 'R50.9', description: 'Fever, unspecified (Pyrexia)', category: 'General Symptoms', billable: true },
      { code: 'R05.9', description: 'Cough, unspecified', category: 'Respiratory Symptoms', billable: true },
      { code: 'R07.9', description: 'Chest pain, unspecified', category: 'Circulatory & Respiratory', billable: true },
      { code: 'R51.9', description: 'Headache, unspecified', category: 'Nervous System Symptoms', billable: true },
      { code: 'R42', description: 'Dizziness and giddiness (Vertigo)', category: 'Nervous System Symptoms', billable: true },
      { code: 'R53.83', description: 'Other fatigue / General malaise', category: 'General Symptoms', billable: true },
      { code: 'R10.9', description: 'Abdominal pain, unspecified', category: 'Digestive Symptoms', billable: true },
      { code: 'R11.2', description: 'Nausea with vomiting, unspecified', category: 'Digestive Symptoms', billable: true },
      { code: 'R06.02', description: 'Shortness of breath (Dyspnea)', category: 'Respiratory Symptoms', billable: true },
      { code: 'R00.2', description: 'Palpitations', category: 'Circulatory Symptoms', billable: true },
    ],
  },
  {
    chapterNumber: 'Chapter 21',
    codeRange: 'Z00-Z99',
    title: 'Factors influencing health status and contact with health services',
    icon: 'bi-check2-circle',
    description: 'General medical check-ups, immunizations, and preventive care',
    codes: [
      { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings (Master Health Checkup)', category: 'General Exams', billable: true },
      { code: 'Z23', description: 'Encounter for immunization (Vaccination)', category: 'Immunization', billable: true },
      { code: 'Z01.818', description: 'Encounter for other preprocedural examination (Fitness certificate)', category: 'Preoperative & Fitness', billable: true },
    ],
  },
];

export const CPT_BILLING_DATABASE: CptProcedureItem[] = [
  { code: '99203', description: 'Office O.P. New Patient Consultation - Moderate Complexity (30-44 mins)', category: 'Doctor Consultation', basePrice: 500 },
  { code: '99213', description: 'Office O.P. Established Patient Follow-up - Low Complexity (20-29 mins)', category: 'Doctor Consultation', basePrice: 350 },
  { code: '99214', description: 'Office O.P. Established Patient Follow-up - Moderate Complexity (30-39 mins)', category: 'Doctor Consultation', basePrice: 450 },
  { code: '99215', description: 'Comprehensive Specialist Medical Consultation - High Complexity', category: 'Doctor Consultation', basePrice: 800 },
  { code: '99283', description: 'Emergency Room / Casualty Initial Triage & Treatment', category: 'Emergency Services', basePrice: 750 },
  { code: '93000', description: '12-Lead Electrocardiogram (ECG / EKG) with Physician Interpretation', category: 'Diagnostics & Cardiology', basePrice: 350 },
  { code: '94640', description: 'Pressurized Inhalation Treatment (Nebulization with Bronchodilator)', category: 'Pulmonary Procedures', basePrice: 200 },
  { code: '80061', description: 'Lipid Profile Blood Panel (Total Cholesterol, HDL, LDL, Triglycerides)', category: 'Laboratory & Pathology', basePrice: 450 },
  { code: '85025', description: 'Complete Blood Count (CBC) with Automated Differential', category: 'Laboratory & Pathology', basePrice: 300 },
  { code: '83036', description: 'Hemoglobin A1c (HbA1c) Glycated Blood Test', category: 'Laboratory & Pathology', basePrice: 400 },
  { code: '87880', description: 'Rapid Infectious Antigen Screening Test', category: 'Laboratory & Pathology', basePrice: 350 },
  { code: '96372', description: 'Intramuscular / Subcutaneous Therapeutic Injection Administration', category: 'Nursing & Procedures', basePrice: 150 },
  { code: '96360', description: 'Intravenous (IV) Hydration Infusion - First Hour with Cannula & Line', category: 'Nursing & Procedures', basePrice: 450 },
  { code: '97597', description: 'Wound Debridement, Antiseptic Cleaning & Sterile Dressing', category: 'Nursing & Procedures', basePrice: 250 },
  { code: '99199', description: 'Day Care Observation Bed Charge & Clinical Monitoring (Per Session)', category: 'Day Care & Room', basePrice: 600 },
];

export const ALL_ICD_CODES = ICD_10_CHAPTERS.flatMap((ch) =>
  ch.codes.map((c) => ({
    ...c,
    chapterTitle: ch.title,
    chapterCodeRange: ch.codeRange,
  }))
);
