import Image from "next/image";

export const GifCard = ({ url }: { url: string }) => {
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
    </div>
  );
};
