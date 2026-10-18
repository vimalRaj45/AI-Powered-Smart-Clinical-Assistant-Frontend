export interface OneMgDisease {
  id: string;
  name: string;
  alphabet: string;
  category: 'Cardiovascular' | 'Respiratory' | 'Gastrointestinal' | 'Endocrine & Diabetes' | 'Neurology & Brain' | 'Dermatology & Skin' | 'Orthopedics & Joint' | 'Infectious Diseases' | 'Nephrology & Urology' | 'ENT & Ophthalmology' | 'Mental Health';
  icd10Code: string;
  overview: string;
  symptoms: string[];
  causes: string[];
  diagnosticTests: string[];
  firstLineMedications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  lifestyleAdvice: string;
  oneMgUrl: string;
}

export interface MedindiaCondition {
  id: string;
  conditionName: string;
  speciality: 'Cardiology' | 'Endocrinology' | 'Gastroenterology' | 'Pulmonology' | 'Neurology' | 'Dermatology' | 'Rheumatology' | 'Nephrology' | 'Infectious Disease';
  overview: string;
  prescribedDrugs: {
    genericName: string;
    brandNames: string[];
    drugClass: string;
    standardDose: string;
    mechanism: string;
  }[];
  clinicalGuidelines: string;
  contraindications: string[];
  medindiaUrl: string;
}

