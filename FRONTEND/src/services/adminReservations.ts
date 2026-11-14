
export interface Reservation {
    id: number;
    booking_id: number;
    booking_reference: string;
    status: string;
    booking_date: string;
    passenger_name: string;
    seat_number: string;
    trip_name: string;
    trip_id: number;
    travel_date: string;
    departure_time: string;
    arrival_time: string;
    fare: number;
    operator_name: string;
    payment_method: string;
    payment_status: string;
    amount: number;
    payment_reference: string;
}

export interface ReservationDetails {
    booking_id: number;
    booking_reference: string;
    payment_reference: string | null;

    passenger_name: string;
    passenger_email: string;
    passenger_phone: string;

    origin_name: string;
    destination_name: string;
    operator_name: string;

    travel_date: string;
    departure_time: string;
    arrival_time: string;
    bus_type: string;

    fare: number;

    seat_numbers: string[];
    seat_count: number;
    total_amount: number;

    payment_method: string;
    payment_status: string;
    booking_status: string;

    bookings: Reservation[];
}

interface ReservationListResponse {
    success: boolean;
    message?: string;
    data?: Reservation[];
    total?: number;
}

interface ReservationDetailsResponse {
    success: boolean;
    message?: string;
    data?: ReservationDetails;
}

export async function getAdminReservations(): Promise<Reservation[]> {
    const response = await fetch("/api/admin/reservations", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: ReservationListResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load reservations."
        );
    }

    return result.data;
}

export async function getAdminReservation(
    id: number
): Promise<ReservationDetails> {
    const response = await fetch(`/api/admin/reservations/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: ReservationDetailsResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load reservation details."
        );
    }

    return result.data;
}
