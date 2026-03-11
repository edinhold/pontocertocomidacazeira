import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Plus, Minus, Send, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { adicionarPedido, type ItemPedido } from "@/lib/pedidosStore";
import { getConfig } from "@/lib/configStore";

const mesas = [1, 2, 3, 4, 5, 6, 7, 8];
const cardapio = [
  { id: "1", nome: "Feijoada Completa", preco: 35.0, tipo: "prato" },
  { id: "2", nome: "Frango à Parmegiana", preco: 28.0, tipo: "prato" },
  { id: "3", nome: "Bife Acebolado", preco: 30.0, tipo: "prato" },
  { id: "4", nome: "Coca-Cola 350ml", preco: 6.0, tipo: "bebida" },
  { id: "5", nome: "Suco de Laranja", preco: 8.0, tipo: "bebida" },
  { id: "6", nome: "Cerveja 600ml", preco: 12.0, tipo: "bebida" },
];

const Garcom = () => {
  const navigate = useNavigate();
  const [mesaSelecionada, setMesaSelecionada] = useState("");
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [observacaoAberta, setObservacaoAberta] = useState<string | null>(null);
  const [observacaoGeral, setObservacaoGeral] = useState("");

  const addItem = (item: typeof cardapio[0]) => {
    setItens((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i));
      return [...prev, { ...item, quantidade: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, quantidade: Math.max(0, i.quantidade + delta) } : i)).filter((i) => i.quantidade > 0));
  };

  const total = itens.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  const enviarPedido = () => {
    if (!mesaSelecionada) { toast.error("Selecione uma mesa"); return; }
    if (itens.length === 0) { toast.error("Adicione itens ao pedido"); return; }

    const agora = new Date();
    const pedido = {
      id: crypto.randomUUID().slice(0, 8),
      mesa: Number(mesaSelecionada),
      itens: [...itens],
      total,
      status: "pendente" as const,
      hora: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      criadoEm: agora.toISOString(),
      observacaoGeral: observacaoGeral.trim() || undefined,
    };

    adicionarPedido(pedido);

    // Enviar notificação via WhatsApp
    const config = getConfig();
    if (config.whatsapp) {
      const linhas = [
        `🍽️ *NOVO PEDIDO - ${config.nomeRestaurante}*`,
        "",
        `🪑 *Mesa:* ${mesaSelecionada}`,
        `🕐 *Horário:* ${pedido.hora}`,
        "",
        "📋 *Itens do Pedido:*",
        ...pedido.itens.map((i) => {
          let linha = `• ${i.quantidade}x ${i.nome} — R$ ${(i.preco * i.quantidade).toFixed(2)}`;
          if (i.observacao) linha += ` _(${i.observacao})_`;
          return linha;
        }),
        "",
        `✅ *Total:* R$ ${pedido.total.toFixed(2)}`,
      ];
      if (pedido.observacaoGeral) {
        linhas.push("", `📝 *Observação:* ${pedido.observacaoGeral}`);
      }
      const texto = encodeURIComponent(linhas.join("\n"));
      window.open(`https://wa.me/55${config.whatsapp}?text=${texto}`, "_blank");
    }

    toast.success(`Pedido enviado para a cozinha! Mesa ${mesaSelecionada}`);
    setItens([]);
    setMesaSelecionada("");
    setObservacaoGeral("");
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="font-semibold">Painel do Garçom</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}><LogOut className="size-4" /></Button>
      </header>
      <div className="p-4 max-w-5xl mx-auto grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Mesa</CardTitle></CardHeader>
            <CardContent>
              <Select value={mesaSelecionada} onValueChange={setMesaSelecionada}>
                <SelectTrigger><SelectValue placeholder="Selecione a mesa" /></SelectTrigger>
                <SelectContent>{mesas.map((m) => <SelectItem key={m} value={m.toString()}>Mesa {m}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Cardápio</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Pratos</p>
              {cardapio.filter((i) => i.tipo === "prato").map((item) => (
                <Button key={item.id} variant="outline" className="w-full justify-between" onClick={() => addItem(item)}>
                  <span>{item.nome}</span>
                  <span className="text-muted-foreground">R$ {item.preco.toFixed(2)}</span>
                </Button>
              ))}
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-2">Bebidas</p>
              {cardapio.filter((i) => i.tipo === "bebida").map((item) => (
                <Button key={item.id} variant="outline" className="w-full justify-between" onClick={() => addItem(item)}>
                  <span>{item.nome}</span>
                  <span className="text-muted-foreground">R$ {item.preco.toFixed(2)}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Pedido {mesaSelecionada && <Badge variant="secondary">Mesa {mesaSelecionada}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {itens.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum item adicionado</p>
              ) : (
                <>
                  {itens.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm flex-1">{item.nome}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="size-7" onClick={() => updateQty(item.id, -1)}><Minus className="size-3" /></Button>
                          <span className="w-6 text-center text-sm">{item.quantidade}</span>
                          <Button variant="outline" size="icon" className="size-7" onClick={() => updateQty(item.id, 1)}><Plus className="size-3" /></Button>
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => setObservacaoAberta(observacaoAberta === item.id ? null : item.id)} title="Observação">
                            <MessageSquare className={`size-3 ${item.observacao ? "text-primary" : ""}`} />
                          </Button>
                        </div>
                        <span className="text-sm w-20 text-right">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                      </div>
                      {observacaoAberta === item.id && (
                        <Textarea
                          placeholder="Ex: sem cebola, bem passado..."
                          className="text-xs min-h-[50px]"
                          value={item.observacao || ""}
                          onChange={(e) => setItens((prev) => prev.map((i) => i.id === item.id ? { ...i, observacao: e.target.value } : i))}
                        />
                      )}
                      {item.observacao && observacaoAberta !== item.id && (
                        <p className="text-xs text-muted-foreground italic pl-1">📝 {item.observacao}</p>
                      )}
                    </div>
                  ))}
                  <div className="border-t pt-3 space-y-3">
                    <div>
                      <label className="text-sm font-medium">Observação geral do pedido</label>
                      <Textarea
                        placeholder="Ex: cliente com alergia a glúten, mesa de aniversário..."
                        className="text-xs min-h-[50px] mt-1"
                        value={observacaoGeral}
                        onChange={(e) => setObservacaoGeral(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full" onClick={enviarPedido}>
                    <Send className="size-4 mr-2" />Enviar Pedido
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Garcom;
