import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

// 必要な型定義
export type Token = Tables<"TOKEN"> & {
  is_recommender?: boolean;
};
export type Member = Tables<"MEMBER"> & {
  USER: Tables<"USER">;
  TOKEN: Tables<"TOKEN">;
};
export type VotingLevel = Tables<"VOTING_LEVEL"> & {
  participants?: (Tables<"VOTING_PARTCIPANT"> & {
    token: Tables<"TOKEN">;
  })[];
};

// GovernanceAgreementの型定義
export type GovernanceAgreement = {
  id?: string;
  companyName?: string;
  communicationTool?: string;
  recommenders?: Token[];
  recommendationRate?: number;
  votingLevels?: VotingLevel[];
  enforcementDate?: string;
  initialExecutive?: Member[];
};

// API戻り値の型定義
export type GovernanceAgreementResponse = Tables<"GOVERNANCE_AGREEMENT"> & {
  recommenders?: Token[];
  votingLevels?: VotingLevel[];
  initialExecutives?: Member[];
  company_id?: string; // company_idプロパティを追加
};

// 作成用のProps
export type CreateGovAgreementProps = Omit<
  GovernanceAgreement,
  "recommenders" | "votingLevels" | "initialExecutive"
> & {
  company_id?: string;
};

// 更新用のProps
export type UpdateGovAgreementProps = Partial<CreateGovAgreementProps> & {
  id: string;
};

/**
 * ガバナンス契約を操作するためのフック
 * @param id ガバナンス契約ID
 */
export const useGovAgreement = (id?: string) => {
  const queryClient = useQueryClient();

  // ガバナンス契約作成
  const {
    mutateAsync: createGovAgreement,
    isPending: isCreating,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
    error: createError,
  } = useMutation<GovernanceAgreementResponse, Error, CreateGovAgreementProps>({
    mutationFn: async (props: CreateGovAgreementProps) => {
      const response = await fetch("/api/gov-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: props.company_id,
          company_name: props.companyName,
          commucation_tool: props.communicationTool,
          recommendation_rate: props.recommendationRate,
          enforcement_date: props.enforcementDate,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] GovernanceAgreement created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create GovernanceAgreement: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["govAgreement", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["govAgreementByCompanyId", data.company_id],
      });
    },
  });

  // ガバナンス契約更新
  const {
    mutateAsync: updateGovAgreement,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
    error: updateError,
  } = useMutation<GovernanceAgreementResponse, Error, UpdateGovAgreementProps>({
    mutationFn: async (props: UpdateGovAgreementProps) => {
      const { id, ...updateData } = props;
      const payload: any = {};

      if (updateData.company_id) payload.company_id = updateData.company_id;
      if (updateData.companyName) payload.company_name = updateData.companyName;
      if (updateData.communicationTool)
        payload.commucation_tool = updateData.communicationTool;
      if (updateData.recommendationRate !== undefined)
        payload.recommendation_rate = updateData.recommendationRate;
      if (updateData.enforcementDate)
        payload.enforcement_date = updateData.enforcementDate;

      const response = await fetch(`/api/gov-agreement/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] GovernanceAgreement updated: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update GovernanceAgreement: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["govAgreement", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["govAgreementByCompanyId", data.company_id],
      });
    },
  });

  // ガバナンス契約取得（関連データを含む）
  const {
    data: govAgreement,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<GovernanceAgreement | undefined, Error>({
    queryKey: ["govAgreement", id],
    queryFn: async () => {
      if (!id) return undefined;

      // ガバナンス契約のベース情報を取得
      const response = await fetch(`/api/gov-agreement/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }

      const baseData = json.data;
      const companyId = baseData.company_id;

      // 関連データを取得
      const [recommenderResponse, votingLevelsResponse, membersResponse] =
        await Promise.all([
          fetch(`/api/token?companyId=${companyId}&isRecommender=true`),
          fetch(`/api/voting-level/company/${companyId}`),
          fetch(`/api/member?companyId=${companyId}&isInitialMember=true`),
        ]);

      // レコメンダートークンを取得
      const recommenderJson = await recommenderResponse.json();
      if (!recommenderResponse.ok) {
        throw new Error(recommenderJson.error);
      }

      // 投票レベルを取得
      const votingLevelsJson = await votingLevelsResponse.json();
      if (!votingLevelsResponse.ok) {
        throw new Error(votingLevelsJson.error);
      }

      console.log("votingLevelsJson", votingLevelsJson.data);

      // 初期役員メンバーを取得
      const membersJson = await membersResponse.json();
      if (!membersResponse.ok) {
        throw new Error(membersJson.error);
      }

      // 緊急投票レベルを特定
      const emergencyVoting =
        votingLevelsJson.data.find(
          (level: VotingLevel) => level.id === baseData.emergency_voting
        ) ||
        votingLevelsJson.data.find(
          (level: VotingLevel) => level.is_emergency === true
        );

      return {
        id: baseData.id,
        companyName: baseData.company_name,
        communicationTool: baseData.commucation_tool,
        recommenders: recommenderJson.data,
        recommendationRate: baseData.recommendation_rate,
        votingLevels: votingLevelsJson.data,
        emergencyVoting: emergencyVoting,
        enforcementDate: baseData.enforcement_date,
        initialExecutive: membersJson.data,
        company_id: companyId,
      };
    },
    enabled: !!id,
  });

  return {
    // 取得
    govAgreement,
    isLoading,
    isError,
    error,
    refetch,

    // 作成
    createGovAgreement,
    isCreating,
    isCreateSuccess,
    isCreateError,
    createError,

    // 更新
    updateGovAgreement,
    isUpdating,
    isUpdateSuccess,
    isUpdateError,
    updateError,
  };
};

