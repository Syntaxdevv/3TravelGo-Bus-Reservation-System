
export interface CustomerSeat {
    seat_id: number;
    seat_number: string;
    status: "available" | "booked";
}

export interface CustomerSeatTrip {
    trip_id: number;
    bus_id: number;
    travel_date: string;
    departure_time: string;
    arrival_time: string;
    fare: number | string;
    bus_type: string;
    bus_number: string;
    seat_capacity: number;
    operator_name: string;
}

export interface CustomerSeatsResponse {
    success: boolean;
    message: string;
    trip: CustomerSeatTrip;
    seats: CustomerSeat[];
}

export async function getCustomerSeats(
    tripId: number | string
): Promise<CustomerSeatsResponse> {
    const response = await fetch(
        `/api/customer/trips/${tripId}/seats`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json",
            },
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to retrieve seat information."
        );
    }

    return result as CustomerSeatsResponse;
}
