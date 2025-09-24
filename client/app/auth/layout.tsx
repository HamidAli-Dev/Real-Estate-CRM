import React, { Suspense } from "react";
import AuthRouteProtection from "./_components/AuthRouteProtection";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <Suspense fallback={null}>
        <AuthRouteProtection />
        {children}
      </Suspense>
    </div>
  );
};

export default AuthLayout;
