
export interface AdminTerminal {
    terminal_id: number;
    terminal_name: string;
    city: string;
}

interface TerminalListResponse {
    success: boolean;
    message?: string;
    data?: AdminTerminal[];
    total?: number;
}

interface TerminalDetailsResponse {
    success: boolean;
    message?: string;
    data?: AdminTerminal;
}

export interface AdminTerminalsResult {
    terminals: AdminTerminal[];
    total: number;
}

export async function getAdminTerminals(): Promise<AdminTerminalsResult> {
    const response = await fetch("/api/admin/terminals", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: TerminalListResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load terminals."
        );
    }

    return {
        terminals: result.data,
        total: result.total ?? result.data.length,
    };
}

export async function getAdminTerminal(
    id: number
): Promise<AdminTerminal> {
    const response = await fetch(`/api/admin/terminals/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: TerminalDetailsResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load terminal details."
        );
    }

    return result.data;
}
