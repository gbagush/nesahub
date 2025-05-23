"use client";
import { User } from "@/types/user";
import axios from "axios";

import { useState, useEffect } from "react";
import { UserCard } from "../../users/user-card";
import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";

export const WhoToFollow = () => {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSuggestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users/recomendations");
        setSuggestions(response.data.data);
      } catch (error) {
        addToast({
          description: "Something went wrong while getting suggestions.",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    getSuggestions();
  }, []);

  return (
    <div className="p-4 rounded-xl border border-foreground-100">
      <h2 className="text-lg font-semibold mb-4">Who to follow</h2>
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      )}
      <ul className="space-y-2 text-sm">
        {!loading &&
          suggestions.length > 0 &&
          suggestions.map((user) => <UserCard key={user.id} user={user} />)}
      </ul>
      {!loading && suggestions.length === 0 && (
        <p className="text-sm text-center text-foreground-500 py-8">
          No suggestions found.
        </p>
      )}
    </div>
  );
};
