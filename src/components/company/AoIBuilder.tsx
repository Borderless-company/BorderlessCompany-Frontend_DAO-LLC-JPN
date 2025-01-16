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
  Textarea,
  DateInput,
  Checkbox,
  DateValue,
} from "@nextui-org/react";
import { Stack } from "@/sphere/Stack";
import { PiPlusCircle, PiMinusCircle } from "react-icons/pi";
import { LuJapaneseYen } from "react-icons/lu";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useCompanyName } from "@/hooks/useCompanyName";
import { useMember } from "@/hooks/useMember";
import { useAOI } from "@/hooks/useAOI";
import { Database, Tables } from "@/types/schema";
import { useCompany } from "@/hooks/useCompany";
import { useUser } from "@/hooks/useUser";
type AoIBuilderProps = {
  companyId?: string;
} & Omit<DrawerProps, "children">;

type ExecutiveMember = {
  id?: string;
  userId: string;
  name: string;
  address: string;
  walletAddress: string;
  isRepresentative: boolean;
  investment: string;
  dateOfEmployment?: string;
};

type AoIFormData = {
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

export const AoIBuilder: FC<AoIBuilderProps> = ({ companyId, ...props }) => {
  const { updateTaskStatusByIds } = useTaskStatus();
  const { updateCompanyName } = useCompanyName();
  const { createMember, updateMember } = useMember({ daoId: companyId });
  const { updateAOI } = useAOI(companyId);
  const { company } = useCompany(companyId);
  const { createUser } = useUser();
  const [formData, setFormData] = useState<AoIFormData>({
    companyNameJp: "",
    companyNameEn: "",
    businessPurpose: "",
    location: "",
    branchLocations: [""],
    executiveMembers: [
      {
        userId: "",
        name: "",
        address: "",
        walletAddress: company?.founder_id!,
        isRepresentative: true,
        investment: "",
      },
    ],
    businessStartDate: null,
    businessEndDate: null,
    capital: "",
    currency: "yen",
    establishmentDate: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBranchLocationChange = (index: number, value: string) => {
    if (value === "") {
      // 要素を削除
      const newBranchLocations = formData.branchLocations.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        branchLocations:
          newBranchLocations.length > 0 ? newBranchLocations : [""],
      }));
    } else {
      // 値を更新または追加
      const newBranchLocations = [...formData.branchLocations];
      if (index === formData.branchLocations.length) {
        // 新しい要素を追加
        newBranchLocations.push(value);
      } else {
        // 既存の要素を更新
        newBranchLocations[index] = value;
      }
      setFormData((prev) => ({
        ...prev,
        branchLocations: newBranchLocations,
      }));
    }
  };

  const handleExecutiveMemberChange = (
    index: number,
    field: keyof ExecutiveMember,
    value: string | boolean
  ) => {
    if (field === "name" && value === "") {
      // 要素を削除
      const newExecutiveMembers = formData.executiveMembers.filter(
        (_, i) => i !== index
      );
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
                  walletAddress: "",
                  isRepresentative: false,
                  investment: "",
                },
              ],
      }));
    } else {
      // 値を更新または追加
      const newExecutiveMembers = [...formData.executiveMembers];
      if (index === formData.executiveMembers.length) {
        // 新しい要素を追加
        newExecutiveMembers.push({
          userId: "",
          name: "",
          address: "",
          walletAddress: "",
          isRepresentative: false,
          investment: "",
        });
      }
      if (newExecutiveMembers[index]) {
        // isRepresentativeの場合、他のメンバーのisRepresentativeをfalseに設定
        if (field === "isRepresentative" && value === true) {
          newExecutiveMembers.forEach((member, i) => {
            if (i !== index) {
              member.isRepresentative = false;
            }
          });
        }
        // 既存の要素を更新
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

  const handleDateChange = (name: string, value: DateValue | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("formData: ", formData);
    console.log("companyId: ", companyId);
    if (!companyId || !company) return;

    try {
      // 1. COMPANY_NAMEの更新
      const companyNameResponse = await updateCompanyName({
        id: company.company_name!,
        "ja-jp": formData.companyNameJp,
        "en-us": formData.companyNameEn,
      });

      if (!companyNameResponse) {
        throw new Error("会社名の更新に失敗しました");
      }

      // 2. USERの更新
      const userPromises = formData.executiveMembers.map(async (member) => {
        if (!member.walletAddress) return;
        const user = await createUser({
          evm_address: member.walletAddress,
          address: member.address,
          name: member.name,
        });
        return user;
      });

      const users = await Promise.all(userPromises);

      // 3. MEMBERの更新
      const memberPromises = formData.executiveMembers.map(async (member) => {
        if (!member.walletAddress) return;
        const memberData: Partial<Tables<"MEMBER">> = {
          user_id: member.walletAddress,
          dao_id: companyId,
          is_executive: true,
          is_representative: member.isRepresentative,
          invested_amount: parseInt(member.investment),
        };

        return await createMember(memberData);
      });

      await Promise.all(memberPromises);

      // 3. AOIの更新
      const aoiResponse = await updateAOI({
        id: company.aoi!,
        company_name: companyNameResponse.id,
        company_id: companyId,
        business_purpose: formData.businessPurpose,
        location: formData.location,
        branch_location: formData.branchLocations,
        establishment_date: formData.establishmentDate?.toString() || null,
        business_start_date: formData.businessStartDate?.toString() || null,
        business_end_date: formData.businessEndDate?.toString() || null,
        capital: parseInt(formData.capital),
        currency: formData.currency,
      });

      if (!aoiResponse) {
        throw new Error("定款の更新に失敗しました");
      }

      // タスクステータスの更新
      await updateTaskStatusByIds({
        company_id: companyId,
        task_id: "create-aoi",
        status: "completed",
      });

      props.onClose?.();
      console.log("更新が完了しました");
    } catch (error) {
      console.error("更新中にエラーが発生しました:", error);
    }
  };

  return (
    <Drawer
      classNames={{
        base: "flex flex-row w-full max-w-5xl rounded-none",
        body: "w-full pb-12",
        footer: "w-full",
      }}
      {...props}
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <Stack className="flex-1 h-full">
              <DrawerHeader className="flex flex-col gap-2">
                <h2 className="font-headline-sm text-primary">Create AoI</h2>
                <p className="font-body-md text-neutral">
                  Please enter the information of AoI below to activate your
                  company.
                </p>
              </DrawerHeader>
              <DrawerBody>
                <form
                  onSubmit={onSubmit}
                  id="aoi-form"
                  className="flex flex-col gap-4"
                >
                  <Input
                    name="companyNameJp"
                    value={formData.companyNameJp}
                    onChange={handleInputChange}
                    label="Company Name (JP)"
                    labelPlacement="outside"
                    placeholder="ネクストコミュニティ DAO, LLC"
                  />
                  <Input
                    name="companyNameEn"
                    value={formData.companyNameEn}
                    onChange={handleInputChange}
                    label="Company Name (EN)"
                    labelPlacement="outside"
                    placeholder="Next Community DAO, LLC"
                  />
                  <Textarea
                    name="businessPurpose"
                    value={formData.businessPurpose}
                    onChange={handleInputChange}
                    label="Business Purpose"
                    labelPlacement="outside"
                    placeholder="Enter your business purpose"
                  />
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    label="Location"
                    labelPlacement="outside"
                    placeholder="1-1-1 Chiyoda, Chiyoda, Tokyo"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="font-label-md text-foreground">
                      Branch Location
                    </p>
                    {formData.branchLocations.map((location, index) => (
                      <div key={index} className="flex gap-1 items-center">
                        <Input
                          className="flex-1"
                          name={`branchLocation-${index}`}
                          value={location}
                          onChange={(e) =>
                            handleBranchLocationChange(index, e.target.value)
                          }
                          label={`Branch Location ${index + 1}`}
                          labelPlacement="inside"
                        />
                        {index > 0 && (
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() =>
                              handleBranchLocationChange(index, "")
                            }
                          >
                            <PiMinusCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="light"
                      color="secondary"
                      startContent={<PiPlusCircle className="w-4 h-4" />}
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          branchLocations: [...prev.branchLocations, ""],
                        }));
                      }}
                    >
                      Add Branch Location
                    </Button>
                  </div>
                  {formData.executiveMembers.map((member, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="font-label-md text-foreground">
                          Executive Member {index + 1}
                        </p>
                        {index > 0 && (
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() =>
                              handleExecutiveMemberChange(index, "name", "")
                            }
                          >
                            <PiMinusCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        name={`executiveMemberName-${index}`}
                        value={member.name}
                        onChange={(e) =>
                          handleExecutiveMemberChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        label="Name"
                        placeholder={index !== 0 ? "John Doe" : "Your Name"}
                        labelPlacement="inside"
                      />
                      <Input
                        name={`executiveMemberAddress-${index}`}
                        value={member.address}
                        onChange={(e) =>
                          handleExecutiveMemberChange(
                            index,
                            "address",
                            e.target.value
                          )
                        }
                        label="Address"
                        placeholder="1-1-1 Chiyoda, Chiyoda, Tokyo"
                        labelPlacement="inside"
                      />
                      <Input
                        name={`executiveMemberWalletAddress-${index}`}
                        value={
                          index !== 0
                            ? member.walletAddress
                            : company?.founder_id!
                        }
                        onChange={(e) =>
                          handleExecutiveMemberChange(
                            index,
                            "walletAddress",
                            e.target.value
                          )
                        }
                        isReadOnly={index === 0}
                        label="Wallet Address"
                        placeholder="0x1234567890abcdef"
                        labelPlacement="inside"
                      />
                      <Input
                        name={`executiveMemberInvestment-${index}`}
                        value={member.investment}
                        onChange={(e) =>
                          handleExecutiveMemberChange(
                            index,
                            "investment",
                            e.target.value
                          )
                        }
                        label="Investment Amount"
                        placeholder="1000000"
                        labelPlacement="inside"
                        type="number"
                        startContent={
                          <LuJapaneseYen className="w-4 h-4 text-neutral" />
                        }
                      />
                      <Checkbox
                        name={`isRepresentativeMember-${index}`}
                        isSelected={member.isRepresentative}
                        onValueChange={(checked) =>
                          handleExecutiveMemberChange(
                            index,
                            "isRepresentative",
                            checked
                          )
                        }
                      >
                        Representative Member
                      </Checkbox>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="light"
                    color="secondary"
                    startContent={<PiPlusCircle className="w-4 h-4" />}
                    onPress={() => {
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
                    }}
                  >
                    Add Executive Member
                  </Button>
                  <DateInput
                    name="businessStartDate"
                    value={formData.businessStartDate}
                    onChange={(value) =>
                      handleDateChange("businessStartDate", value)
                    }
                    label="Business Start Date"
                    labelPlacement="outside"
                  />
                  <DateInput
                    name="businessEndDate"
                    value={formData.businessEndDate}
                    onChange={(value) =>
                      handleDateChange("businessEndDate", value)
                    }
                    label="Business End Date"
                    labelPlacement="outside"
                  />
                  <Input
                    name="capital"
                    value={formData.capital}
                    onChange={handleInputChange}
                    label="Capital"
                    labelPlacement="outside"
                    inputMode="numeric"
                    placeholder="100000000"
                    type="number"
                    startContent={
                      <LuJapaneseYen className="w-4 h-4 text-neutral" />
                    }
                  />
                  <DateInput
                    name="establishmentDate"
                    value={formData.establishmentDate}
                    onChange={(value) =>
                      handleDateChange("establishmentDate", value)
                    }
                    label="Establishment Date"
                    labelPlacement="outside"
                  />
                </form>
              </DrawerBody>
              <DrawerFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" type="submit" form="aoi-form">
                  Save
                </Button>
              </DrawerFooter>
            </Stack>
            <div className="flex flex-col gap-4 flex-1 h-full border-l-1 border-l-divider p-4 overflow-scroll">
              <p className="font-label-lg text-neutral">Preview of AoI</p>
              <div>
                <h1 className="font-headline-lg text-foreground mb-4">定款</h1>
                <h2 className="font-headline-sm text-foreground mb-3">
                  第１章 総則
                </h2>

                <h3 className="font-title-lg text-foreground mb-2">
                  第1条 (商号)
                </h3>
                <p className="font-body-md text-foreground">
                  当会社は、{formData.companyNameJp || "＿＿＿"}と称し、英文では
                  {formData.companyNameEn || "＿＿＿"}と表示する。
                </p>

                <h3 className="font-title-lg text-foreground mb-2 mt-4">
                  第2条 (目的)
                </h3>
                <p className="font-body-md text-foreground">
                  当会社は、次の事業を営むことを目的とする。
                  {formData.businessPurpose
                    .split("\n")
                    .map((purpose, index) => (
                      <div key={index}>{purpose}</div>
                    ))}
                </p>

                <h3 className="font-title-lg text-foreground mb-2 mt-4">
                  第3条 (本店の所在地)
                </h3>
                <p className="font-body-md text-foreground">
                  当会社は、本店を{formData.location || "＿＿＿"}に置く。
                </p>

                <h3 className="font-title-lg text-foreground mb-2 mt-4">
                  第4条 (支店の所在地)
                </h3>
                <p className="font-body-md text-foreground">
                  当会社は、
                  {formData.branchLocations
                    .filter((loc) => loc)
                    .map((location, index) => (
                      <span key={index}>
                        {index > 0 && "、"}
                        支店を{location}に置く
                      </span>
                    ))}
                  。
                </p>

                <h3 className="font-title-lg text-foreground mb-2 mt-4">
                  第5条 (公告の方法)
                </h3>
                <p className="font-body-md text-foreground">
                  当会社の公告は、官報に掲載する方法で行う。
                </p>

                <h2 className="font-headline-sm text-foreground mb-3 mt-6">
                  第2章 社員及び出資
                </h2>

                <h3 className="font-title-lg text-foreground mb-2">
                  第6条 (社員の氏名又は名称、住所、出資及び責任)
                </h3>
                <p className="font-body-md text-foreground mb-2">
                  1.
                  当会社の業務を執行する社員（以下「業務執行社員」という。）の氏名又は名称、住所、出資の目的及びその価額は次のとおりである。
                </p>
                {formData.executiveMembers.map(
                  (member, index) =>
                    member.name && (
                      <div key={index} className="mb-4 ml-4">
                        <p className="font-body-md text-foreground">
                          ({index + 1}) 名 称 {member.name}
                        </p>
                        <p className="font-body-md text-foreground ml-4">
                          住 所 {member.address}
                        </p>
                        <p className="font-body-md text-foreground ml-4">
                          出資の目的及びその価額 金銭 金
                          {parseInt(member.investment || "0").toLocaleString()}
                          円
                        </p>
                      </div>
                    )
                )}
                <p className="font-body-md text-foreground mb-2">
                  2.
                  当会社の業務執行社員以外の社員（以下「非業務執行社員」という。）の氏名又は名称、住所、出資の目的及びその価額は別紙社員名簿のとおりである。なお、社員名簿は本定款の一部を構成するものとする。
                </p>
                <p className="font-body-md text-foreground mb-2">
                  3. 当会社の社員は、全て有限責任社員とする。
                </p>
                <p className="font-body-md text-foreground mb-2">
                  4.
                  非業務執行社員は、第2項に定める社員名簿について、閲覧、謄写その他開示を求めることはできないものとする。
                </p>
                <p className="font-body-md text-foreground mb-2">
                  5.
                  業務執行社員は、法令に基づく場合、人の生命、身体又は財産の保護のために必要がある場合、国の機関若しくは地方公共団体又はその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合等の合理的な必要性がある場合を除き、同社員名簿について、閲覧、謄写その他開示ができないよう技術的な措置を講じるものとする。
                </p>
                <h3 className="font-title-lg text-foreground mb-2 mt-4">
                  第7条 (トークンについて)
                </h3>
                <p className="font-body-md text-foreground mb-2">
                  1.
                  当会社の社員となることができる者は、当会社が発行し、当会社の社員権を表章するトークン（以下「社員権トークン」という。）を保有する者（以下「社員権トークンホルダー」という。）に限る。なお、「社員権トークン」とは、当法人が発行する非代替性トークンであって、電子情報処理組織を用いて移転することができ、かつ、DAO総会において別途定めるトークン規程に従い発行されるものをいう。
                </p>
                <p className="font-body-md text-foreground mb-2">
                  2.
                  当会社は、ガバナンストークンを発行することができ、ガバナンストークンを保有する者をガバナンストークンホルダー（以下、社員権トークンホルダーと合わせて、「トークンホルダー」という。）として扱うものとする。なお、「ガバナンストークン」とは、社員権トークンとは別の、当法人が発行する非代替性トークンであって、電子情報処理組織を用いて移転することができ、別途定めるトークン規程に従い発行されるものをいう。
                </p>
                <p className="font-body-md text-foreground mb-2">
                  3.
                  ウォレットを紛失した場合の社員権トークン及びガバナンストークンの再発行は、DAO総会において別途定めるトークン規程に従うものとする。
                </p>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
