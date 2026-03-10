import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Instalar = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Instalar Aplicativo
          </CardTitle>
          <CardDescription>
            Tenha o cardápio digital sempre à mão no seu celular!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-lg font-medium text-foreground">
                App já instalado!
              </p>
              <p className="text-sm text-muted-foreground">
                Abra o app diretamente pela tela inicial do seu dispositivo.
              </p>
            </div>
          ) : isIOS ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <Smartphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm text-foreground">
                  <p className="font-medium mb-1">No iPhone/iPad:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta)</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                    <li>Toque em <strong>"Adicionar"</strong></li>
                  </ol>
                </div>
              </div>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Instalar Agora
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <Smartphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm text-foreground">
                  <p className="font-medium mb-1">No Android:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Toque no menu do navegador (⋮)</li>
                    <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Instalar;
