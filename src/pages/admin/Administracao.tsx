import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Administracao = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administração</h1>
        <p className="text-muted-foreground">
          Gerenciamento de usuários, permissões e configurações gerais.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Usuários e Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Módulo de administração será implementado em breve com gestão de usuários e permissões.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Administracao;
