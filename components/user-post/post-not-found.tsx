"use client";

import { Navbar } from "../commons/navigations/social/navbar";

export const PostNotFound = () => {
  return (
    <div>
      <Navbar title="Post" />
      <p className="text-center py-4">
        The post you are looking for does not exist.
      </p>
    </div>
  );
};
