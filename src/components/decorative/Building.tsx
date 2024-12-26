import { ComponentPropsWithoutRef, FC } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export type BuildingProps = {} & ComponentPropsWithoutRef<"div">;

export const Building: FC<BuildingProps> = ({ ...props }) => {
  return (
    <div {...props}>
      <DotLottieReact
        src="/lotties/building_no_bg.lottie"
        loop={true}
        autoplay={true}
        backgroundColor="transparent"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
