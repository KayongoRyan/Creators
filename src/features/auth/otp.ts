/** OTP lifetime and resend cadence — keep in sync with API `OTP_TTL_SECONDS`. */
export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 60;

export function otpExpiresIn(expiresIn?: number) {
  return typeof expiresIn === "number" && expiresIn > 0
    ? expiresIn
    : OTP_TTL_SECONDS;
}
