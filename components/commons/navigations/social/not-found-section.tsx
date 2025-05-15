"use client";
import { Navbar } from "./navbar";

export const NotFoundSection = ({
  page,
  title,
  description,
  hideNavbar = false,
}: {
  page: string;
  title: string;
  description?: string;
  hideNavbar?: boolean;
}) => {
  return (
    <div>
      {!hideNavbar && <Navbar title={page} />}
      <div className="p-24">
        <h4 className="text-2xl font-bold mb-2">{title}</h4>
        <p className="text-foreground-500">{description}</p>
      </div>
    </div>
  );
};
