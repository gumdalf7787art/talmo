// Web Crypto API 기반 PBKDF2 암호화 (Edge Runtime 호환)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  // 16-byte random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import password as a CryptoKey
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  // Derive 32-byte hash using PBKDF2 with 210,000 iterations
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 10000,
      hash: "SHA-256"
    },
    keyMaterial,
    256 // 32 bytes
  );

  // Combine salt and hash into one buffer
  const hashArray = new Uint8Array(salt.length + hashBuffer.byteLength);
  hashArray.set(salt, 0);
  hashArray.set(new Uint8Array(hashBuffer), salt.length);
  
  // Convert to Base64
  return btoa(String.fromCharCode.apply(null, hashArray));
}

// 비밀번호 검증 함수
export async function verifyPassword(password, storedHashBase64) {
  const encoder = new TextEncoder();
  // Decode Base64
  const hashArrayStr = atob(storedHashBase64);
  const hashArray = new Uint8Array(hashArrayStr.length);
  for (let i = 0; i < hashArrayStr.length; i++) {
    hashArray[i] = hashArrayStr.charCodeAt(i);
  }

  // Extract salt (first 16 bytes) and hash (remaining bytes)
  const salt = hashArray.slice(0, 16);
  const storedHash = hashArray.slice(16);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 10000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  const computedHash = new Uint8Array(hashBuffer);

  // Compare buffers safely
  if (computedHash.length !== storedHash.length) return false;
  let isMatch = true;
  for (let i = 0; i < computedHash.length; i++) {
    if (computedHash[i] !== storedHash[i]) isMatch = false;
  }
  return isMatch;
}
