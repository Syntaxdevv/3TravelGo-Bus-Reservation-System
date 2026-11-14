export interface AdminPayment {
    payment_id: number;
    booking_id: number;
    payment_method: string;
    payment_status: string;
    amount: number | string;
    payment_reference: string | null;
    created_at: string;
    paypal_order_id: string | null;
}

export interface PaymentSummary {
    total_amount: number;
    paid_count: number;
    pending_count: number;
    failed_count: number;
}

interface AdminPaymentsResponse {
    success: boolean;
    message?: string;
    data?: AdminPayment[];
    total?: number;
    summary?: PaymentSummary;
}

export interface AdminPaymentsResult {
    payments: AdminPayment[];
    total: number;
    summary: PaymentSummary;
}

export async function getAdminPayments(): Promise<AdminPaymentsResult> {
    const response = await fetch("/api/admin/payments", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: AdminPaymentsResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load payment records."
        );
    }

    return {
        payments: result.data,
        total: result.total ?? result.data.length,
        summary: result.summary ?? {
            total_amount: 0,
            paid_count: 0,
            pending_count: 0,
            failed_count: 0,
        },
    };
}