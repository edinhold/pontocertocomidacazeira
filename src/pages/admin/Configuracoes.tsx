import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Settings, ImagePlus, X, Upload, History } from "lucide-react";
import { toast } from "sonner";
import { getConfigAsync, salvarConfigAsync, type ConfigLoja } from "@/lib/configStore";
import { useLogo, uploadLogo } from "@/hooks/useLogo";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/logo.png";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const defaultConfig: ConfigLoja = {
  whatsapp: "",
  taxaEntrega: 0,
  nomeRestaurante: "Ponto Certo - Comida Caseira",
};

const Configuracoes = () => {
  const [config, setConfig] = useState<ConfigLoja>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const { logoUrl } = useLogo();

  // Logo upload state
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Array<{ url_anterior: string | null; url_nova: string; alterado_em: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getConfigAsync().then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Aceitos: JPG, PNG, SVG e WebP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Imagem muito grande. O tamanho máximo é 2MB.");
      e.target.value = "";
      return;
    }

    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCancelUpload = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleConfirmUpload = async () => {
    if (!previewFile) return;
    setUploading(true);
    try {
      await uploadLogo(previewFile);
      toast.success("Logo atualizada com sucesso! Todas as páginas já refletem a mudança.");
      handleCancelUpload();
    } catch (err: any) {
      toast.error("Erro ao enviar logo: " + (err.message || "tente novamente"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!config.whatsapp.trim()) {
      toast.error("Informe o número do WhatsApp");
      return;
    }

    setUploading(true);
    try {
      // Se tiver uma logo pendente, salva ela primeiro
      if (previewFile) {
        await uploadLogo(previewFile);
        handleCancelUpload();
      }

      await salvarConfigAsync(config);
      toast.success("Todas as configurações foram salvas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar configurações: " + (error.message || "tente novamente"));
    } finally {
      setUploading(false);
    }
  };

  const loadHistory = async () => {
    const { data } = await supabase
      .from("logo_alteracoes")
      .select("url_anterior, url_nova, alterado_em")
      .order("alterado_em", { ascending: false })
      .limit(10);

    if (data) {
      setHistory(data as any);
    }
    setShowHistory(true);
  };

  if (loading) {
    return <p className="text-center py-8 text-muted-foreground">Carregando configurações...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      {/* Logo Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="size-5" />
            Logo do Sistema
          </CardTitle>
          <CardDescription>
            Envie uma nova logo (PNG, JPG, SVG ou WebP, máx. 2MB). A alteração será aplicada em todas as páginas automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current logo */}
          <div className="space-y-2">
            <Label>Logo atual</Label>
            <div className="w-32 h-32 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl || defaultLogo}
                alt="Logo atual"
                className="max-w-full max-h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; }}
              />
            </div>
          </div>

          {/* Upload area */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.svg,.webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          {previewUrl ? (
            <div className="space-y-3">
              <Label>Nova logo (prévia)</Label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-lg border-2 border-primary bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Nova logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    {previewFile?.name} ({((previewFile?.size || 0) / 1024).toFixed(0)} KB)
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleConfirmUpload} disabled={uploading} size="sm">
                      <Upload className="size-4 mr-1" />
                      {uploading ? "Enviando..." : "Confirmar"}
                    </Button>
                    <Button onClick={handleCancelUpload} variant="outline" size="sm" disabled={uploading}>
                      <X className="size-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-20 border-dashed flex flex-col gap-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Clique para selecionar uma nova logo</span>
            </Button>
          )}

          {/* History button */}
          <Button variant="ghost" size="sm" onClick={loadHistory}>
            <History className="size-4 mr-1" />
            Histórico de alterações
          </Button>

          {showHistory && (
            <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              <Label>Últimas alterações</Label>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="text-xs text-muted-foreground border-b pb-1">
                    {new Date(h.alterado_em).toLocaleString("pt-BR")}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp para Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Número do WhatsApp (com DDD)</Label>
            <Input
              placeholder="Ex: 11999999999"
              value={config.whatsapp}
              onChange={(e) => setConfig({ ...config, whatsapp: e.target.value.replace(/\D/g, "") })}
            />
            <p className="text-xs text-muted-foreground">
              Apenas números, sem espaços ou caracteres especiais. Ex: 11999999999
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxa de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Valor da taxa de entrega (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={config.taxaEntrega || ""}
              onChange={(e) => setConfig({ ...config, taxaEntrega: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">
              Este valor será exibido no cardápio online para o cliente. Deixe 0 para entrega grátis.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nome do Restaurante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome exibido no cardápio</Label>
            <Input
              value={config.nomeRestaurante}
              onChange={(e) => setConfig({ ...config, nomeRestaurante: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} size="lg" className="w-full sm:w-auto">
        <Save className="size-4 mr-2" />
        Salvar Configurações
      </Button>
    </div>
  );
};

export default Configuracoes;
