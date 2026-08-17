import OTP from "../models/OTP.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;

function generateOTP() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

async function createOTP(identifier) {
  const code = generateOTP();

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await OTP.findOneAndUpdate(
    { identifier },
    {
      identifier,
      code,
      expiresAt,
      verified: false,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return code;
}

async function getOTP(identifier) {
  const entry = await OTP.findOne({ identifier });

  if (!entry) return null;

  if (Date.now() > entry.expiresAt.getTime()) {
    await OTP.deleteOne({ identifier });
    return null;
  }

  return entry;
}

async function verifyOTP(identifier, inputCode) {
  const entry = await getOTP(identifier);

  if (!entry) {
    return {
      success: false,
      message: "OTP expired or not found. Please request a new code.",
    };
  }

  if (entry.code !== String(inputCode)) {
    return {
      success: false,
      message: "wrong",
    };
  }

  entry.verified = true;
  await entry.save();

  return {
    success: true,
    message: "Verified",
  };
}

async function isVerified(identifier) {
  const entry = await OTP.findOne({ identifier });
  return !!(entry && entry.verified === true);
}

async function clearOTP(identifier) {
  await OTP.deleteOne({ identifier });
}

export {
  createOTP,
  getOTP,
  verifyOTP,
  isVerified,
  clearOTP,
};