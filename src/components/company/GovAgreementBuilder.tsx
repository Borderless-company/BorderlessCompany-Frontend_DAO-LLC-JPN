import { FC, useEffect, useState } from "react";
import {
  Drawer,
  DrawerProps,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
  CheckboxGroup,
  Checkbox,
  DateInput,
} from "@heroui/react";
import { Stack } from "@/sphere/Stack";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useCompanyName } from "@/hooks/useCompanyName";
import { useMember, useMembersByCompanyId } from "@/hooks/useMember";
import { useCompany } from "@/hooks/useCompany";
import { GovAgreementPreview } from "./GovAgreementPreview";
import { useTranslation } from "next-i18next";
import { GovAgreementFormData } from "@/types/govAgreement";
import { useForm, Controller } from "react-hook-form";
import { I18nProvider } from "@react-aria/i18n";
import { useVotingLevel } from "@/hooks/useVotingLevel";
import { useToken, useTokenByCompanyId } from "@/hooks/useToken";
import {
  useGovAgreement,
  useGovAgreementByCompanyId,
} from "@/hooks/useGovAgreement";
import { parseDate } from "@internationalized/date";

type GovAgreementBuilderProps = {
  companyId?: string;
} & Omit<DrawerProps, "children">;

export const GovAgreementBuilder: FC<GovAgreementBuilderProps> = ({
  companyId,
  ...props
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { company, refetch, updateCompany } = useCompany(companyId);

  const { govAgreement } = useGovAgreementByCompanyId(company?.id);
  const { createGovAgreement, updateGovAgreement } = useGovAgreement();
  const { tokens } = useTokenByCompanyId(company?.id);
  const { updateToken } = useToken();
  const { members } = useMembersByCompanyId(companyId);
  const { createVotingLevel } = useVotingLevel();
  const { updateTaskStatusByIds } = useTaskStatus();
  const { t } = useTranslation(["aoi", "common"]);

  useEffect(() => {
    console.log("govAgreement", govAgreement);
  }, [govAgreement]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<GovAgreementFormData>({
    defaultValues: {
      communicationTool: "",
      recommenders: [],
      recommendationRate: 0,
      votingLevels: [
        {
          level: 1,
          name: "",
          participants: [],
          quorum: 50,
          threshold: 60,
        },
        {
          level: 2,
          name: "",
          participants: [],
          quorum: 50,
          threshold: 60,
        },
      ],
      emergencyVoting: {
        level: -1,
        name: "",
        participants: [],
        quorum: 50,
        threshold: 60,
      },
    },
  });

  // govAgreementが取得されたら、フォームの初期値を設定
  useEffect(() => {
    if (govAgreement) {
      reset({
        communicationTool: govAgreement?.communicationTool || "",
        recommenders:
          govAgreement?.recommenders?.map((token) =>
            token.is_executable ? "executive" : "non-executive"
          ) || [],
        recommendationRate: govAgreement?.recommendationRate || 60,
        votingLevels: [
          {
            level: 1,
            name: govAgreement?.votingLevels?.[0]?.name || "",
            participants:
              govAgreement?.votingLevels?.[0]?.participants?.map(
                (participant) =>
                  participant.token.is_executable
                    ? "executive"
                    : "non-executive"
              ) || [],
            quorum: govAgreement?.votingLevels?.[0]?.quorum || 50,
            threshold: govAgreement?.votingLevels?.[0]?.voting_threshold || 60,
          },
          {
            level: 2,
            name: govAgreement?.votingLevels?.[1]?.name || "",
            participants:
              govAgreement?.votingLevels?.[1]?.participants?.map(
                (participant) =>
                  participant.token.is_executable
                    ? "executive"
                    : "non-executive"
              ) || [],
            quorum: govAgreement?.votingLevels?.[1]?.quorum || 50,
            threshold: govAgreement?.votingLevels?.[1]?.voting_threshold || 60,
          },
        ],
        emergencyVoting: {
          level: -1,
          name:
            govAgreement?.votingLevels?.filter((level) => level.is_emergency)[0]
              ?.name || "",
          participants:
            govAgreement?.votingLevels
              ?.filter((level) => level.is_emergency)[0]
              ?.participants?.map((participant) =>
                participant.token.is_executable ? "executive" : "non-executive"
              ) || [],
          quorum:
            govAgreement?.votingLevels?.filter((level) => level.is_emergency)[0]
              ?.quorum || 50,
          threshold:
            govAgreement?.votingLevels?.filter((level) => level.is_emergency)[0]
              ?.voting_threshold || 60,
        },
        enforcementDate: govAgreement?.enforcementDate
          ? parseDate(govAgreement.enforcementDate)
          : undefined,
      });
    }
  }, [govAgreement, reset]);

  const getParticipants = (participants: string[]) => {
    if (participants.includes("executive")) {
      if (participants.includes("non-executive")) {
        return tokens?.map((token) => token.id);
      } else {
        return tokens
          ?.filter((token) => token.is_executable)
          .map((token) => token.id);
      }
    } else {
      return tokens
        ?.filter((token) => !token.is_executable)
        .map((token) => token.id);
    }
  };

  const onSubmit = async (data: GovAgreementFormData) => {
    setIsSaving(true);
    try {
      // レベル1とレベル2両方を保存
      for (let i = 0; i < 2; i++) {
        const levelData = data.votingLevels[i];
        const participants = getParticipants(levelData.participants);
        await createVotingLevel({
          level: i + 1,
          company_id: company?.id,
          name: levelData.name,
          participants: participants,
          quorum: levelData.quorum,
          voting_threshold: levelData.threshold,
        });
      }
      await createVotingLevel({
        level: -1,
        company_id: company?.id,
        name: data.emergencyVoting.name,
        participants: getParticipants(data.emergencyVoting.participants),
        quorum: data.emergencyVoting.quorum,
        voting_threshold: data.emergencyVoting.threshold,
        is_emergency: true,
      });

      if (govAgreement) {
        await updateGovAgreement({
          id: govAgreement.id as string,
          company_id: company?.id as string,
          companyName: company?.COMPANY_NAME?.id,
          communicationTool: data.communicationTool,
          recommendationRate: data.recommendationRate,
          enforcementDate: data.enforcementDate.toString(),
        });
      } else {
        const newGovAgreement = await createGovAgreement({
          company_id: company?.id as string,
          companyName: company?.COMPANY_NAME?.id,
          communicationTool: data.communicationTool,
          recommendationRate: data.recommendationRate,
          enforcementDate: data.enforcementDate.toString(),
        });
        console.log("newGovAgreement", newGovAgreement);
        await updateCompany({
          id: company?.id as string,
          governance_agreement: newGovAgreement.id,
        });
      }

      tokens?.forEach(async (token) => {
        if (data.recommenders.includes("executive")) {
          if (data.recommenders.includes("non-executive")) {
            await updateToken({
              id: token.id as string,
              is_recommender: true,
            });
          } else {
            if (token.is_executable) {
              await updateToken({
                id: token.id as string,
                is_recommender: true,
              });
            } else {
              await updateToken({
                id: token.id as string,
                is_recommender: false,
              });
            }
          }
        } else {
          if (!token.is_executable) {
            await updateToken({
              id: token.id as string,
              is_recommender: true,
            });
          } else {
            await updateToken({
              id: token.id as string,
              is_recommender: false,
            });
          }
        }
      });
      // タスクステータスの更新
      const isFieldEmpty =
        !data.communicationTool ||
        data.recommenders.length === 0 ||
        !data.recommendationRate ||
        !data.votingLevels[0].name ||
        data.votingLevels[0].participants.length === 0 ||
        !data.votingLevels[0].quorum ||
        !data.votingLevels[0].threshold ||
        !data.votingLevels[1].name ||
        data.votingLevels[1].participants.length === 0 ||
        !data.votingLevels[1].quorum ||
        !data.votingLevels[1].threshold ||
        data.emergencyVoting.participants.length === 0 ||
        !data.emergencyVoting.quorum ||
        !data.emergencyVoting.threshold ||
        !data.enforcementDate;

      const isAllFieldsFilled = !isFieldEmpty;

      const status = isAllFieldsFilled ? "completed" : "inProgress";

      await updateTaskStatusByIds({
        company_id: company?.id as string,
        task_id: "create-gov-agreement",
        status,
      });

      props.onClose?.();
      setIsSaving(false);
      props.onOpenChange?.(false);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  const previewData = watch();

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
                  総会規定を作成する
                </h2>
                <p className="font-body-md text-neutral">
                  必要な情報を入力してください
                </p>
              </DrawerHeader>
              <DrawerBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  id="aoi-form"
                  className="flex flex-col gap-4"
                >
                  <Stack h className="items-center gap-2">
                    <p className="font-label-lg text-foreground">議案の提案</p>
                    <div className="h-[1px] bg-divider flex-1" />
                  </Stack>
                  <Controller
                    name="communicationTool"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="コミュニケーションツール"
                        labelPlacement="outside"
                        placeholder="例) Slackの議論チャンネル"
                      />
                    )}
                  />

                  <Stack h className="items-center gap-2">
                    <p className="font-label-lg text-foreground">役員の選任</p>
                    <div className="h-[1px] bg-divider flex-1" />
                  </Stack>
                  <Controller
                    name="recommenders"
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup
                        {...field}
                        label="推薦人スコープ"
                        orientation="horizontal"
                        value={field.value || []}
                        onChange={field.onChange}
                      >
                        <Checkbox value="executive">業務執行社員</Checkbox>
                        <Checkbox value="non-executive">
                          非業務執行社員
                        </Checkbox>
                      </CheckboxGroup>
                    )}
                  />
                  <Controller
                    name="recommendationRate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="推薦割合"
                        labelPlacement="outside"
                        endContent={<span>%</span>}
                        placeholder="60"
                        description="有権者数に対する推薦人の割合"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Stack h className="items-center gap-2">
                    <p className="font-label-lg text-foreground">投票レベル2</p>
                    <div className="h-[1px] bg-divider flex-1" />
                  </Stack>
                  <Controller
                    name="votingLevels.1.name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="タイトル"
                        labelPlacement="outside"
                        placeholder="例) DAO総会投票"
                      />
                    )}
                  />
                  <Controller
                    name="votingLevels.1.participants"
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup
                        {...field}
                        label="参加者スコープ"
                        orientation="horizontal"
                        value={field.value || []}
                        onChange={field.onChange}
                      >
                        <Checkbox value="executive">業務執行社員</Checkbox>
                        <Checkbox value="non-executive">
                          非業務執行社員
                        </Checkbox>
                      </CheckboxGroup>
                    )}
                  />
                  <Controller
                    name="votingLevels.1.quorum"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="定足数"
                        labelPlacement="outside"
                        endContent={<span>%</span>}
                        placeholder="50"
                        description="投票を成立させるために必要な全有権者数に対する最低限の参加者数の割合"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Controller
                    name="votingLevels.1.threshold"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="評決数"
                        labelPlacement="outside"
                        endContent={<span>%</span>}
                        placeholder="60"
                        description="決議するために必要な全投票数に対する最低限の票数の割合"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Stack h className="items-center gap-2">
                    <p className="font-label-lg text-foreground">投票レベル1</p>
                    <div className="h-[1px] bg-divider flex-1" />
                  </Stack>
                  <Controller
                    name="votingLevels.0.name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="タイトル"
                        labelPlacement="outside"
                        placeholder="例) DAO総会投票"
                      />
                    )}
                  />
                  <Controller
                    name="votingLevels.0.participants"
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup
                        {...field}
                        label="参加者スコープ"
                        orientation="horizontal"
                        value={field.value || []}
                        onChange={field.onChange}
                      >
                        <Checkbox value="executive">業務執行社員</Checkbox>
                        <Checkbox value="non-executive">
                          非業務執行社員
                        </Checkbox>
                      </CheckboxGroup>
                    )}
                  />
                  <Controller
                    name="votingLevels.0.quorum"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="定足数"
                        labelPlacement="outside"
                        endContent={<span>%</span>}
                        placeholder="50"
                        description="投票を成立させるために必要な全有権者数に対する最低限の参加者数の割合"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Controller
                    name="votingLevels.0.threshold"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="評決数"
                        labelPlacement="outside"
                        endContent={<span>%</span>}
                        placeholder="60"
                        description="決議するために必要な全投票数に対する最低限の票数の割合"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Stack h className="items-center gap-2">
                    <p className="font-label-lg text-foreground">緊急決議</p>
                    <div className="h-[1px] bg-divider flex-1" />
                  </Stack>
                  <Controller
                    name="emergencyVoting.participants"
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup
                        {...field}
                        label="参加者スコープ"
                        orientation="horizontal"
                        value={field.value || []}
                        onChange={field.onChange}
                      >
                        <Checkbox value="executive">業務執行社員</Checkbox>
                        <Checkbox value="non-executive">
                          非業務執行社員
                        </Checkbox>
                      </CheckboxGroup>
                    )}
                  />
                  <Controller
                    name="emergencyVoting.quorum"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="定足数"
                        labelPlacement="outside"
                        endContent={<span>%</span>}
                        placeholder="50"
                        description="投票を成立させるために必要な全有権者数に対する最低限の参加者数の割合"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Controller
                    name="emergencyVoting.threshold"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="評決数"
                        labelPlacement="outside"
                        endContent={<span>%</span>}
                        placeholder="60"
                        description="決議するために必要な全投票数に対する最低限の票数の割合"
                        value={field.value?.toString() || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Stack h className="items-center gap-2">
                    <p className="font-label-lg text-foreground">その他</p>
                    <div className="h-[1px] bg-divider flex-1" />
                  </Stack>
                  <Controller
                    name="enforcementDate"
                    control={control}
                    render={({ field }) => (
                      <I18nProvider locale="ja-JP">
                        <DateInput
                          {...field}
                          label="施行日"
                          labelPlacement="outside"
                          description="総会規定が施行される日"
                          value={field.value || undefined}
                          onChange={field.onChange}
                        />
                      </I18nProvider>
                    )}
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
            <GovAgreementPreview
              data={{
                ...previewData,
                companyName: company?.COMPANY_NAME?.["ja-jp"] || undefined,
                initialMembers: govAgreement?.initialExecutive?.map(
                  (member) => member.USER.name || ""
                ),
              }}
            />
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
