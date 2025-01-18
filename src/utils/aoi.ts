import { CompanyWithRelations } from "@/hooks/useCompany";
import { Tables } from "@/types/schema";
import { AoIFormData } from "@/types/aoi";
import { parseDate } from "@internationalized/date";

export const getInitialFormData = (
  company: CompanyWithRelations | null | undefined,
  aoi?: Tables<"AOI"> | null | undefined
): AoIFormData => {
  return {
    companyNameJp: company?.COMPANY_NAME?.["ja-jp"] || "",
    companyNameEn: company?.COMPANY_NAME?.["en-us"] || "",
    businessPurpose: aoi?.business_purpose || "",
    location: aoi?.location || "",
    branchLocations: aoi?.branch_location || [""],
    executiveMembers: [
      {
        userId: "",
        name: "",
        address: "",
        walletAddress: company?.founder_id ?? "",
        isRepresentative: true,
        investment: aoi?.capital?.toString() || "",
      },
    ],
    businessStartDate: aoi?.business_start_date
      ? parseDate(aoi.business_start_date.split("T")[0])
      : null,
    businessEndDate: aoi?.business_end_date
      ? parseDate(aoi.business_end_date.split("T")[0])
      : null,
    capital: aoi?.capital?.toString() || "",
    currency: aoi?.currency || "yen",
    establishmentDate: aoi?.establishment_date
      ? parseDate(aoi.establishment_date.split("T")[0])
      : null,
  };
};
