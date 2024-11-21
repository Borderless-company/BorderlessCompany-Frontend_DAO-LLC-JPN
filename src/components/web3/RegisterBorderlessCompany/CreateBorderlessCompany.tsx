import { FormEvent, useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  BaseError,
  useChainId,
  useAccount,
} from "wagmi";
import { RegisterBorderlessCompanyAbi } from "@/utils/abi/RegisterBorderlessCompany.sol/RegisterBorderlessCompany";
import { AccountStateConflictError, Address, stringToHex } from "viem";
import { Button, Checkbox, DatePicker, Input, Link } from "@nextui-org/react";
import {
  getBlockExplorerUrl,
  getRegisterBorderlessCompanyContractAddress,
} from "@/utils/contractAddress";
import { decodeEventLog } from "viem";
import Image from "next/image";
import { useDAO } from "@/hooks/useDAO";
import ImageUploader from "@/components/ImageUploader";
import { useAtom } from "jotai";
import { selectedFileAtom } from "@/atoms";
import { uploadFile } from "@/utils/supabase";
import { useTranslation } from "next-i18next";

export function CreateBorderlessCompany() {
  const { t } = useTranslation("common");
  const [isClient, setIsClient] = useState(false);
  const chainId = useChainId();

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { address } = useAccount();
  const { createDAO } = useDAO();

  const [contractAddress, setContractAddress] = useState<Address>();
  const [blockExplorerUrl, setBlockExplorerUrl] = useState<string>();
  const [companyName, setCompanyName] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [establishmentDate, setEstablishmentDate] = useState<Date>();
  const [daoName, setDaoName] = useState<string>("");
  const [newCompanyAddress, setNewCompanyAddress] = useState<Address>();
  const [established, setEstablished] = useState(false);
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);

  console.log("chainId: ", chainId);
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

    if (!selectedFile) {
      alert(t("Please upload an icon"));
      return;
    }

    if (!daoName_) {
      alert(t("Please enter your DAO name"));
      return;
    }

    if (!companyID_) {
      alert(t("Please enter your company ID"));
      return;
    }

    if (!companyName_) {
      alert(t("Please enter your company name"));
      return;
    }

    if (establishmentDateValue === "") {
      alert(t("Please enter establishment date of your company"));
      return;
    }
    setDaoName(daoName_);
    setCompanyName(companyName_);
    setCompanyId(companyID_);
    setEstablishmentDate(new Date(establishmentDateValue));

    const establishmentDate_ = new Date(establishmentDateValue)
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const confirmedBool = true;

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

  useEffect(() => {
    if (!isSuccess) return;
    const _createDAO = async () => {
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

        const companyAddress = logs[0].args.company_;
        console.log("companyAddres: ", companyAddress);
        setNewCompanyAddress(companyAddress);

        const { publicUrl } = await uploadFile(
          "dao-icon",
          companyAddress,
          selectedFile!
        );

        createDAO({
          address: companyAddress,
          company_id: companyId,
          company_name: companyName,
          dao_icon: publicUrl,
          dao_name: daoName,
          established_by: address,
          establishment_date:
            establishmentDate?.toISOString() || new Date().toISOString(),
        });
        setSelectedFile(undefined);
        setEstablished(true);
      }
    };
    _createDAO();
  }, [isSuccess]);
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
                      {t("DAO has been activated.")}
                    </h3>
                    <div className="mt-4">
                      <p className="text-md text-gray-600">
                        {t(
                          "Let's create your first membership token on the dashboard"
                        )}
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
                    {t("Go to Dashboard")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="mb-8">
                <h2 className="text-4xl font-bold mb-2">
                  {t("Activate your DAO")}
                </h2>
                <p className="text-sm text-gray-600">
                  {t(
                    "Only users registered on the whitelist can activate DAO from this form."
                  )}{" "}
                  <NextLink
                    className=" text-primary underline"
                    target="_blank"
                    href="https://docs.google.com/forms/d/1t3DdeJlV8NCDfr6hY4yynSYupcNDQYBRQMt90GsjXK8"
                  >
                    {t("Join Whitelist")}
                  </NextLink>
                </p>
              </div>
              <form onSubmit={submit} className="flex flex-col gap-6">
                <ImageUploader label={t("Icon")} />
                <div>
                  <label className="font-semibold text-lg">
                    {t("DAO Name")}
                  </label>
                  <Input
                    name="daoName_"
                    key="inside"
                    type="text"
                    label=""
                    labelPlacement="inside"
                    placeholder={t("Enter your DAO name")}
                    variant="bordered"
                    size="lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-lg">
                    {t("Company Name")}
                  </label>
                  <Input
                    name="companyName_"
                    key="inside"
                    type="text"
                    label=""
                    labelPlacement="inside"
                    placeholder={t("e.g.Alice inc.")}
                    variant="bordered"
                    size="lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-lg">
                    {t("Company ID")}
                  </label>
                  <Input
                    name="companyID_"
                    key="inside"
                    type="text"
                    label=""
                    labelPlacement="inside"
                    placeholder={t("Enter your company ID")}
                    variant="bordered"
                    size="lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-lg">
                    {t("Establishment Date")}
                  </label>
                  <DatePicker
                    name="establishmentDate_"
                    label=""
                    className="max-w-[284px]"
                    labelPlacement="inside"
                    variant="bordered"
                    size="lg"
                  />
                </div>

                {/* <div className="flex flex-col gap-2">
                  <label className="font-semibold text-lg">利用規約</label>
                  <div className="overflow-y-scroll h-40 border-2 p-2 rounded-md">
                    <p>
                      ※ 利用規約ダミー利用規約ダミー利用規約ダミー利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー利用規約ダミー利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー 利用規約ダミー 利用規約ダミー
                      利用規約ダミー
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
                </div> */}
                <div className="max-w-[284px] w-full mx-auto mt-6">
                  <Button
                    // isDisabled={isConfirmed !== true}
                    type="submit"
                    color="primary"
                    size="lg"
                    className="font-semibold w-full bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
                  >
                    {isPending ? t("Confirming...") : t("Activate your DAO")}
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
