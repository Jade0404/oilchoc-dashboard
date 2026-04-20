"use client";

import dynamic from "next/dynamic";

const StressTester = dynamic(() => import("./StressTester"), {
  ssr: false,
  loading: () => <ToolSkeleton label="A" />,
});

const ReformOptimizer = dynamic(() => import("./ReformOptimizer"), {
  ssr: false,
  loading: () => <ToolSkeleton label="B" />,
});

export default function ClientTools() {
  return (
    <>
      <div className="border-b border-zinc-800">
        <StressTester />
      </div>
      <ReformOptimizer />
    </>
  );
}

function ToolSkeleton({ label }: { label: string }) {
  return (
    <div className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-xs font-bold text-black">
            {label}
          </span>
          <div className="h-5 w-48 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="h-64 animate-pulse rounded border border-zinc-800 bg-zinc-900/50" />
      </div>
    </div>
  );
}
