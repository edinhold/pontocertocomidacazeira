import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, ShoppingBag, TrendingUp, Users, Printer, Lock, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { getPedidos, type Pedido } from "@/lib/pedidosStore";
import { getVendas, type Venda } from "@/lib/vendasStore";
import { supabase } from "@/integrations/supabase/client";

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const isThisWeek = (date: Date, now: Date) => {
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
};

const isSameMonth = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();

const Dashboard = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [diaFechado, setDiaFechado] = useState(false);
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes">("dia");

  const loadData = async () => {
    const [p, v] = await Promise.all([getPedidos(), getVendas()]);
    setPedidos(p);
    setVendas(v);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("pedidos-updated", loadData);
    window.addEventListener("vendas-updated", loadData);

    const channel = supabase
      .channel('dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, () => loadData())
      .subscribe();

    return () => {
      window.removeEventListener("pedidos-updated", loadData);
      window.removeEventListener("vendas-updated", loadData);
      supabase.removeChannel(channel);
    };
  }, []);

  const now = new Date();

  const filtrarPorPeriodo = (dataStr: string) => {
    const data = new Date(dataStr);
    if (periodo === "dia") return isSameDay(data, now);
    if (periodo === "semana") return isThisWeek(data, now);
    return isSameMonth(data, now);
  };

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => filtrarPorPeriodo(p.criadoEm));
  }, [pedidos, periodo]);

  const vendasFiltradas = useMemo(() => {
    return vendas.filter((v) => filtrarPorPeriodo(v.fechadoEm));
  }, [vendas, periodo]);

  const totalVendas = vendasFiltradas.reduce((sum, v) => sum + v.total, 0);
  const totalVendasCount = vendasFiltradas.length;
  const totalPedidosAtivos = pedidosFiltrados.length;

  const periodoLabel = periodo === "dia" ? "Hoje" : periodo === "semana" ? "Esta Semana" : "Este Mês";

  const stats = [
    { title: `Vendas ${periodoLabel}`, value: `R$ ${totalVendas.toFixed(2).replace(".", ",")}`, icon: DollarSign },
    { title: `Mesas Fechadas ${periodoLabel}`, value: totalVendasCount.toString(), icon: ShoppingBag },
    { title: "Ticket Médio", value: totalVendasCount > 0 ? `R$ ${(totalVendas / totalVendasCount).toFixed(2).replace(".", ",")}` : "R$ 0,00", icon: TrendingUp },
    { title: `Pedidos Ativos`, value: totalPedidosAtivos.toString(), icon: Users },
  ];

  const imprimirRelatorio = () => {
    const totalPrint = vendasFiltradas.reduce((sum, v) => sum + v.total, 0);
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString("pt-BR");
    const horaFormatada = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório - Ponto Certo</title>
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
          <h2>Relatório ${periodoLabel}</h2>
          <div class="divider"></div>
          <p><strong>Data:</strong> ${dataFormatada} &nbsp; <strong>Hora:</strong> ${horaFormatada}</p>
          <div class="divider"></div>
          <table>
            <thead>
              <tr><th>#</th><th>Mesa</th><th>Itens</th><th class="text-right">Total</th></tr>
            </thead>
            <tbody>
              ${vendasFiltradas.map((v, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${v.mesa === 0 ? "WhatsApp" : v.mesa}</td>
                  <td>${v.itens.map(it => it.nome).join(", ")}</td>
                  <td class="text-right">R$ ${v.total.toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr class="total-row">
              <td>Vendas Fechadas:</td>
              <td class="text-right">${vendasFiltradas.length}</td>
            </tr>
            <tr class="total-row">
              <td>Total em Vendas:</td>
              <td class="text-right">R$ ${totalPrint.toFixed(2)}</td>
            </tr>
            ${vendasFiltradas.length > 0 ? `
            <tr>
              <td>Ticket Médio:</td>
              <td class="text-right">R$ ${(totalPrint / vendasFiltradas.length).toFixed(2)}</td>
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

      <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as "dia" | "semana" | "mes")} className="w-full">
        <TabsList>
          <TabsTrigger value="dia"><Calendar className="size-4 mr-1.5" />Dia</TabsTrigger>
          <TabsTrigger value="semana"><CalendarDays className="size-4 mr-1.5" />Semana</TabsTrigger>
          <TabsTrigger value="mes"><CalendarRange className="size-4 mr-1.5" />Mês</TabsTrigger>
        </TabsList>
      </Tabs>

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
          <CardTitle>Vendas Fechadas - {periodoLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          {vendasFiltradas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma venda registrada neste período. As vendas são computadas ao fechar uma mesa ou via WhatsApp.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Fechado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendasFiltradas.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.mesa === 0 ? "📱 WhatsApp" : `Mesa ${v.mesa}`}</TableCell>
                    <TableCell>{v.itens.map(it => `${it.quantidade}x ${it.nome}`).join(", ")}</TableCell>
                    <TableCell>R$ {v.total.toFixed(2).replace(".", ",")}</TableCell>
                    <TableCell>{new Date(v.fechadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
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
