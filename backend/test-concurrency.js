const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const EVENT_ID = '6a368dc20919aa291cb3296a';

// Paste in 3+ different user tokens (different accounts, NOT the same user)
const tokens = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzY4ZTI4MDkxOWFhMjkxY2IzMjk2ZCIsInJvbGUiOiJhdHRlbmRlZSIsImlhdCI6MTc4MTk2MDUzNiwiZXhwIjoxNzgyNTY1MzM2fQ.d1t2vHMaXt3Ves1MjlyOe55TaHF11llReqMOpsOBASE',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzY4ZTU2MDkxOWFhMjkxY2IzMjk3MCIsInJvbGUiOiJhdHRlbmRlZSIsImlhdCI6MTc4MTk2MDQ5NywiZXhwIjoxNzgyNTY1Mjk3fQ.XUZjgN2wYHk7yogjeS7tw5waRHE107juTxdXp8oCAj0',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzY4ZTZlMDkxOWFhMjkxY2IzMjk3MyIsInJvbGUiOiJhdHRlbmRlZSIsImlhdCI6MTc4MTk2MDU2NiwiZXhwIjoxNzgyNTY1MzY2fQ.-FZKMAptn-31FS-CfzJELvTwiBK27zUKnto-uPELB64',
];

const attemptRegistration = async (token, label) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/registrations/${EVENT_ID}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { label, status: res.status, result: 'SUCCESS' };
  } catch (err) {
    return {
      label,
      status: err.response?.status,
      result: err.response?.data?.message || 'FAILED',
    };
  }
};

const runTest = async () => {
  console.log('Firing concurrent registration requests...\n');

  const results = await Promise.all(
    tokens.map((token, i) => attemptRegistration(token, `User ${i + 1}`))
  );

  results.forEach((r) => {
    console.log(`${r.label}: ${r.status} — ${r.result}`);
  });

  const successCount = results.filter((r) => r.result === 'SUCCESS').length;
  console.log(`\nTotal successful registrations: ${successCount}`);
  console.log(successCount === 1 ? 'PASS — exactly one registration succeeded' : 'FAIL — race condition occurred');
};

runTest();