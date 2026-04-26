import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

export const DynamicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme.corTema) {
      document.documentElement.style.setProperty("--primary", hexToHsl(theme.corTema));
      document.documentElement.style.setProperty("--primary-foreground", "0 0% 100%");
    }
    
    if (theme.corBotoes) {
      // For buttons we can use primary as well if we want it to be the main color
      // But let's see if we have specific button styles
      // document.documentElement.style.setProperty("--button-color", theme.corBotoes);
    }

    if (theme.corLetras) {
      document.documentElement.style.setProperty("--foreground", hexToHsl(theme.corLetras));
    }

    if (theme.imagemFundo) {
      document.body.style.backgroundImage = `url(${theme.imagemFundo})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundPosition = "center";
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [theme]);

  return <>{children}</>;
};

// Helper function to convert hex to HSL for Tailwind variables
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace("#", "");
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
