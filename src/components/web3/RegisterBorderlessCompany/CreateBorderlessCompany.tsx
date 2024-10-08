import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
} from "wagmi";
import { RegisterBorderlessCompanyAbi } from "@/utils/abi/RegisterBorderlessCompany.sol/RegisterBorderlessCompany";
import { Address, stringToHex } from "viem";
import { Button, Checkbox, DatePicker, Input, Link } from "@nextui-org/react";
import {
  getBlockExplorerUrl,
  getRegisterBorderlessCompanyContractAddress,
} from "@/utils/contractAddress";
import { decodeEventLog } from "viem";
import Image from "next/image";

export function CreateBorderlessCompany() {
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [contractAddress, setContractAddress] = useState<Address>();
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();
  const [companyName, setCompanyName] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [daoName, setDaoName] = useState<string>("");
  const [newCompanyAddress, setNewCompanyAddress] = useState<Address>();
  const [established, setEstablished] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    if (!contractAddress) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const companyID_ = formData.get("companyID_") as string;
    const establishmentDateValue = formData.get("establishmentDate_") as string;
    const companyName_ = formData.get("companyName_") as string;
    const daoName_ = formData.get("daoName_") as string;

    if (!daoName_) {
      alert("DAOの名称が未入力です");
      return;
    }

    if (!companyID_) {
      alert("法人番号が未入力です");
      return;
    }

    if (!companyName_) {
      alert("会社名が未入力です");
      return;
    }

    if (!companyID_) {
      alert("会社IDが未入力です");
      return;
    }

    if (establishmentDateValue === "") {
      alert("設立日が未入力です。");
      return;
    }
    const establishmentDate_ = new Date(establishmentDateValue)
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const confirmedBool = isConfirmed;

    setDaoName(daoName_);
    setCompanyName(companyName_);
    setCompanyId(companyID_);

    writeContract({
      address: contractAddress,
      abi: RegisterBorderlessCompanyAbi,
      functionName: "createBorderlessCompany",
      args: [
        stringToHex(companyID_),
        stringToHex(establishmentDate_),
        confirmedBool,
      ],
    });
  }

  const {
    data,
    isLoading: isLoading,
    isSuccess: isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setContractAddress(getRegisterBorderlessCompanyContractAddress(chainId));
    setBlockExplorerUrl(getBlockExplorerUrl(chainId));
  }, [chainId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addCompany = useCallback(
    async (
      companyAddress: Address,
      daoName: string,
      companyName: string,
      companyId: string
    ) => {
      const res = await fetch(`/api/companies/${companyAddress}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ daoName, companyName, companyId }),
      });
      const data = await res.json();
      console.log(data);
      setEstablished(true);
      return data;
    },
    []
  );

  useEffect(() => {
    if (!isSuccess) return;
    console.log("isSuccess", data);

    const logs: any[] = data.logs
      .map((log) => {
        try {
          return decodeEventLog({
            abi: RegisterBorderlessCompanyAbi,
            data: log.data,
            topics: (log as any).topics,
          });
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // logs[0].args.founder_;
    // logs[0].args.company_;
    // logs[0].args.companyIndex_;

    if (logs.length > 0) {
      console.log(logs[0].args);
      setNewCompanyAddress(logs[0].args.company_);
      addCompany(logs[0].args.company_, daoName, companyName, companyId);
    }
  }, [addCompany, companyId, companyName, daoName, data, isSuccess]);
  return (
    <>
      {isClient && (
        <>
          {established ? (
            <>
              <div
                className="max-w-xl mx-auto flex flex-col justify-center z-20 bg-white mb-24"
                style={{ height: "calc(100dvh - 4rem - 133px)" }}
              >
                <div>
                  <div className="mx-auto flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="400"
                      width="400"
                    >
                      <g style={{ order: "-1" }}>
                        <polygon
                          transform="rotate(45 200 200)"
                          stroke-width="2"
                          stroke="#0d9488"
                          fill="none"
                          points="140,140 296,100 260,260 100,300"
                          id="bounce"
                        ></polygon>
                        <polygon
                          transform="rotate(45 200 200)"
                          stroke-width="2"
                          stroke="#0d9488"
                          fill="none"
                          points="140,140 296,100 260,260 100,300"
                          id="bounce2"
                        ></polygon>
                        <polygon
                          transform="rotate(45 200 200)"
                          stroke-width="4"
                          stroke=""
                          fill="#414750"
                          points="140,140 300,100 260,260 100,300"
                        ></polygon>
                        <polygon
                          stroke-width="4"
                          stroke=""
                          fill="url(#gradiente)"
                          points="200,140 300,200 200,260 100,200"
                        ></polygon>
                        <defs>
                          <linearGradient
                            y2="100%"
                            x2="10%"
                            y1="0%"
                            x1="0%"
                            id="gradiente"
                          >
                            <stop
                              style={{ stopColor: "#1e2026", stopOpacity: 1 }}
                              offset="20%"
                            ></stop>
                            <stop
                              style={{
                                stopColor: "#414750",
                                stopOpacity: 1,
                              }}
                              offset="60%"
                            ></stop>
                          </linearGradient>
                        </defs>
                        <polygon
                          transform="translate(40, 62)"
                          stroke-width="4"
                          stroke=""
                          fill="#0d9488"
                          points="160,100 160,150 160,198 80,150"
                        ></polygon>
                        <polygon
                          transform="translate(40, 62)"
                          stroke-width="4"
                          stroke=""
                          fill="url(#gradiente2)"
                          points="80,-80 160,-80 160,198 80,150"
                        ></polygon>
                        <defs>
                          <linearGradient
                            y2="100%"
                            x2="0%"
                            y1="-17%"
                            x1="10%"
                            id="gradiente2"
                          >
                            <stop
                              style={{ stopColor: "#d3a51000", stopOpacity: 1 }}
                              offset="20%"
                            ></stop>
                            <stop
                              style={{
                                stopColor: "#d3a51054",
                                stopOpacity: 1,
                              }}
                              offset="100%"
                              id="animatedStop"
                            ></stop>
                          </linearGradient>
                        </defs>
                        <polygon
                          transform="rotate(180 200 200) translate(40, 40)"
                          stroke-width="4"
                          stroke=""
                          fill="#0d9488"
                          points="160,100 160,150 160,198 80,150"
                        ></polygon>
                        <polygon
                          transform="rotate(0 200 200) translate(120, 40)"
                          stroke-width="4"
                          stroke=""
                          fill="url(#gradiente3)"
                          points="80,-80 160,-80 160,170 80,220.4"
                        ></polygon>
                        <defs>
                          <linearGradient
                            y2="100%"
                            x2="10%"
                            y1="0%"
                            x1="0%"
                            id="gradiente3"
                          >
                            <stop
                              style={{ stopColor: "#d3a51000", stopOpacity: 1 }}
                              offset="20%"
                            ></stop>
                            <stop
                              style={{
                                stopColor: "#d3a51054",
                                stopOpacity: 1,
                              }}
                              offset="100%"
                              id="animatedStop"
                            ></stop>
                          </linearGradient>
                        </defs>
                        <polygon
                          transform="rotate(45 200 200) translate(160, 190)"
                          stroke-width="4"
                          stroke=""
                          fill="#ffe4a1"
                          points="10,0 10,10 0,10 0,0"
                          id="particles"
                        ></polygon>
                        <polygon
                          transform="rotate(45 200 200) translate(160, 110)"
                          stroke-width="4"
                          stroke=""
                          fill="#ccb069"
                          points="12,0 12,12 0,12 0,0"
                          id="particles"
                        ></polygon>
                        <polygon
                          transform="rotate(45 200 200) translate(140, 160)"
                          stroke-width="4"
                          stroke=""
                          fill="#fff"
                          points="4,0 4,4 0,4 0,0"
                          id="particles"
                        ></polygon>
                        <polygon
                          stroke-width="4"
                          stroke=""
                          fill="#292d34"
                          points="59,199.6 200,284 200,344 59,260"
                        ></polygon>
                        <polygon
                          transform="translate(100, 184)"
                          stroke-width="4"
                          stroke=""
                          fill="#1f2127"
                          points="100,100 241,16 241,70 100,160"
                        ></polygon>
                      </g>
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-4xl font-bold leading-6 text-gray-900">
                      DAOが起動しました！
                    </h3>
                    <div className="mt-4">
                      <p className="text-md text-gray-600">
                        これでDAOの起動は完了です。次にDAOのダッシュボードからメンバーシップトークンを発行して、メンバーを追加してみましょう。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <Button
                    as={Link}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    href={`/dao/${newCompanyAddress}`}
                    color="secondary"
                    size="lg"
                  >
                    DAOのダッシュボードへ
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="mb-8">
                <h2 className="text-4xl font-bold mb-2">DAOの起動</h2>
                <p className="text-sm text-gray-600">
                  ホワイトリストに登録されたユーザーのみこのフォームからDAOを起動できます。
                </p>
              </div>
              <form onSubmit={submit} className="flex flex-col gap-6">
                <div>
                  <label className="font-semibold text-lg">DAOの名称</label>
                  <Input
                    name="daoName_"
                    key="inside"
                    type="text"
                    label=""
                    labelPlacement="inside"
                    placeholder="DAOの名称を入力"
                    description="DAOの名称です。"
                    variant="bordered"
                    size="lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-lg">合同会社名称</label>
                  <Input
                    name="companyName_"
                    key="inside"
                    type="text"
                    label=""
                    labelPlacement="inside"
                    placeholder="会社名を入力"
                    description="合同会社の名前です。"
                    variant="bordered"
                    size="lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-lg">法人番号</label>
                  <Input
                    name="companyID_"
                    key="inside"
                    type="text"
                    label=""
                    labelPlacement="inside"
                    placeholder="法人番号を入力"
                    description="会社の法人番号です。DAOの設立時に利用するIDにも用います。"
                    variant="bordered"
                    size="lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-lg">DAO設立日</label>
                  <DatePicker
                    name="establishmentDate_"
                    label=""
                    className="max-w-[284px]"
                    description="DAOの設立日です。"
                    labelPlacement="inside"
                    variant="bordered"
                    size="lg"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-lg">利用規約</label>
                  <div className="overflow-y-scroll h-40 border-2 p-2 rounded-md">
                    <p>
                     利用規約
この利用規約（以下，「本規約」といいます。）は，ボーダーレス合同会社（以下，「当社」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。

第1条（適用）
本規約は，ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
当社は本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。
本規約の規定が前条の個別規定の規定と矛盾する場合には，個別規定において特段の定めなき限り，個別規定の規定が優先されるものとします。
第2条（利用登録）
本サービスにおいては，登録希望者が本規約に同意の上，当社の定める方法によって利用登録を申請し，当社がこれを承認することによって，利用登録が完了するものとします。
当社は，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。
利用登録の申請に際して虚偽の事項を届け出た場合
本規約に違反したことがある者からの申請である場合
その他，当社が利用登録を相当でないと判断した場合
第3条（ユーザーIDおよびパスワードの管理）
ユーザーは，自己の責任において，本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
ユーザーは，いかなる場合にも，ユーザーIDおよびパスワードを第三者に譲渡または貸与し，もしくは第三者と共用することはできません。当社は，ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には，そのユーザーIDを登録しているユーザー自身による利用とみなします。
ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は，当社に故意又は重大な過失がある場合を除き，当社は一切の責任を負わないものとします。
第4条（利用料金および支払方法）
ユーザーは，本サービスの有料部分の対価として，当社が別途定め，本ウェブサイトに表示する利用料金を，当社が指定する方法により支払うものとします。
ユーザーが利用料金の支払を遅滞した場合には，ユーザーは年14．6％の割合による遅延損害金を支払うものとします。
第5条（禁止事項）
ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。

法令または公序良俗に違反する行為
犯罪行為に関連する行為
本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為
当社，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為
本サービスによって得られた情報を商業的に利用する行為
当社のサービスの運営を妨害するおそれのある行為
不正アクセスをし，またはこれを試みる行為
他のユーザーに関する個人情報等を収集または蓄積する行為
不正な目的を持って本サービスを利用する行為
本サービスの他のユーザーまたはその他の第三者に不利益，損害，不快感を与える行為
他のユーザーに成りすます行為
当社が許諾しない本サービス上での宣伝，広告，勧誘，または営業行為
面識のない異性との出会いを目的とした行為
当社のサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為
その他，当社が不適切と判断する行為
第6条（本サービスの提供の停止等）
当社は，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合
コンピュータまたは通信回線等が事故により停止した場合
その他，当社が本サービスの提供が困難と判断した場合
当社は，本サービスの提供の停止または中断により，ユーザーまたは第三者が被ったいかなる不利益または損害についても，一切の責任を負わないものとします。
第7条（利用制限および登録抹消）
当社は，ユーザーが以下のいずれかに該当する場合には，事前の通知なく，ユーザーに対して，本サービスの全部もしくは一部の利用を制限し，またはユーザーとしての登録を抹消することができるものとします。
本規約のいずれかの条項に違反した場合
登録事項に虚偽の事実があることが判明した場合
料金等の支払債務の不履行があった場合
当社からの連絡に対し，一定期間返答がない場合
本サービスについて，最終の利用から一定期間利用がない場合
その他，当社が本サービスの利用を適当でないと判断した場合
当社は，本条に基づき当社が行った行為によりユーザーに生じた損害について，一切の責任を負いません。
第8条（退会）
ユーザーは，当社の定める退会手続により，本サービスから退会できるものとします。

第9条（保証の否認および免責事項）
当社は，本サービスに事実上または法律上の瑕疵（安全性，信頼性，正確性，完全性，有効性，特定の目的への適合性，セキュリティなどに関する欠陥，エラーやバグ，権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
当社は，本サービスに起因してユーザーに生じたあらゆる損害について、当社の故意又は重過失による場合を除き、一切の責任を負いません。ただし，本サービスに関する当社とユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合，この免責規定は適用されません。
前項ただし書に定める場合であっても，当社は，当社の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害（当社またはユーザーが損害発生につき予見し，または予見し得た場合を含みます。）について一切の責任を負いません。また，当社の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害の賠償は，ユーザーから当該損害が発生した月に受領した利用料の額を上限とします。
当社は，本サービスに関して，ユーザーと他のユーザーまたは第三者との間において生じた取引，連絡または紛争等について一切責任を負いません。
第10条（サービス内容の変更等）
当社は，ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。

第11条（利用規約の変更）
当社は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
本規約の変更がユーザーの一般の利益に適合するとき。
本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき。
当社はユーザーに対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨及び変更後の本規約の内容並びにその効力発生時期を通知します。
第12条（個人情報の取扱い）
当社は，本サービスの利用によって取得する個人情報については，当社「プライバシーポリシー」に従い適切に取り扱うものとします。

第13条（通知または連絡）
ユーザーと当社との間の通知または連絡は，当社の定める方法によって行うものとします。当社は,ユーザーから,当社が別途定める方式に従った変更届け出がない限り,現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い,これらは,発信時にユーザーへ到達したものとみなします。

第14条（権利義務の譲渡の禁止）
ユーザーは，当社の書面による事前の承諾なく，利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し，または担保に供することはできません。

第15条（準拠法・裁判管轄）
本規約の解釈にあたっては，日本法を準拠法とします。
本サービスに関して紛争が生じた場合には，当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
以上

                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <Checkbox
                      isSelected={isConfirmed}
                      onValueChange={setIsConfirmed}
                    >
                      利用規約に同意する
                    </Checkbox>
                  </div>
                </div>
                <div className="max-w-[284px] w-full mx-auto mt-6">
                  <Button
                    isDisabled={isConfirmed !== true}
                    type="submit"
                    color="primary"
                    size="lg"
                    className="font-semibold w-full bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
                  >
                    {isPending ? "Confirming..." : "DAOを起動"}
                  </Button>
                </div>
              </form>
              {hash && (
                <a
                  className="text-blue-500"
                  href={blockExplorerUrl + "/tx/" + hash}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Transaction Hash: {hash}
                </a>
              )}
              {isLoading && <div>Waiting for confirmation...</div>}
              {isSuccess && <div>Transaction confirmed.</div>}
              {error && (
                <div className="text-red-500">
                  {(error as BaseError).shortMessage || error.message}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
