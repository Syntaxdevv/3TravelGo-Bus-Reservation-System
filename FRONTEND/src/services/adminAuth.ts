
export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: "admin" | "staff";
}

interface AuthApiResponse {
    success: boolean;
    message?: string;
    data?: AdminUser;
}

async function handleAuthResponse(
    response: Response,
    fallbackMessage: string
): Promise<AdminUser> {
    const result: AuthApiResponse = await response.json();

    if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || fallbackMessage);
    }

    return result.data;
}

export async function adminLogin(
    email: string,
    password: string
): Promise<AdminUser> {
    const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    return handleAuthResponse(response, "Login failed.");
}

export async function checkAdminSession(): Promise<AdminUser | null> {
    const response = await fetch("/api/admin/check", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    if (response.status === 401) {
        return null;
    }

    return handleAuthResponse(
        response,
        "Unable to verify admin session."
    );
}

export async function checkStaffSession(): Promise<AdminUser | null> {
    const response = await fetch("/api/staff/check", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    if (response.status === 401) {
        return null;
    }

    return handleAuthResponse(
        response,
        "Unable to verify staff session."
    );
}

export async function adminLogout(): Promise<void> {
    const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: AuthApiResponse = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Logout failed.");
    }
}

export async function staffLogout(): Promise<void> {
    const response = await fetch("/api/staff/logout", {
        method: "POST",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const result: AuthApiResponse = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Logout failed.");
    }
}
