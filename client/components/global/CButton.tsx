import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CButtonProps {
  btnTxt: string;
  btnHref: string;
  className?: string;
}

const CButton = ({ btnTxt, btnHref, className }: CButtonProps) => {
  return (
    <Button className={`${className}`} variant="customPrimary" asChild>
      <Link href={btnHref}>{btnTxt}</Link>
    </Button>
  );
};

export default CButton;
