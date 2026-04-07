import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | 'none';

interface ScrollContextType {
  shouldHideNavbar: boolean;
  handleScroll: (offset: number) => void;
  resetNavbar: () => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [shouldHideNavbar, setShouldHideNavbar] = useState(false);
  const lastOffset = useRef(0);
  const threshold = 50; // Delay before hiding

  const handleScroll = useCallback(
    (offset: number) => {
      // Ignore small scrolls or negative (iOS bounce)
      if (offset < 0) return;

      const diff = offset - lastOffset.current;

      if (Math.abs(diff) < 5) return; // Ignore micro-scrolls

      if (diff > 0 && offset > threshold) {
        // Scrolling down
        if (!shouldHideNavbar) setShouldHideNavbar(true);
      } else if (diff < 0) {
        // Scrolling up
        if (shouldHideNavbar) setShouldHideNavbar(false);
      }

      lastOffset.current = offset;
    },
    [shouldHideNavbar]
  );

  const resetNavbar = useCallback(() => {
    setShouldHideNavbar(false);
  }, []);

  return (
    <ScrollContext.Provider value={{ shouldHideNavbar, handleScroll, resetNavbar }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
}
