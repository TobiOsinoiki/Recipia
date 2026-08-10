const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function generateOTP() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function createOTP(identifier) {
  const code = generateOTP();
  otpStore.set(identifier, {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    verified: false,
  });
  return code;
}

function getOTP(identifier) {
  const entry = otpStore.get(identifier);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(identifier);
    return null;
  }
  return entry;
}

function verifyOTP(identifier, inputCode) {
  const entry = getOTP(identifier);
  if (!entry) {
    return { success: false, message: "OTP expired or not found. Please request a new code." };
  }
  if (entry.code !== String(inputCode)) {
    return { success: false, message: "wrong" };
  }
  entry.verified = true;
  return { success: true, message: "Verified" };
}

function isVerified(identifier) {
  const entry = otpStore.get(identifier);
  return !!(entry && entry.verified === true);
}

function clearOTP(identifier) {
  otpStore.delete(identifier);
}

export { createOTP, getOTP, verifyOTP, isVerified, clearOTP };
