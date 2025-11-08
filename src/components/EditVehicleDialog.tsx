import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { vehicleService } from "@/services/vehicleService";
import { toast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  owner_name: string;
  department: string;
  extension: string;
}

interface EditVehicleDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditVehicleDialog = ({ vehicle, open, onClose, onSuccess }: EditVehicleDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plate: "",
    model: "",
    color: "",
    owner_name: "",
    department: "",
    extension: "",
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate,
        model: vehicle.model,
        color: vehicle.color,
        owner_name: vehicle.owner_name,
        department: vehicle.department,
        extension: vehicle.extension,
      });
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    setLoading(true);

    try {
      await vehicleService.updateVehicle(vehicle.id as any, {
        owner_name: formData.owner_name,
        extension: formData.extension,
        department: formData.department,
        plate: formData.plate.toUpperCase(),
        model: formData.model,
        color: formData.color,
      });

      toast({
        title: "Cadastro atualizado com sucesso",
        description: `Veículo ${formData.plate.toUpperCase()} foi atualizado.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Cadastro</DialogTitle>
          <DialogDescription>
            Atualize as informações do veículo e proprietário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">Dados do Proprietário</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-owner">Nome do Proprietário</Label>
                <Input
                  id="edit-owner"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-extension">Ramal</Label>
                <Input
                  id="edit-extension"
                  value={formData.extension}
                  onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department">Setor</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">Dados do Veículo</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-plate">Placa</Label>
                <Input
                  id="edit-plate"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  maxLength={7}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-model">Modelo</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-color">Cor</Label>
                <Input
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
