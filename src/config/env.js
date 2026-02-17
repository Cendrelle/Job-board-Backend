function requireEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const JWT_SECRET = requireEnv("JWT_SECRET");

module.exports = {
  JWT_SECRET,
};
