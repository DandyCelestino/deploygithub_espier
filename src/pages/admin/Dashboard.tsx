import { ClipboardList, Package, FileText, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  { title: "Ordens Abertas", value: "0", icon: ClipboardList, color: "text-primary" },
  { title: "Orçamentos Pendentes", value: "0", icon: FileText, color: "text-yellow-500" },
  { title: "Itens em Estoque", value: "0", icon: Package, color: "text-accent" },
  { title: "Contas a Receber", value: "R$ 0", icon: DollarSign, color: "text-blue-500" },
];

const AdminDashboard = () => {
  const { profile, roles } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {profile?.full_name || "Usuário"}!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Seus Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong className="text-card-foreground">Nome:</strong> {profile?.full_name || "-"}</p>
          <p><strong className="text-card-foreground">E-mail:</strong> {profile?.email || "-"}</p>
          <p><strong className="text-card-foreground">Matrícula:</strong> {profile?.matricula || "-"}</p>
          <p><strong className="text-card-foreground">Funções:</strong> {roles.join(", ") || "Nenhuma"}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
