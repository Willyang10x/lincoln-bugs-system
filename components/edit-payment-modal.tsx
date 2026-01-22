"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface EditPaymentModalProps {
  payment: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPaymentModal({ payment, open, onOpenChange, onSuccess }: EditPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    category: ""
  })

  useEffect(() => {
    if (payment) {
      setFormData({
        title: payment.title,
        value: payment.value.toString(),
        category: payment.category
      })
    }
  }, [payment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem("finance_token")

    try {
      const data = new FormData()
      data.append("titulo", formData.title)
      data.append("valor", formData.value)
      data.append("categoria", formData.category)

      const response = await fetch(`${API_URL}/pagamentos/${payment.id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}` 
        },
        body: data,
      })

      if (response.ok) {
        onSuccess()
        toast.success("Pagamento atualizado com sucesso!") // <--- MUDANÇA
        onOpenChange(false)
      } else {
        toast.error("Erro ao atualizar pagamento.") // <--- MUDANÇA
      }
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro de conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Pagamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({...formData, category: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aluguel">Aluguel</SelectItem>
                <SelectItem value="Salários">Salários</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="Softwares">Softwares</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}