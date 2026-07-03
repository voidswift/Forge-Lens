import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // Redirect to dashboard if already authenticated
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <main className="flex flex-col items-center gap-8 text-center max-w-3xl px-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
          ForgeLens
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          The engineering intelligence platform for high-performance teams. 
          Analyze, visualize, and optimize your GitHub repositories with ease.
        </p>
        <div className="flex gap-4 items-center mt-4">
          <Link
            href="/sign-in"
            className="rounded-full bg-black text-white px-8 py-3.5 text-sm font-semibold transition-all hover:bg-gray-800 hover:shadow-md"
          >
            Sign in with GitHub
          </Link>
        </div>
      </main>
    </div>
  );
}
