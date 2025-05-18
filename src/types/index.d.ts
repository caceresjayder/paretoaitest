export interface GenericError {
    root: string|null;
    [key: string]: string | null;
}

export interface RegisterError extends GenericError {
    fullname: string | null;
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
}

export interface LoginError extends GenericError {
    email: string | null;
    password: string | null;
}

export interface ApiResponse {
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>|null;
    error: GenericError|null;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
}

export interface ChatItem {
    id: number;
    name: string;
    slug: string;
    description: string;
    lastMessageDate: string;
}

export interface MessageItem {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    isUser: boolean;
    isAssistant: boolean;
    chatId: number;
}