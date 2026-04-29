const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    try {
        // Create admin user
        const passwordHash = await bcrypt.hash('admin123', 12);

        const { data: adminUser } = await supabase
            .from('users')
            .insert({
                name: 'Admin User',
                email: 'admin@studyindia.com',
                password_hash: passwordHash,
                role: 'super_admin',
                status: 'active',
            })
            .select()
            .single();

        console.log('Admin user created:', adminUser.email);

        // Create universities
        const universities = [
            {
                name: "Invertis University",
                location: "Bareilly, Uttar Pradesh",
                established: 1998,
                type: "Private",
                accreditation: "UGC, NAAC A+",
                ranking: "Top 100 in India",
                description: "Invertis University is a leading private university offering world-class education.",
                courses: JSON.stringify([
                    { name: "B.Tech Computer Science", duration: "4 Years", fees: "₹1,20,000/year", eligibility: "10+2 with PCM, minimum 60%" },
                    { name: "MBA", duration: "2 Years", fees: "₹1,50,000/year", eligibility: "Bachelor's degree with minimum 50%" },
                    { name: "BCA", duration: "3 Years", fees: "₹80,000/year", eligibility: "10+2 with minimum 50%" },
                ]),
                facilities: ["Library", "Hostel", "Sports Complex", "WiFi Campus"],
                status: 'active',
            },
            {
                name: "Amity University",
                location: "Noida, Uttar Pradesh",
                established: 2005,
                type: "Private",
                accreditation: "UGC, NAAC A+",
                ranking: "Top 50 in India",
                description: "Amity University is one of India's leading private universities.",
                courses: JSON.stringify([
                    { name: "B.Tech Computer Science", duration: "4 Years", fees: "₹2,50,000/year", eligibility: "10+2 with PCM, minimum 70%" },
                    { name: "BBA", duration: "3 Years", fees: "₹2,00,000/year", eligibility: "10+2 with minimum 60%" },
                    { name: "B.Arch", duration: "5 Years", fees: "₹2,75,000/year", eligibility: "10+2 with Mathematics" },
                ]),
                facilities: ["Library", "Hostel", "Gym", "Medical Center"],
                status: 'active',
            },
            {
                name: "Lovely Professional University",
                location: "Phagwara, Punjab",
                established: 2005,
                type: "Private",
                accreditation: "UGC, NAAC A++",
                ranking: "Top 80 in India",
                description: "LPU is one of India's largest single-campus universities.",
                courses: JSON.stringify([
                    { name: "B.Tech CSE", duration: "4 Years", fees: "₹1,40,000/year", eligibility: "10+2 with PCM, minimum 60%" },
                    { name: "B.Sc Agriculture", duration: "4 Years", fees: "₹1,20,000/year", eligibility: "10+2 with PCB/PCM" },
                    { name: "MBA", duration: "2 Years", fees: "₹1,80,000/year", eligibility: "Graduation with 55%" },
                ]),
                facilities: ["Library", "Hostel", "Mall", "Hospital"],
                status: 'active',
            },
        ];

        const { error: uniError } = await supabase
            .from('universities')
            .insert(universities);

        if (uniError) {
            console.error('Error seeding universities:', uniError);
        } else {
            console.log('Universities created successfully');
        }

        console.log('Seed completed successfully');
    } catch (error) {
        console.error('Seed error:', error);
    }
}

seed();