import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { getConfig, salvarConfig } from "@/lib/configStore";

const Configuracoes = () => {
  const [config, setConfig] = useState(getConfig());

  const handleSave = () => {
    if (!config.whatsapp.trim()) {
      toast.error("Informe o número do WhatsApp");
      return;
    }
    salvarConfig(config);
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

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
