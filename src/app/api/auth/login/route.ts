import { userRepository } from "@/data/Repository";
import { verifyPassword } from "@/lib/passwords";
import { createSession } from "@/lib/session";
import { parseZodErrors } from "@/lib/utils";
import { loginSchema } from "@/lib/validation";
import { ApiResponse } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    
    try {
        const validated = loginSchema.safeParse(body);
        if(!validated.success) {
            return NextResponse.json<ApiResponse>({ 
                success: false,
                error: {...parseZodErrors(validated.error), root: null},
                data: null
            }, { status: 422 });
        }

        const { email, password } = validated.data;
        const user = await userRepository.findOneBy( { email } );

        if(!user) {
            return NextResponse.json<ApiResponse>({ 
                success: false,
                error: { root: "Invalid username or password" },
                data: null
            }, { status: 401 });
        }

        const isPasswordValid = await verifyPassword(password, user.password);

        if(!isPasswordValid) {
            return NextResponse.json<ApiResponse>({ 
                success: false,
                error: { root: "Invalid username or password" },
                data: null
            }, { status: 401 });
        }

        await createSession(user.id.toString());

        return NextResponse.json<ApiResponse>({ 
            success: true,
            error: null,
            data: {
                user: user
            }
        }, { status: 200 });

    } catch (error) {
        console.error(error)
        return NextResponse.json<ApiResponse>({ 
            success: false,
            error: { root: "Server error, please try again later" },
            data: null
        }, { status: 500 });
    }
}