import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

function IconBase({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

export function IconDashboard({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </IconBase>
  );
}

export function IconOrders({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </IconBase>
  );
}

export function IconTruck({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h2" />
      <path d="M19 18h2v-3.34a1 1 0 0 0-.76-.97L18 13" />
      <path d="M14 9h4l2 3v6h-6" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </IconBase>
  );
}

export function IconWallet({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M3 7h16v4H3z" />
      <path d="M17 13h.01" />
    </IconBase>
  );
}

export function IconGlobe({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </IconBase>
  );
}

export function IconStore({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 9l1-4h16l1 4" />
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M9 20v-6h6v6" />
      <path d="M8 9V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
    </IconBase>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function IconHistory({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v6h6" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function IconPackage({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </IconBase>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export type SidebarIconName =
  | "dashboard"
  | "orders"
  | "truck"
  | "wallet"
  | "globe"
  | "store"
  | "users"
  | "history"
  | "package"
  | "settings";

const ICONS: Record<SidebarIconName, ComponentType<IconProps>> = {
  dashboard: IconDashboard,
  orders: IconOrders,
  truck: IconTruck,
  wallet: IconWallet,
  globe: IconGlobe,
  store: IconStore,
  users: IconUsers,
  history: IconHistory,
  package: IconPackage,
  settings: IconSettings,
};

export function SidebarIcon({
  name,
  className,
}: {
  name: SidebarIconName;
  className?: string;
}) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}
