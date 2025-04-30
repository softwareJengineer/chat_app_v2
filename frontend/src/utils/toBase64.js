// utils/toBase64.js
export default function toBase64(int16Array) {
    // Node
    if (typeof Buffer !== 'undefined' && Buffer.from) {return Buffer.from(int16Array.buffer).toString('base64');}
  
    // Browser - chunk to avoid call-stack limits
    let binary = '';
    const bytes = new Uint8Array(int16Array.buffer);
    const CHUNK = 0x8000; // 32 768 - safe size
  
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
  }
  