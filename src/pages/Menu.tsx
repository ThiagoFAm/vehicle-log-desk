import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, List, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Menu = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-background to-primary/5">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Sistema de Portaria</h2>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Sistema de Cadastro de Portaria
          </h1>
          <p className="text-muted-foreground">
            Gerencie veículos e proprietários de forma simples e eficiente
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/cadastro")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Cadastrar Veículo e Proprietário</CardTitle>
              <CardDescription>
                Formulário para registrar a placa e vincular ao responsável
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Novo Cadastro
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/listagem")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <List className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Visualizar Cadastros</CardTitle>
              <CardDescription>
                Lista completa de todos os veículos e seus proprietários/setores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Ver Listagem
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Menu;
