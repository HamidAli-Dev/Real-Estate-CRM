import { AlignRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CButton from "@/components/global/CButton";

const Header = () => {
  return (
    //
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={"/images/logo-2.png"}
              alt="logo"
              width={100}
              height={100}
              className="mb-3"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Reviews
            </Link>
            <Link
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              href="/auth/login"
            >
              Sign In
            </Link>
            <Link
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              href="/auth/register"
            >
              Start Free Trial
            </Link>
          </nav>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <AlignRight />
              </SheetTrigger>

              <SheetContent>
                <SheetHeader>
                  <div className="flex flex-col py-6 mt-5 gap-5">
                    <SheetClose asChild>
                      <Link href="#features" className="font-semibold">
                        Features
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="#pricing" className="font-semibold">
                        Pricing
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="#contact" className="font-semibold">
                        Contact
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <CButton
                        btnHref="/auth/register"
                        btnTxt="Get Started"
                        className="bg-blue-600"
                      />
                    </SheetClose>
                  </div>
                  <SheetTitle></SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
