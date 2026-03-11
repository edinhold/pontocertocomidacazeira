import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Receipt, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  getPedidos, salvarPedidos, excluirPedido as excluirPedidoStore,
  getPedidosPorMesa, fecharMesa, type Pedido,
} from "@/lib/pedidosStore";

const statusColors: Record<string, string> = {
  pendente: "bg-warning/10 text-warning",
  preparando: "bg-primary/10 text-primary",
  pronto: "bg-success/10 text-success",
};

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(getPedidos());
  const [mesaAberta, setMesaAberta] = useState<number | null>(null);

  const recarregar = useCallback(() => setPedidos(getPedidos()), []);

  useEffect(() => {
    window.addEventListener("pedidos-updated", recarregar);
    const interval = setInterval(recarregar, 2000);
    return () => {
      window.removeEventListener("pedidos-updated", recarregar);
      clearInterval(interval);
    };
  }, [recarregar]);

  const handleExcluir = (id: string) => {
    excluirPedidoStore(id);
    recarregar();
    toast.success("Pedido excluído com sucesso!");
  };

  // Agrupar pedidos por mesa
  const mesasComPedidos = [...new Set(pedidos.map((p) => p.mesa))].sort((a, b) => a - b);

  const pedidosDaMesa = mesaAberta !== null ? getPedidosPorMesa(mesaAberta) : [];
  const totalMesa = pedidosDaMesa.reduce((sum, p) => sum + p.total, 0);

  const imprimirContaMesa = (mesa: number) => {
    const pedidosMesa = getPedidosPorMesa(mesa);
    const totalGeral = pedidosMesa.reduce((sum, p) => sum + p.total, 0);
    const agora = new Date();

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Conta Mesa ${mesa} - Ponto Certo</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
            h2 { text-align: center; font-size: 14px; font-weight: normal; color: #666; margin-top: 0; }
            .divider { border-top: 1px dashed #333; margin: 12px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; padding: 4px 0; border-bottom: 1px solid #333; }
            td { padding: 4px 0; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 8px; }
            .footer { text-align: center; font-size: 11px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>PONTO CERTO - COMIDA CASEIRA</h1>
          <h2>Conta da Mesa ${mesa}</h2>
          <div class="divider"></div>
          <p><strong>Data:</strong> ${agora.toLocaleDateString("pt-BR")} &nbsp; <strong>Hora:</strong> ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
          <div class="divider"></div>
          <table>
            <thead>
              <tr><th>Item</th><th class="text-right">Qtd</th><th class="text-right">Valor</th></tr>
            </thead>
            <tbody>
              ${pedidosMesa.flatMap((p) =>
                p.itens.map((item) => `
                  <tr>
                    <td>${item.nome}</td>
                    <td class="text-right">${item.quantidade}</td>
                    <td class="text-right">R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
                  </tr>
                `)
              ).join("")}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr class="total-row">
              <td>TOTAL:</td>
              <td class="text-right">R$ ${totalGeral.toFixed(2)}</td>
            </tr>
          </table>
          <div class="divider"></div>
          <p class="footer">Obrigado pela preferência!<br/>Documento gerado pelo sistema Ponto Certo</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleFecharMesa = (mesa: number) => {
    imprimirContaMesa(mesa);
    fecharMesa(mesa);
    recarregar();
    setMesaAberta(null);
    toast.success(`Mesa ${mesa} fechada! Conta enviada para impressão.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      {/* Mesas com pedidos ativos */}
      {mesasComPedidos.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {mesasComPedidos.map((mesa) => {
            const pedidosMesa = getPedidosPorMesa(mesa);
            const totalMesaCard = pedidosMesa.reduce((sum, p) => sum + p.total, 0);
            return (
              <Card key={mesa} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setMesaAberta(mesa)}>
                <CardContent className="p-4 text-center">
                  <p className="text-lg font-bold">{mesa === 0 ? "📱 WhatsApp" : `Mesa ${mesa}`}</p>
                  <p className="text-sm text-muted-foreground">{pedidosMesa.length} pedido(s)</p>
                  <p className="text-base font-semibold mt-1">R$ {totalMesaCard.toFixed(2)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todos os Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pedidos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum pedido registrado. Os pedidos do garçom aparecerão aqui automaticamente.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell>Mesa {p.mesa}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {p.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(", ")}
                    </TableCell>
                    <TableCell>R$ {p.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[p.status] || ""}`}>{p.status}</span>
                    </TableCell>
                    <TableCell>{p.hora}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setMesaAberta(p.mesa)} title="Ver mesa">
                          <Receipt className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir pedido #{p.id}?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleExcluir(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de fechamento de mesa */}
      <Dialog open={mesaAberta !== null} onOpenChange={(open) => !open && setMesaAberta(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mesa {mesaAberta} — Conta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {pedidosDaMesa.map((p) => (
              <div key={p.id} className="border rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pedido #{p.id}</span>
                  <span>{p.hora}</span>
                </div>
                {p.itens.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between text-sm">
                      <span>{item.quantidade}x {item.nome}</span>
                      <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                    {item.observacao && (
                      <p className="text-xs text-muted-foreground italic pl-2">📝 {item.observacao}</p>
                    )}
                  </div>
                ))}
                {p.observacaoGeral && (
                  <p className="text-xs text-muted-foreground italic border-t pt-1 mt-1">📋 Obs. geral: {p.observacaoGeral}</p>
                )}
                <div className="text-right text-sm font-semibold">Subtotal: R$ {p.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
            <span>Total da Mesa</span>
            <span>R$ {totalMesa.toFixed(2)}</span>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => mesaAberta !== null && imprimirContaMesa(mesaAberta)}>
              <Printer className="size-4 mr-2" />Imprimir
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Receipt className="size-4 mr-2" />Fechar Mesa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fechar Mesa {mesaAberta}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A conta será impressa e todos os pedidos desta mesa serão encerrados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => mesaAberta !== null && handleFecharMesa(mesaAberta)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Fechar e Imprimir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pedidos;
