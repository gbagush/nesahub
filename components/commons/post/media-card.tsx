"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { X } from "lucide-react";

export const MediaCard = ({
  path,
  source,
  alt,
  span = false,
}: {
  path: string;
  source: "GIPHY" | "USERCONTENT";
  alt?: string;
  span?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const src =
    source === "USERCONTENT"
      ? `${process.env.NEXT_PUBLIC_FTP_BASE_URL}${path}`
      : path;

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`relative overflow-hidden rounded-lg cursor-pointer ${
          span ? "col-span-2" : ""
        }`}
      >
        <Image
          src={src}
          alt={alt || "Post media"}
          width={512}
          height={512}
          className={`w-full h-auto object-cover ${
            source === "GIPHY" ? "w-64" : ""
          }`}
          loading="lazy"
          unoptimized={source === "GIPHY"}
        />

        {source === "GIPHY" && (
          <Image
            src="/powered-by-giphy-icon.png"
            alt="Powered by GIPHY"
            width={60}
            height={32}
            className="absolute bottom-2 left-2"
          />
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="2xl"
        hideCloseButton
        classNames={{
          body: "p-0",
        }}
      >
        <ModalContent>
          <ModalBody>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <Image
                src={src}
                alt={alt || "Full media"}
                width={1024}
                height={1024}
                className="w-full h-auto object-contain"
                unoptimized={source === "GIPHY"}
              />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-background bg-foreground rounded-full p-1 opacity-80"
              >
                <X size={20} />
              </button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
