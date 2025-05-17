"use client";
import axios from "axios";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { addToast } from "@heroui/toast";
import { ArrowLeft } from "lucide-react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Textarea } from "@heroui/input";

import Logo from "@/public/logo.svg";
import Image from "next/image";

import type { User } from "@/types/user";

export const EditProfileModal = ({ user }: { user: User }) => {
  const [bio, setBio] = useState(user.bio || "");
  const [gender, setGender] = useState(user.gender);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    console.log(user.bio);
    console.log(user.gender);
  }, [user]);

  const handleProfileUpdate = async () => {
    if (gender !== "MALE" && gender !== "FEMALE" && gender !== "NOT_SET") {
      addToast({
        description: "Invalid gender selection.",
        color: "danger",
      });

      return;
    }
    try {
      await axios.put("/api/profile", { bio, gender });

      addToast({
        title: "Profile updated successfully",
        color: "success",
      });
    } catch (error: any) {
      addToast({
        description:
          error.response?.data?.message || "Failed to update user profile.",
        color: "danger",
      });
    }
  };

  return (
    <>
      <Button onPress={onOpen} variant="ghost" radius="full">
        Edit profile
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
        <ModalContent className="px-8">
          {(onClose) => (
            <>
              <ModalHeader className="flex w-full items-center">
                <button className="-ml-8" onClick={onClose}>
                  <ArrowLeft />
                </button>
                <Image
                  src={Logo}
                  height={28}
                  alt="Nesahub Logo"
                  className="mx-auto"
                />
              </ModalHeader>
              <ModalBody className="mb-16">
                <h4 className="text-xl font-bold">Describe yourself</h4>
                <p className="text-foreground-500 text-sm">
                  What makes you special? Don&apos;t think too hard, just have
                  fun with it.
                </p>
                <Textarea
                  placeholder="Your bio"
                  variant="bordered"
                  description={`${bio.length}/160`}
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />

                <p className="text-foreground-500 text-sm">
                  Let us know how you identify — feel free to choose what fits
                  you best.
                </p>
                <Autocomplete
                  placeholder="Gender"
                  variant="bordered"
                  selectedKey={gender}
                  onSelectionChange={setGender as any}
                  aria-label="Gender selector"
                >
                  <AutocompleteItem key="MALE">Male</AutocompleteItem>
                  <AutocompleteItem key="FEMALE">Female</AutocompleteItem>
                  <AutocompleteItem key="NOT_SET">
                    Prefer not to say
                  </AutocompleteItem>
                </Autocomplete>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="ghost"
                  radius="full"
                  className="w-full"
                  onPress={handleProfileUpdate}
                  isDisabled={
                    gender !== "MALE" &&
                    gender !== "FEMALE" &&
                    gender !== "NOT_SET"
                  }
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
