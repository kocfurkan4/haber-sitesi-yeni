"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SettingsContextType {
  geminiApiKey: string;
  elevenlabsApiKey: string;
  setGeminiApiKey: (key: string) => void;
  setElevenlabsApiKey: (key: string) => void;
  saveSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [geminiApiKey, setGeminiApiKeyState] = useState("");
  const [elevenlabsApiKey, setElevenlabsApiKeyState] = useState("");

  useEffect(() => {
    const gemini = localStorage.getItem("gemini_api_key") || "";
    const elevenlabs = localStorage.getItem("elevenlabs_api_key") || "";
    setGeminiApiKeyState(gemini);
    setElevenlabsApiKeyState(elevenlabs);
  }, []);

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
  };

  const setElevenlabsApiKey = (key: string) => {
    setElevenlabsApiKeyState(key);
  };

  const saveSettings = () => {
    localStorage.setItem("gemini_api_key", geminiApiKey);
    localStorage.setItem("elevenlabs_api_key", elevenlabsApiKey);
  };

  return (
    <SettingsContext.Provider
      value={{
        geminiApiKey,
        elevenlabsApiKey,
        setGeminiApiKey,
        setElevenlabsApiKey,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
