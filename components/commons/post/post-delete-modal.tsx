"use client";
import axios from "axios";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { addToast } from "@heroui/toast";

export const DeletePostModal = ({
  isOpen,
  onOpenChange,
  postId,
  onDeleteSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  onDeleteSuccess: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeletePost = async () => {
    try {
      setIsSubmitting(true);
      await axios.delete(`/api/posts/${postId}`);
      addToast({ description: "Post deleted successfully.", color: "success" });
      onDeleteSuccess();
      onOpenChange(false);
    } catch (error) {
      addToast({ description: "Failed to delete post.", color: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      className="max-w-md"
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex w-full items-center px-16">
              <button className="-ml-8" onClick={onClose}>
                <ArrowLeft />
              </button>
              <span className="mx-auto">Delete post</span>
            </ModalHeader>
            <ModalBody className="px-16">
              <h4 className="text-2xl font-bold">Delete post?</h4>
              <p className="text-sm text-foreground-500">
                If you delete this post, it&apos;ll be gone for good, including
                all media. No worries if you change your mind, you can always
                cancel.
              </p>
            </ModalBody>
            <ModalFooter className="flex flex-col gap-2 px-16 py-4">
              <Button
                radius="full"
                color="danger"
                className="w-full"
                isLoading={isSubmitting}
                onPress={handleDeletePost}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                radius="full"
                className="w-full"
                onPress={onClose}
              >
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
