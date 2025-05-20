import { CompanyWithRelations } from "@/hooks/useCompany";
import { Tables } from "@/types/schema";
import { AoIFormData } from "@/types/aoi";
import { parseDate } from "@internationalized/date";
import { MemberWithRelations } from "@/hooks/useMember";

export const getInitialFormData = (
  company: CompanyWithRelations | null | undefined,
  aoi?: Tables<"AOI"> | null | undefined,
  members?: MemberWithRelations[] | null | undefined
): AoIFormData => {
  let executiveMembers = [
    {
      userId: "",
      name: "",
      address: "",
      walletAddress: company?.founder_id ?? "",
      isRepresentative: true,
      investment: aoi?.capital?.toString() || "",
    },
  ];

  if (members && members.length > 0) {
    const filteredExecutiveMembers = members
      .filter((member) => member.is_executive && member.user_id)
      .map((member) => ({
        userId: member.user_id!,
        name: member.USER?.name || "",
        address: member.USER?.address || "",
        walletAddress: member.user_id!,
        isRepresentative: member.is_representative || false,
        investment: member.invested_amount?.toString() || "",
      }));

    if (filteredExecutiveMembers.length > 0) {
      executiveMembers = filteredExecutiveMembers;
    }
  }

  return {
    companyNameJp: company?.COMPANY_NAME?.["ja-jp"] || "",
    companyNameEn: company?.COMPANY_NAME?.["en-us"] || "",
    businessPurpose: aoi?.business_purpose || "",
    location: aoi?.location || "",
    branchLocations: aoi?.branch_location || [""],
    executiveMembers,
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
