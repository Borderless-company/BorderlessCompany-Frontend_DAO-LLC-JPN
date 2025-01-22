import { FC } from "react";
import { AoIFormData } from "@/types/aoi";

type AoIPreviewProps = {
  formData: AoIFormData;
};

export const AoIPreview: FC<AoIPreviewProps> = ({ formData }) => {
  return (
    <div className="flex flex-col gap-4 flex-1 h-full border-l-1 border-l-divider p-4 overflow-scroll">
      <p className="font-label-lg text-neutral">Preview of AoI</p>
      <div>
        <h1 className="font-headline-lg text-foreground mb-4">定款</h1>
        <h2 className="font-headline-sm text-foreground mb-3">第１章 総則</h2>

        <h3 className="font-title-lg text-foreground mb-2">第1条 (商号)</h3>
        <p className="font-body-md text-foreground">
          当会社は、{formData.companyNameJp || "＿＿＿"}と称し、英文では
          {formData.companyNameEn || "＿＿＿"}と表示する。
        </p>

        <h3 className="font-title-lg text-foreground mb-2 mt-4">
          第2条 (目的)
        </h3>
        <p className="font-body-md text-foreground">
          当会社は、次の事業を営むことを目的とする。
          {formData.businessPurpose.split("\n").map((purpose, index) => (
            <div key={index}>{purpose || "＿＿＿"}</div>
          ))}
        </p>

        <h3 className="font-title-lg text-foreground mb-2 mt-4">
          第3条 (本店の所在地)
        </h3>
        <p className="font-body-md text-foreground">
          当会社は、本店を{formData.location || "＿＿＿"}に置く。
        </p>

        {formData.branchLocations.length > 0 && (
          <>
            <h3 className="font-title-lg text-foreground mb-2 mt-4">
              第4条 (支店の所在地)
            </h3>
            <p className="font-body-md text-foreground">
              当会社は、
              {formData.branchLocations.filter((loc) => loc).length > 0 ? (
                formData.branchLocations
                  .filter((loc) => loc)
                  .map((location, index) => (
                    <span key={index}>
                      {index > 0 && "、"}
                      支店を{location}に置く
                    </span>
                  ))
              ) : (
                <span>支店を＿＿＿に置く</span>
              )}
              。
            </p>
          </>
        )}

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
                  {parseInt(member.investment || "0").toLocaleString()}円
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

        <h2 className="font-headline-sm text-foreground mb-3 mt-6">
          第3章 事業年度
        </h2>

        <h3 className="font-title-lg text-foreground mb-2">第8条 (事業年度)</h3>
        <p className="font-body-md text-foreground">
          当会社の事業年度は、毎年
          {formData.businessStartDate
            ? formData.businessStartDate
                .toDate("JST")
                .toLocaleDateString("ja-JP", {
                  month: "long",
                  day: "numeric",
                })
            : "＿＿＿"}
          日から翌年
          {formData.businessEndDate
            ? formData.businessEndDate
                .toDate("JST")
                .toLocaleDateString("ja-JP", {
                  month: "long",
                  day: "numeric",
                })
            : "＿＿＿"}
          日までとする。
        </p>

        <h2 className="font-headline-sm text-foreground mb-3 mt-6">
          第4章 附則
        </h2>

        <h3 className="font-title-lg text-foreground mb-2">
          第9条 (設立に際する出資)
        </h3>
        <p className="font-body-md text-foreground">
          当会社の資本金は金{parseInt(formData.capital || "0").toLocaleString()}
          円とする。
        </p>

        <h3 className="font-title-lg text-foreground mb-2 mt-4">
          第10条 (最初の事業年度)
        </h3>
        <p className="font-body-md text-foreground">
          当会社の最初の事業年度は、当会社成立の日から
          {formData.establishmentDate
            ? formData.establishmentDate
                .toDate("JST")
                .toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
            : "＿＿＿"}
          日までとする。
        </p>
      </div>
    </div>
  );
};
