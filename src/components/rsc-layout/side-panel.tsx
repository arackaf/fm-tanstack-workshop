"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FC } from "react";
import type { UserInfoType } from "./types";

const triggerClassName =
  "flex cursor-pointer items-center gap-3 rounded-xl text-left ring-1 ring-white/25 backdrop-blur-sm transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60";

export const SidePanel: FC<{ user: UserInfoType }> = ({ user }) => {
  const { name, avatar } = user;
  return (
    <Sheet>
      <SheetTrigger type="button" className={triggerClassName}>
        <div className="flex items-center gap-3 h-[52px] w-36 rounded-xl bg-black/15 px-3 py-2 ring-1 ring-white/25 backdrop-blur-sm">
          <img
            src={avatar}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white/40"
            loading="eager"
          />
          <div className="min-w-0 text-right">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-emerald-100/80">
              Signed in
            </p>
            <p className="truncate text-sm font-semibold text-white">{name}</p>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Account</SheetTitle>
          <SheetDescription>
            User settings and profile information.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
