"use client";
import React from "react";
import { Button } from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { clearToken, clearCooperativeId } from "../../lib/authClient";
import { useRouter } from "next/navigation";

export default function Topbar() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    function logout() {
        clearToken();
        clearCooperativeId();
        // navigate to login
        router.push("/login");
    }

    return (
        <div className="w-full flex items-center justify-between px-4 py-3 border-b border-muted bg-background">
            <div className="flex items-center gap-3">
                <button className="md:hidden p-2 rounded-md border border-muted">☰</button>
                <h1 className="text-lg font-semibold">Co-Pay Organization</h1>
            </div>

            <div className="flex items-center gap-2 relative">
                <Button variant="ghost">Help</Button>
                <ThemeToggle />

                <div className="relative">
                    <Button variant="ghost" onClick={() => setOpen((s) => !s)} aria-expanded={open} aria-haspopup="true">
                        Profile
                    </Button>

                    {open && (
                        <div
                            className="absolute right-0 mt-2 w-40 bg-card-bg border border-muted rounded shadow-lg z-50"
                            onBlur={() => setOpen(false)}
                        >
                            <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
