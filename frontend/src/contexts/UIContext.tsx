"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type ModalType = "search" | "login" | "register" | null;

interface UIContextType {
  activeModal: ModalType;
  openSearch: () => void;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  toggleLoginRegister: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const openSearch = () => setActiveModal("search");
  const openLogin = () => setActiveModal("login");
  const openRegister = () => setActiveModal("register");
  
  const closeModal = () => {
    setActiveModal(null);
    // Clear query params if they exist
    if (searchParams.get("modal")) {
      router.replace(pathname);
    }
  };

  const toggleLoginRegister = () => {
    setActiveModal((prev) => (prev === "login" ? "register" : "login"));
  };

  // Sync with URL params on mount or param change
  useEffect(() => {
    const modalParam = searchParams.get("modal");
    if (modalParam === "search") setActiveModal("search");
    if (modalParam === "login") setActiveModal("login");
    if (modalParam === "register") setActiveModal("register");
  }, [searchParams]);

  return (
    <UIContext.Provider
      value={{
        activeModal,
        openSearch,
        openLogin,
        openRegister,
        closeModal,
        toggleLoginRegister,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
