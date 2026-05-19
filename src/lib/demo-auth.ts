export const DEMO_LOGIN_EMAIL = "owner@leasemate.dev";
export const DEMO_LOGIN_PASSWORD = "LeaseMate123!";

export function isDemoAuthEnabled(environment = process.env.NODE_ENV) {
  return environment !== "production";
}

export function getDemoLoginDefaults(environment = process.env.NODE_ENV) {
  if (!isDemoAuthEnabled(environment)) {
    return {
      email: DEMO_LOGIN_EMAIL,
      password: "",
      helperText: null,
    };
  }

  return {
    email: DEMO_LOGIN_EMAIL,
    password: DEMO_LOGIN_PASSWORD,
    helperText:
      "Demo accounts use password LeaseMate123!: owner@leasemate.dev, renter@leasemate.dev, or admin@leasemate.dev.",
  };
}
