import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F9F8] px-4">
      <div className="stappli-card p-10 max-w-md w-full text-center">
        <p className="stappli-badge-active mb-4">404</p>
        <h1 className="stappli-title mb-2 mt-4">Page not found</h1>
        <p className="stappli-subtitle mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="stappli-button-primary">
          Go home
        </Link>
      </div>
    </div>
  );
}
