import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-7xl">🍲</p>
      <h1 className="mt-5 text-3xl font-extrabold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">
        Looks like this dish isn’t on the menu. Let’s get you back to something delicious.
      </p>
      <Link
        href="/"
        className="mt-7 inline-block rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-600"
      >
        Back to home
      </Link>
    </div>
  );
}
