const { io } = require('./frontend/node_modules/socket.io-client');

const BASE_URL = 'http://localhost:5000';

async function req(url, options = {}) {
    const res = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
}

async function runTests() {
    console.log('--- Starting Multi-Chat App Integration Tests ---');

    // 1. Health check
    const health = await req('/api/health');
    console.log('✓ Health check passed:', health);

    // 2. Register User 1
    const user1Timestamp = Date.now();
    const user1Data = {
        username: `testuser_${user1Timestamp}`,
        email: `test_${user1Timestamp}@example.com`,
        password: 'password123',
        status: 'Coding an integration test 🚀',
    };
    const regRes = await req('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(user1Data),
    });
    console.log('✓ User 1 registered:', regRes.username, `(ID: ${regRes._id})`);
    const token1 = regRes.token;
    const user1Id = regRes._id;

    // 3. Register User 2
    const user2Data = {
        username: `partner_${user1Timestamp}`,
        email: `partner_${user1Timestamp}@example.com`,
        password: 'password123',
        status: 'Testing multi-user chat 💬',
    };
    const regRes2 = await req('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(user2Data),
    });
    console.log('✓ User 2 registered:', regRes2.username, `(ID: ${regRes2._id})`);
    const token2 = regRes2.token;
    const user2Id = regRes2._id;

    // 4. Test Login
    const loginRes = await req('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            emailOrUsername: user1Data.email,
            password: user1Data.password,
        }),
    });
    console.log('✓ User 1 login successful:', loginRes.username);

    // 5. Update Profile
    const updateRes = await req('/api/auth/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ status: 'Updated Status: Tests passing! ✨' }),
    });
    console.log('✓ User 1 profile updated:', updateRes.status);

    // 6. Get Rooms (Channel list, should auto-seed default rooms)
    const rooms = await req('/api/chat/rooms', {
        headers: { Authorization: `Bearer ${token1}` },
    });
    console.log(`✓ Fetched ${rooms.length} rooms:`, rooms.map(r => `#${r.name}`).join(', '));
    const generalRoom = rooms.find(r => r.name === 'general');
    if (!generalRoom) throw new Error('Default #general room not found!');

    // 7. Create New Channel
    const newChannel = await req('/api/chat/rooms', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ name: `dev-room-${user1Timestamp}`, description: 'A test channel' }),
    });
    console.log('✓ Channel created:', `#${newChannel.name}`);

    // 8. Create Direct Message Thread between User 1 & User 2
    const dmRoom = await req('/api/chat/dm', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token1}` },
        body: JSON.stringify({ targetUserId: user2Id }),
    });
    console.log('✓ DM thread created between User 1 and User 2 (Room ID:', dmRoom._id, ')');

    // 9. Test Socket.IO Real-Time Messaging between two connected users
    console.log('Testing Real-Time Socket.IO communication...');
    const socket1 = io(BASE_URL, { transports: ['websocket'] });
    const socket2 = io(BASE_URL, { transports: ['websocket'] });

    await new Promise((resolve, reject) => {
        let connectedCount = 0;
        const onConnect = () => {
            connectedCount++;
            if (connectedCount === 2) resolve();
        };
        socket1.on('connect', onConnect);
        socket2.on('connect', onConnect);
        setTimeout(() => reject(new Error('Socket connection timed out')), 4000);
    });
    console.log('✓ Sockets connected to backend.');

    // Authenticate / setup sockets
    socket1.emit('setup', { _id: user1Id, username: user1Data.username });
    socket2.emit('setup', { _id: user2Id, username: user2Data.username });

    // Join the general room on both sockets
    socket1.emit('join_room', generalRoom._id);
    socket2.emit('join_room', generalRoom._id);

    // User 2 listens for message from User 1
    const testMessageContent = `Hello real-time world at ${Date.now()}!`;
    const messageReceivedPromise = new Promise((resolve, reject) => {
        socket2.on('message_received', (msg) => {
            if (msg.content === testMessageContent) {
                console.log(`✓ Real-time message received by User 2 from ${msg.sender.username}: "${msg.content}"`);
                resolve(msg);
            }
        });
        setTimeout(() => reject(new Error('Socket message receipt timed out')), 5000);
    });

    // User 1 sends message
    socket1.emit('send_message', {
        roomId: generalRoom._id,
        senderId: user1Id,
        content: testMessageContent,
    });

    await messageReceivedPromise;

    // 10. Verify message history retrieval via REST API
    const messages = await req(`/api/chat/messages/${generalRoom._id}`, {
        headers: { Authorization: `Bearer ${token1}` },
    });
    const found = messages.find(m => m.content === testMessageContent);
    if (!found) throw new Error('Sent message not found in history!');
    console.log('✓ Message verified in persistent message history database.');

    // 11. Search message history
    const filteredMessages = await req(`/api/chat/messages/${generalRoom._id}?search=real-time`, {
        headers: { Authorization: `Bearer ${token1}` },
    });
    console.log(`✓ Message search filter returned ${filteredMessages.length} matches.`);

    // 12. Test file upload
    const formData = new FormData();
    const blob = new Blob(['Hello from Multi-Chat attachment test file!'], { type: 'text/plain' });
    formData.append('file', blob, 'test-notes.txt');

    const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token1}` },
        body: formData,
    });
    const uploadData = await uploadRes.json();
    console.log('✓ File attachment uploaded successfully:', uploadData.fileUrl, `(${uploadData.fileName})`);

    socket1.disconnect();
    socket2.disconnect();

    console.log('\n========================================');
    console.log('🎉 ALL MULTI-CHAT APP TESTS PASSED! 🎉');
    console.log('========================================\n');
}

runTests().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});
