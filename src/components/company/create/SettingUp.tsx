import { Border } from "@/components/decorative/Border";
import { Building } from "@/components/decorative/Building";
import clsx from "clsx";
import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import styles from "@/styles/animation.module.css";
import { useRouter } from "next/router";

export const SettingUp: FC = () => {
  const [isBorder, setIsBorder] = useState<boolean>(true);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setIsBorder(false);
      setIsIdle(true);
    }, 1700);
  }, [isBorder]);

  useEffect(() => {
    if (isIdle) {
      setTimeout(() => {
        setIsIdle(false);
        setIsBorder(true);
      }, 2000);
    }
  }, [isIdle]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     router.push("/dao/");
  //   }, 3000);
  // }, []);

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center gap-4 w-full p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Building className=" aspect-square w-full max-w-40" />
        <p className="text-sm font-semibold text-center text-neutral-minor">
          法人テンプレートを読み込んでいます...
        </p>
      </motion.div>
      {isBorder && (
        <>
          <div className="absolute top-0 left-0 w-[320px] h-[640px] opacity-20">
            <Border />
          </div>
          <div className="absolute bottom-0 right-0 w-[320px] h-[640px] rotate-180 opacity-20 ">
            <Border />
          </div>
        </>
      )}
      <div
        className={clsx(
          styles["blink-shadow"],
          "absolute top-0 left-0 right-0 bottom-0 z-0"
        )}
      />
    </>
  );
};
