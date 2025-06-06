import { FC, useState, useEffect } from "react";
import { Button, Input, Checkbox } from "@heroui/react";
import { PiPlusCircle, PiMinusCircle } from "react-icons/pi";
import { LuJapaneseYen } from "react-icons/lu";
import { AoIFormData } from "@/types/aoi";
import { Tables } from "@/types/schema";
import { useTranslation } from "next-i18next";
import { useUser } from "@/hooks/useUser";
import { useActiveAccount } from "thirdweb/react";

type ExecutiveMembersSectionProps = {
  formData: AoIFormData;
  setFormData: React.Dispatch<React.SetStateAction<AoIFormData>>;
  company: Tables<"COMPANY"> | null | undefined;
};

export const ExecutiveMembersSection: FC<ExecutiveMembersSectionProps> = ({
  formData,
  setFormData,
  company,
}) => {
  const { t } = useTranslation(["aoi", "common"]);
  const smartAccount = useActiveAccount();
  const { user: founderUser, getUserByAddress } = useUser(
    company?.founder_id || undefined
  );
  const [userLookupErrors, setUserLookupErrors] = useState<
    Record<number, string>
  >({});

  // founderの情報を最初のメンバーに自動設定
  useEffect(() => {
    if (founderUser && formData.executiveMembers[0] && company?.founder_id) {
      const updatedMembers = [...formData.executiveMembers];
      updatedMembers[0] = {
        ...updatedMembers[0],
        name: founderUser.name || "",
        address: founderUser.address || "",
        walletAddress: company.founder_id,
      };
      setFormData((prev) => ({
        ...prev,
        executiveMembers: updatedMembers,
      }));
    }
  }, [founderUser, company?.founder_id]);

  // ウォレットアドレスに基づいてユーザー情報を取得
  const lookupUserByWallet = async (walletAddress: string, index: number) => {
    if (!walletAddress || walletAddress === company?.founder_id) return;

    setUserLookupErrors((prev) => ({ ...prev, [index]: "" }));

    try {
      const user = await getUserByAddress(walletAddress);

      if (!user) {
        throw new Error("User not found");
      }

      // ユーザー情報をフォームに設定
      const updatedMembers = [...formData.executiveMembers];
      updatedMembers[index] = {
        ...updatedMembers[index],
        name: user.name || "",
        address: user.address || "",
        walletAddress: walletAddress,
      };

      setFormData((prev) => ({
        ...prev,
        executiveMembers: updatedMembers,
      }));
    } catch (error) {
      // エラーの場合は氏名・住所を空にする
      const updatedMembers = [...formData.executiveMembers];
      updatedMembers[index] = {
        ...updatedMembers[index],
        name: "",
        address: "",
        walletAddress: walletAddress,
      };

      setFormData((prev) => ({
        ...prev,
        executiveMembers: updatedMembers,
      }));

      setUserLookupErrors((prev) => ({
        ...prev,
        [index]: "このウォレットアドレスに対応するユーザーが見つかりません",
      }));
    }
  };

  const handleExecutiveMemberChange = (
    index: number,
    field: keyof AoIFormData["executiveMembers"][0],
    value: string | boolean
  ) => {
    if (field === "name" && value === "") {
      const newExecutiveMembers = formData.executiveMembers.filter(
        (_, i) => i !== index
      );

      // エラー状態をクリア
      setUserLookupErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });

      setFormData((prev) => ({
        ...prev,
        executiveMembers:
          newExecutiveMembers.length > 0
            ? newExecutiveMembers
            : [
                {
                  userId: "",
                  name: "",
                  address: "",
                  walletAddress: company?.founder_id ?? "",
                  isRepresentative: true,
                  investment: "",
                },
              ],
      }));
    } else {
      const newExecutiveMembers = [...formData.executiveMembers];

      if (newExecutiveMembers[index]) {
        if (field === "isRepresentative" && value === true) {
          newExecutiveMembers.forEach((member, i) => {
            if (i !== index) {
              member.isRepresentative = false;
            }
          });
        }

        // ウォレットアドレスが変更された場合、ユーザー情報を取得
        if (
          field === "walletAddress" &&
          typeof value === "string" &&
          index > 0
        ) {
          setUserLookupErrors((prev) => ({ ...prev, [index]: "" }));

          // デバウンス処理: 入力が止まってから500ms後にAPI呼び出し
          setTimeout(() => {
            lookupUserByWallet(value, index);
          }, 500);
        }

        newExecutiveMembers[index] = {
          ...newExecutiveMembers[index],
          [field]: value,
        };
      }
      setFormData((prev) => ({
        ...prev,
        executiveMembers: newExecutiveMembers,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {formData.executiveMembers.map((member, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-label-md text-foreground">
              {t("Executive", { ns: "common" })} {index + 1}
            </p>
            {index > 0 && (
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="light"
                onPress={() => handleExecutiveMemberChange(index, "name", "")}
              >
                <PiMinusCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
          {/* 氏名フィールド：founderまたはユーザーが見つかった場合のみ表示 */}
          {(index === 0 || (index > 0 && member.name && !userLookupErrors[index])) && (
            <Input
              name={`executiveMemberName-${index}`}
              value={member.name}
              onChange={(e) =>
                handleExecutiveMemberChange(index, "name", e.target.value)
              }
              label={t("Name")}
              placeholder={index !== 0 ? t("John Doe") : t("Your Name")}
              labelPlacement="inside"
              isDisabled={
                index === 0 ||
                !!(index > 0 && member.name && member.walletAddress)
              }
              description={
                index === 0
                  ? "自動入力済み（編集不可）"
                  : member.name && member.walletAddress
                  ? "自動入力済み（編集不可）"
                  : undefined
              }
            />
          )}
          
          {/* 住所フィールド：founderまたはユーザーが見つかった場合のみ表示 */}
          {(index === 0 || (index > 0 && member.address && !userLookupErrors[index])) && (
            <Input
              name={`executiveMemberAddress-${index}`}
              value={member.address}
              onChange={(e) =>
                handleExecutiveMemberChange(index, "address", e.target.value)
              }
              label={t("Address")}
              placeholder={t("Chiyoda, Chiyoda, Tokyo")}
              labelPlacement="inside"
              isDisabled={
                index === 0 ||
                !!(index > 0 && member.address && member.walletAddress)
              }
              description={
                index === 0
                  ? "自動入力済み（編集不可）"
                  : member.address && member.walletAddress
                  ? "自動入力済み（編集不可）"
                  : undefined
              }
            />
          )}
          <Input
            name={`executiveMemberWalletAddress-${index}`}
            value={index !== 0 ? member.walletAddress : company?.founder_id!}
            onChange={(e) =>
              handleExecutiveMemberChange(
                index,
                "walletAddress",
                e.target.value
              )
            }
            isReadOnly={index === 0}
            label={t("Wallet Address")}
            placeholder="0x1234567890abcdef"
            labelPlacement="inside"
            errorMessage={userLookupErrors[index]}
            isInvalid={!!userLookupErrors[index]}
            description={
              index === 0
                ? "自動入力済み（編集不可）"
                : "ウォレットアドレスを入力すると自動でユーザー情報が取得されます"
            }
          />
          <Input
            name={`executiveMemberInvestment-${index}`}
            value={member.investment}
            onChange={(e) =>
              handleExecutiveMemberChange(index, "investment", e.target.value)
            }
            label={t("Investment Amount")}
            placeholder="1000000"
            labelPlacement="inside"
            type="number"
            startContent={<LuJapaneseYen className="w-4 h-4 text-neutral" />}
          />
          <Checkbox
            name={`isRepresentativeMember-${index}`}
            isSelected={member.isRepresentative}
            onValueChange={(checked) =>
              handleExecutiveMemberChange(index, "isRepresentative", checked)
            }
          >
            {t("Representative", { ns: "common" })}
          </Checkbox>
        </div>
      ))}
      <Button
        size="sm"
        variant="light"
        color="secondary"
        startContent={<PiPlusCircle className="w-4 h-4" />}
        onPress={() => {
          const newIndex = formData.executiveMembers.length;
          setFormData((prev) => ({
            ...prev,
            executiveMembers: [
              ...prev.executiveMembers,
              {
                userId: "",
                name: "",
                address: "",
                walletAddress: "",
                isRepresentative: false,
                investment: "",
              },
            ],
          }));
          // 新しいメンバーのエラー状態をリセット
          setUserLookupErrors((prev) => ({ ...prev, [newIndex]: "" }));
        }}
      >
        {t("Add Executive")}
      </Button>
    </div>
  );
};
