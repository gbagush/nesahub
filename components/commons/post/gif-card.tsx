import { X } from "lucide-react";
import Image from "next/image";

export const GifCard = ({
  url,
  onRemove,
}: {
  url: string;
  onRemove?: () => void;
}) => {
  return (
    <div className="relative inline-block mt-2">
      <Image
        src={url}
        alt="GIF"
        width={256}
        height={0}
        className="h-auto w-64 rounded-lg"
        loading="lazy"
        unoptimized
      />
      <Image
        src="/powered-by-giphy-icon.png"
        alt="Powered by GIPHY"
        width={60}
        height={32}
        className="absolute bottom-2 left-2"
      />

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 bg-foreground bg-opacity-50 rounded-full p-1 hover:bg-opacity-100 transition"
          aria-label="Remove GIF"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
