import { selectedFileAtom } from "@/atoms";
import { useAtom } from "jotai";
import { useTranslation } from "next-i18next";
import React, { FC, useState } from "react";
import { FileTrigger, Button } from "react-aria-components";

export type ImageUploaderProps = {
  label: string;
};

const ImageUploader: FC<ImageUploaderProps> = ({ label }) => {
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [preview, setPreview] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);

      // プレビュー用のURLを作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-lg font-semibold ">{label}</p>
      {selectedFile && (
        <div>
          {preview && (
            <div>
              <img
                src={preview}
                alt="プレビュー"
                style={{
                  maxWidth: "160px",
                  maxHeight: "160px",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
        </div>
      )}
      <FileTrigger
        acceptedFileTypes={["image/png", "image/jpeg"]}
        onSelect={handleSelect}
      >
        <Button className="h-12 w-fit px-4 bg-primary text-white rounded-xl text-sm hover:scale-[1.02] transition-all font-semibold">
          {selectedFile ? t("Upload Image again") : t("Upload Image")}
        </Button>
      </FileTrigger>
    </div>
  );
};

export default ImageUploader;
