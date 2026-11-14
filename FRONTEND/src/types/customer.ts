
export interface CustomerTrip {
    trip_id: string;
    bus_id: string;
    operator_id: string;

    origin_id: string;
    destination_id: string;

    travel_date: string;
    departure_time: string;
    arrival_time: string;

    fare: number;
    bus_type: string;
    status: string;

    operator_name: string;

    origin_name: string;
    origin_city: string;

    destination_name: string;
    destination_city: string;

    bus_number: string;
    seat_capacity: number;

    total_seats: number;
    booked_seats: number;
    available_seats: number;
}

export interface CustomerTripsResponse {
    success: boolean;
    data: CustomerTrip[];
    total: number;
    message?: string;
}

export interface CustomerTripFilters {
    origin_id?: string;
    destination_id?: string;
    travel_date?: string;
}
