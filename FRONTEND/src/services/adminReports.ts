
export interface ReportOverview {
    total_reservations: number;
    total_payments: number;
    demo_revenue: number;
    total_trips: number;
}

export interface BookingSummary {
    booking_status: string;
    total: number;
}

export interface PaymentSummary {
    payment_status: string;
    total: number;
    amount: number;
}

export interface PaymentMethodSummary {
    payment_method: string;
    total: number;
    amount: number;
}

export interface MonthlyReport {
    month: string;
    total: number;
}

export interface TripStatusSummary {
    status: string;
    total: number;
}

export interface TopRoute {
    origin_name: string | null;
    destination_name: string | null;
    total_reservations: number;
}

export interface AdminReports {
    overview: ReportOverview;
    booking_summary: BookingSummary[];
    payment_summary: PaymentSummary[];
    payment_methods: PaymentMethodSummary[];
    monthly_reservations: MonthlyReport[];
    monthly_revenue: MonthlyReport[];
    trip_statuses: TripStatusSummary[];
    top_routes: TopRoute[];
}

interface AdminReportsResponse {
    success: boolean;
    message?: string;
    data?: AdminReports;
}

export async function getAdminReports(): Promise<AdminReports> {
    const response = await fetch("/api/admin/reports", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: AdminReportsResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Failed to load reports.");
    }

    return result.data;
}
