-- Clear existing templates and insert REAL Indian student visa steps
DELETE FROM visa_step_templates;

INSERT INTO visa_step_templates (step_number, title, description, icon, required_documents, details) VALUES

-- STEP 1: Basic Documents
(1, 'Basic Required Documents', 
 'Prepare the fundamental documents required for Indian student visa application.',
 '📋',
 ARRAY[
    'Original passport (valid 6+ months, 3 blank pages)',
    'Photocopy of passport data page',
    'Two passport size photographs (2x2 inch)',
    'Health certificate',
    'Parental authorization (if minor)'
 ],
 ARRAY[
    'Passport must be valid for minimum 6 months',
    'Passport must have at least 3 blank visa pages',
    'Photos must be 2x2 inches, glued to application form',
    'Photos: first on page 1 box, second on bottom right of page 2',
    'Health certificate from authorized medical practitioner',
    'Parental authorization letter signed by both parents (if under 18)'
 ]),

-- STEP 2: Visa Application Form
(2, 'Visa Application Form & Admission Letter',
 'Complete the online visa application and obtain admission letter.',
 '📝',
 ARRAY[
    'Indian Government visa application form (filled online)',
    'Original admission letter from Indian university',
    'Motivation letter (if studying only in India)'
 ],
 ARRAY[
    'Fill form at www.indianvisaonline.gov.in',
    'Form must be signed in box under photograph (page 1)',
    'Signature must match passport signature',
    'Validate data and sign declaration at bottom of page 2',
    'Admission letter must be in English on official letterhead',
    'Letter must be stamped and signed (no scanned/fax copies)',
    'Letter must specify program nature, terms, and duration',
    'Motivation letter: explain why studying in India, previous education details'
 ]),

-- STEP 3: Financial Proof
(3, 'Financial Proof & Bank Guarantee',
 'Provide proof of financial capability to cover studies in India.',
 '💰',
 ARRAY[
    'Bank guarantee letter (if self-financed)',
    'Sponsor bank guarantee letter (if sponsored)',
    'UBA Visa Card or proof of funds',
    'Last 3 months bank statements'
 ],
 ARRAY[
    'If self-financed: Original bank guarantee letter on bank letterhead',
    'Must show minimum €500/month for study fees, accommodation, living',
    'If sponsored: Original guarantee letter for sponsor with same amount',
    'UBA Visa Card details or equivalent international payment card',
    'For refugee/travel document: Last 3 months account statements',
    'All bank documents must be in English or translated'
 ]),

-- STEP 4: Program-Specific Documents
(4, 'Program-Specific & Additional Documents',
 'Submit documents specific to your type of program (internship, exchange, medical).',
 '📁',
 ARRAY[
    'Internship letter (if applicable)',
    'Exchange program documents (if applicable)',
    'No objection certificate - Medical (if applicable)',
    'Indian origin documents (if applicable)',
    'Non-French passport copy (if applicable)'
 ],
 ARRAY[
    'Internship: Company letter with period & salary (min ₹3.6 Lakhs/annum)',
    'Internship: Company registration proof (incorporation certificate)',
    'Internship: Income Tax Payment Undertaking on company letterhead',
    'Internship: Proof of graduation or diploma',
    'Exchange: Document confirming enrollment & transfer to India',
    'Exchange: Copy of exchange agreement between institutions',
    'Medical/Paramedical: No objection certificate from Ministry of Health India',
    'Indian origin: Surrender Certificate or cancelled Indian passport',
    'Indian origin: Sworn Affidavit from Embassy of India',
    'Born in India (not Indian): Explanation letter to consular services',
    'French with Indian parent: Letter stating never held Indian passport',
    'Minor: Photocopy of livret de famille or birth certificate',
    'Minor: Photocopy of ID proof of each parent',
    'Minor: Authorization letter for travel signed by both parents',
    'Non-French passport: Copy of second passport',
    'Pakistani origin: Reference form as per current nationality'
 ]),

-- STEP 5: UBA Visa Card & Insurance
(5, 'UBA Visa Card, Insurance & Final Review',
 'Submit payment card, insurance proof, and complete final review.',
 '💳',
 ARRAY[
    'UBA Visa Card (front and back copy)',
    'International travel insurance',
    'Flight booking (optional, for review)',
    'Accommodation confirmation'
 ],
 ARRAY[
    'UBA Visa Card: Clear copy of front and back',
    'Travel insurance covering entire stay duration in India',
    'Insurance must cover medical emergencies and repatriation',
    'Accommodation: University hostel or private accommodation proof',
    'Review all previous steps are complete before submitting'
 ]),

-- STEP 6: Interview & Submission
(6, 'Visa Interview & Final Submission',
 'Prepare for and attend the visa interview at the Indian embassy.',
 '🎤',
 ARRAY[
    'Complete application package (all previous documents)',
    'Visa fee payment receipt',
    'Interview appointment confirmation',
    'Declaration form (signed)'
 ],
 ARRAY[
    'Bring ALL original documents + photocopies',
    'Organize documents in the order listed in previous steps',
    'Dress formally for the interview',
    'Be prepared to explain your study plans in India',
    'Know your university details, course duration, and fees',
    'Be able to explain your financial situation',
    'Processing time: 7-15 working days after interview',
    'Declaration: "I certify that I have submitted a complete application"'
 ]);