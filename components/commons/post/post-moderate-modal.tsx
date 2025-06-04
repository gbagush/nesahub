"use client";
import axios from "axios";

import { cn } from "@/lib/utils";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, Radio } from "@heroui/radio";
import { useState } from "react";
import { Textarea } from "@heroui/input";

import { reportCategories } from "@/config/site";
import { addToast } from "@heroui/toast";

export const CustomRadio = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row-reverse cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
      }}
    >
      {children}
    </Radio>
  );
};

export const PostModerateModal = ({
  isOpen,
  onOpenChange,
  postId,
  onModerateSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  onModerateSuccess: () => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [details, setDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!postId || !selectedCategory) return;

    setIsSubmitting(true);
    try {
      await axios.delete(`/api/dashboard/posts/${postId}`, {
        data: {
          violation_type: selectedCategory,
          reason: details,
        },
      });

      addToast({
        description:
          "Post moderate successfully. Thanks for helping keep our community safe and healthy.",
        color: "success",
      });

      setSelectedCategory(null);
      setDetails("");
      onOpenChange(false);
      onModerateSuccess();
    } catch (err: any) {
      addToast({
        description: err.response?.data?.message || "Failed to moderate post.",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      className="max-w-xl"
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex w-full items-center px-16">
              <button className="-ml-8" onClick={onClose}>
                <ArrowLeft />
              </button>
              <span className="mx-auto">Moderate post</span>
            </ModalHeader>
            <ModalBody className="px-16">
              <h4 className="text-2xl font-bold">
                What kind of violation is this post?
              </h4>
              <RadioGroup
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                {reportCategories.map((category) => (
                  <CustomRadio
                    key={category.value}
                    value={category.value}
                    description={category.description}
                  >
                    {category.title}
                  </CustomRadio>
                ))}
              </RadioGroup>

              <div className="mt-4">
                <Textarea
                  placeholder="Please provide more details"
                  radius="sm"
                  maxLength={500}
                  minRows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
            </ModalBody>
            <ModalFooter className="px-16 py-4">
              <Button
                variant="ghost"
                radius="full"
                className="w-full"
                isLoading={isSubmitting}
                onPress={handleSubmit}
              >
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
