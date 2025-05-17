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
import { RegisterError } from "@/types"
import { useState } from "react"
import config from "@/config/config"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"


export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [errors, setErrors] = useState<RegisterError|null>(null);
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const res = await axios.post(config.public.api.register, formData);

            if(res.status === 201) {
                toast.success("User created successfully");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 1000);
            }


        } catch (error) {
            if(error instanceof AxiosError) {
                if(error.response?.status === 422) {
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
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="fullname">Fullname</Label>
                <Input
                  id="fullname"
                  type="text"
                  name="fullname"
                  placeholder="Jhon Doe"
                  required
                />
                { errors?.fullname && <p className="text-red-500">{errors.fullname}</p>}
              </div>
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
                  <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
                { errors?.password && <p className="text-red-500">{errors.password}</p>}
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" name="confirmPassword" required />
                { errors?.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}
              </div>
                {errors?.root && <p className="text-red-500">{errors.root}</p>}
              <Button type="submit" className="w-full">
                Register
              </Button>
              {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/auth/login" className="underline underline-offset-4">
                Log in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
