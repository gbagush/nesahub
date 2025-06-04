export default function DashboardPage() {
  return (
    <>
      <div className="flex gap-2">
        {[...new Array(4)].map((i, idx) => (
          <div
            key={"first-array-demo-1" + idx}
            className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
          ></div>
        ))}
      </div>
      <div className="flex flex-1 gap-2">
        {[...new Array(2)].map((i, idx) => (
          <div
            key={"second-array-demo-1" + idx}
            className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
          ></div>
        ))}
      </div>
    </>
  );
}
