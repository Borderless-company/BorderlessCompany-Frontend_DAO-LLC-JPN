import { FC, forwardRef, ForwardedRef } from "react";
import { useTranslation } from "next-i18next";
import { GovAgreementFormData } from "@/types/govAgreement";
import { useCompany } from "@/hooks/useCompany";
import { cn } from "@heroui/react";
type GovAgreementPreviewProps = {
  data: GovAgreementFormData & {
    companyName?: string;
    initialMembers?: string[];
  };
  className?: string;
  onlyPreview?: boolean;
};

export const GovAgreementPreview = forwardRef<
  HTMLDivElement,
  GovAgreementPreviewProps
>(({ data, className, onlyPreview = false }, ref) => {
  const { t } = useTranslation("govAgreement");

  const parseParticipants = (participants: string[]) => {
    if (participants.includes("executive")) {
      if (participants.includes("non-executive")) {
        return "業務執行社員及び非業務執行社員";
      }
      return "業務執行社員";
    } else if (participants.includes("non-executive")) {
      return "非業務執行社員";
    } else {
      return "＿＿＿";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 flex-1 h-full  border-l-divider pt-4  overflow-scroll",
        !onlyPreview && "border-l-1 p-4"
      )}
      ref={ref}
    >
      {!onlyPreview && (
        <p className="font-label-lg text-neutral">
          {t("Preview of Governance Agreement")}
        </p>
      )}
      <div className="prose-preview">
        <h1>DAO 総会規定</h1>
        <hr />

        <h2>第 1 章　総則</h2>

        <h3>第１条（目的）</h3>
        <p>
          この規程は、{data.companyName || "＿＿＿"} （以下「本
          DAO」という。）の定款（以下「本定款」という。）第１４条の規定に基づき、DAO
          総会（以下、DAO
          総会の構成員を「社員」という。）の適法かつ円滑な運営を図るために必要な事項を定めることを目的とする。
        </p>

        <h3>第２条(総会の構成）</h3>
        <ol>
          <li>
            総会は、すべての社員権トークンを保有する社員（以下「社員権トークンホルダー」という。）をもって組織する。
          </li>
          <li>
            社員権トークンホルダー兼トークンホルダーは自律的に投票を行うよう努めなければならない。
          </li>
        </ol>

        <h3>第３条（役職の選任）</h3>
        <ol>
          <li>
            業務執行社員は、社員権トークンホルダーの中で
            {parseParticipants(data.recommenders || []) || "＿＿＿"}の
            {`${data.recommendationRate}%` || "＿＿＿"}
            以上の推薦があった者の中から本人の立候補で総会に提案され、本 DAO
            総会規程第６条レベル２の業務執行社員信任投票により選出される。
          </li>
          <li>
            前項の規程に関わらず、本 DAO
            設立時における業務執行社員は、当規程第１４条において設立時業務執行社員と定める者とする。
          </li>
        </ol>

        <hr />

        <h2>第 2 章　総会投票の種類及び手続き</h2>

        <h3>第４条（社員権トークンホルダーによる議案の提案権）</h3>
        <ol>
          <li>
            社員権トークンホルダーは、DAO
            総会に対し、一定の事項（当該トークンホルダーが議決権を行使することができる事項に限る。）を当規程第６条で定める
            DAO 総会の決議事項として請求することができる。
          </li>
          <li>
            社員権トークンホルダーは、以下のプロセスに従い、前項の請求を行うことができる。
            <ol type="a">
              <li>
                社員権トークンホルダーは、本 DAO
                がコミュニケーションツールとして利用する
                {data.communicationTool || "＿＿＿"}
                にて議案の内容を示すスレッドを作成し、提案を行う。
              </li>
              <li>
                当該スレッドで議題に対する議論を行い、社員権トークンホルダー３名以上及び業務執行社員の３分の２以上から当該議案に対して賛同を得ることで、次のプロポーザル段階に進むことができるものとする。
              </li>
              <li>
                プロポーザル段階においては、提案者は議論を踏まえ、内容を修正し再提案する。この再提案について、業務執行社員会で投票重要度のレベルが審議された後、当規程第８条に基づき委員会が全体告知を行い、社員権トークンホルダーに周知される。
              </li>
              <li>
                社員権トークンホルダーに周知された後、当規程第６条に基づく投票が実施され、承認された議案は実施可能となる。
              </li>
            </ol>
          </li>
          <li>
            当該議案が法令若しくは定款に違反する場合又はこれらと実質的に同一の議案につき
            DAO
            総会において社員権トークンホルダー（当該議案について議決権を行使することができない社員権トークンホルダーを除く。）の議決権の十分の一（これを下回る割合を定款で定めた場合にあっては、その割合）以上の賛成を得られなかった日から一年を経過していない場合は、この限りでない。
          </li>
          <li>
            特的の条件下で、DAO
            総会規程で定めるレベル２の投票により承認された議案に関して、社員権トークンホルダーでない者も
            DAO 総会に議題を提案する権利を与えることができる。
          </li>
        </ol>

        <h3>第５条（免責事項）</h3>
        <p>
          前条に従い、社員権トークンホルダーから提案がなされた議題について、必要に応じて当該提案者及び賛同者の意見を聞いた上で、業務執行社員は、当規程第１１条に定める免責事項に該当する場合は、DAO
          総会で決議することを拒否するものとする。この場合、業務執行社員は、社員権トークンホルダーに対し、拒否した理由及び根拠等の必要な説明をしなければならない。
        </p>

        <h3>第６条（総会の決議事項）</h3>
        <p>
          総会における決議事項はその重要度に応じてレベル分けされ、前二条で定められる手続きを経て各議案が提案された場合に、当規程第７条に基づいて告知された電磁的方法によって
          DAO 総会投票が実施される。重要度のレベルは 1 ～ 2 まで存在し、本 DAO
          総会規程において DAO 総会が決議するレベル 1 ～ 2
          を記載する。当該レベル 1 ～ 2
          の投票における社員権トークンホルダーの議決権の個数は、本 DAO
          のトークン規程で別途定めるものとする。決議事項は当規程第１１条の免責事項に該当しないものでなければならない。
        </p>

        <h4>1. レベル 2：{data.votingLevels[1].name || "＿＿＿"}</h4>
        <ul>
          <li>
            レベル 2 総会投票は、本 DAO
            に大きな影響を与えうる、以下の最重要事項に関して議決する。
            <ul>
              <li>利益の配当及び残余財産の分配</li>
              <li>
                本 DAO
                のトレジャリーからの払出等、トレジャリーの管理関する一切の件
              </li>
              <li>
                業務執行社員、代表社員その他担当社員及び委員会長の選任及び解任
              </li>
              <li>社員の退任に関する事</li>
              <li>
                定款、運営規程、DAO 総会規程、トークン規程等当 DAO
                の定める規定等の変更又は規程の制定
              </li>
              <li>業務執行社員の利益相反取引及び協業避止関係の承認</li>
              <li>倒産手続等開始の申立ての決定</li>
              <li>解散</li>
              <li>清算人の解任</li>
              <li>組織変更の決定</li>
              <li>
                会社法第 793 条、第 802 条又は第 813
                条に従った当会社の吸収合併等についての吸収合併契約書等の締結及び当会社の事業の全部又は重要な一部の譲渡の決定
              </li>
              <li>
                その他、業務執行社員の３分の１以上がレベル２に該当すると判断した事項
              </li>
            </ul>
          </li>
          <li>
            レベル 2 の議案は法令又は当社定款に別段の定めがある場合を除き、
            {parseParticipants(data.votingLevels[1].participants || []) ||
              "＿＿＿"}
            がもつ総議決権数の
            {data.votingLevels[1].quorum || 0 || "＿＿＿"}
            %を有する
            {parseParticipants(data.votingLevels[1].participants || []) ||
              "＿＿＿"}
            が投票し、
            {data.votingLevels[1].threshold || 0 || "＿＿＿"}
            %以上の賛成をもって決議する。
          </li>
        </ul>

        <h4>2. レベル 1：{data.votingLevels[0].name || "＿＿＿"}</h4>
        <ul>
          <li>
            レベル 1 総会投票は、運営に重要な事項で、DAO
            総会全体の審議が必要な以下の事項について議決する。
          </li>
          <li>業務執行社員会で、レベル 1 総会投票が相当であるとされた事項</li>
          <li>
            レベル 1 の議案は DAO
            総会において法令又は当社定款に別段の定めがある場合を除き、
            {parseParticipants(data.votingLevels[0].participants || []) ||
              "＿＿＿"}
            がもつ総議決権数の
            {data.votingLevels[0].quorum || 0 || "＿＿＿"}
            %を有する
            {parseParticipants(data.votingLevels[0].participants || []) ||
              "＿＿＿"}
            が投票し、投票した議決権の
            {data.votingLevels[0].threshold || 0 || "＿＿＿"}
            %以上の賛成をもって議決する。
          </li>
        </ul>

        <h3>第７条（DAO 総会投票の手続）</h3>
        <ol>
          <li>
            当規程第４条及び第５条の手続きを経て、DAO
            総会投票を実施する場合には、委員会は、投票開始日の前日までに、社員権トークンホルダーに対して次の事項の通知を電子的な方法でしなければならない。
            <ol type="a">
              <li>DAO 総会投票の開始日、期間及び具体的な電磁的方法</li>
              <li>前条に基づいた該当意思決定レベル</li>
              <li>当該事項に係る議案の概要及び投票の選択肢</li>
            </ol>
          </li>
          <li>
            前項に関わらず、緊急に決議が必要である場合は、
            {parseParticipants(data.emergencyVoting?.participants || []) ||
              "＿＿＿"}
            がもつ総議決権数の
            {data.emergencyVoting?.quorum || 0 || "＿＿＿"}
            %を有する
            {parseParticipants(data.emergencyVoting?.participants || []) ||
              "＿＿＿"}
            が投票し、
            {data.emergencyVoting?.threshold || 0 || "＿＿＿"}
            %以上の賛成をもって、直ちに投票を開始することができる。
          </li>
        </ol>

        <hr />

        <h2>第 3 章　DAO 総会の議事</h2>

        <h3>第８条（投票管理）</h3>
        <ol>
          <li>
            当規程第４条～第７条に定める DAO
            総会投票の管理は、委員会がこれにあたる。
          </li>
          <li>
            DAO
            総会において議長を定める必要がある場合は、委員会長がこれにあたる。
          </li>
          <li>
            DAO
            総会の議事については、技術的に変更が不可な形で議事録を作成または議事を記録する。
          </li>
        </ol>

        <hr />

        <h2>第 4 章　DAO 総会における業務執行社員及び委員会の役割</h2>

        <h3>第１０条(業務執行社員の説明義務)</h3>
        <p>
          業務執行社員は、DAO
          総会において、社員権トークンホルダーから特定の事項について説明を求められた場合には、その事項について必要な説明をしなければならない。ただし、その事項が
          DAO
          総会の目的である事項に関しないものである場合その他正当な理由がある場合として法令で定める場合は、その限りではない。
        </p>

        <h3>第１１条（免責事項）</h3>
        <p>
          業務執行社員は、次に定める免責事項に該当する場合に限り、社員権トークンホルダーから提案された議題の拒否、DAO
          総会により議決された事項の差し止め、及び実施中の事業の差し止めを行うことができる。この場合、業務執行社員は社員権トークンホルダーに対し、当該事項について必要な説明をしなければならない。
        </p>
        <ol>
          <li>法令に基づく場合</li>
          <li>人の生命又は身体の保護のために必要がある場合</li>
          <li>
            国の機関若しくは地方公共団体又はその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合等のやむにやまれない必要性がある場合
          </li>
          <li>本 DAO の定める、本 DAO 定款、規程に違反する場合</li>
        </ol>

        <hr />

        <h2>第 5 章　その他</h2>

        <h3>第１２条（委員会）</h3>
        <ol>
          <li>
            DAO
            総会は委員会がこれを運営するものとし、委員会長をその運営任者とする。
          </li>
          <li>
            第７条及び前項の委員会長は、予め DAO
            総会投票において選任する。委員会長は複数名選任することができる。
          </li>
          <li>
            委員会長が何らかの理由で不在の場合は、業務執行社員がこれに当たる。
          </li>
        </ol>

        <h3>第１３条（特例）</h3>
        <p>
          やむを得ない理由により当規程第６条に基づく決議がなされない場合は、業務執行社員は決議がなされるまでの間、当該決議までに議決された事項に準じ収入支出することができる。ただし、重要な財産の処分及び譲受け並びに多額の借財をすることはできない。
        </p>

        <h3>第１４条（設立時業務執行社員）</h3>
        <p>以下の者を設立時業務執行社員とする。</p>
        <ul>
          {data.initialMembers?.map((member) => (
            <li key={member}>{member}</li>
          ))}
        </ul>

        <h3>第１５条（附則）</h3>
        <p>
          この規則の改廃は、DAO 総会の決議を経て行う。
          <br />
          この規則は、
          {data.enforcementDate
            ? `${data.enforcementDate.year}年${data.enforcementDate.month}月${data.enforcementDate.day}日`
            : "＿＿＿年＿＿月＿＿日"}
          から施行する。
        </p>
      </div>
    </div>
  );
});

GovAgreementPreview.displayName = "GovAgreementPreview";

export default GovAgreementPreview;
