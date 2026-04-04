import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Estoque = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
        <p className="text-muted-foreground">
          Controle de materiais, entradas e saídas.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Itens em Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhum item cadastrado no estoque. Este módulo será implementado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Estoque;
