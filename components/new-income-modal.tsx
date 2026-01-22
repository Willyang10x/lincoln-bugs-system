"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, TrendingUp, PlusCircle } from "lucide-react"
import { toast } from "sonner" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface NewIncomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewIncomeModal({ open, onOpenChange, onSuccess }: NewIncomeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ title: "", value: "", client: "", status: "Recebido" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem("finance_token")

    try {
      const data = new FormData()
      data.append("titulo", formData.title)
      data.append("valor", formData.value)
      data.append("cliente", formData.client)
      data.append("status", formData.status)

      const response = await fetch(`${API_URL}/recebimentos/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      })

      if (response.ok) {
        setFormData({ title: "", value: "", client: "", status: "Recebido" })
        toast.success("Receita adicionada com sucesso!") // <--- MUDANÇA
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error("Erro ao salvar. Verifique os dados.") // <--- MUDANÇA
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
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
        <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                    <DialogTitle className="text-white">Nova Receita</DialogTitle>
                    <DialogDescription className="text-zinc-400">Registre uma entrada de dinheiro.</DialogDescription>
                </div>
            </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Título</Label>
            <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
                placeholder="Ex: Venda de Site"
                className="bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-zinc-300">Valor (R$)</Label>
                <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.value} 
                    onChange={(e) => setFormData({...formData, value: e.target.value})} 
                    required 
                    placeholder="0,00"
                    className="bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-zinc-300">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-emerald-500/20">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="Recebido" className="focus:bg-emerald-500/20 focus:text-emerald-500">Recebido</SelectItem>
                    <SelectItem value="Pendente" className="focus:bg-emerald-500/20 focus:text-emerald-500">Pendente</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Cliente / Origem</Label>
            <Input 
                value={formData.client} 
                onChange={(e) => setFormData({...formData, client: e.target.value})} 
                required 
                placeholder="Ex: Google Adsense"
                className="bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white"
            />
          </div>
          
          <DialogFooter className="pt-4 border-t border-zinc-900">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} 
                Salvar Receita
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}