
export interface CustomerTerminal {
    terminal_id: string;
    terminal_name: string;
    city: string;
}

interface CustomerTerminalsResponse {
    success: boolean;
    data: CustomerTerminal[];
    total: number;
    message?: string;
}

export async function getCustomerTerminals(): Promise<CustomerTerminal[]> {
    const response = await fetch("/api/customer/terminals", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: CustomerTerminalsResponse = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to load terminals."
        );
    }

    return result.data;
}
