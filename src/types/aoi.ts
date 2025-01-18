import { DateValue } from "@nextui-org/react";
import { Database } from "@/types/schema";

export type ExecutiveMember = {
  id?: string;
  userId: string;
  name: string;
  address: string;
  walletAddress: string;
  isRepresentative: boolean;
  investment: string;
  dateOfEmployment?: string;
};

export type AoIFormData = {
  companyNameJp: string;
  companyNameEn: string;
  businessPurpose: string;
  location: string;
  branchLocations: string[];
  executiveMembers: ExecutiveMember[];
  businessStartDate: DateValue | null;
  businessEndDate: DateValue | null;
  capital: string;
  currency: Database["public"]["Enums"]["Currency"];
  establishmentDate: DateValue | null;
};
