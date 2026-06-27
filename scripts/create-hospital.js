const crypto = require('crypto');
const { execSync } = require('child_process');

async function run() {
  const password = "password";
  const encoder = new TextEncoder();
  const salt = crypto.webcrypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.webcrypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.webcrypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 10000,
      hash: "SHA-256"
    },
    keyMaterial,
    256 // 32 bytes
  );

  const hashArray = new Uint8Array(salt.length + hashBuffer.byteLength);
  hashArray.set(salt, 0);
  hashArray.set(new Uint8Array(hashBuffer), salt.length);
  const hashBase64 = Buffer.from(hashArray).toString('base64');
  
  const id = crypto.randomUUID();
  const email = "admin@talmotalk.com";
  const nickname = "최고관리자";
  const role = "admin";

  const sql = `INSERT INTO users (id, email, password, nickname, role) VALUES ('${id}', '${email}', '${hashBase64}', '${nickname}', '${role}')`;
  console.log("SQL:", sql);

  try {
    const result = execSync(`npx wrangler d1 execute talmo-db --local --command="${sql}"`);
    console.log(result.toString());
  } catch (err) {
    console.error(err.toString());
  }
}
run();
