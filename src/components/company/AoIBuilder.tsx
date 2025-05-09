import { FC, useEffect, useState } from "react";
import {
  Drawer,
  DrawerProps,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from "@heroui/react";
import { Stack } from "@/sphere/Stack";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useCompanyName } from "@/hooks/useCompanyName";
import { useMember, useMembersByCompanyId } from "@/hooks/useMember";
import { useAOI, useAOIByCompanyId } from "@/hooks/useAOI";
import { useCompany } from "@/hooks/useCompany";
import { useUser } from "@/hooks/useUser";
import { AoIFormData } from "@/types/aoi";
import { CompanyInfoSection } from "./form-sections/CompanyInfoSection";
import { BranchLocationsSection } from "./form-sections/BranchLocationsSection";
import { ExecutiveMembersSection } from "./form-sections/ExecutiveMembersSection";
import { BusinessDatesSection } from "./form-sections/BusinessDatesSection";
import { AoIPreview } from "./AoIPreview";
import { getInitialFormData } from "@/utils/aoi";
import { useTranslation } from "next-i18next";

type AoIBuilderProps = {
  companyId?: string;
} & Omit<DrawerProps, "children">;

export const AoIBuilder: FC<AoIBuilderProps> = ({ companyId, ...props }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { company, refetch } = useCompany(companyId);
  const { members } = useMembersByCompanyId(companyId);
  const { aoi } = useAOIByCompanyId(companyId);
  const { t } = useTranslation(["aoi", "common"]);

  const [formData, setFormData] = useState<AoIFormData>(
    getInitialFormData(company, aoi)
  );

  useEffect(() => {
    if (company && members) {
      const executiveMembers = members
        .filter((member) => member.is_executive && member.user_id)
        .map((member) => ({
          userId: member.user_id!,
          name: member.USER?.name || "",
          address: member.USER?.address || "",
          walletAddress: member.user_id!,
          isRepresentative: member.is_representative || false,
          investment: member.invested_amount?.toString() || "",
        }));

      setFormData((prev) => ({
        ...getInitialFormData(company, aoi),
        executiveMembers:
          executiveMembers.length > 0
            ? executiveMembers
            : prev.executiveMembers,
      }));
    } else if (company) {
      setFormData(getInitialFormData(company, aoi));
    }
  }, [company, members, aoi]);

  const { updateCompanyName } = useCompanyName();
  const { createUser, deleteUser } = useUser();
  const { createMember, deleteMember } = useMember();
  const { updateAOI } = useAOI();
  const { updateTaskStatusByIds } = useTaskStatus();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyId || !company) return;

    setIsSaving(true);

    try {
      // 既存のExecutive Membersを取得
      const existingExecutiveMembers =
        members?.filter((member) => member.is_executive && member.user_id) ||
        [];

      // フォームから削除されたメンバーを特定
      const deletedMembers = existingExecutiveMembers.filter(
        (existingMember) =>
          !formData.executiveMembers.some(
            (formMember) => formMember.walletAddress === existingMember.user_id
          )
      );

      // 削除されたメンバーの処理
      const deletePromises = deletedMembers.map(async (member) => {
        if (member.user_id) {
          // MEMBERテーブルから削除
          await deleteMember({
            user_id: member.user_id,
            company_id: companyId,
          });
          // USERテーブルから削除
          await deleteUser(member.user_id);
        }
      });

      await Promise.all(deletePromises);

      // 1. COMPANY_NAMEの更新
      const companyNameResponse = await updateCompanyName({
        id: company.company_name!,
        "ja-jp": formData.companyNameJp,
        "en-us": formData.companyNameEn,
      });

      if (!companyNameResponse) {
        throw new Error("会社名の更新に失敗しました");
      }

      // 2. USERとMEMBERの更新
      const memberPromises = formData.executiveMembers.map(async (member) => {
        console.log("member", member);
        if (!member.walletAddress) return;

        // ユーザー作成/更新
        const user = await createUser({
          evm_address: member.walletAddress,
          address: member.address,
          name: member.name,
        });

        // メンバー作成/更新
        if (user) {
          console.log("walletAddress", member.walletAddress);
          console.log("companyId", companyId);
          await createMember({
            user_id: member.walletAddress,
            company_id: companyId,
            is_executive: true,
            is_representative: member.isRepresentative,
            invested_amount: parseInt(member.investment) || 0,
          });
        }
      });

      await Promise.all(memberPromises);

      // 3. AOIの更新
      const aoiResponse = await updateAOI({
        id: company.aoi!,
        company_name: companyNameResponse.id,
        company_id: companyId,
        business_purpose: formData.businessPurpose,
        location: formData.location,
        branch_location: formData.branchLocations.filter((loc) => loc),
        establishment_date:
          formData.establishmentDate?.toDate("JST").toISOString() || null,
        business_start_date:
          formData.businessStartDate?.toDate("JST").toISOString() || null,
        business_end_date:
          formData.businessEndDate?.toDate("JST").toISOString() || null,
        capital: parseInt(formData.capital) || 0,
        currency: formData.currency,
      });

      if (!aoiResponse) {
        throw new Error("定款の更新に失敗しました");
      }

      await refetch();

      // 4. タスクステータスの更新
      const founderMember = formData.executiveMembers.find(
        (member) => member.walletAddress === company.founder_id
      );

      const isOnlyFounderWithWalletAddress =
        formData.executiveMembers.length === 1 &&
        founderMember &&
        founderMember.walletAddress &&
        !founderMember.name &&
        !founderMember.address &&
        !founderMember.investment &&
        !formData.companyNameJp &&
        !formData.companyNameEn &&
        !formData.businessPurpose &&
        !formData.location &&
        formData.branchLocations.every((loc) => !loc) &&
        !formData.establishmentDate &&
        !formData.businessStartDate &&
        !formData.businessEndDate &&
        !formData.capital;

      const isAllFieldsFilled =
        formData.companyNameJp &&
        formData.companyNameEn &&
        formData.businessPurpose &&
        formData.location &&
        formData.establishmentDate &&
        formData.businessStartDate &&
        formData.capital &&
        formData.executiveMembers.every(
          (member) =>
            member.walletAddress &&
            member.name &&
            member.address &&
            member.investment
        );

      const status = isOnlyFounderWithWalletAddress
        ? "todo"
        : isAllFieldsFilled
        ? "completed"
        : "inProgress";

      await updateTaskStatusByIds({
        company_id: companyId,
        task_id: "create-aoi",
        status,
      });

      props.onClose?.();
      setIsSaving(false);
      props.onOpenChange?.(false);
    } catch (error) {
      console.error("更新中にエラーが発生しました:", error);
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      classNames={{
        base: "flex flex-row w-full max-w-5xl rounded-none",
        body: "w-full pb-12",
        footer: "w-full",
      }}
      hideCloseButton={isSaving}
      isDismissable={!isSaving}
      {...props}
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <Stack className="flex-1 h-full">
              <DrawerHeader className="flex flex-col gap-2">
                <h2 className="font-headline-sm text-primary">
                  {t("Create AoI")}
                </h2>
                <p className="font-body-md text-neutral">
                  {t("Please enter the information")}
                </p>
              </DrawerHeader>
              <DrawerBody>
                <form
                  onSubmit={onSubmit}
                  id="aoi-form"
                  className="flex flex-col gap-4"
                >
                  <CompanyInfoSection
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <BranchLocationsSection
                    formData={formData}
                    setFormData={setFormData}
                  />
                  <ExecutiveMembersSection
                    formData={formData}
                    setFormData={setFormData}
                    company={company}
                  />
                  <BusinessDatesSection
                    formData={formData}
                    setFormData={setFormData}
                  />
                </form>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  color="default"
                  variant="light"
                  isDisabled={isSaving}
                  onPress={onClose}
                >
                  {t("Close", { ns: "common" })}
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  form="aoi-form"
                  isLoading={isSaving}
                >
                  {t("Save", { ns: "common" })}
                </Button>
              </DrawerFooter>
            </Stack>
            <AoIPreview formData={formData} />
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
