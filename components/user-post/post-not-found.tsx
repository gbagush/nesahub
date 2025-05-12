"use client";

import { SocialNav } from "../navigations/social/social-nav";

export const PostNotFound = () => {
  return (
    <div>
      <SocialNav title="Post" />
      <p className="text-center py-4">
        The post you are looking for does not exist.
      </p>
    </div>
  );
};
