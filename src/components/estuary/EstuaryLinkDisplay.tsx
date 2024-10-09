import { useEstuary } from "@/hooks/useEstuary";
import { Link } from "@nextui-org/react";
import React, { FC } from "react";

export type EstuaryLinkDisplayProps = {
  estId: string;
};

export const EstuaryLinkDisplay: FC<EstuaryLinkDisplayProps> = ({ estId }) => {
  const { estuary } = useEstuary(estId);

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        color="primary"
        isExternal
        showAnchorIcon
        href={(estuary?.estuary_link as string) || ""}
      >
        {estuary?.estuary_link}
      </Link>
      <div className="flex flex-col gap-2">
        <h2 className="text-md font-semibold">埋め込みコード</h2>
        <div className="p-4 rounded-2xl bg-stone-100 border-1 border-stone-300">
          <p className="font-mono text-sm">
            &lt;iframe style=&quot;border: 0px solid rgba(0, 0, 0, 0.1);
            border-radius: 28px;&quot; width=&quot;100%&quot;
            height=&quot;800px&quot; src=&quot;{estuary?.estuary_link}&quot;
            allowfullscreen&gt;&lt;/iframe&gt;
          </p>
        </div>
        <p className=" text-[14px] font-sans font-medium">
          このコードをコピーして自社サイトへ貼り付けてください。
        </p>
      </div>
    </div>
  );
};
