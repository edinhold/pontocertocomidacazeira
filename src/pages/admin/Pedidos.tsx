import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const pedidosMock = [
  { id: "001", mesa: 2, itens: "Feijoada, Coca-Cola", total: 41.0, status: "pronto", hora: "12:30" },
  { id: "002", mesa: 5, itens: "Frango Parmegiana, Suco de Laranja", total: 36.0, status: "preparando", hora: "12:45" },
  { id: "003", mesa: 3, itens: "Feijoada x2, Cerveja x2", total: 86.0, status: "pendente", hora: "13:00" },
];

const statusColors: Record<string, string> = {
  pendente: "bg-warning/10 text-warning",
  preparando: "bg-primary/10 text-primary",
  pronto: "bg-success/10 text-success",
};

const Pedidos = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Pedidos</h1>
    <Card>
      <CardContent className="p-0">
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
            {pedidosMock.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.id}</TableCell>
                <TableCell>{p.mesa}</TableCell>
                <TableCell>{p.itens}</TableCell>
                <TableCell>R$ {p.total.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[p.status]}`}>{p.status}</span>
                </TableCell>
                <TableCell>{p.hora}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default Pedidos;
