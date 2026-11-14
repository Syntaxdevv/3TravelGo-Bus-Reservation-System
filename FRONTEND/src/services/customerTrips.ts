
import type {
    CustomerTrip,
    CustomerTripsResponse,
    CustomerTripFilters,
} from "../types/customer";

const API_URL = "/api/customer/trips";

export async function getCustomerTrips(
    filters: CustomerTripFilters = {}
): Promise<CustomerTrip[]> {
    const params = new URLSearchParams();

    if (filters.origin_id) {
        params.append("origin_id", filters.origin_id);
    }

    if (filters.destination_id) {
        params.append("destination_id", filters.destination_id);
    }

    if (filters.travel_date) {
        params.append("travel_date", filters.travel_date);
    }

    const query = params.toString();
    const url = query ? `${API_URL}?${query}` : API_URL;

    const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: CustomerTripsResponse = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to load available trips."
        );
    }

    return result.data;
}