/**
 * 会社IDに基づくガバナンス契約を取得するフック
 * @param companyId 会社ID
 */
export const useGovAgreementByCompanyId = (companyId?: string) => {
  const {
    data: govAgreement,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<GovernanceAgreement | undefined, Error>({
    queryKey: ["govAgreementByCompanyId", companyId],
    queryFn: async () => {
      if (!companyId) return undefined;

      // 会社IDに基づくガバナンス契約を取得
      const response = await fetch(`/api/gov-agreement/company/${companyId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }

      // データが存在しない場合は未定義を返す
      if (!json.data || json.data.length === 0) {
        return undefined;
      }

      const baseData = json.data; // 最初のガバナンス契約を使用
      console.log("baseData", baseData);

      // 関連データを取得
      const [recommenderResponse, votingLevelsResponse, membersResponse] =
        await Promise.all([
          fetch(`/api/token?companyId=${companyId}`),
          fetch(`/api/voting-level/company/${companyId}`),
          fetch(`/api/member?companyId=${companyId}`),
        ]);

      // レコメンダートークンを取得
      const recommenderJson = await recommenderResponse.json();
      if (!recommenderResponse.ok) {
        throw new Error(recommenderJson.error);
      }

      // 投票レベルを取得
      const votingLevelsJson = await votingLevelsResponse.json();
      if (!votingLevelsResponse.ok) {
        throw new Error(votingLevelsJson.error);
      }

      // 初期役員メンバーを取得
      const membersJson = await membersResponse.json();
      if (!membersResponse.ok) {
        throw new Error(membersJson.error);
      }

      // 緊急投票レベルを特定
      const emergencyVoting =
        votingLevelsJson.data.find(
          (level: VotingLevel) => level.id === baseData.emergency_voting
        ) ||
        votingLevelsJson.data.find(
          (level: VotingLevel) => level.is_emergency === true
        );

      return {
        id: baseData.id,
        companyName: baseData.company_name,
        communicationTool: baseData.commucation_tool,
        recommenders: recommenderJson.data.filter(
          (token: Token) => token.is_recommender === true
        ),
        recommendationRate: baseData.recommendation_rate,
        votingLevels: votingLevelsJson.data,
        emergencyVoting: emergencyVoting,
        enforcementDate: baseData.enforcement_date,
        initialExecutive: membersJson.data.filter(
          (member: Member) => member.is_initial_member === true
        ),
        company_id: companyId,
      };
    },
    enabled: !!companyId,
  });

  return { govAgreement, isLoading, isError, error, refetch };
};
