import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, List, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { vehicleService } from "@/services/vehicleService";
import { toast } from "@/hooks/use-toast";

const Cadastro = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: "",
    extension: "",
    department: "",
    plate: "",
    model: "",
    color: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vehicleService.createVehicle({
        owner_name: formData.ownerName,
        extension: formData.extension,
        department: formData.department,
        plate: formData.plate.toUpperCase(),
        model: formData.model,
        color: formData.color,
      });

      toast({
        title: "Veículo cadastrado com sucesso",
        description: `Placa ${formData.plate.toUpperCase()} registrada.`,
      });

      setFormData({
        ownerName: "",
        extension: "",
        department: "",
        plate: "",
        model: "",
        color: "",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar veículo",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-background to-primary/5">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <h2 className="text-lg font-semibold text-primary">Sistema de Portaria</h2>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Cadastro de Veículos - Portaria</h1>
            <p className="text-muted-foreground">
              Preencha os dados do proprietário e do veículo
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Dados do Proprietário</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Nome do Proprietário</Label>
                      <Input
                        id="ownerName"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        placeholder="Nome completo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extension">Ramal</Label>
                      <Input
                        id="extension"
                        name="extension"
                        value={formData.extension}
                        onChange={handleChange}
                        placeholder="Ex: 1234"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Setor</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Ex: Administrativo, TI, Recepção..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Dados do Veículo</h3>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="plate">Placa</Label>
                      <Input
                        id="plate"
                        name="plate"
                        value={formData.plate}
                        onChange={handleChange}
                        placeholder="ABC1234"
                        maxLength={7}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="Ex: Civic, Gol..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Cor</Label>
                      <Input
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="Ex: Preto, Branco..."
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Cadastrando..." : "Cadastrar Veículo"}
                  </Button>

                  <Button type="button" variant="secondary" onClick={() => navigate("/listagem")}>
                    <List className="mr-2 h-4 w-4" />
                    Ver Listagem
                  </Button>

                  <Button type="button" variant="outline" onClick={() => navigate("/menu")}>
                    <Home className="mr-2 h-4 w-4" />
                    Voltar ao Menu
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Cadastro;
