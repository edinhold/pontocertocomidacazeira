import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Mesa {
  id: string;
  numero: number;
  capacidade: number;
  status: "livre" | "ocupada";
}

const Mesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([
    { id: "1", numero: 1, capacidade: 4, status: "livre" },
    { id: "2", numero: 2, capacidade: 6, status: "ocupada" },
    { id: "3", numero: 3, capacidade: 2, status: "livre" },
    { id: "4", numero: 4, capacidade: 4, status: "livre" },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ numero: "", capacidade: "" });

  const handleSave = () => {
    if (!form.numero || !form.capacidade) { toast.error("Preencha todos os campos"); return; }
    setMesas((prev) => [...prev, { id: Date.now().toString(), numero: parseInt(form.numero), capacidade: parseInt(form.capacidade), status: "livre" }]);
    toast.success("Mesa adicionada!");
    setOpen(false);
    setForm({ numero: "", capacidade: "" });
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
        {mesas.map((mesa) => (
          <Card key={mesa.id} className={mesa.status === "ocupada" ? "border-primary/50" : ""}>
            <CardContent className="p-4 text-center space-y-2">
              <div className="text-3xl font-bold">{mesa.numero}</div>
              <p className="text-sm text-muted-foreground">{mesa.capacidade} pessoas</p>
              <Badge variant={mesa.status === "livre" ? "secondary" : "default"}>
                {mesa.status === "livre" ? "Livre" : "Ocupada"}
              </Badge>
              <div className="pt-2">
                <Button variant="ghost" size="icon" onClick={() => setMesas((prev) => prev.filter((m) => m.id !== mesa.id))}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Mesas;