export const ONE_MG_ALL_DISEASES: OneMgDisease[] = [
  {
    id: '1mg-asthma',
    name: 'Bronchial Asthma',
    alphabet: 'A',
    category: 'Respiratory',
    icd10Code: 'J45.909',
    overview: 'Chronic inflammatory disorder of the airways causing hyper-responsiveness, wheezing, breathlessness, chest tightness, and nighttime cough.',
    symptoms: ['Wheezing (whistling sound on expiration)', 'Shortness of breath (dyspnea)', 'Chest tightness', 'Nocturnal paroxysmal cough'],
    causes: ['Allergen triggers (dust mites, pollen)', 'Cold air exposure', 'Upper respiratory viral infections', 'Exercise-induced bronchoconstriction'],
    diagnosticTests: ['Spirometry / Pulmonary Function Test (PFT)', 'Peak Expiratory Flow Rate (PEFR)', 'Chest X-Ray PA', 'Serum IgE & Absolute Eosinophil Count (AEC)'],
    firstLineMedications: [
      { name: 'Budecort 200 Inhaler (Budesonide)', dosage: '200 mcg', frequency: '1 puff BD', duration: 'Continuous', instructions: 'Rinse mouth with water after inhalation.' },
      { name: 'Asthalin Inhaler (Salbutamol SOS)', dosage: '100 mcg', frequency: '2 puffs SOS', duration: 'As needed', instructions: 'Use during sudden acute acute wheezing/shortness of breath.' },
      { name: 'Montair-LC (Montelukast 10mg + Levocetirizine 5mg)', dosage: '1 Tab', frequency: '0-0-1', duration: '14 days', instructions: 'Take at bedtime for allergic asthma.' }
    ],
    lifestyleAdvice: 'Avoid exposure to cold drinks, smoke, dust, and sudden temperature shifts. Maintain peak flow diary.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-acute-bronchitis',
    name: 'Acute Bronchitis',
    alphabet: 'A',
    category: 'Respiratory',
    icd10Code: 'J20.9',
    overview: 'Acute inflammation of the tracheobronchial tree, frequently secondary to viral respiratory infection, presenting with persistent productive cough.',
    symptoms: ['Productive cough with clear/yellow sputum', 'Low-grade fever & chills', 'Substernal chest soreness', 'Mild fatigue and sore throat'],
    causes: ['Rhinovirus, Influenza, Coronavirus', 'Secondary bacterial superinfection', 'Inhaled chemical fumes or tobacco smoke'],
    diagnosticTests: ['Chest X-Ray (to rule out pneumonia)', 'Complete Blood Count (CBC) with ESR', 'Sputum culture (if purulent)'],
    firstLineMedications: [
      { name: 'Ascoril-LS Expectorant Syrup', dosage: '10 ml', frequency: '1-1-1', duration: '5 days', instructions: 'Take after meals. Loosens bronchial secretions.' },
      { name: 'Dolo 650mg (Paracetamol)', dosage: '650 mg', frequency: '1-0-1', duration: '3 to 5 days', instructions: 'Take after food for fever and body malaise.' },
      { name: 'Azithral 500mg (Azithromycin)', dosage: '500 mg', frequency: '1-0-0', duration: '3 days', instructions: 'Take 1 hour before meal if bacterial infection is suspected.' }
    ],
    lifestyleAdvice: 'Steam inhalation twice daily, drink lukewarm fluids, avoid cold refrigerated items and smoking.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-allergic-rhinitis',
    name: 'Allergic Rhinitis (Hay Fever)',
    alphabet: 'A',
    category: 'Respiratory',
    icd10Code: 'J30.9',
    overview: 'Immunoglobulin E (IgE)-mediated inflammatory response of nasal mucous membranes triggered by environmental allergens.',
    symptoms: ['Bouts of repetitive sneezing', 'Profuse watery rhinorrhea', 'Nasal congestion & pruritus', 'Red, itchy, watery eyes'],
    causes: ['Airborne pollen', 'Dust mite fecal particles', 'Animal dander', 'Molds and fungal spores'],
    diagnosticTests: ['Nasal endoscopy', 'Absolute Eosinophil Count (AEC)', 'Total Serum IgE test', 'Skin prick allergen panel'],
    firstLineMedications: [
      { name: 'Allegra 120mg (Fexofenadine)', dosage: '120 mg', frequency: '1-0-0', duration: '10 days', instructions: 'Non-sedating antihistamine. Take in morning.' },
      { name: 'Flomist Nasal Spray (Fluticasone Propionate)', dosage: '50 mcg/spray', frequency: '1 spray per nostril BD', duration: '14 days', instructions: 'Clear nasal passages before spraying.' }
    ],
    lifestyleAdvice: 'Keep windows closed during high pollen counts. Clean bed linen in hot water weekly.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-anemia-iron',
    name: 'Iron Deficiency Anemia',
    alphabet: 'A',
    category: 'Cardiovascular',
    icd10Code: 'D50.9',
    overview: 'Microcytic hypochromic anemia caused by inadequate iron stores required for hemoglobin synthesis and oxygen delivery.',
    symptoms: ['Easy fatigability and generalized weakness', 'Pallor of conjunctiva and nail beds', 'Koilonychia (spoon nails)', 'Dyspnea on exertion & palpitations'],
    causes: ['Chronic occult blood loss (PUD, menorrhagia)', 'Inadequate dietary intake', 'Malabsorption (Celiac disease)', 'Increased demand during pregnancy'],
    diagnosticTests: ['CBC (Hb, MCV < 80 fL, MCH, RDW > 15%)', 'Serum Ferritin (< 15 ng/mL diagnostic)', 'Serum Iron & Total Iron Binding Capacity (TIBC)', 'Stool occult blood'],
    firstLineMedications: [
      { name: 'Autrin / Orofer XT (Ferrous Ascorbate + Folic Acid)', dosage: '100 mg elemental iron', frequency: '0-0-1', duration: '90 days', instructions: 'Take on empty stomach with Vitamin C or orange juice. Avoid milk/tea 2 hrs.' }
    ],
    lifestyleAdvice: 'Include green leafy vegetables, jaggery, beetroot, dates, and lean meat. Avoid taking iron tablets with calcium or dairy.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-bacterial-pneumonia',
    name: 'Bacterial Pneumonia (Community-Acquired)',
    alphabet: 'B',
    category: 'Respiratory',
    icd10Code: 'J15.9',
    overview: 'Acute parenchymal pulmonary infection causing alveolar consolidation, severe hypoxia, and inflammatory exudates.',
    symptoms: ['High-grade spiking fever with rigors', 'Productive cough with rust-colored sputum', 'Pleuritic sharp chest pain', 'Tachypnea and crackles on auscultation'],
    causes: ['Streptococcus pneumoniae', 'Haemophilus influenzae', 'Klebsiella pneumoniae', 'Atypical bacteria (Mycoplasma)'],
    diagnosticTests: ['Chest X-Ray PA (lobar consolidation)', 'CBC (leukocytosis > 15,000/uL with neutrophilia)', 'C-Reactive Protein (CRP) & Procalcitonin', 'Pulse Oximetry (SpO2)'],
    firstLineMedications: [
      { name: 'Augmentin 625 Duo (Amoxicillin + Clavulanate)', dosage: '625 mg', frequency: '1-0-1', duration: '7 days', instructions: 'Take immediately before or with meal to prevent nausea.' },
      { name: 'Azee 500 (Azithromycin)', dosage: '500 mg', frequency: '1-0-0', duration: '5 days', instructions: 'Dual coverage for atypical pathogens.' }
    ],
    lifestyleAdvice: 'Strict bed rest, monitor SpO2 every 4 hours, oral rehydration therapy, deep breathing exercises.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-bph',
    name: 'Benign Prostatic Hyperplasia (BPH)',
    alphabet: 'B',
    category: 'Nephrology & Urology',
    icd10Code: 'N40.0',
    overview: 'Non-malignant glandular and stromal proliferation of the prostate transition zone leading to lower urinary tract symptoms (LUTS).',
    symptoms: ['Weak or interrupted urinary stream', 'Nocturia (> 2 times per night)', 'Hesitancy & post-void dribbling', 'Sensation of incomplete bladder emptying'],
    causes: ['Age-related androgen/estrogen hormonal imbalance', 'Dihydrotestosterone (DHT) metabolic effect', 'Genetic predisposition'],
    diagnosticTests: ['Prostate Specific Antigen (PSA Serum)', 'USG KUB & Prostate with Post-Void Residual (PVR)', 'Uroflowmetry', 'Digital Rectal Examination (DRE)'],
    firstLineMedications: [
      { name: 'Urimax 0.4mg (Tamsulosin HCl)', dosage: '0.4 mg', frequency: '0-0-1', duration: '30 days', instructions: 'Alpha-1 blocker. Take 30 minutes after dinner at night.' },
      { name: 'Finast 5mg (Finasteride)', dosage: '5 mg', frequency: '1-0-0', duration: '60 days', instructions: '5-alpha reductase inhibitor to reduce prostate volume.' }
    ],
    lifestyleAdvice: 'Limit fluid intake 2 hours before bed. Avoid caffeine, alcohol, and OTC decongestants.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-copd',
    name: 'Chronic Obstructive Pulmonary Disease (COPD)',
    alphabet: 'C',
    category: 'Respiratory',
    icd10Code: 'J44.9',
    overview: 'Progressive airflow limitation characterized by chronic bronchitis and emphysema, predominantly driven by noxious particle exposure.',
    symptoms: ['Progressive chronic exertional dyspnea', 'Chronic cough with daily sputum production', 'Barrel chest deformity & pursed-lip breathing', 'Ankle edema in cor pulmonale'],
    causes: ['Long-term cigarette and bidi smoking', 'Biomass fuel / indoor cooking wood smoke', 'Occupational dust exposure', 'Alpha-1 antitrypsin deficiency'],
    diagnosticTests: ['Spirometry Post-Bronchodilator (FEV1/FVC < 0.70)', 'High-Resolution CT (HRCT) Chest', 'Arterial Blood Gas (ABG)', '6-Minute Walk Test (6MWT)'],
    firstLineMedications: [
      { name: 'Tiova Rotacaps 18mcg (Tiotropium Bromide)', dosage: '18 mcg', frequency: '1 capsule inhalation OD', duration: 'Continuous', instructions: 'Long-acting muscarinic antagonist (LAMA) via DPI.' },
      { name: 'Foracort 200 Inhaler (Formoterol + Budesonide)', dosage: '200 mcg', frequency: '1 puff BD', duration: 'Continuous', instructions: 'Rinse mouth after each use.' }
    ],
    lifestyleAdvice: 'Absolute cessation of smoking. Annual Influenza and 5-yearly Pneumococcal vaccinations. Pulmonary rehabilitation.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-ckd',
    name: 'Chronic Kidney Disease (CKD)',
    alphabet: 'C',
    category: 'Nephrology & Urology',
    icd10Code: 'N18.9',
    overview: 'Long-standing, irreversible structural and functional renal damage characterized by persistent GFR < 60 mL/min/1.73m² or proteinuria > 3 months.',
    symptoms: ['Bilateral pedal edema & periorbital puffiness', 'Fatigue, anorexia, nausea (uremic toxins)', 'Nocturia and frothy urine', 'Refractory hypertension and pruritus'],
    causes: ['Diabetic Nephropathy', 'Hypertensive Nephrosclerosis', 'Chronic Glomerulonephritis', 'Polycystic Kidney Disease'],
    diagnosticTests: ['Serum Creatinine & Blood Urea Nitrogen (BUN)', 'Estimated GFR (eGFR via CKD-EPI equation)', 'Spot Urine Albumin-to-Creatinine Ratio (UACR)', 'USG Bilateral Kidneys (contracted echogenic kidneys)'],
    firstLineMedications: [
      { name: 'Telmisartan 40mg (Telma 40)', dosage: '40 mg', frequency: '1-0-0', duration: '30 days', instructions: 'Renoprotective ARB. Slows progression of proteinuria.' },
      { name: 'Torsemide 10mg (Dytor 10)', dosage: '10 mg', frequency: '1-0-0', duration: '30 days', instructions: 'Loop diuretic for fluid overload and edema.' }
    ],
    lifestyleAdvice: 'Strict restriction of dietary salt (< 2g/day) and potassium. Protein restriction (0.6-0.8 g/kg/day). Avoid NSAIDs and nephrotoxic dyes.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-type2-diabetes',
    name: 'Type 2 Diabetes Mellitus',
    alphabet: 'D',
    category: 'Endocrine & Diabetes',
    icd10Code: 'E11.9',
    overview: 'Chronic metabolic disorder characterized by persistent hyperglycemia resulting from progressive insulin secretory defect on a background of insulin resistance.',
    symptoms: ['Polyuria (excessive urination)', 'Polydipsia (excessive thirst)', 'Unexplained weight loss despite polyphagia', 'Delayed wound healing & recurrent fungal infections'],
    causes: ['Insulin receptor resistance', 'Sedentary lifestyle and visceral adiposity', 'Genetic predisposition & positive family history', 'Pancreatic beta-cell failure'],
    diagnosticTests: ['Fasting Blood Sugar (FBS >= 126 mg/dL)', 'Post-Prandial Blood Sugar (PPBS >= 200 mg/dL)', 'HbA1c Glycated Hemoglobin (>= 6.5%)', 'Lipid Profile & Urine Microalbumin'],
    firstLineMedications: [
      { name: 'Glycomet 500 SR (Metformin Extended Release)', dosage: '500 mg', frequency: '1-0-1', duration: '30 days', instructions: 'First-line biguanide. Take with or immediately after meals.' },
      { name: 'Galvus 50mg (Vildagliptin)', dosage: '50 mg', frequency: '1-0-1', duration: '30 days', instructions: 'DPP-4 inhibitor. Weight-neutral, low risk of hypoglycemia.' }
    ],
    lifestyleAdvice: 'DASH/Diabetic low-glycemic diet. 45 minutes of moderate aerobic exercise 5 days/week. Self-monitoring of blood glucose (SMBG).',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-dengue',
    name: 'Dengue Viral Fever',
    alphabet: 'D',
    category: 'Infectious Diseases',
    icd10Code: 'A90',
    overview: 'Arboviral acute febrile illness transmitted by Aedes aegypti mosquitoes, characterized by severe thrombocytopenia and vascular leakage.',
    symptoms: ['High sudden fever (104°F / 40°C)', 'Retro-orbital eye pain & severe frontal headache', 'Breakbone arthralgia & severe myalgia', 'Maculopapular petechial rash & bleeding tendencies'],
    causes: ['Dengue virus serotypes (DENV 1, 2, 3, 4)', 'Aedes aegypti / Aedes albopictus mosquito vector bites'],
    diagnosticTests: ['Dengue NS1 Antigen (Days 1-5)', 'Dengue IgM & IgG Antibodies (Day 5 onwards)', 'Daily CBC (Platelet count & Hematocrit monitoring)', 'Liver Function Tests (ALT/AST elevation)'],
    firstLineMedications: [
      { name: 'Dolo 650mg (Paracetamol)', dosage: '650 mg', frequency: '1-1-1', duration: '5 days', instructions: 'Max 3-4 tabs/day. Strictly avoid Aspirin and Brufen/NSAIDs.' },
      { name: 'Oral Rehydration Salts (Electral ORS)', dosage: '1 sachet in 1L water', frequency: 'Sip throughout day', duration: '5 days', instructions: 'Prevents vascular collapse and hypovolemia.' }
    ],
    lifestyleAdvice: 'Aggressive oral hydration (3 to 4 liters fluids: coconut water, soup, ORS). Watch for warning signs: persistent vomiting, abdominal pain, mucosal bleeding.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-hypertension',
    name: 'Essential (Primary) Hypertension',
    alphabet: 'E',
    category: 'Cardiovascular',
    icd10Code: 'I10',
    overview: 'Sustained elevation of systemic arterial blood pressure (>= 140/90 mmHg) without identifiable secondary endocrine or vascular causes.',
    symptoms: ['Often asymptomatic ("Silent Killer")', 'Early morning occipital headache', 'Lightheadedness & postural dizziness', 'Visual blurriness & palpitations during exertion'],
    causes: ['Arterial wall stiffness and peripheral vascular resistance', 'High dietary sodium intake', 'Chronic sympathetic hyperactivity & stress', 'Obesity and physical inactivity'],
    diagnosticTests: ['Serial blood pressure readings (3 occasions)', '12-Lead Electrocardiogram (ECG) for LVH', 'Serum Creatinine & Electrolytes', 'Fasting Lipid Profile & Blood Glucose'],
    firstLineMedications: [
      { name: 'Telma 40 (Telmisartan)', dosage: '40 mg', frequency: '1-0-0', duration: '30 days', instructions: 'Take consistently at the same time every morning.' },
      { name: 'Amlong 5mg (Amlodipine Besylate)', dosage: '5 mg', frequency: '0-0-1', duration: '30 days', instructions: 'Calcium channel blocker. Watch for peripheral ankle edema.' }
    ],
    lifestyleAdvice: 'DASH diet with sodium < 1,500 - 2,000 mg/day. Minimum 30 mins brisk walking daily. Avoid alcohol and tobacco.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-fatty-liver',
    name: 'Non-Alcoholic Fatty Liver Disease (NAFLD / MASLD)',
    alphabet: 'F',
    category: 'Gastrointestinal',
    icd10Code: 'K76.0',
    overview: 'Hepatic steatosis affecting > 5% of hepatocytes in individuals without significant alcohol consumption, strongly linked to metabolic syndrome.',
    symptoms: ['Vague right upper quadrant dull ache', 'General fatigue and malaise', 'Often discovered incidentally on routine USG', 'Hepatomegaly on deep palpation'],
    causes: ['Insulin resistance and hyperinsulinemia', 'Central obesity & dyslipidemia', 'High fructose corn syrup consumption', 'Sedentary metabolic dysfunction'],
    diagnosticTests: ['USG Whole Abdomen (Grade 1/2/3 bright liver)', 'Liver Function Tests (ALT > AST elevation)', 'FibroScan (Transient Elastography for stiffness)', 'Lipid Panel & Fasting Insulin'],
    firstLineMedications: [
      { name: 'Evion 400 (Vitamin E)', dosage: '400 IU', frequency: '1-0-0', duration: '60 days', instructions: 'Antioxidant therapy for non-diabetic NASH.' },
      { name: 'Ursocol 300 (Ursodeoxycholic Acid - UDCA)', dosage: '300 mg', frequency: '1-0-1', duration: '60 days', instructions: 'Hepatoprotective bile acid. Take with food.' }
    ],
    lifestyleAdvice: 'Weight reduction of 7-10% is curative. Eliminate refined carbohydrates, sugary drinks, and fried food. Engage in resistance training.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-gerd',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    alphabet: 'G',
    category: 'Gastrointestinal',
    icd10Code: 'K21.9',
    overview: 'Retrograde movement of acidic gastric contents past the lower esophageal sphincter (LES) causing troublesome symptoms or mucosal damage.',
    symptoms: ['Retrosternal pyrosis (Heartburn)', 'Acid regurgitation & sour waterbrash', 'Epigastric burning post-meals', 'Chronic dry cough & globus sensation'],
    causes: ['Transient lower esophageal sphincter relaxations (TLESR)', 'Hiatus hernia', 'Delayed gastric emptying', 'Heavy late-night meals, caffeine, chocolate'],
    diagnosticTests: ['Upper GI Upper Endoscopy (Esophagogastroduodenoscopy - EGD)', '24-hour ambulatory pH impedance monitoring', 'High-resolution esophageal manometry'],
    firstLineMedications: [
      { name: 'Pan-D (Pantoprazole 40mg + Domperidone 30mg SR)', dosage: '1 Capsule', frequency: '1-0-0', duration: '14 days', instructions: 'Take 30 to 45 minutes before morning breakfast with water.' },
      { name: 'Gelusil MPS Liquid Antacid', dosage: '10 ml', frequency: 'SOS', duration: 'As needed', instructions: 'Take 1 hour after meals and at bedtime for immediate heartburn relief.' }
    ],
    lifestyleAdvice: 'Eat small frequent meals. Do not lie down within 2.5 hours after eating. Elevate the head of your bed by 6 inches.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-gout',
    name: 'Gout & Hyperuricemia',
    alphabet: 'G',
    category: 'Orthopedics & Joint',
    icd10Code: 'M10.9',
    overview: 'Crystal deposition arthropathy caused by monosodium urate monohydrate crystals in joints resulting from chronic hyperuricemia (Serum Uric Acid > 6.8 mg/dL).',
    symptoms: ['Excruciating monoarticular pain (Podagra - 1st MTP big toe joint)', 'Intense erythema, warmth, and swelling of joint', 'Extreme hypersensitivity to even light bedsheets', 'Tophi formation in chronic cases'],
    causes: ['Underexcretion or overproduction of uric acid', 'High purine intake (red meat, seafood, beer)', 'Loop or thiazide diuretic therapy', 'Metabolic syndrome and renal impairment'],
    diagnosticTests: ['Serum Uric Acid Level', 'Synovial fluid analysis (negatively birefringent needle crystals)', 'X-Ray of affected joint (punched-out erosions)', 'Complete Blood Count & ESR'],
    firstLineMedications: [
      { name: 'Colchicine 0.5mg (Zycolchin)', dosage: '0.5 mg', frequency: '1-0-1', duration: '5 days', instructions: 'Anti-inflammatory for acute flare. Start within 12 hours of attack.' },
      { name: 'Feburic 40mg (Febuxostat)', dosage: '40 mg', frequency: '1-0-0', duration: '30 days', instructions: 'Xanthine oxidase inhibitor. Start 2 weeks after acute flare subsides.' }
    ],
    lifestyleAdvice: 'Abundant water intake (> 3L/day). Avoid red meat, organ meats, shellfish, alcohol (especially beer), and high-fructose syrups.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-hypothyroidism',
    name: 'Primary Hypothyroidism',
    alphabet: 'H',
    category: 'Endocrine & Diabetes',
    icd10Code: 'E03.9',
    overview: 'Deficiency of thyroid hormone production leading to generalized slowing of metabolic processes across organ systems.',
    symptoms: ['Unexplained weight gain with decreased appetite', 'Cold intolerance & dry rough skin', 'Chronic constipation & facial periorbital puffiness', 'Fatigue, lethargy, muscle cramps, menorrhagia'],
    causes: ['Hashimoto thyroiditis (autoimmune destruction)', 'Iodine deficiency or therapeutic radioactive iodine ablation', 'Post-thyroidectomy', 'Medications (Lithium, Amiodarone)'],
    diagnosticTests: ['Thyroid Profile (TSH elevated > 4.5 uIU/mL, Free T4 low)', 'Anti-Thyroid Peroxidase (Anti-TPO) Antibodies', 'USG Neck & Thyroid gland'],
    firstLineMedications: [
      { name: 'Thyronorm / Eltroxin (Levothyroxine Sodium)', dosage: '50 mcg (titrated to TSH)', frequency: '1-0-0', duration: 'Continuous', instructions: 'Take strictly on an empty stomach with plain water at least 45 mins before tea/breakfast.' }
    ],
    lifestyleAdvice: 'Do not take calcium or iron supplements within 4 hours of levothyroxine. Repeat TSH 6-8 weeks after dose change.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-migraine',
    name: 'Migraine Headache',
    alphabet: 'M',
    category: 'Neurology & Brain',
    icd10Code: 'G43.909',
    overview: 'Primary neurovascular headache disorder characterized by recurrent attacks of moderate to severe pulsating unilateral pain aggravated by physical activity.',
    symptoms: ['Unilateral throbbing or pulsating headache (4-72 hours)', 'Photophobia (light sensitivity) & phonophobia (sound sensitivity)', 'Nausea and vomiting', 'Visual aura (flashing lights, zigzag scotoma) in 25%'],
    causes: ['Cortical spreading depression & trigeminovascular pathway activation', 'Hormonal estrogen fluctuations', 'Skipped meals, sleep deprivation, stress', 'Sensory triggers (bright lights, aged cheese, MSG)'],
    diagnosticTests: ['Clinical diagnosis via ICHD-3 criteria', 'Brain MRI/CT (to exclude secondary headache if red flags present)'],
    firstLineMedications: [
      { name: 'Vasograin / Naprosyn 500mg (Naproxen)', dosage: '500 mg', frequency: 'SOS', duration: 'As needed', instructions: 'Take at earliest onset of headache or aura.' },
      { name: 'Suminat 50mg (Sumatriptan)', dosage: '50 mg', frequency: '1 Tab at onset', duration: 'SOS', instructions: '5-HT1B/1D agonist. Contraindicated in ischemic heart disease.' },
      { name: 'Propranolol 40mg (Ciplar LA 40)', dosage: '40 mg', frequency: '1-0-0', duration: '30 days', instructions: 'Prophylaxis for frequent attacks (> 3/month).' }
    ],
    lifestyleAdvice: 'Maintain consistent sleep and meal schedules. Keep a headache trigger diary. Practice relaxation techniques.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-osteoarthritis',
    name: 'Osteoarthritis (Knee & Hip OA)',
    alphabet: 'O',
    category: 'Orthopedics & Joint',
    icd10Code: 'M15.9',
    overview: 'Progressive degenerative joint disease characterized by breakdown of articular cartilage, subchondral bone remodeling, and osteophyte formation.',
    symptoms: ['Exertional joint pain relieved by rest', 'Morning stiffness lasting < 30 minutes', 'Joint crepitus (grating sound on movement)', 'Loss of flexibility & joint enlargement (Heberden/Bouchard nodes)'],
    causes: ['Mechanical wear-and-tear & age-related degeneration', 'Obesity (excess joint load)', 'Previous joint trauma or ligament tears', 'Genetic cartilage predisposition'],
    diagnosticTests: ['Weight-bearing X-Ray of knee (joint space narrowing, osteophytes, subchondral sclerosis)', 'ESR & CRP (typically normal)', 'Serum Uric Acid & RA factor (to rule out inflammatory arthritis)'],
    firstLineMedications: [
      { name: 'Paracetamol 650mg / Dolo 650', dosage: '650 mg', frequency: '1-0-1', duration: '10 days', instructions: 'First-line analgesic. Safe for gastrointestinal and renal profile.' },
      { name: 'Jointace DN (Glucosamine + Diacerein)', dosage: '1 Tab', frequency: '0-0-1', duration: '60 days', instructions: 'Cartilage supporting formulation. Take after meals.' },
      { name: 'Voveran Emulgel (Diclofenac Topical Gel)', dosage: 'Apply locally', frequency: '2-3 times daily', duration: '14 days', instructions: 'Gently rub over painful knee joint. Avoid broken skin.' }
    ],
    lifestyleAdvice: 'Weight reduction to diminish knee joint load. Low-impact aerobic exercise: swimming, stationary cycling, quadriceps strengthening.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  },
  {
    id: '1mg-uti',
    name: 'Urinary Tract Infection (Acute Cystitis / Pyelonephritis)',
    alphabet: 'U',
    category: 'Nephrology & Urology',
    icd10Code: 'N39.0',
    overview: 'Infection of the urinary system typically ascending from the periurethral area into the bladder mucosa (cystitis) or kidneys (pyelonephritis).',
    symptoms: ['Dysuria (burning sensation on micturition)', 'Urinary frequency & intense urgency', 'Suprapubic lower abdominal discomfort', 'Turbid, cloudy, foul-smelling or blood-tinged urine'],
    causes: ['Uropathogenic Escherichia coli (UPEC) in 80%+', 'Klebsiella pneumoniae, Proteus mirabilis, Enterococcus', 'Inadequate hydration & delaying voiding', 'Urinary catheterization or sexual activity'],
    diagnosticTests: ['Urinalysis Routine & Microscopy (Pus cells > 5/HPF, Leukocyte esterase, Nitrite +)', 'Urine Culture & Antibiotic Sensitivity (CFU >= 10^5/mL)', 'USG KUB (if recurrent or male patient)'],
    firstLineMedications: [
      { name: 'Nitrofurantoin 100mg (Niftran / Furadantin)', dosage: '100 mg SR', frequency: '1-0-1', duration: '5 days', instructions: 'Take with food or milk to enhance absorption and minimize nausea.' },
      { name: 'Alkarate Syrup (Disodium Hydrogen Citrate)', dosage: '10 ml in glass of water', frequency: '1-1-1', duration: '3 days', instructions: 'Urine alkalizer. Relieves burning dysuria.' }
    ],
    lifestyleAdvice: 'Drink 2.5 to 3 liters of water daily. Void bladder immediately after sexual intercourse. Wipe from front to back.',
    oneMgUrl: 'https://www.1mg.com/all-diseases'
  }
];

export const MEDINDIA_MEDICAL_CONDITIONS: MedindiaCondition[] = [
  {
    id: 'medindia-cad',
    conditionName: 'Coronary Artery Disease & Angina Pectoris',
    speciality: 'Cardiology',
    overview: 'Narrowing or blockage of the coronary arteries caused by atherosclerotic plaque buildup, resulting in myocardial ischemia and chest pain.',
    prescribedDrugs: [
      { genericName: 'Atorvastatin', brandNames: ['Atorva', 'Lipitor'], drugClass: 'HMG-CoA Reductase Inhibitor (Statin)', standardDose: '40 mg to 80 mg OD at bedtime', mechanism: 'Inhibits hepatic cholesterol biosynthesis, stabilizes vulnerable plaques, reduces LDL.' },
      { genericName: 'Aspirin (Acetylsalicylic Acid)', brandNames: ['Ecosprin', 'Disprin'], drugClass: 'Antiplatelet Agent (COX-1 Inhibitor)', standardDose: '75 mg to 150 mg OD after lunch', mechanism: 'Irreversibly inhibits platelet cyclooxygenase-1, preventing thromboxane A2 and arterial thrombus.' },
      { genericName: 'Metoprolol Succinate', brandNames: ['Betaloc', 'Metolar-XR'], drugClass: 'Beta-1 Selective Adrenergic Antagonist', standardDose: '25 mg to 50 mg OD in morning', mechanism: 'Reduces myocardial oxygen demand by decreasing heart rate, cardiac output, and systemic blood pressure.' },
      { genericName: 'Nitroglycerin / Glyceryl Trinitrate', brandNames: ['Sorbitrate', 'Nitrocontin'], drugClass: 'Organic Nitrate Vasodilator', standardDose: '2.6 mg to 6.4 mg BD or 0.5mg SL SOS', mechanism: 'Releases nitric oxide (NO), stimulating cGMP to dilate systemic venous capacitance vessels and coronary arteries.' }
    ],
    clinicalGuidelines: 'Target LDL < 55 mg/dL in high-risk patients. Maintain resting heart rate between 55-65 bpm with beta-blockers.',
    contraindications: ['Active gastrointestinal hemorrhage (Aspirin)', 'Severe bradycardia / 2nd-3rd degree AV block (Metoprolol)', 'Phosphodiesterase-5 inhibitors / Sildenafil (Nitrates)'],
    medindiaUrl: 'https://www.medindia.net/drugs/medical-condition/index.html'
  },
  {
    id: 'medindia-heart-failure',
    conditionName: 'Heart Failure with Reduced Ejection Fraction (HFrEF)',
    speciality: 'Cardiology',
    overview: 'Clinical syndrome characterized by structural or functional impairment of ventricular filling or ejection of blood (EF <= 40%).',
    prescribedDrugs: [
      { genericName: 'Sacubitril + Valsartan', brandNames: ['Vymada', 'Entresto'], drugClass: 'Angiotensin Receptor-Neprilysin Inhibitor (ARNI)', standardDose: '24/26 mg to 97/103 mg BD', mechanism: 'Inhibits neprilysin to augment natriuretic peptides while simultaneously blocking angiotensin AT1 receptors.' },
      { genericName: 'Dapagliflozin / Empagliflozin', brandNames: ['Forxiga', 'Jardiance'], drugClass: 'SGLT2 Inhibitor', standardDose: '10 mg OD morning', mechanism: 'Promotes osmotic diuresis, decreases preload/afterload, enhances myocardial energetics and reduces cardiovascular mortality.' },
      { genericName: 'Spironolactone', brandNames: ['Aldactone'], drugClass: 'Mineralocorticoid Receptor Antagonist (MRA)', standardDose: '25 mg OD', mechanism: 'Competitive aldosterone antagonist; prevents myocardial fibrosis, hypokalemia, and adverse remodeling.' },
      { genericName: 'Furosemide / Torsemide', brandNames: ['Lasix', 'Dytor'], drugClass: 'Loop Diuretic', standardDose: '20 mg to 40 mg OD/BD', mechanism: 'Inhibits Na-K-2Cl symporter in thick ascending limb of Henle loop, relieving pulmonary congestion and peripheral edema.' }
    ],
    clinicalGuidelines: 'Four-pillar guideline-directed medical therapy (GDMT): ARNI + Beta-blocker + MRA + SGLT2i. Daily morning weight tracking.',
    contraindications: ['Serum Potassium > 5.5 mEq/L (Spironolactone, ARNI)', 'History of angioedema with ACE inhibitors (ARNI)', 'Anuria / Severe renal failure (eGFR < 20)'],
    medindiaUrl: 'https://www.medindia.net/drugs/medical-condition/index.html'
  },
  {
    id: 'medindia-type2-dm',
    conditionName: 'Type 2 Diabetes Mellitus & Metabolic Syndrome',
    speciality: 'Endocrinology',
    overview: 'Progressive glycemic dysregulation characterized by peripheral insulin resistance, impaired insulin secretion, and accelerated hepatic gluconeogenesis.',
    prescribedDrugs: [
      { genericName: 'Metformin Hydrochloride', brandNames: ['Glycomet', 'Glucophage'], drugClass: 'Biguanide Insulin Sensitizer', standardDose: '500 mg to 1000 mg BD with meals', mechanism: 'Activates AMP-activated protein kinase (AMPK), reduces hepatic glucose output, improves peripheral insulin sensitivity.' },
      { genericName: 'Semaglutide / Dulaglutide', brandNames: ['Rybelsus (Oral)', 'Ozempic'], drugClass: 'GLP-1 Receptor Agonist (Incretin Mimetic)', standardDose: '3 mg titrated to 14 mg oral OD', mechanism: 'Stimulates glucose-dependent insulin secretion, suppresses glucagon, delays gastric emptying, promotes significant weight loss.' },
      { genericName: 'Vildagliptin / Sitagliptin', brandNames: ['Galvus', 'Januvia'], drugClass: 'Dipeptidyl Peptidase-4 (DPP-4) Inhibitor', standardDose: '50 mg BD / 100 mg OD', mechanism: 'Inhibits enzymatic breakdown of endogenous incretin hormones (GLP-1 and GIP), enhancing insulin synthesis.' },
      { genericName: 'Glimepiride', brandNames: ['Amaryl', 'Gepride'], drugClass: 'Second-Generation Sulfonylurea', standardDose: '1 mg to 4 mg OD before breakfast', mechanism: 'Binds sulfonylurea receptors on pancreatic beta-cell K-ATP channels, stimulating insulin secretion.' }
    ],
    clinicalGuidelines: 'First-line Metformin unless eGFR < 30. Add SGLT2i or GLP-1 RA early if cardiovascular disease, CKD, or heart failure present.',
    contraindications: ['eGFR < 30 mL/min/1.73m² (Metformin risk of lactic acidosis)', 'History of medullary thyroid carcinoma or pancreatitis (GLP-1 RA)', 'Diabetic ketoacidosis (DKA)'],
    medindiaUrl: 'https://www.medindia.net/drugs/medical-condition/index.html'
  },
  {
    id: 'medindia-peptic-ulcer',
    conditionName: 'Peptic Ulcer Disease & H. Pylori Infection',
    speciality: 'Gastroenterology',
    overview: 'Disruption of the mucosal integrity of the stomach or duodenum extending through the muscularis mucosa, driven by H. pylori and NSAID use.',
    prescribedDrugs: [
      { genericName: 'Esomeprazole / Pantoprazole', brandNames: ['Nexpro', 'Pan 40'], drugClass: 'Proton Pump Inhibitor (PPI)', standardDose: '40 mg OD 30 mins before breakfast', mechanism: 'Irreversibly inhibits the H+/K+ ATPase pump in gastric parietal cells, profoundly reducing acid secretion.' },
      { genericName: 'Clarithromycin', brandNames: ['Claribid', 'Biaxin'], drugClass: 'Macrolide Antibiotic', standardDose: '500 mg BD for 14 days', mechanism: 'Binds 50S ribosomal subunit of H. pylori, inhibiting protein synthesis as part of triple eradication therapy.' },
      { genericName: 'Amoxicillin', brandNames: ['Novamox', 'Mox'], drugClass: 'Aminopenicillin Antibiotic', standardDose: '1000 mg BD for 14 days', mechanism: 'Inhibits bacterial cell wall synthesis during active H. pylori bacterial division.' },
      { genericName: 'Sucralfate', brandNames: ['Sucrafil', 'Carafate'], drugClass: 'Mucosal Protective Agent', standardDose: '1000 mg QDS 1 hr before meals', mechanism: 'Forms a viscous cross-linked polymer coating over ulcer craters, protecting against pepsin, acid, and bile salts.' }
    ],
    clinicalGuidelines: '14-day 1st-line quadruple or triple therapy for H. pylori eradication. Confirm eradication with stool antigen test 4 weeks after therapy.',
    contraindications: ['Penicillin allergy (substitute Metronidazole for Amoxicillin)', 'Co-administration with QT-prolonging agents (Clarithromycin)', 'Severe renal impairment (Sucralfate aluminum accumulation)'],
    medindiaUrl: 'https://www.medindia.net/drugs/medical-condition/index.html'
  },
  {
    id: 'medindia-depressive-disorder',
    conditionName: 'Major Depressive Disorder & Generalized Anxiety',
    speciality: 'Neurology',
    overview: 'Common and serious mood disorder causing persistent feelings of sadness, anhedonia, sleep disturbances, fatigue, and functional impairment.',
    prescribedDrugs: [
      { genericName: 'Escitalopram Oxalate', brandNames: ['Nexito', 'Lexapro'], drugClass: 'Selective Serotonin Reuptake Inhibitor (SSRI)', standardDose: '10 mg to 20 mg OD in morning', mechanism: 'Selectively inhibits neuronal presynaptic reuptake of serotonin (5-HT), increasing synaptic cleft availability.' },
      { genericName: 'Sertraline Hydrochloride', brandNames: ['Sertima', 'Zoloft'], drugClass: 'Selective Serotonin Reuptake Inhibitor (SSRI)', standardDose: '50 mg to 100 mg OD in morning', mechanism: 'Potent and selective 5-HT reuptake inhibitor with minimal effect on norepinephrine or dopamine.' },
      { genericName: 'Clonazepam', brandNames: ['Zapiz', 'Klonopin'], drugClass: 'High-Potency Benzodiazepine', standardDose: '0.25 mg to 0.5 mg SOS or at bedtime', mechanism: 'Allosteric modulator of GABA-A receptors, increasing channel opening frequency and causing central neural inhibition.' },
      { genericName: 'Mirtazapine', brandNames: ['Mirnite', 'Remeron'], drugClass: 'Noradrenergic & Specific Serotonergic Antidepressant (NaSSA)', standardDose: '15 mg to 30 mg OD at bedtime', mechanism: 'Antagonizes central presynaptic alpha-2 receptors, enhancing noradrenaline and 5-HT release; excellent for depression with insomnia.' }
    ],
    clinicalGuidelines: 'Counsel patients that therapeutic benefits require 2-4 weeks. Continue treatment for 6-9 months after full remission to prevent relapse.',
    contraindications: ['Concurrent use of MAO inhibitors (risk of fatal Serotonin Syndrome)', 'Severe hepatic impairment', 'Narrow-angle glaucoma (Benzodiazepines)'],
    medindiaUrl: 'https://www.medindia.net/drugs/medical-condition/index.html'
  },
  {
    id: 'medindia-rheumatoid-arthritis',
    conditionName: 'Rheumatoid Arthritis (RA)',
    speciality: 'Rheumatology',
    overview: 'Chronic systemic autoimmune inflammatory disorder predominantly affecting peripheral synovial joints symmetrically, leading to cartilage and bone erosion.',
    prescribedDrugs: [
      { genericName: 'Methotrexate', brandNames: ['Folitrax', 'Trexall'], drugClass: 'Conventional Synthetic DMARD (Antifolate)', standardDose: '7.5 mg to 20 mg ONCE WEEKLY + Folic Acid 5mg', mechanism: 'Inhibits dihydrofolate reductase and AICAR transformylase, increasing extracellular adenosine and suppressing inflammatory cytokines.' },
      { genericName: 'Hydroxychloroquine Sulfate', brandNames: ['HCQS 200', 'Plaquenil'], drugClass: 'Antimalarial / Immunomodulating DMARD', standardDose: '200 mg to 400 mg OD after meals', mechanism: 'Increases intracellular vacuolar pH in antigen-presenting cells, reducing autoantigen presentation and toll-like receptor signaling.' },
      { genericName: 'Sulfasalazine', brandNames: ['Saaz', 'Azulfidine'], drugClass: 'Anti-inflammatory DMARD', standardDose: '500 mg to 1000 mg BD with food', mechanism: 'Colonic bacteria cleave into 5-ASA and sulfapyridine, dampening NF-kB activation and synovial inflammatory response.' },
      { genericName: 'Prednisolone', brandNames: ['Wysolone', 'Omnacortil'], drugClass: 'Systemic Glucocorticoid (Bridge Therapy)', standardDose: '5 mg to 10 mg OD tapering rapidly', mechanism: 'Binds cytoplasmic glucocorticoid receptors, downregulating pro-inflammatory gene transcription (IL-1, IL-6, TNF-alpha).' }
    ],
    clinicalGuidelines: 'Treat-to-target strategy with early DMARD combination therapy. Prescribe Folic Acid (5mg) on non-methotrexate days to prevent stomatitis.',
    contraindications: ['Pregnancy and lactation (Methotrexate is strictly teratogenic)', 'Pre-existing hepatic disease or severe renal impairment', 'Pre-existing retinal maculopathy (Hydroxychloroquine)'],
    medindiaUrl: 'https://www.medindia.net/drugs/medical-condition/index.html'
  }
];
