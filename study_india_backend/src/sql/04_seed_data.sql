-- Insert sample universities
INSERT INTO universities
    (name, location, established, type, accreditation, ranking, description, courses, facilities, status)
VALUES
    (
        'Invertis University',
        'Bareilly, Uttar Pradesh',
        1998,
        'Private',
        'UGC, NAAC A+',
        'Top 100 in India',
        'Invertis University is a leading private university offering world-class education.',
        '[
        {"name": "B.Tech Computer Science", "duration": "4 Years", "fees": "₹1,20,000/year", "eligibility": "10+2 with PCM, minimum 60%"},
        {"name": "MBA", "duration": "2 Years", "fees": "₹1,50,000/year", "eligibility": "Bachelor degree with minimum 50%"},
        {"name": "BCA", "duration": "3 Years", "fees": "₹80,000/year", "eligibility": "10+2 with minimum 50%"}
    ]',
    '["Library", "Hostel", "Sports Complex", "WiFi Campus", "Cafeteria"]',
    'active'
),
(
    'Amity University',
    'Noida, Uttar Pradesh',
    2005,
    'Private',
    'UGC, NAAC A+',
    'Top 50 in India',
    'Amity University is one of India''s leading private universities.',
    '[
        {"name": "B.Tech Computer Science", "duration": "4 Years", "fees": "₹2,50,000/year", "eligibility": "10+2 with PCM, minimum 70%"},
        {"name": "BBA", "duration": "3 Years", "fees": "₹2,00,000/year", "eligibility": "10+2 with minimum 60%"},
        {"name": "B.Arch", "duration": "5 Years", "fees": "₹2,75,000/year", "eligibility": "10+2 with Mathematics"}
    ]',
    '["Library", "Hostel", "Gym", "WiFi Campus", "Medical Center"]',
    'active'
),
(
    'Lovely Professional University',
    'Phagwara, Punjab',
    2005,
    'Private',
    'UGC, NAAC A++',
    'Top 80 in India',
    'LPU is one of India''s largest single-campus universities.',
    '[
        {"name": "B.Tech CSE", "duration": "4 Years", "fees": "₹1,40,000/year", "eligibility": "10+2 with PCM, minimum 60%"},
        {"name": "B.Sc Agriculture", "duration": "4 Years", "fees": "₹1,20,000/year", "eligibility": "10+2 with PCB/PCM"},
        {"name": "MBA", "duration": "2 Years", "fees": "₹1,80,000/year", "eligibility": "Graduation with 55%"}
    ]',
    '["Library", "Hostel", "Mall", "Hospital", "Indoor Stadium"]',
    'active'
);