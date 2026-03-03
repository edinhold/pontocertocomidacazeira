import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DollarSign, ShoppingBag, TrendingUp, Users, Printer, Lock } from "lucide-react";
import { toast } from "sonner";

interface Pedido {
  id: string;
  mesa: number;
  itens: string;
  total: number;
  status: string;
  hora: string;
}

const Dashboard = () => {
  const [pedidosDoDia, setPedidosDoDia] = useState<Pedido[]>([]);
  const [diaFechado, setDiaFechado] = useState(false);

  const totalVendas = pedidosDoDia
    .filter((p) => p.status === "pronto")
    .reduce((sum, p) => sum + p.total, 0);

  const totalPedidos = pedidosDoDia.length;

  const stats = [
    { title: "Vendas Hoje", value: `R$ ${totalVendas.toFixed(2).replace(".", ",")}`, icon: DollarSign },
    { title: "Pedidos Hoje", value: totalPedidos.toString(), icon: ShoppingBag },
    { title: "Ticket Médio", value: totalPedidos > 0 ? `R$ ${(totalVendas / totalPedidos).toFixed(2).replace(".", ",")}` : "R$ 0,00", icon: TrendingUp },
    { title: "Funcionários Ativos", value: "0", icon: Users },
  ];

  const imprimirRelatorio = () => {
    const pedidosProntos = pedidosDoDia.filter((p) => p.status === "pronto");
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString("pt-BR");
    const horaFormatada = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório do Dia - Ponto Certo</title>
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
          <h2>Relatório de Fechamento do Dia</h2>
          <div class="divider"></div>
          <p><strong>Data:</strong> ${dataFormatada} &nbsp; <strong>Hora:</strong> ${horaFormatada}</p>
          <div class="divider"></div>
          <table>
            <thead>
              <tr><th>#</th><th>Mesa</th><th>Itens</th><th class="text-right">Total</th></tr>
            </thead>
            <tbody>
              ${pedidosProntos.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.mesa}</td>
                  <td>${p.itens}</td>
                  <td class="text-right">R$ ${p.total.toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr class="total-row">
              <td>Total de Pedidos:</td>
              <td class="text-right">${pedidosProntos.length}</td>
            </tr>
            <tr class="total-row">
              <td>Total em Vendas:</td>
              <td class="text-right">R$ ${totalVendas.toFixed(2)}</td>
            </tr>
            ${pedidosProntos.length > 0 ? `
            <tr>
              <td>Ticket Médio:</td>
              <td class="text-right">R$ ${(totalVendas / pedidosProntos.length).toFixed(2)}</td>
            </tr>` : ""}
          </table>
          <div class="divider"></div>
          <p class="footer">Documento gerado automaticamente pelo sistema Ponto Certo</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const fecharDia = () => {
    imprimirRelatorio();
    setDiaFechado(true);
    toast.success("Dia fechado com sucesso! Relatório enviado para impressão.");
  };

  const reabrirDia = () => {
    setDiaFechado(false);
    toast.info("Dia reaberto.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={imprimirRelatorio}>
            <Printer className="size-4 mr-2" />Imprimir Relatório
          </Button>
          {diaFechado ? (
            <Button variant="secondary" onClick={reabrirDia}>
              <Lock className="size-4 mr-2" />Reabrir Dia
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Lock className="size-4 mr-2" />Fechar o Dia
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fechar o dia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso irá gerar o relatório final de vendas e enviar para impressão. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={fecharDia} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Fechar e Imprimir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {diaFechado && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-3">
            <Lock className="size-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Dia fechado. O relatório foi impresso. Clique em "Reabrir Dia" se necessário.</span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {pedidosDoDia.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum pedido registrado hoje. Os pedidos aparecerão aqui após conectar ao banco de dados.
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosDoDia.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell>{p.mesa}</TableCell>
                    <TableCell>{p.itens}</TableCell>
                    <TableCell>R$ {p.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        p.status === "pronto" ? "bg-success/10 text-success" :
                        p.status === "preparando" ? "bg-primary/10 text-primary" :
                        "bg-warning/10 text-warning"
                      }`}>{p.status}</span>
                    </TableCell>
                    <TableCell>{p.hora}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
