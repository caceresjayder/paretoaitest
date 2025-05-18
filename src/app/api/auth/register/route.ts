import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/passwords";
import { registerSchema } from "@/lib/validation";
import { ApiResponse } from "@/types";
import { parseZodErrors } from "@/lib/utils";
import { userRepository } from "@/data/Repository";

export async function POST(request: Request) {
    
    try {
        const body = await request.json();
        
        const validated = registerSchema.safeParse(body);
        if(!validated.success) {
            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: {...parseZodErrors(validated.error), root: null }
            }, { status: 422 });
        }

        const { fullname, email, password } = validated.data;
        
        const existingUser = await userRepository.findOne({ where: { email } });

        if(existingUser) {
            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: { root: "User already exists" }
            }, { status: 422 });
        }
        
        const hashedPassword = await hashPassword(password);

        const user = userRepository.create({
            name: fullname,
            email,
            password: hashedPassword,
        });


        await userRepository.save(user);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: { message: "User created successfully" },
            error: null
        }, { status: 201 });

    } catch (err) {
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: { root: "Server error, please try again later" }
        }, { status: 500 });
    }

}