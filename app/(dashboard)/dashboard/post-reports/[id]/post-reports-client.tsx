"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";

const categoryMap = {
  SPAM: { label: "Spam", color: "warning" },
  HARASSMENT: { label: "Harassment", color: "danger" },
  FALSE_INFORMATION: { label: "False Info", color: "secondary" },
  HATE_SPEECH: { label: "Hate Speech", color: "danger" },
  NUDITY: { label: "Nudity", color: "warning" },
  VIOLENCE: { label: "Violence", color: "danger" },
  OTHER: { label: "Other", color: "default" },
};

export const PostReportsClient = ({ id }: { id: string }) => {
  const router = useRouter();

  const [reports, setReports] = useState<any[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPage: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/dashboard/posts/${id}/reports?page=${page}`
      );
      setReports(res.data.data || []);
      setMeta(res.data.meta || { page: 1, limit: 10, totalPage: 1, total: 0 });
    } catch (error) {
      addToast({ description: "Failed to fetch reports", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(meta.page);
  }, [meta.page]);

  return (
    <>
      <button
        className="group flex items-center gap-4 transition-all cursor-pointer mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="transition-all duration-300 ease-in-out group-hover:-ml-2 group-hover:mr-2" />
        <h4 className="text-2xl font-semibold">Post reports</h4>
      </button>

      <Table
        aria-label="Post reports table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              page={meta.page}
              total={meta.totalPage}
              onChange={(page) => setMeta((prev) => ({ ...prev, page }))}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>Reporter</TableColumn>
          <TableColumn>Report ID</TableColumn>
          <TableColumn>Category</TableColumn>
          <TableColumn>Reason</TableColumn>
          <TableColumn>Reported At</TableColumn>
        </TableHeader>
        <TableBody emptyContent={loading ? <Spinner /> : "No reports found"}>
          {reports.map((report) => {
            const categoryInfo = categoryMap[
              report.category as keyof typeof categoryMap
            ] || {
              label: report.category,
              color: "default",
            };
            return (
              <TableRow key={report.id}>
                <TableCell>
                  <User
                    name={`${report.user.first_name} ${report.user.last_name}`}
                    description={`@${report.user.username}`}
                    avatarProps={{
                      src: report.user.profile_pict,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-default-500">{report.id}</span>
                </TableCell>
                <TableCell>
                  <Chip
                    color={categoryInfo.color as any}
                    variant="flat"
                    startContent={<Flag size={12} />}
                  >
                    {categoryInfo.label}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-sm line-clamp-2 max-w-xs">
                    {report.reason || "No reason provided"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
