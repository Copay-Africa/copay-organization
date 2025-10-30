"use client";
import React from "react";

export function Modal({ open, title, onClose, children }: {
    open: boolean;
    title?: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl rounded-lg p-6 shadow-lg card-bg border border-muted">
                {title && <div className="mb-4 text-lg font-semibold">{title}</div>}
                <div>{children}</div>
            </div>
        </div>
    );
}

export default Modal;
