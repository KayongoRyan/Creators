import { routes } from "@/config/routes";
import type { UserRole } from "@/types";

export type DemoSession = {
    role: UserRole;
    displayName: string;
    email: string;
    avatarDataUrl?: string;
    address?: string;
    birthDate?: string;
    phone?: string;
    niches?: string[];
};

export const demoRoleOptions: {
    role: UserRole;
    label: string;
    description: string;
}[] = [
        {
            role: "creator",
            label: "Creator",
            description: "Find campaigns and manage your work",
        },
        {
            role: "brand",
            label: "Brand",
            description: "Build campaigns and review content",
        },
        {
            role: "admin",
            label: "Admin",
            description: "Review activity across the platform",
        },
    ];

const demoSessionKey = "creators.demo-session.v2";

const roleHome: Record<UserRole, string> = {
    admin: routes.admin.root,
    brand: routes.brand.root,
    creator: routes.creator.root,
};

export function getRoleHome(role: UserRole) {
    return roleHome[role];
}

export function readDemoSession(): DemoSession | null {
    if (typeof window === "undefined") return null;

    try {
        const storedValue = window.localStorage.getItem(demoSessionKey);
        if (!storedValue) return null;

        const session = JSON.parse(storedValue) as Partial<DemoSession>;
        const isValidRole = demoRoleOptions.some(
            (option) => option.role === session.role,
        );

        if (
            !isValidRole ||
            typeof session.displayName !== "string" ||
            typeof session.email !== "string"
        ) {
            return null;
        }

        return {
            role: session.role as UserRole,
            displayName: session.displayName,
            email: session.email,
            ...(typeof session.avatarDataUrl === "string"
                ? { avatarDataUrl: session.avatarDataUrl }
                : {}),
            ...(typeof session.address === "string"
                ? { address: session.address }
                : {}),
            ...(typeof session.birthDate === "string"
                ? { birthDate: session.birthDate }
                : {}),
            ...(typeof session.phone === "string"
                ? { phone: session.phone }
                : {}),
            ...(Array.isArray(session.niches) &&
                session.niches.every((niche) => typeof niche === "string")
                ? { niches: session.niches }
                : {}),
        };
    } catch {
        return null;
    }
}

export function saveDemoSession(session: DemoSession) {
    window.localStorage.setItem(demoSessionKey, JSON.stringify(session));
}

export function clearDemoSession() {
    window.localStorage.removeItem(demoSessionKey);
}