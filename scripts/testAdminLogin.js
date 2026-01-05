import fetch from 'node-fetch';

const testAdminLogin = async () => {
    try {
        console.log('Testing admin login...');
        console.log('Email: jeevanpatil.025@gmail.com');
        console.log('Password: Secure@123\n');

        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'jeevanpatil.025@gmail.com',
                password: 'Secure@123'
            })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Login successful!');
            console.log('User:', data.data.user.firstName, data.data.user.lastName);
            console.log('Role:', data.data.user.role);
        } else {
            console.log('\n❌ Login failed!');
            console.log('Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testAdminLogin();
