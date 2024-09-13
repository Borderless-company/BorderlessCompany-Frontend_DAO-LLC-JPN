import { FC } from "react";
import Image from "next/image";
import { Radio, useRadio, cn, RadioProps } from "@nextui-org/react";

type TokenCardProps = {
  name: string;
  imageSrc: string;
  minPrice: number;
  maxPrice?: number;
} & RadioProps;

export const TokenCard: FC<TokenCardProps> = ({
  name,
  imageSrc,
  minPrice,
  maxPrice,
  ...props
}) => {
  const { isSelected } = useRadio(props);
  return (
    <Radio
      value={props.value}
      classNames={{
        base: cn(
          "flex flex-col w-64 h-[340px] flex-shrink-0 p-0 bg-white rounded-2xl shadow-lg overflow-hidden m-0 box-content",
          isSelected &&
            "outline outline-1 outline-teal-500 shadow-lg shadow-teal-500/50 transition-all"
        ),
        wrapper: cn(
          "absolute right-2 top-2 w-6 h-6 rounded-md z-10 m-0 bg-white",
          "border-2 group-data-[selected=true]:border-teal-600"
        ),
        control: cn("bg-teal-600"),
        labelWrapper: "m-0",
      }}
    >
      <div className="w-full aspect-square overflow-hidden">
        <Image
          src={imageSrc}
          alt={name + " image"}
          width={0}
          height={0}
          sizes="100%"
          className="w-full aspect-square object-cover hover:scale-105 transition-all"
        />
      </div>
      <div className="flex flex-col gap-0 p-4 pt-3">
        <h3 className="text-slate-800 text-xl font-semibold">{name}</h3>
        <p className="text-slate-600 text-lg font-semibold">
          {maxPrice ? `¥${minPrice} ~ ¥${maxPrice}` : `¥${minPrice}`}
        </p>
      </div>
    </Radio>
  );
};
