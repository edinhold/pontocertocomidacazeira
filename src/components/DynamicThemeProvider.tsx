import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

export const DynamicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    if (theme.corTema) {
      // Use theme color for accents and other elements if needed
      // For now, let's also update --ring and some borders
      document.documentElement.style.setProperty("--ring", hexToHsl(theme.corTema));
    }
    
    if (theme.corBotoes) {
      // Primary color is mostly used for buttons in this template
      document.documentElement.style.setProperty("--primary", hexToHsl(theme.corBotoes));
      document.documentElement.style.setProperty("--primary-foreground", isDark(theme.corBotoes) ? "0 0% 100%" : "0 0% 0%");
    }

    if (theme.corLetras) {
      document.documentElement.style.setProperty("--foreground", hexToHsl(theme.corLetras));
    }

    if (theme.imagemFundo) {
      // Apply background only to public pages or everywhere?
      // Let's check if we are on cardapio page
      const isCardapio = window.location.pathname === "/cardapio";
      if (isCardapio) {
        document.body.style.backgroundImage = `url(${theme.imagemFundo})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundColor = "transparent";
      } else {
        document.body.style.backgroundImage = "none";
      }
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [theme, window.location.pathname]);

  return <>{children}</>;
};

// Helper function to convert hex to HSL for Tailwind variables
function hexToHsl(hex: string): string {
  if (!hex) return "0 0% 0%";
  // Remove # if present
  hex = hex.replace("#", "");
  
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

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

function isDark(hex: string): boolean {
  if (!hex) return true;
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Luma formula
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128;
}
