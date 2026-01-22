"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, PlusCircle, Building } from "lucide-react"
import { toast } from "sonner" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface NewSupplierModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewSupplierModal({ open, onOpenChange, onSuccess }: NewSupplierModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", category: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem("finance_token")

    try {
      const data = new FormData()
      data.append("nome", formData.name)
      data.append("email", formData.email)
      data.append("telefone", formData.phone)
      data.append("categoria", formData.category)

      const response = await fetch(`${API_URL}/fornecedores/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      })

      if (response.ok) {
        setFormData({ name: "", email: "", phone: "", category: "" })
        toast.success("Fornecedor cadastrado com sucesso!") // <--- MUDANÇA
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error("Erro ao cadastrar fornecedor.") // <--- MUDANÇA
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
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px] shadow-2xl">
        <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Building className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                    <DialogTitle className="text-white">Novo Fornecedor</DialogTitle>
                    <DialogDescription className="text-zinc-400">Cadastre um novo parceiro comercial.</DialogDescription>
                </div>
            </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Nome da Empresa / Pessoa</Label>
            <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
                className="bg-zinc-900 border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-zinc-600 text-white"
                placeholder="Ex: Tech Solutions Ltda"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-zinc-300">Email</Label>
                <Input 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="bg-zinc-900 border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-zinc-600 text-white"
                    placeholder="contato@..."
                />
            </div>
            <div className="space-y-2">
                <Label className="text-zinc-300">Telefone</Label>
                <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    className="bg-zinc-900 border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-zinc-600 text-white"
                    placeholder="(00) 00000..."
                />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-zinc-300">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-emerald-500/20">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="Tecnologia" className="focus:bg-emerald-500/20 focus:text-emerald-500 cursor-pointer">Tecnologia</SelectItem>
                <SelectItem value="Serviços" className="focus:bg-emerald-500/20 focus:text-emerald-500 cursor-pointer">Serviços</SelectItem>
                <SelectItem value="Insumos" className="focus:bg-emerald-500/20 focus:text-emerald-500 cursor-pointer">Insumos</SelectItem>
                <SelectItem value="Consultoria" className="focus:bg-emerald-500/20 focus:text-emerald-500 cursor-pointer">Consultoria</SelectItem>
                <SelectItem value="Outros" className="focus:bg-emerald-500/20 focus:text-emerald-500 cursor-pointer">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-900">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} 
                Cadastrar Fornecedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}