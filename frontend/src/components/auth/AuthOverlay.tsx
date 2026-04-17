"use client";
import React from "react";
import { useUI } from "@/contexts/UIContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthOverlay() {
  const { activeModal } = useUI();

  if (activeModal === "login") {
    return <LoginForm />;
  }

  if (activeModal === "register") {
    return <RegisterForm />;
  }

  return null;
}
