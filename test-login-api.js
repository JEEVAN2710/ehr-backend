import fetch from 'node-fetch';

const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'jeevanpatil.025@gmail.com',
                password: 'Admin@2026'
            })
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        const text = await response.text();
        console.log('\nResponse Body:');
        console.log(text);

        if (contentType && contentType.includes('application/json')) {
            try {
                const data = JSON.parse(text);
                console.log('\nParsed JSON:');
                console.log(JSON.stringify(data, null, 2));
            } catch (e) {
                console.log('Could not parse as JSON');
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testLogin();
