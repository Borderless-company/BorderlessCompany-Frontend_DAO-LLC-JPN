import { Tables } from "@/types/schema";

/**
 * Determines if a company is a stateless DAO
 * @param company - The company object to check
 * @returns true if the company is a stateless DAO, false otherwise
 */
export const isStatelessDao = (company?: Tables<"COMPANY"> | null): boolean => {
  return (
    company?.company_type === "dao" && company?.jurisdiction === "stateless"
  );
};

/**
 * Determines if a company is a traditional company (LLC in Japan)
 * @param company - The company object to check
 * @returns true if the company is a traditional company, false otherwise
 */
export const isJpLLC = (company?: Tables<"COMPANY"> | null): boolean => {
  return company?.company_type === "llc" && company?.jurisdiction === "jp";
};

/**
 * Gets the company type display name
 * @param company - The company object
 * @returns A human-readable company type string
 */
export const getCompanyTypeDisplay = (
  company?: Tables<"COMPANY"> | null
): string => {
  if (isStatelessDao(company)) {
    return "Stateless DAO";
  }
  if (isJpLLC(company)) {
    return "LLC (Japan)";
  }
  return "Unknown";
};
