import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-6 bg-primary text-white mt-auto">
      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-200">
          © 2024 EduPathway Platform. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link className="text-sm hover:underline underline-offset-4 text-gray-200" href="#">
            Terms of Service
          </Link>
          <Link className="text-sm hover:underline underline-offset-4 text-gray-200" href="#">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
