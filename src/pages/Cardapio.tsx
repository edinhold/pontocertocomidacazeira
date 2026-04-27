import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Minus,
  ShoppingCart,
  Send,
  Truck,
  UtensilsCrossed,
  Wine,
  CirclePlus,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { getPratos, type Prato } from "@/lib/pratosStore";
import { getBebidas, type Bebida } from "@/lib/bebidasStore";
import { getAdicionais, type Adicional } from "@/lib/adicionaisStore";
import { registrarVenda } from "@/lib/vendasStore";
import { adicionarPedido } from "@/lib/pedidosStore";
import { cadastrarCliente, autenticarCliente } from "@/lib/clientesStore";
import { useConfig } from "@/hooks/useConfig";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { formatWhatsAppUrl } from "@/lib/utils";

const isDark = (hex: string) => {
  if (!hex) return true;
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128;
};

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  tipo: "prato" | "bebida" | "adicional";
}

const Cardapio = () => {
  const { config, loading: configLoading } = useConfig();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [loading, setLoading] = useState(true);

  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacao, setObservacao] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"entrega" | "retirada">("entrega");
  const [enviando, setEnviando] = useState(false);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [passo, setPasso] = useState<"carrinho" | "delivery">("carrinho");
  const [isLogado, setIsLogado] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [p, b, a] = await Promise.all([
      getPratos(),
      getBebidas(),
      getAdicionais()
    ]);
    setPratos(p.filter(item => item.disponivel));
    setBebidas(b);
    setAdicionais(a);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    const userStr = localStorage.getItem("pontocerto_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.tipo === "cliente") {
        setIsLogado(true);
        setNome(user.nome || "");
        // Buscar dados extras se necessário
        const fetchUserData = async () => {
          const { data } = await supabase
            .from("clientes")
            .select("whatsapp, endereco")
            .eq("id", user.id)
            .single();
          if (data) {
            setWhatsapp(data.whatsapp || "");
            setEndereco(data.endereco || "");
          }
        };
        fetchUserData();
      }
    }
  }, []);

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

  const enviarWhatsApp = async () => {
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
    if (!whatsapp.trim()) {
      toast.error("Informe seu WhatsApp");
      return;
    }
    if (tipoEntrega === "entrega" && !endereco.trim()) {
      toast.error("Informe o endereço de entrega");
      return;
    }

    setEnviando(true);

    const linhas = [
      `🍽️ *PEDIDO - ${config.nomeRestaurante}*`,
      "",
      `👤 *Nome:* ${nome}`,
      `📱 *WhatsApp:* ${whatsapp}`,
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

    const texto = linhas.join("\n");
    const url = formatWhatsAppUrl(config.whatsapp, texto);

    try {
      // Salvar informações no usuário se logado
      const userStr = localStorage.getItem("pontocerto_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.tipo === "cliente") {
          await supabase
            .from("clientes")
            .update({
              nome: nome,
              whatsapp: whatsapp,
              endereco: endereco,
            })
            .eq("id", user.id);
        }
      }

      // Registrar como venda do dia
      await registrarVenda({
        id: crypto.randomUUID(),
        mesa: 0,
        itens: carrinho.map((i) => ({
          nome: i.nome,
          preco: i.preco,
          quantidade: i.quantidade,
        })),
        total,
        fechadoEm: new Date().toISOString(),
        observacaoGeral: `WhatsApp - ${nome} (${whatsapp})${tipoEntrega === "entrega" ? ` | ${endereco}` : " | Retirada"}`,
      });

      // Registrar como pedido para aparecer no painel de pedidos
      const pedidoId = `WA${Date.now()}`;
      const agora = new Date();
      await adicionarPedido({
        id: pedidoId,
        mesa: 0,
        itens: carrinho.map((i) => ({
          id: crypto.randomUUID(),
          nome: i.nome,
          preco: i.preco,
          quantidade: i.quantidade,
        })),
        total,
        status: "pendente",
        hora: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        criadoEm: agora.toISOString(),
        observacaoGeral: `📱 WhatsApp - ${nome} (${whatsapp})${tipoEntrega === "entrega" ? ` | Entrega: ${endereco}` : " | Retirada"}`,
      });
    } catch (err) {
      console.error("Erro ao registrar pedido:", err);
    }

    // Usar window.location.href como fallback para mobile
    const win = window.open(url, "_blank");
    if (!win) {
      window.location.href = url;
    }

    // Limpar carrinho após envio
    setCarrinho([]);
    setPasso("carrinho");
    setCarrinhoAberto(false);
    setEnviando(false);

    toast.success("Pedido enviado para o WhatsApp!");
  };

  const categoriasOrdenadas = [...new Set(pratos.map((p) => p.categoria))];

  return (
    <div 
      className={`min-h-screen ${config.imagemFundo ? 'bg-black/40' : 'bg-muted'} relative transition-colors duration-500`}
      style={config.imagemFundo ? { backdropFilter: 'blur(2px)' } : {}}
    >
      {/* Header */}
      <header 
        className="py-6 px-4 text-center transition-colors duration-500"
        style={{ 
          backgroundColor: config.corTema || 'hsl(var(--primary))', 
          color: isDark(config.corTema || '#ea384c') ? '#fff' : '#000' 
        }}
      >
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

      {/* Botão flutuante do Carrinho */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Sheet open={carrinhoAberto} onOpenChange={(open) => {
            setCarrinhoAberto(open);
            if (!open) setPasso("carrinho");
          }}>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full size-16 shadow-2xl relative bg-primary hover:bg-primary/90">
                <ShoppingCart className="size-7" />
                <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1 min-w-[24px] h-6 flex items-center justify-center text-xs font-bold rounded-full">
                  {carrinho.reduce((sum, item) => sum + item.quantidade, 0)}
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl sm:max-w-md mx-auto p-0 flex flex-col">
              <SheetHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    {passo === "delivery" && (
                      <Button variant="ghost" size="icon" onClick={() => setPasso("carrinho")} className="size-8">
                        <ArrowLeft className="size-5" />
                      </Button>
                    )}
                    {passo === "carrinho" ? "Meu Carrinho" : "Dados para Entrega"}
                  </SheetTitle>
                  <Button variant="ghost" size="icon" onClick={() => setCarrinhoAberto(false)} className="size-8">
                    <X className="size-5" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4">
                {passo === "carrinho" ? (
                  <div className="space-y-4">
                    {carrinho.map((item) => (
                      <div key={`${item.tipo}-${item.id}`} className="flex items-center justify-between border-b pb-3">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-medium text-sm truncate">{item.nome}</p>
                          <p className="text-xs text-muted-foreground">R$ {item.preco.toFixed(2)} cada</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                            <Button variant="ghost" size="icon" className="size-7 rounded-full" onClick={() => updateQty(item.id, item.tipo, -1)}>
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantidade}</span>
                            <Button variant="ghost" size="icon" className="size-7 rounded-full" onClick={() => updateQty(item.id, item.tipo, 1)}>
                              <Plus className="size-3" />
                            </Button>
                          </div>
                          <p className="w-20 text-right font-semibold text-sm">
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total</span>
                        <span className="text-primary">R$ {subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Como deseja receber?</label>
                      <div className="flex gap-2">
                        <Button 
                          variant={tipoEntrega === "entrega" ? "default" : "outline"} 
                          className="flex-1 gap-2" 
                          onClick={() => setTipoEntrega("entrega")}
                        >
                          <Truck className="size-4" /> Entrega
                        </Button>
                        <Button 
                          variant={tipoEntrega === "retirada" ? "default" : "outline"} 
                          className="flex-1 gap-2" 
                          onClick={() => setTipoEntrega("retirada")}
                        >
                          🏪 Retirada
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Nome completo *</label>
                        <Input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">WhatsApp *</label>
                        <Input placeholder="(00) 00000-0000" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                      </div>
                      {tipoEntrega === "entrega" && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Endereço de entrega *</label>
                          <Input placeholder="Rua, número, bairro, cidade" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Observação (opcional)</label>
                        <Textarea 
                          placeholder="Ex: Tirar cebola, ponto da carne, etc." 
                          value={observacao} 
                          onChange={(e) => setObservacao(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {tipoEntrega === "entrega" && taxaEntrega > 0 && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Taxa de entrega</span>
                          <span>+ R$ {taxaEntrega.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold pt-2">
                        <span>Total</span>
                        <span className="text-primary">R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="p-4 border-t bg-background mt-auto">
                {passo === "carrinho" ? (
                  <Button className="w-full gap-2 h-12 text-lg" onClick={() => setPasso("delivery")}>
                    Finalizar Pedido <ArrowRight className="size-5" />
                  </Button>
                ) : (
                  <Button 
                    className="w-full gap-2 h-12 text-lg bg-green-600 hover:bg-green-700" 
                    onClick={enviarWhatsApp}
                    disabled={enviando}
                  >
                    <Send className="size-5" />
                    {enviando ? "Processando..." : "Enviar via WhatsApp"}
                  </Button>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};

export default Cardapio;
