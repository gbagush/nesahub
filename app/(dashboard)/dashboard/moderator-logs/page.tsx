"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { addToast } from "@heroui/toast";
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

import {
  Trash2,
  Ban,
  Flag,
  AlertCircle,
  FileWarning,
  EyeOff,
  Bomb,
  HelpCircle,
  CheckSquare,
  UserMinus,
} from "lucide-react";

const actionMap = {
  DELETE_POST: { icon: Trash2, label: "Delete Post", color: "danger" },
  REVIEWED_REPORT: {
    icon: CheckSquare,
    label: "Reviewed Report",
    color: "success",
  },
  DISMISSED_REPORT: { icon: Flag, label: "Dismissed Report", color: "warning" },
  BAN_USER: { icon: Ban, label: "Ban User", color: "secondary" },
  UNBAN_USER: { icon: Ban, label: "Unban User", color: "success" },
};

// Map for Violation Types with Icons
const violationTypeMap = {
  SPAM: { icon: AlertCircle, label: "Spam", color: "warning" },
  HARASSMENT: { icon: UserMinus, label: "Harassment", color: "danger" },
  FALSE_INFORMATION: {
    icon: FileWarning,
    label: "False Information",
    color: "primary",
  },
  HATE_SPEECH: { icon: Ban, label: "Hate Speech", color: "danger" },
  NUDITY: { icon: EyeOff, label: "Nudity", color: "warning" },
  VIOLENCE: { icon: Bomb, label: "Violence", color: "danger" },
  OTHER: { icon: HelpCircle, label: "Other", color: "default" },
};

export default function ModeratorActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalPage: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/dashboard/moderator-logs?page=${page}`);
      setLogs(res.data.data || []);
      setMeta(res.data.meta || { page: 1, limit: 10, totalPage: 1, total: 0 });
    } catch (error) {
      addToast({
        description: "Failed to fetch moderator logs",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(meta.page);
  }, [meta.page]);

  return (
    <>
      <h4 className="text-2xl font-semibold mb-4">Moderator Activity Logs</h4>

      <Table
        aria-label="Moderator activity logs"
        bottomContent={
          <div className="flex w-full justify-center mt-4">
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
          <TableColumn>Moderator</TableColumn>
          <TableColumn>Action</TableColumn>
          <TableColumn>Violation Type</TableColumn>
          <TableColumn>Reason</TableColumn>
          <TableColumn>Timestamp</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={loading ? <Spinner /> : "No activity logs found"}
        >
          {logs.map((log) => {
            const actionInfo = actionMap[
              log.action as keyof typeof actionMap
            ] || {
              icon: Flag,
              label: log.action,
              color: "default",
            };
            const violationInfo = violationTypeMap[
              log.violation_type as keyof typeof violationTypeMap
            ] || {
              icon: HelpCircle,
              label: log.violation_type,
              color: "default",
            };

            return (
              <TableRow key={log.id}>
                <TableCell>
                  <User
                    name={`${log.moderator.first_name} ${log.moderator.last_name}`}
                    description={`@${log.moderator.username}`}
                    avatarProps={{
                      src: log.moderator.profile_pict,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    color={actionInfo.color as any}
                    variant="flat"
                    startContent={<actionInfo.icon size={12} />}
                  >
                    {actionInfo.label}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    color={violationInfo.color as any}
                    variant="flat"
                    startContent={<violationInfo.icon size={12} />}
                  >
                    {violationInfo.label}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-sm line-clamp-2 max-w-xs">
                    {log.reason || "No reason provided"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
