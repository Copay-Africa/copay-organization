"use client";
import React from "react";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../theme/ThemeToggle";
import { MobileNav } from "./Sidebar";
import { clearToken, clearCooperativeId } from "../../lib/authClient";
import { useRouter } from "next/navigation";
import { ChevronDown, HelpCircle, LogOut, User } from "lucide-react";

export default function Topbar() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (open && !target.closest('[data-profile-dropdown]')) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [open]);

    function logout() {
        clearToken();
        clearCooperativeId();
        router.push("/login");
    }

    return (
        <div className="sticky top-0 z-50 w-full flex h-14 sm:h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Navigation Toggle */}
                <MobileNav />

                {/* Logo/Brand */}
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                    <span className="hidden sm:inline text-muted-foreground">Organization</span>
                </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                {/* Help Button - Hidden on very small screens */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="hidden xs:flex h-9 w-9 sm:h-auto sm:w-auto sm:px-3"
                    aria-label="Help"
                >
                    <HelpCircle className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Help</span>
                </Button>

                {/* Profile Dropdown */}
                <div className="relative" data-profile-dropdown>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen((s) => !s)}
                        aria-expanded={open}
                        aria-haspopup="true"
                        className="h-9 px-2 sm:px-3 gap-1 sm:gap-2"
                    >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''
                            }`} />
                    </Button>

                    {/* Dropdown Menu */}
                    {open && (
                        <div className="absolute right-0 top-full mt-2 w-48 animate-in slide-in-from-top-2 bg-background border border-border rounded-lg shadow-lg z-50">
                            <div className="p-1">
                                <button
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                                    onClick={logout}
                                >
                                    <LogOut className="h-4 w-4 text-muted-foreground" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />
            </div>
        </div>
    );
}
