
import fetch from 'node-fetch'; // Standard fetch if node 18+, but let's assume valid environment or use dynamic import if needed. actually node 18 has global fetch.

const BASE_URL = 'http://localhost:4000/api/auth';
const TIMESTAMP = Date.now();

const DOCTOR = {
    firstName: 'Test',
    lastName: 'Doctor',
    email: `dr_${TIMESTAMP}@test.com`,
    password: 'Password123!',
    role: 'doctor',
    dateOfBirth: '1980-01-01'
};

const PATIENT = {
    firstName: 'Test',
    lastName: 'Patient',
    email: `pat_${TIMESTAMP}@test.com`,
    password: 'Password123!',
    phoneNumber: `+1${TIMESTAMP.toString().slice(-10)}`, // Unique phone
    role: 'patient',
    dateOfBirth: '1990-01-01'
};

async function test() {
    console.log('🚀 Starting Verification: Phone Number Lookup');
    console.log(`Target: ${BASE_URL}\n`);

    try {
        // 1. Register Doctor
        console.log('1️⃣  Registering Doctor...');
        let res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DOCTOR)
        });
        let data = await res.json();
        if (!data.success) throw new Error(`Doctor registration failed: ${data.message}`);

        // We need to verify OTP to login?
        // The previous analysis showed verifyOTP endpoint.
        // AND the register response returns `otpExpiresAt`.
        // BUT we don't have the OTP code (it's sent via email).
        // HOWEVER, for testing, maybe we can't login without OTP?

        // Check if we can login directly? usually no.
        // If I cannot login, I cannot get a token to call 'verify-patient'.

        // Alternative: Use the User model directly in this script to set isVerified=true
        // But that requires DB connection.

        console.log('⚠️  Cannot proceed with HTTP test because OTP is required for login.');
        console.log('🔄  Switching to direct DB verification script...');
        return false;

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        return false;
    }
}

test();
