import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrdensServico = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
        <p className="text-muted-foreground">
          Gerencie as ordens de serviço atribuídas a técnicos.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Ordens Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma ordem de serviço disponível no momento. As ordens aparecerão aqui quando orçamentos forem aprovados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdensServico;
