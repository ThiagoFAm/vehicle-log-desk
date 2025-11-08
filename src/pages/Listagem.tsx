import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, FileText, FileSpreadsheet, Edit, Trash2, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { EditVehicleDialog } from "@/components/EditVehicleDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  owner_name: string;
  department: string;
  extension: string;
}

const Listagem = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    } else if (user) {
      fetchVehicles();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const filtered = vehicles.filter((vehicle) =>
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVehicles(data || []);
      setFilteredVehicles(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar veículos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    try {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicle.id);

      if (error) throw error;

      toast({
        title: "Cadastro excluído com sucesso",
        description: `Veículo ${vehicle.plate} removido.`,
      });

      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingVehicle(null);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Relatório de Veículos Cadastrados", 14, 15);
    
    autoTable(doc, {
      startY: 25,
      head: [["Placa", "Modelo", "Cor", "Proprietário", "Setor", "Ramal"]],
      body: filteredVehicles.map((v) => [
        v.plate,
        v.model,
        v.color,
        v.owner_name,
        v.department,
        v.extension,
      ]),
      theme: "striped",
      headStyles: { fillColor: [0, 122, 204] },
    });

    doc.save("veiculos-cadastrados.pdf");
    toast({
      title: "Relatório exportado",
      description: "PDF gerado com sucesso!",
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredVehicles.map((v) => ({
        Placa: v.plate,
        Modelo: v.model,
        Cor: v.color,
        Proprietário: v.owner_name,
        Setor: v.department,
        Ramal: v.extension,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Veículos");
    XLSX.writeFile(workbook, "veiculos-cadastrados.xlsx");
    
    toast({
      title: "Relatório exportado",
      description: "Excel gerado com sucesso!",
    });
  };

  if (authLoading || loading) {
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Veículos Cadastrados</h1>
          <p className="text-muted-foreground">
            {filteredVehicles.length} {filteredVehicles.length === 1 ? "veículo cadastrado" : "veículos cadastrados"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Lista de Veículos</CardTitle>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/cadastro")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Cadastro
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/menu")}>
                  <Home className="mr-2 h-4 w-4" />
                  Menu
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={exportToExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, proprietário ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                    <TableHead className="text-primary-foreground">Placa</TableHead>
                    <TableHead className="text-primary-foreground">Modelo</TableHead>
                    <TableHead className="text-primary-foreground">Cor</TableHead>
                    <TableHead className="text-primary-foreground">Proprietário</TableHead>
                    <TableHead className="text-primary-foreground">Setor</TableHead>
                    <TableHead className="text-primary-foreground">Ramal</TableHead>
                    <TableHead className="text-primary-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum veículo cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.plate}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.color}</TableCell>
                        <TableCell>{vehicle.owner_name}</TableCell>
                        <TableCell>{vehicle.department}</TableCell>
                        <TableCell>{vehicle.extension}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingVehicle(vehicle)}
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingVehicle(vehicle)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <EditVehicleDialog
        vehicle={editingVehicle}
        open={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        onSuccess={fetchVehicles}
      />

      <DeleteConfirmDialog
        vehicle={deletingVehicle}
        open={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={() => deletingVehicle && handleDelete(deletingVehicle)}
      />
    </div>
  );
};

export default Listagem;
