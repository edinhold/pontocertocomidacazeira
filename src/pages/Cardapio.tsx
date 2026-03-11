import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, ShoppingCart, Send, Truck, UtensilsCrossed, Wine, CirclePlus } from "lucide-react";
import { toast } from "sonner";
import { getPratos, type Prato } from "@/lib/pratosStore";
import { getBebidas, type Bebida } from "@/lib/bebidasStore";
import { getAdicionais, type Adicional } from "@/lib/adicionaisStore";
import { useConfig } from "@/hooks/useConfig";
import Logo from "@/components/Logo";

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  tipo: "prato" | "bebida" | "adicional";
}

const Cardapio = () => {
  const { config, loading } = useConfig();
  const pratos = getPratos().filter((p) => p.disponivel);
  const bebidas = getBebidas();
  const adicionais = getAdicionais();

  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacao, setObservacao] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"entrega" | "retirada">("entrega");

  const addToCart = (item: { id: string; nome: string; preco: number }, tipo: CartItem["tipo"]) => {
    setCarrinho((prev) => {
      const key = `${tipo}-${item.id}`;
      const existing = prev.find((i) => `${i.tipo}-${i.id}` === key);
      if (existing) return prev.map((i) => (`${i.tipo}-${i.id}` === key ? { ...i, quantidade: i.quantidade + 1 } : i));
      return [...prev, { id: item.id, nome: item.nome, preco: item.preco, quantidade: 1, tipo }];
    });
  };

  const updateQty = (id: string, tipo: string, delta: number) => {
    const key = `${tipo}-${id}`;
    setCarrinho((prev) =>
      prev
        .map((i) => (`${i.tipo}-${i.id}` === key ? { ...i, quantidade: Math.max(0, i.quantidade + delta) } : i))
        .filter((i) => i.quantidade > 0)
    );
  };

  const subtotal = useMemo(() => carrinho.reduce((sum, i) => sum + i.preco * i.quantidade, 0), [carrinho]);
  const taxaEntrega = tipoEntrega === "entrega" ? config.taxaEntrega : 0;
  const total = subtotal + taxaEntrega;

  const enviarWhatsApp = () => {
    if (!config.whatsapp) {
      toast.error("Restaurante ainda não configurou o WhatsApp. Tente novamente mais tarde.");
      return;
    }
    if (carrinho.length === 0) {
      toast.error("Adicione itens ao carrinho");
      return;
    }
    if (!nome.trim()) {
      toast.error("Informe seu nome");
      return;
    }
    if (tipoEntrega === "entrega" && !endereco.trim()) {
      toast.error("Informe o endereço de entrega");
      return;
    }

    const linhas = [
      `🍽️ *PEDIDO - ${config.nomeRestaurante}*`,
      "",
      `👤 *Nome:* ${nome}`,
      tipoEntrega === "entrega" ? `📍 *Endereço:* ${endereco}` : `🏪 *Retirada no local*`,
      "",
      "📋 *Itens do Pedido:*",
      ...carrinho.map((i) => `• ${i.quantidade}x ${i.nome} — R$ ${(i.preco * i.quantidade).toFixed(2)}`),
      "",
      `💰 *Subtotal:* R$ ${subtotal.toFixed(2)}`,
    ];

    if (tipoEntrega === "entrega" && taxaEntrega > 0) {
      linhas.push(`🚚 *Taxa de entrega:* R$ ${taxaEntrega.toFixed(2)}`);
    }
    linhas.push(`✅ *Total:* R$ ${total.toFixed(2)}`);

    if (observacao.trim()) {
      linhas.push("", `📝 *Observação:* ${observacao}`);
    }

    const texto = encodeURIComponent(linhas.join("\n"));
    const numero = configAtual.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/55${numero}?text=${texto}`;
    
    // Usar window.location.href como fallback para mobile
    const win = window.open(url, "_blank");
    if (!win) {
      window.location.href = url;
    }
    
    toast.success("Pedido enviado para o WhatsApp!");
  };

  const categoriasOrdenadas = [...new Set(pratos.map((p) => p.categoria))];

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Logo size="md" />
          <h1 className="text-2xl font-bold mt-2">{config.nomeRestaurante}</h1>
          <p className="text-sm opacity-90 mt-1">Cardápio Digital</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
        {/* Pratos */}
        {categoriasOrdenadas.map((cat) => (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UtensilsCrossed className="size-5 text-primary" />
                {cat}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pratos.filter((p) => p.categoria === cat).map((prato) => (
                <div key={prato.id} className="flex items-center justify-between border rounded-lg p-3 gap-3">
                  {prato.imagem && (
                    <img src={prato.imagem} alt={prato.nome} className="size-16 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{prato.nome}</p>
                    {prato.descricao && <p className="text-xs text-muted-foreground">{prato.descricao}</p>}
                    <p className="text-sm font-semibold text-primary mt-1">R$ {prato.preco.toFixed(2)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addToCart(prato, "prato")}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Bebidas */}
        {bebidas.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wine className="size-5 text-primary" />
                Bebidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bebidas.map((bebida) => (
                <div key={bebida.id} className="flex items-center justify-between border rounded-lg p-3 gap-3">
                  {bebida.imagem && (
                    <img src={bebida.imagem} alt={bebida.nome} className="size-16 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{bebida.nome}</p>
                    <p className="text-xs text-muted-foreground">{bebida.categoria}</p>
                    <p className="text-sm font-semibold text-primary mt-1">R$ {bebida.preco.toFixed(2)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addToCart(bebida, "bebida")}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Adicionais */}
        {adicionais.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CirclePlus className="size-5 text-primary" />
                Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {adicionais.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{ad.nome}</p>
                    <p className="text-sm font-semibold text-primary mt-1">+ R$ {ad.preco.toFixed(2)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addToCart(ad, "adicional")}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Taxa de entrega info */}
        {config.taxaEntrega > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card rounded-lg p-3 border">
            <Truck className="size-4 text-primary" />
            <span>Taxa de entrega: <strong className="text-foreground">R$ {config.taxaEntrega.toFixed(2)}</strong></span>
          </div>
        )}
      </div>

      {/* Carrinho fixo no rodapé */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
          <div className="max-w-2xl mx-auto p-4 space-y-3">
            {/* Itens do carrinho */}
            <div className="max-h-40 overflow-y-auto space-y-2">
              {carrinho.map((item) => (
                <div key={`${item.tipo}-${item.id}`} className="flex items-center justify-between text-sm">
                  <span className="flex-1 truncate">{item.nome}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="size-6" onClick={() => updateQty(item.id, item.tipo, -1)}>
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-xs">{item.quantidade}</span>
                    <Button variant="outline" size="icon" className="size-6" onClick={() => updateQty(item.id, item.tipo, 1)}>
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <span className="w-20 text-right font-medium">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Tipo de entrega */}
            <div className="flex gap-2">
              <Button
                variant={tipoEntrega === "entrega" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setTipoEntrega("entrega")}
              >
                <Truck className="size-4 mr-1" />Entrega
              </Button>
              <Button
                variant={tipoEntrega === "retirada" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setTipoEntrega("retirada")}
              >
                🏪 Retirada
              </Button>
            </div>

            {/* Dados do cliente */}
            <Input placeholder="Seu nome *" value={nome} onChange={(e) => setNome(e.target.value)} className="text-sm" />
            {tipoEntrega === "entrega" && (
              <Input placeholder="Endereço de entrega *" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="text-sm" />
            )}
            <Textarea placeholder="Observação (opcional)" value={observacao} onChange={(e) => setObservacao(e.target.value)} className="text-sm min-h-[40px]" />

            {/* Total e botão */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Subtotal: R$ {subtotal.toFixed(2)}</p>
                {tipoEntrega === "entrega" && taxaEntrega > 0 && (
                  <p className="text-xs text-muted-foreground">Entrega: R$ {taxaEntrega.toFixed(2)}</p>
                )}
                <p className="font-bold text-lg">Total: R$ {total.toFixed(2)}</p>
              </div>
              <Button onClick={enviarWhatsApp} size="lg" className="gap-2">
                <Send className="size-4" />
                Pedir via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cardapio;
