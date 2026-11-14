export interface AdminSeat {
    seat_id: number;
    trip_id: number;
    seat_number: string;
    status: string;
    travel_date: string | null;
    departure_time: string | null;
    arrival_time: string | null;
    origin_name: string | null;
    destination_name: string | null;
    operator_name: string | null;
}

export interface SeatSummary {
    total_seats: number;
    available_count: number;
    reserved_count: number;
    occupied_count: number;
    other_count: number;
}

interface SeatListResponse {
    success: boolean;
    message?: string;
    data?: AdminSeat[];
    total?: number;
    summary?: SeatSummary;
}

interface SeatDetailsResponse {
    success: boolean;
    message?: string;
    data?: AdminSeat;
}

export interface AdminSeatsResult {
    seats: AdminSeat[];
    total: number;
    summary: SeatSummary;
}

export async function getAdminSeats(): Promise<AdminSeatsResult> {
    const response = await fetch("/api/admin/seats", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: SeatListResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Failed to load seats.");
    }

    return {
        seats: result.data,
        total: result.total ?? result.data.length,
        summary: result.summary ?? {
            total_seats: 0,
            available_count: 0,
            reserved_count: 0,
            occupied_count: 0,
            other_count: 0,
        },
    };
}

export async function getAdminSeat(id: number): Promise<AdminSeat> {
    const response = await fetch(`/api/admin/seats/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: SeatDetailsResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Failed to load seat details.");
    }

    return result.data;
}