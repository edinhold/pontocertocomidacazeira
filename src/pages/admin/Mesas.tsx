import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getPedidos } from "@/lib/pedidosStore";
import { getMesas, salvarMesa, excluirMesa, type Mesa } from "@/lib/mesasStore";

const Mesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>(getMesasSalvas());
  const [mesasOcupadas, setMesasOcupadas] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ numero: "", capacidade: "" });

  const atualizarOcupacao = useCallback(async () => {
    const pedidos = await getPedidos();
    const ocupadas = new Set(pedidos.map((p) => p.mesa));
    setMesasOcupadas(ocupadas);
  }, []);

  useEffect(() => {
    atualizarOcupacao();
    const interval = setInterval(atualizarOcupacao, 2000);
    window.addEventListener("pedidos-updated", atualizarOcupacao);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pedidos-updated", atualizarOcupacao);
    };
  }, [atualizarOcupacao]);

  const handleSave = () => {
    if (!form.numero || !form.capacidade) { toast.error("Preencha todos os campos"); return; }
    const novasMesas = [...mesas, { id: Date.now().toString(), numero: parseInt(form.numero), capacidade: parseInt(form.capacidade) }];
    setMesas(novasMesas);
    salvarMesas(novasMesas);
    toast.success("Mesa adicionada!");
    setOpen(false);
    setForm({ numero: "", capacidade: "" });
  };

  const handleExcluir = (id: string) => {
    const novasMesas = mesas.filter((m) => m.id !== id);
    setMesas(novasMesas);
    salvarMesas(novasMesas);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mesas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Nova Mesa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Mesa</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Número da Mesa</Label><Input type="number" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></div>
              <div className="space-y-2"><Label>Capacidade (pessoas)</Label><Input type="number" value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mesas.map((mesa) => {
          const ocupada = mesasOcupadas.has(mesa.numero);
          return (
            <Card key={mesa.id} className={ocupada ? "border-primary/50" : ""}>
              <CardContent className="p-4 text-center space-y-2">
                <div className="text-3xl font-bold">{mesa.numero}</div>
                <p className="text-sm text-muted-foreground">{mesa.capacidade} pessoas</p>
                <Badge variant={ocupada ? "default" : "secondary"}>
                  {ocupada ? "Ocupada" : "Livre"}
                </Badge>
                <div className="pt-2">
                  <Button variant="ghost" size="icon" onClick={() => handleExcluir(mesa.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Mesas;
