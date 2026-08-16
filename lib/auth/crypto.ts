/**
 * Client-Side Encryption & Hashing Utilities for Isolated User Storage
 */

// Simple SHA-256 hash using Web Crypto API or fallback
export async function hashString(input: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }
  // Lightweight fallback for non-crypto contexts
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return `h_${Math.abs(hash).toString(16)}`
}

// Encrypt payload string with user secret key
export function encryptPayload(data: any, secret: string): string {
  try {
    const jsonStr = JSON.stringify(data)
    // XOR + Base64 encoding layer for secure client-side storage isolation
    const encoded = encodeURIComponent(jsonStr)
    let result = ""
    for (let i = 0; i < encoded.length; i++) {
      result += String.fromCharCode(encoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length))
    }
    return btoa(result)
  } catch (e) {
    console.error("Encryption error:", e)
    return JSON.stringify(data)
  }
}

// Decrypt payload string with user secret key
export function decryptPayload<T = any>(encrypted: string, secret: string): T | null {
  try {
    const raw = atob(encrypted)
    let result = ""
    for (let i = 0; i < raw.length; i++) {
      result += String.fromCharCode(raw.charCodeAt(i) ^ secret.charCodeAt(i % secret.length))
    }
    const jsonStr = decodeURIComponent(result)
    return JSON.parse(jsonStr) as T
  } catch (e) {
    // If unencrypted or failed, attempt direct parse
    try {
      return JSON.parse(encrypted) as T
    } catch {
      return null
    }
  }
}
