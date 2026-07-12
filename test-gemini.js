const apiKey = 'AQ.Ab8RN6JF7QRSvvq9aMKtxUTE7kPGJ4aVNp8ajvvgH_qBFGC0dQ';
const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];

async function test() {
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
    });
    const data = await res.json();
    console.log(model, ':', res.status, data.error ? data.error.message : 'SUCCESS');
  }
}
test();
