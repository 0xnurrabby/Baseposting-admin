import bcrypt from "bcryptjs";

export const validateCredentials = async (username: string, password: string) => {
  const adminUser = process.env.ADMIN_USERNAME;
  if (!adminUser) {
    throw new Error("Missing ADMIN_USERNAME");
  }
  if (username !== adminUser) return false;

  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const passwordPlain = process.env.ADMIN_PASSWORD;

  if (passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }

  if (!passwordPlain) {
    throw new Error("Missing ADMIN_PASSWORD or ADMIN_PASSWORD_HASH");
  }

  return password === passwordPlain;
};
