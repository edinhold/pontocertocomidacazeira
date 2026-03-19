import { cn } from "@/lib/utils";
import { useLogo } from "@/hooks/useLogo";
import defaultLogo from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-10 h-auto",
  md: "w-24 h-auto",
  lg: "w-48 h-auto",
};

const Logo = ({ size = "md", className }: LogoProps) => {
  const { logoUrl } = useLogo();

  return (
    <img
      src={logoUrl || defaultLogo}
      alt="Brigadeiros dos Sonhos - Doceria"
      className={cn(sizeMap[size], className)}
      onError={(e) => {
        (e.target as HTMLImageElement).src = defaultLogo;
      }}
    />
  );
};

export default Logo;
