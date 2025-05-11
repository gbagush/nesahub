"use client";

export const Navbar = () => {
  return (
    <div className="sticky top-0 z-10 flex h-16 backdrop-blur-md border-y border-foreground-100">
      <div className="flex w-full items-center justify-center cursor-pointer hover:bg-foreground/15">
        For you
      </div>
      <div className="flex w-full items-center justify-center cursor-pointer hover:bg-foreground/15">
        Following
      </div>
    </div>
  );
};
