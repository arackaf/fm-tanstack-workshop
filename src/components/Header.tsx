import type { FC, PropsWithChildren } from "react";

export type HeaderProps = {
  title: string;
};

export const Header: FC<PropsWithChildren<HeaderProps>> = ({
  title,
  children,
}) => {
  return (
    <header className="mb-8 flex items-start justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-50 md:text-4xl">
        {title}
      </h1>
      {children}
    </header>
  );
};
