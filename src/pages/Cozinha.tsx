import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Printer, Check, ChefHat } from "lucide-react";
import { toast } from "sonner";

interface Pedido {
  id: string;
  mesa: number;
  itens: { nome: string; quantidade: number }[];
  hora: string;
  status: "pendente" | "preparando" | "pronto";
}

const Cozinha = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([
    { id: "001", mesa: 2, itens: [{ nome: "Feijoada Completa", quantidade: 1 }, { nome: "Coca-Cola 350ml", quantidade: 2 }], hora: "12:30", status: "pendente" },
    { id: "002", mesa: 5, itens: [{ nome: "Frango à Parmegiana", quantidade: 2 }, { nome: "Suco de Laranja", quantidade: 2 }], hora: "12:45", status: "pendente" },
    { id: "003", mesa: 3, itens: [{ nome: "Bife Acebolado", quantidade: 1 }], hora: "13:00", status: "preparando" },
  ]);

  const updateStatus = (id: string, status: Pedido["status"]) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    if (status === "preparando") toast.info("Pedido aceito!");
    if (status === "pronto") toast.success("Pedido pronto!");
  };

  const imprimirPedido = (pedido: Pedido) => {
    const printContent = `
      <html><head><title>Pedido #${pedido.id}</title>
      <style>body{font-family:monospace;padding:20px}h2{margin:0}hr{border:1px dashed #000}.item{display:flex;justify-content:space-between;padding:4px 0}</style></head>
      <body>
        <h2>PONTO CERTO - COMIDA CASEIRA</h2><hr/>
        <p><strong>Pedido:</strong> #${pedido.id}</p>
        <p><strong>Mesa:</strong> ${pedido.mesa}</p>
        <p><strong>Hora:</strong> ${pedido.hora}</p><hr/>
        ${pedido.itens.map((i) => `<div class="item"><span>${i.nome}</span><span>x${i.quantidade}</span></div>`).join("")}
        <hr/><p style="text-align:center;font-size:12px">*** Ponto Certo ***</p>
      </body></html>
    `;
    const win = window.open("", "_blank", "width=300,height=400");
    if (win) { win.document.write(printContent); win.document.close(); win.print(); }
  };

  const statusColors: Record<string, string> = {
    pendente: "bg-warning/10 text-warning border-warning/30",
    preparando: "bg-primary/10 text-primary border-primary/30",
    pronto: "bg-success/10 text-success border-success/30",
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <ChefHat className="size-5" />
          <span className="font-semibold">Painel da Cozinha</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}><LogOut className="size-4" /></Button>
      </header>
      <div className="p-4 max-w-6xl mx-auto">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className={`border-2 ${statusColors[pedido.status]}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pedido #{pedido.id}</CardTitle>
                  <Badge variant="outline">Mesa {pedido.mesa}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{pedido.hora}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  {pedido.itens.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.nome}</span>
                      <span className="font-medium">x{item.quantidade}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {pedido.status === "pendente" && (
                    <Button size="sm" className="flex-1" onClick={() => updateStatus(pedido.id, "preparando")}>
                      <ChefHat className="size-4 mr-1" />Aceitar
                    </Button>
                  )}
                  {pedido.status === "preparando" && (
                    <Button size="sm" className="flex-1" onClick={() => updateStatus(pedido.id, "pronto")}>
                      <Check className="size-4 mr-1" />Pronto
                    </Button>
                  )}
                  {pedido.status === "pronto" && (
                    <Badge className="flex-1 justify-center py-1">✓ Entregue</Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={() => imprimirPedido(pedido)}>
                    <Printer className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cozinha;
