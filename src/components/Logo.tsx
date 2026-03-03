import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-10 h-auto",
  md: "w-24 h-auto",
  lg: "w-48 h-auto",
};

const Logo = ({ size = "md", className }: LogoProps) => (
  <img
    src={logo}
    alt="Ponto Certo - Comida Caseira"
    className={cn(sizeMap[size], className)}
  />
);

export default Logo;
