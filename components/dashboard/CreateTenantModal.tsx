"use client";
import React, { useState } from "react";
import Modal from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useCreateTenant } from "../../hooks/useCreateTenant";
import { getCooperativeId } from "../../lib/authClient";

export default function CreateTenantModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const coop = getCooperativeId();
    const mutation = useCreateTenant();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cooperativeId = coop ?? "";

        if (!cooperativeId) {
            mutation.mutate({ phone, pin, firstName, lastName, email, role: "TENANT", cooperativeId });
            return;
        }
        
        mutation.mutate({ phone, pin, firstName, lastName, email, role: "TENANT", cooperativeId });
    };

    React.useEffect(() => {
        if (mutation.status === "success" && open) {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mutation.status, open]);

    return (
        <Modal open={open} onClose={onClose} title="Create Tenant">
            <form onSubmit={onSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm mb-1">Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250..." />
                </div>

                <div>
                    <label className="block text-sm mb-1">PIN</label>
                    <Input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm mb-1">First name</label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Last name</label>
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                {!coop && (
                    <div className="text-sm text-yellow-700">No cooperative configured for this account. Tenant will be created without a cooperative id.</div>
                )}

                <div className="flex items-center gap-2 pt-3">
                    <Button type="submit" disabled={mutation.status === "pending"}>
                        {mutation.status === "pending" ? "Creating…" : "Create"}
                    </Button>
                    <Button variant="ghost" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                </div>

                {mutation.status === "error" && (
                    <div className="text-sm text-red-600">{(mutation.error as Error).message}</div>
                )}
            </form>
        </Modal>
    );
}
