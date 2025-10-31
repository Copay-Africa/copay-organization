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
        router.push("/login");
    }

    return (
        <div className="sticky top-0 z-50 w-full flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon"
                    className="md:hidden"
                >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />
                    </svg>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">Copay</h1>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Help</Button>
                <ThemeToggle />

                <div className="relative">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setOpen((s) => !s)} 
                        aria-expanded={open} 
                        aria-haspopup="true"
                    >
                        Profile
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4">
                            <path
                                d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75605 9.60753 8.75605 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75605 5.10753 8.75605 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.26618 11.9026 7.38064 11.95 7.49999 11.95C7.61933 11.95 7.73379 11.9026 7.81819 11.8182L10.0682 9.56819Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Button>

                    {open && (
                        <div className="absolute right-0 top-full mt-2 w-48 animate-in bg-popover border border-border rounded-lg shadow-lg z-50">
                            <div className="p-1">
                                <button
                                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onClick={logout}
                                >
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
