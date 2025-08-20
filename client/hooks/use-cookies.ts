"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export function useCookies() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCookie = (name: string) => {
    if (!isClient) return undefined;
    return Cookies.get(name);
  };

  const setCookie = (name: string, value: string, options?: any) => {
    if (!isClient) return;
    Cookies.set(name, value, options);
  };

  const removeCookie = (name: string) => {
    if (!isClient) return;
    Cookies.remove(name);
  };

  return {
    isClient,
    getCookie,
    setCookie,
    removeCookie,
  };
}
