import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Financeiro = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground">
          Contas a pagar, receber, fluxo de caixa e relatórios.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Módulo financeiro será implementado em breve com contas a pagar/receber, fluxo de caixa e relatórios.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;
