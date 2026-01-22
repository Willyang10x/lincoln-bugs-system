"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, PlusCircle, DollarSign } from "lucide-react"
import { toast } from "sonner" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface NewPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewPaymentModal({ open, onOpenChange, onSuccess }: NewPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [value, setValue] = useState("")
  const [category, setCategory] = useState("")
  const [file, setFile] = useState<File | null>(null)
  
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    if (open) {
        const token = localStorage.getItem("finance_token")
        if (token) fetchCategories(token)
    }
  }, [open])

  const fetchCategories = async (token: string) => {
    try {
        const res = await fetch(`${API_URL}/categories/`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
            const data = await res.json()
            setCategories(data.filter((c: any) => c.type === 'Despesa'))
        }
    } catch (error) {
        console.error("Erro ao carregar categorias", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem("finance_token")

    try {
      const formData = new FormData()
      formData.append("titulo", title)
      formData.append("valor", value)
      formData.append("categoria", category)
      if (file) formData.append("comprovante", file)

      const res = await fetch(`${API_URL}/pagamentos/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })

      if (res.ok) {
        onSuccess()
        toast.success("Pagamento registrado!") // <--- MUDANÇA
        onOpenChange(false)
        setTitle(""); setValue(""); setCategory(""); setFile(null);
      } else {
        toast.error("Erro ao salvar pagamento.") // <--- MUDANÇA
      }
    } catch (error) {
      console.error(error)
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
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <DollarSign className="h-5 w-5 text-red-500" />
                </div>
                <div>
                    <DialogTitle className="text-white">Novo Pagamento</DialogTitle>
                    <DialogDescription className="text-zinc-400">Registre uma despesa ou conta paga.</DialogDescription>
                </div>
            </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
                <Label>Título</Label>
                <Input 
                    placeholder="Ex: Aluguel Escritório" 
                    className="bg-zinc-900 border-zinc-800 focus:border-emerald-500"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        className="bg-zinc-900 border-zinc-800 focus:border-emerald-500"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        required
                    >
                        <option value="" disabled>Selecione...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                        {categories.length === 0 && <option value="" disabled>Nenhuma categoria</option>}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Comprovante (Opcional)</Label>
                <Input 
                    type="file" 
                    className="bg-zinc-900 border-zinc-800 text-xs cursor-pointer file:text-emerald-500 file:bg-emerald-500/10 file:border-0 file:rounded-md file:mr-2"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Salvar Pagamento
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}