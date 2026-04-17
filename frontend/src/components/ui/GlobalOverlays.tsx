"use client";
import React from "react";
import { useUI } from "@/contexts/UIContext";
import { Overlay } from "./Overlay";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { AuthOverlay } from "@/components/auth/AuthOverlay";

export function GlobalOverlays() {
  const { activeModal, closeModal } = useUI();

  return (
    <>
      {/* Search Overlay - Full Screen Style */}
      <Overlay isOpen={activeModal === "search"} onClose={closeModal}>
        <SearchOverlay />
      </Overlay>

      {/* Auth Overlay - Centered Card Style */}
      <Overlay 
        isOpen={activeModal === "login" || activeModal === "register"} 
        onClose={closeModal}
      >
        <AuthOverlay />
      </Overlay>
    </>
  );
}
