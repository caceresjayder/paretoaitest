import { hash as argon2Hash, verify } from "argon2";
import { hash } from "node:crypto";

export async function hashPassword(password: string) {
        return await argon2Hash(hash( "sha256",password));
}

export async function verifyPassword(password: string, hashedPassword: string) {
        return await verify(hashedPassword, hash( "sha256",password));
}