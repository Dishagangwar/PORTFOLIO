"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type IntroState = { ready: boolean; setReady: (v: boolean) => void };

const IntroContext = createContext<IntroState>({ ready: true, setReady: () => {} });

/** Tracks whether the intro loader has finished, so hero animations can wait for it. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  return (
    <IntroContext.Provider value={{ ready, setReady }}>
      {children}
    </IntroContext.Provider>
  );
}

export const useIntro = () => useContext(IntroContext);
