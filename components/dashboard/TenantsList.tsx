"use client";
import React from "react";
import { useTenants } from "../../hooks/useTenants";
import Table from "../ui/Table";
import { Button } from "../ui/Button";
import CreateTenantModal from "./CreateTenantModal";

export default function TenantsList() {
    const [page, setPage] = React.useState(1);
    const [isOpen, setIsOpen] = React.useState(false);
        const { data, isLoading, isError, error } = useTenants(page, 10);

    return (
        <div>
            <CreateTenantModal open={isOpen} onClose={() => setIsOpen(false)} />

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Tenants</h2>
                <div className="flex items-center gap-2">
                    <input placeholder="Search" className="border px-2 py-1 rounded" />
                    <Button onClick={() => setIsOpen(true)}>New Tenant</Button>
                </div>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : isError ? (
                <div className="text-red-600">{(error as Error).message}</div>
            ) : (
                        <Table
                            columns={[
                                { key: "id", label: "ID" },
                                { key: "firstName", label: "First" },
                                { key: "lastName", label: "Last" },
                                { key: "email", label: "Email" },
                                { key: "phone", label: "Phone" },
                            ]}
                            data={data?.data || []}
                        />
            )}

            <div className="flex items-center gap-2 mt-4">
                <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    Prev
                </Button>
                <div>Page {page}</div>
                <Button onClick={() => setPage((p) => p + 1)} disabled={!data?.meta.hasNextPage}>
                    Next
                </Button>
            </div>
        </div>
    );
}
