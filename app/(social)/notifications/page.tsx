"use client";
import axios from "axios";

import { Suspense, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "next/navigation";

import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";

import Link from "next/link";
import { Navbar } from "@/components/commons/navigations/social/navbar";
import { NotFoundSection } from "@/components/commons/navigations/social/not-found-section";
import { NotificationCard } from "@/components/commons/notification/notification-card";

import type { Notification } from "@/types/notification";

const LIMIT = 25;

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type");

  const fetchNotifications = async (currentPage = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/notifications?type=${typeFilter || ""}&page=${currentPage}&limit=${LIMIT}`
      );
      const newNotifications = response.data.data;

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const filtered = newNotifications.filter(
          (n: Notification) => !existingIds.has(n.id)
        );
        return [...prev, ...filtered];
      });

      if (newNotifications.length < LIMIT) setHasMore(false);
    } catch (error) {
      addToast({
        description: "Failed getting notifications. Please try again later.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNotifications([]);
    setPage(1);
    setHasMore(true);
  }, [typeFilter]);

  useEffect(() => {
    fetchNotifications(page);
  }, [page, typeFilter]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, hasMore]);

  return (
    <>
      <Navbar
        title="Notifications"
        endContent={
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { label: "All", value: null, href: "/notifications" },
              {
                label: "Follows",
                value: "NEW_FOLLOWER",
                href: "?type=NEW_FOLLOWER",
              },
              {
                label: "Replies",
                value: "POST_REPLY",
                href: "?type=POST_REPLY",
              },
              {
                label: "Mentions",
                value: "POST_MENTION",
                href: "?type=POST_MENTION",
              },
              {
                label: "System",
                value: "SYSTEM_MESSAGE",
                href: "?type=SYSTEM_MESSAGE",
              },
            ].map(({ label, value, href }) => (
              <Chip
                key={value || "all"}
                as={Link}
                href={href}
                variant={typeFilter === value ? "faded" : "bordered"}
              >
                {label}
              </Chip>
            ))}
          </div>
        }
      />

      <div className="flex flex-col">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}

        {loading && (
          <div className="flex w-full h-24 items-center justify-center">
            <Spinner />
          </div>
        )}

        {!loading && hasMore && <div ref={ref} className="h-10 w-full" />}

        {!loading && notifications.length === 0 && (
          <NotFoundSection
            page="Notifications"
            title="No notifications yet"
            description="Stay tuned — you'll get notified when someone follows you or interacts with your posts."
            hideNavbar
          />
        )}
      </div>
    </>
  );
};

export default function NotificationsPage() {
  return (
    <Suspense>
      <NotificationsContent />
    </Suspense>
  );
}
