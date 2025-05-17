'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { LoginError } from "@/types"
import { useRouter } from "next/navigation"
import config from "@/config/config"
import { toast } from "sonner"
import { AxiosError } from "axios"
import axios from "@/lib/axios"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [errors, setErrors] = useState<LoginError|null>(null);
  const router = useRouter();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const res = await axios.post(config.public.api.login, formData);

            if(res.status === 200) {
                toast.success("User logged in successfully");
                setTimeout(() => {
                    router.push("/app");
                }, 1000);
            }


        } catch (error) {
            if(error instanceof AxiosError) {
                if(error.response?.status === 422) {
                    setErrors(error.response?.data.error);
                }
                if(error.response?.status === 401) {
                    setErrors(error.response?.data.error);
                }
            }
            console.error(error)
            toast.error("Something went wrong");
        }
    }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
                { errors?.email && <p className="text-red-500">{errors.email}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" name="password" required />
              </div>
              { errors?.root && <p className="text-red-500">{errors.root}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
              {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/auth/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
