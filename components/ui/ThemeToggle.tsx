"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./Button";

const STORAGE_KEY = "copay_theme";

export function ThemeToggle() {

    const applyTheme = (t: string) => {
        document.documentElement.setAttribute("data-theme", t);
    };

    // Initialize theme synchronously from storage or system preference
    const [theme, setTheme] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") return saved;
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    });

    useEffect(() => {
        if (theme) applyTheme(theme);
    }, [theme]);

    function toggle() {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
    }

    return (
        <Button onClick={toggle} variant="ghost" aria-label="Toggle theme">
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </Button>
    );
}

export default ThemeToggle;
