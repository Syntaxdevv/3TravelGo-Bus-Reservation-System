
export interface PaymentPassenger {
    full_name: string;
    contact_number: string;
    email: string;
}

export interface CustomerPaymentRequest {
    trip_id: number;
    seat_ids: number[];
    passengers: PaymentPassenger[];
    payment_method: "PayPal" | "QR Ph" | "GCash";
}

export interface CustomerPaymentResult {
    booking_reference: string;
    payment_reference: string;
    booking_ids: number[];
    seat_numbers: string[];
    seat_count: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    booking_status: string;
}

interface PaymentResponse {
    success: boolean;
    message: string;
    data?: CustomerPaymentResult;
}

export async function processCustomerPayment(
    payload: CustomerPaymentRequest
): Promise<CustomerPaymentResult> {
    const response = await fetch(
        "/api/customer/payment/process",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const result =
        (await response.json()) as PaymentResponse;

    if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Unable to process reservation."
        );
    }

    return result.data;
}
