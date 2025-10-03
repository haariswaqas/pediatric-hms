// Security constants
export const ADMIN_PASSKEY_SALT = "hc_portal_secure_salt_2025";

// This hash represents the encrypted value of "1111" using the salt above
// Generated using: CryptoJS.MD5("1111" + ADMIN_PASSKEY_SALT).toString()
export const ADMIN_PASSKEY_HASH = "4dea6f83910afc2cb47bc07f59027dfb";
