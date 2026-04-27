import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success("App pronto para uso offline!");
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast("Nova atualização disponível!", {
        description: "Clique em atualizar para ver as novidades e melhorias.",
        action: {
          label: "Atualizar Agora",
          onClick: () => {
            updateServiceWorker(true);
            window.location.reload();
          },
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
    
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    setIsIOS(iOS);

    if (!isStandaloneMode) {
      if (iOS) {
        // For iOS, we can't use beforeinstallprompt, so we show the banner anyway if not standalone
        setShowInstallBanner(true);
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isStandaloneMode) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-4 sm:left-auto sm:right-4 sm:w-96">
      <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex items-center justify-between gap-4 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="bg-primary-foreground/20 p-2 rounded-full shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Instalar Aplicativo</p>
            <p className="text-xs opacity-90">
              {isIOS 
                ? "Toque em 'Compartilhar' e 'Adicionar à Tela de Início'" 
                : "Tenha uma melhor experiência no seu celular"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isIOS && deferredPrompt && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleInstall}
              className="h-8 px-3 text-xs font-bold whitespace-nowrap"
            >
              Instalar
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowInstallBanner(false)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
