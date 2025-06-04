"use client";
import axios from "axios";
import { useState, useEffect } from "react";

import Link from "next/link";

import { addToast } from "@heroui/toast";
import {
  Ban,
  Bomb,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  FileWarning,
  Flag,
  HelpCircle,
  Image,
  ShieldAlert,
  UserMinus,
  X,
} from "lucide-react";
import { Chip } from "@heroui/chip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { User } from "@heroui/user";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";

const categoryMap = {
  SPAM: { icon: ShieldAlert, label: "spam" },
  HARASSMENT: { icon: UserMinus, label: "harassment" },
  FALSE_INFORMATION: { icon: FileWarning, label: "false info" },
  HATE_SPEECH: { icon: Ban, label: "hate" },
  NUDITY: { icon: EyeOff, label: "nudity" },
  VIOLENCE: { icon: Bomb, label: "violence" },
  OTHER: { icon: HelpCircle, label: "other" },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [meta, setMeta] = useState({
    currentPage: 1,
    limit: 25,
    totalPages: 0,
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(false);

  const [selectedPost, setSelectedPost] = useState(0);
  const [selectedAction, setSelectedAction] = useState("");

  const actionModal = useDisclosure();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setReports([]);
        setLoading(true);
        const response = await axios.get(
          `/api/dashboard/posts/reports?page=${meta.currentPage}&limit=${meta.limit}`
        );
        setReports(response.data.data);
        setMeta(response.data.meta);
      } catch (error) {
        addToast({
          description:
            "There was an error fetching the reports. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [meta.currentPage]);

  const renderCategoryChips = (categoryCounts: Record<string, number>) => {
    return Object.entries(categoryCounts)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => {
        const categoryInfo = categoryMap[category as keyof typeof categoryMap];
        if (!categoryInfo) return null;

        const IconComponent = categoryInfo.icon;

        return (
          <Chip
            key={category}
            size="sm"
            color="warning"
            variant="faded"
            startContent={<IconComponent size={12} />}
          >
            {count} {categoryInfo.label}
          </Chip>
        );
      });
  };

  return (
    <>
      <h4 className="text-2xl font-semibold mb-4">Post reports</h4>
      <Table
        aria-label="Reports table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              page={meta.currentPage || 1}
              total={meta.totalPages || 1}
              onChange={(page) => setMeta({ ...meta, currentPage: page })}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>AUTHOR</TableColumn>
          <TableColumn>POST</TableColumn>
          <TableColumn>REPORTS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent={loading ? <Spinner /> : "No reports found"}>
          {reports.map((report: any) => (
            <TableRow key={report.post.id}>
              <TableCell>
                {report.post.author && (
                  <User
                    name={`${report.post.author?.first_name} ${report.post.author.last_name}`}
                    description={`@${report.post.author?.username}`}
                    avatarProps={{
                      src: report.post.author?.profile_pict,
                    }}
                  />
                )}
                {report.post.aiBot && (
                  <User
                    name={report.post.aiBot?.name}
                    description={`@${report.post.aiBot?.username}`}
                    avatarProps={{
                      src: report.post.aiBot?.profile_pict,
                    }}
                  />
                )}
              </TableCell>
              <TableCell>
                <div className="flex w-full gap-2 items-center">
                  {report.post.media.map((media: any) => (
                    <Image key={media.id} size={20} />
                  ))}
                  <span className="text-sm truncate max-w-lg block">
                    {report.post.content}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Chip
                    size="sm"
                    color="danger"
                    variant="faded"
                    startContent={<Flag size={12} />}
                  >
                    {report.totalReports} reports
                  </Chip>
                  {renderCategoryChips(report.categoryCounts)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={
                      report.post.author
                        ? `/user/${report.post.author?.username}/posts/${report.post.id}`
                        : report.post.aiBot
                          ? `/bot/${report.post.aiBot?.username}/posts/${report.post.id}`
                          : `#`
                    }
                    target="_blank"
                    className="hover:text-primary transition-all"
                  >
                    <ExternalLink size={16} />
                  </Link>
                  <Link
                    href={`/dashboard/post-reports/${report.post.id}`}
                    className="hover:text-primary transition-all"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    className="hover:text-success transition-all"
                    onClick={() => {
                      setSelectedAction("REVIEWED");
                      setSelectedPost(report.post.id);
                      actionModal.onOpen();
                    }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    className="hover:text-warning transition-all"
                    onClick={() => {
                      setSelectedAction("DISMISSED");
                      setSelectedPost(report.post.id);
                      actionModal.onOpen();
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ActionModal
        isOpen={actionModal.isOpen}
        onOpenChange={actionModal.onOpenChange}
        postId={selectedPost}
        action={selectedAction}
        onActionSuccess={(id: number) => {
          setReports((prev) => prev.filter((r) => r.post.id !== id));
        }}
      />
    </>
  );
}

const ActionModal = ({
  isOpen,
  onOpenChange,
  postId,
  action,
  onActionSuccess,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  postId: number;
  action: string;
  onActionSuccess: (id: number) => void;
}) => {
  const handleAction = async () => {
    try {
      const response = await axios.put(
        `/api/dashboard/posts/${postId}/reports`,
        { action }
      );

      addToast({
        description: response.data.message || "Success update report status",
        color: "success",
      });

      onActionSuccess(postId);
      onOpenChange();
    } catch (error) {
      addToast({
        description: "Failed update report status",
        color: "danger",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Action confirmation
            </ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to mark this report as{" "}
                <strong>{action}</strong>? This action will update the status of
                all pending reports for the post and cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleAction}>
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
