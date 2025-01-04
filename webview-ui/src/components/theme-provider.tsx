import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [systemTheme, setSystemTheme] = useState<string | undefined>(
    document.querySelector("body")?.getAttribute("data-vscode-theme-kind") ||
      "dark"
  );

  useEffect(() => {
    // Set up observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-vscode-theme-kind") {
          setSystemTheme(
            document
              .querySelector("body")
              ?.getAttribute("data-vscode-theme-kind") || "dark"
          );
        }
      });
    });

    // Start observing the body element for attribute changes
    observer.observe(document.querySelector("body")!, {
      attributes: true,
      attributeFilter: ["data-vscode-theme-kind"],
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (systemTheme?.includes("light")) {
      root.classList.add("light");
    } else {
      root.classList.add("dark");
    }
  }, [systemTheme]);

  const value: ThemeProviderState = {
    theme: "system" as Theme,
    setTheme: () => {}, // No-op since we're always using system theme
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
