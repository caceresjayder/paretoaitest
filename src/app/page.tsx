import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <nav className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold">Pareto AI Test</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={"/auth/login"}>
            Login
            </Link>
          </Button>
          <Button asChild>
            <Link href={"/auth/register"}>
            Register
            </Link>
            </Button>
        </div>
      </nav>
    </div>
  );
}
