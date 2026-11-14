export interface CustomerUser {
    customer_id: number;
    passenger_id: number;
    name: string;
    email: string;
    phone?: string;
}

interface AuthResponse {
    success: boolean;
    message?: string;
    data?: CustomerUser;
}

async function apiRequest(
    endpoint: string,
    method: string,
    body?: Record<string, string>
): Promise<AuthResponse> {
    const response = await fetch(`/api/customer/${endpoint}`, {
        method,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Something went wrong."
        );
    }

    return result;
}

export async function customerLogin(
    email: string,
    password: string
): Promise<CustomerUser> {
    const result = await apiRequest("login", "POST", {
        email,
        password,
    });

    if (!result.data) {
        throw new Error("Customer information not found.");
    }

    return result.data;
}

export async function customerRegister(
    full_name: string,
    email: string,
    phone: string,
    password: string,
    password_confirm: string
): Promise<AuthResponse> {
    return apiRequest("register", "POST", {
        full_name,
        email,
        phone,
        password,
        password_confirm,
    });
}

export async function checkCustomerSession(): Promise<CustomerUser | null> {
    try {
        const result = await apiRequest("check", "GET");
        return result.data ?? null;
    } catch {
        return null;
    }
}

export async function customerLogout(): Promise<void> {
    await apiRequest("logout", "POST");
}
