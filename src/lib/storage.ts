import fs from "fs";
import path from "path";
import { generateToken } from "./utils";

const KEYS_FILE = path.join(process.cwd(), "keys.json");

export interface LicenseKey {
  code: string;
  createdAt: number;
  expiresAt: number;
}

function readKeys(): LicenseKey[] {
  if (!fs.existsSync(KEYS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(KEYS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading keys file:", error);
    return [];
  }
}

function writeKeys(keys: LicenseKey[]) {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing keys file:", error);
  }
}

export function getAllKeys(): LicenseKey[] {
  const keys = readKeys();
  const now = Date.now();
  // Filter out expired keys if you want to auto-cleanup, or keep them for display
  return keys;
}

export function createKey(durationMs: number): LicenseKey {
  const keys = readKeys();
  const newKey: LicenseKey = {
    code: `ARTY-${generateToken(12).toUpperCase()}`,
    createdAt: Date.now(),
    expiresAt: Date.now() + durationMs,
  };
  keys.push(newKey);
  writeKeys(keys);
  return newKey;
}

export function deleteKey(code: string): boolean {
  const keys = readKeys();
  const initialLength = keys.length;
  const filteredKeys = keys.filter((k) => k.code !== code);
  if (filteredKeys.length !== initialLength) {
    writeKeys(filteredKeys);
    return true;
  }
  return false;
}

export function validateKey(code: string): { valid: boolean; error?: string } {
  const keys = readKeys();
  const key = keys.find((k) => k.code === code);

  if (!key) {
    return { valid: false, error: "Invalid key" };
  }

  if (Date.now() > key.expiresAt) {
    return { valid: false, error: "Key has expired" };
  }

  return { valid: true };
}
