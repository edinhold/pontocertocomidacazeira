import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWhatsAppUrl(phone: string, text: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  // Se não começa com 55 e tem 10 ou 11 dígitos, adiciona o 55
  const phoneWithCountry = cleanPhone.length <= 11 && !cleanPhone.startsWith("55") 
    ? `55${cleanPhone}` 
    : cleanPhone;
  
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
}
