"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Bell, Moon, Sun, ChevronDown, Menu, LogOut, Settings, Building2, User } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { useMosque } from "@/providers/mosque-provider";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { activeMosque, activeRole } = useMosque();

  const [hasUnread, setHasUnread] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const userInitials = React.useMemo(() => {
    if (!user?.name) return "MM";
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user?.name]);

  const roleDisplay = React.useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return "Super Admin";
    if (activeRole) return activeRole.replace("_", " ");
    return "Member";
  }, [activeRole, user?.role]);

  return (
    <header className="sticky top-0 z-30 h-18 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Menu Button + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search ledger, members, donors..."
              className="w-full h-10 pl-10 pr-12 rounded-full border border-border bg-background/50 hover:bg-background focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
            />
            <kbd className="absolute right-3.5 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded border border-border">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Theme & Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasUnread(false);
            }}
            className="relative p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-card" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-lg p-3 z-50 text-xs animate-in fade-in-0 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border font-semibold text-foreground">
                <span>Recent Activity</span>
                <span className="text-[11px] text-primary cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="py-6 text-center text-muted-foreground">
                <p>No unread notifications.</p>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-muted/70 transition-colors border border-transparent hover:border-border"
          >
            {/* Avatar Pill */}
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center font-bold text-xs text-primary">
              <span className="tracking-tight">{userInitials}</span>
            </div>

            {/* User Details */}
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize truncate max-w-[120px]">
                {roleDisplay}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block ml-0.5" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg p-2 z-50 text-xs animate-in fade-in-0 duration-150">
              <div className="px-3 py-2 border-b border-border/80">
                <p className="font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-muted-foreground text-[10px] truncate">{user?.email || user?.phone}</p>
                {activeMosque && (
                  <p className="text-[10px] text-primary font-medium mt-0.5 truncate">
                    {activeMosque.name}
                  </p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/mosques"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg text-foreground transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Switch Mosque
                </Link>

                {activeMosque && (
                  <Link
                    href={`/mosques/${activeMosque.id}/settings`}
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg text-foreground transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                    Mosque Settings
                  </Link>
                )}

                <Link
                  href={`/mosques/${activeMosque?.id || ""}/me`}
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg text-foreground transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  My Giving Profile
                </Link>
              </div>

              <div className="pt-1 border-t border-border/80">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
