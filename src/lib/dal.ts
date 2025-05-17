import { cookies } from "next/headers";
import { cache } from "react";
import { decrypt } from "./session";
import { redirect } from "next/navigation";
import { userRepository } from "@/data/Repository";

export const verifySession = cache(async () => {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
  
    if (!session?.userId) {
      redirect("/login");
    }
  
    return { isAuth: true, userId: session.userId as string };
  });


  export const getUser = cache(async () => {
    const session = await verifySession()
    if (!session) return null
   
    try {
      const user = await userRepository.findOneBy({ id: parseInt(session.userId) })
      return user
    } catch (error) {
      console.log('Failed to fetch user')
      return null
    }
  })