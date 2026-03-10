import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
  label?: string;
}

const ImageUpload = ({ value, onChange, label = "Imagem" }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Apenas JPG e PNG são aceitos.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Imagem muito grande. O tamanho máximo é 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border bg-muted">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 size-6"
            onClick={() => onChange(undefined)}
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 border-dashed flex flex-col gap-1"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">JPG ou PNG (máx. 2MB)</span>
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
