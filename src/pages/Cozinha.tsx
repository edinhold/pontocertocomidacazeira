import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Printer, Check, ChefHat, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { getPedidos, atualizarStatusPedido, type Pedido } from "@/lib/pedidosStore";

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    playTone(880, 0, 0.15);
    playTone(1100, 0.18, 0.15);
    playTone(1320, 0.36, 0.25);
  } catch {}
};

const Cozinha = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>(getPedidos());
  const [somAtivo, setSomAtivo] = useState(true);
  const prevPendentesRef = useRef<string[]>([]);

  const carregarPedidos = useCallback(() => {
    const todos = getPedidos();
    setPedidos(todos);

    const pendenteIds = todos.filter(p => p.status === "pendente").map(p => p.id);
    const novos = pendenteIds.filter(id => !prevPendentesRef.current.includes(id));
    if (novos.length > 0 && somAtivo) {
      playNotificationSound();
      toast.info(`🔔 ${novos.length} novo(s) pedido(s)!`);
    }
    prevPendentesRef.current = pendenteIds;
  }, [somAtivo]);

  useEffect(() => {
    carregarPedidos();
    const interval = setInterval(carregarPedidos, 3000);
    window.addEventListener("pedidos-updated", carregarPedidos);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pedidos-updated", carregarPedidos);
    };
  }, [carregarPedidos]);

  const updateStatus = (id: string, status: Pedido["status"]) => {
    atualizarStatusPedido(id, status);
    carregarPedidos();
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
        ${pedido.itens.map((i) => `<div class="item"><span>${i.nome}</span><span>x${i.quantidade}</span></div>${i.observacao ? `<div style="font-size:11px;color:#666;padding-left:8px">📝 ${i.observacao}</div>` : ""}`).join("")}
        ${pedido.observacaoGeral ? `<hr/><div style="font-size:11px;color:#666">📋 Obs. geral: ${pedido.observacaoGeral}</div>` : ""}
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
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSomAtivo(!somAtivo)} title={somAtivo ? "Desativar som" : "Ativar som"}>
            {somAtivo ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><LogOut className="size-4" /></Button>
        </div>
      </header>
      <div className="p-4 max-w-6xl mx-auto">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className={`border-2 ${statusColors[pedido.status]}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pedido #{pedido.id}</CardTitle>
                  <Badge variant="outline">{pedido.mesa === 0 ? "📱 WhatsApp" : `Mesa ${pedido.mesa}`}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{pedido.hora}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  {pedido.itens.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-sm">
                        <span>{item.nome}</span>
                        <span className="font-medium">x{item.quantidade}</span>
                      </div>
                      {item.observacao && (
                        <p className="text-xs text-muted-foreground italic pl-2">📝 {item.observacao}</p>
                      )}
                    </div>
                  ))}
                </div>
                {pedido.observacaoGeral && (
                  <div className="bg-muted/50 rounded p-2 text-xs italic border">
                    📋 <strong>Obs. geral:</strong> {pedido.observacaoGeral}
                  </div>
                )}
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
