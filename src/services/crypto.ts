import CryptoJs from 'crypto-js';

const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY;

export function encryptData(data: string): string {
    return CryptoJs.AES.encrypt(data, CRYPTO_KEY).toString();
}

export function decryptData(ciphertext: string): string {
    var bytes = CryptoJs.AES.decrypt(ciphertext, CRYPTO_KEY);
    var originalText = bytes.toString(CryptoJs.enc.Utf8);
    return originalText;
}
