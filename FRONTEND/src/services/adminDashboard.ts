
export interface Reservation {
    booking_id: string;
    passenger_name: string;
    trip_id: string;
    trip_name: string;
    booking_date: string;
    status: string;
}

export interface AdminDashboardData {
    totalReservations: number;
    totalTrips: number;
    totalPassengers: number;
    totalPayments: number;
    recentReservations: Reservation[];
}

interface DashboardApiResponse {
    success: boolean;
    message?: string;
    data?: AdminDashboardData;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: DashboardApiResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load dashboard data."
        );
    }

    return result.data;
}
