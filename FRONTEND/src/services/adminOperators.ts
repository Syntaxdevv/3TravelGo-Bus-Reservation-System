
export interface AdminOperator {
    operator_id: number;
    operator_name: string;
    is_active: boolean | string;
    contact_person: string | null;
    contact_number: string | null;
    email: string | null;
    address: string | null;
}

export interface OperatorSummary {
    active_count: number;
    inactive_count: number;
}

interface OperatorListResponse {
    success: boolean;
    message?: string;
    data?: AdminOperator[];
    total?: number;
    summary?: OperatorSummary;
}

interface OperatorDetailsResponse {
    success: boolean;
    message?: string;
    data?: AdminOperator;
}

export interface AdminOperatorsResult {
    operators: AdminOperator[];
    total: number;
    summary: OperatorSummary;
}

export async function getAdminOperators(): Promise<AdminOperatorsResult> {
    const response = await fetch("/api/admin/operators", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: OperatorListResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load bus operators."
        );
    }

    return {
        operators: result.data,
        total: result.total ?? result.data.length,
        summary: result.summary ?? {
            active_count: 0,
            inactive_count: 0,
        },
    };
}

export async function getAdminOperator(
    id: number
): Promise<AdminOperator> {
    const response = await fetch(`/api/admin/operators/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: OperatorDetailsResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load operator details."
        );
    }

    return result.data;
}
