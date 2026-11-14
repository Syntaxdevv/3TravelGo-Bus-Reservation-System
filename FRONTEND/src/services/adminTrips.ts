
export interface Trip {
    trip_id: number;
    operator_id: number;
    origin_id: number;
    destination_id: number;

    travel_date: string;
    departure_time: string;
    arrival_time: string;

    fare: number;
    bus_type: string;
    status: string;

    operator_name: string;
    origin_name: string;
    destination_name: string;
}

interface TripsApiResponse {
    success: boolean;
    message?: string;
    data?: Trip[];
    total?: number;
}

export async function getAdminTrips(): Promise<Trip[]> {
    const response = await fetch("/api/admin/trips", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: TripsApiResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load trips."
        );
    }

    return result.data;
}
