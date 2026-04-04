import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Orcamentos = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
        <p className="text-muted-foreground">
          Crie e gerencie orçamentos para clientes.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Lista de Orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhum orçamento cadastrado. Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orcamentos;
