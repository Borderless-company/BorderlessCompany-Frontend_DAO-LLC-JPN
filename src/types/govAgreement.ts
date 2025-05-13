import { CalendarDate } from "@heroui/react";

export type GovAgreementFormData = {
  communicationTool: string;
  recommenders: string[];
  recommendationRate: number;
  votingLevels: VotingLevel[];
  emergencyVoting: VotingLevel;
  enforcementDate: CalendarDate;
};

export type VotingLevel = {
  level: number;
  name: string;
  participants: string[];
  quorum: number;
  threshold: number;
};
