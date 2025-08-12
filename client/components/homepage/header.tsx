import { AlignRight } from "lucide-react";
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
    <header className="w-full px-6 py-4 flex items-center justify-between border-b">
      <div className="font-bold text-lg">PropertyPulse</div>
      <nav className="hidden md:flex items-center space-x-6">
        <Link href="#features">Features</Link>
        <Link href="#pricing">Pricing</Link>
        <Link href="#contact">Contact</Link>
        <CButton btnHref="/auth/register" btnTxt="Get Started" />
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
                  <CButton btnHref="/auth/register" btnTxt="Get Started" />
                </SheetClose>
              </div>
              <SheetTitle></SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
