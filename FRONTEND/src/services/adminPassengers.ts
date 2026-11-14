
export interface Passenger {
    passenger_id: number;
    full_name: string;
    email: string;
    phone: string;
}

export interface PassengerDetails extends Passenger {
    [key: string]: unknown;
}

interface PassengerListResponse {
    success: boolean;
    message?: string;
    data?: Passenger[];
    total?: number;
}

interface PassengerDetailsResponse {
    success: boolean;
    message?: string;
    data?: PassengerDetails;
}

export async function getAdminPassengers(): Promise<Passenger[]> {
    const response = await fetch("/api/admin/passengers", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: PassengerListResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load passengers."
        );
    }

    return result.data;
}

export async function getAdminPassenger(
    id: number
): Promise<PassengerDetails> {
    const response = await fetch(`/api/admin/passengers/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: PassengerDetailsResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Failed to load passenger details."
        );
    }

    return result.data;
}
