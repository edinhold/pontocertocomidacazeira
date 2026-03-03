import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";

const stats = [
  { title: "Vendas Hoje", value: "R$ 1.250,00", icon: DollarSign, change: "+12%" },
  { title: "Pedidos Hoje", value: "34", icon: ShoppingBag, change: "+5%" },
  { title: "Vendas Semana", value: "R$ 8.430,00", icon: TrendingUp, change: "+8%" },
  { title: "Funcionários Ativos", value: "6", icon: Users, change: "" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-muted-foreground">{stat.change} desde ontem</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vendas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dados de vendas serão exibidos aqui após conectar ao banco de dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
