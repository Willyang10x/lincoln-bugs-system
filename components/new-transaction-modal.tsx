"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, PlusCircle } from "lucide-react"
import { toast } from "sonner" 

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function NewTransactionModal({ open, onOpenChange, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState("Despesa") 
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
        const res = await fetch(`${API_URL}/categories/`, { headers: { "Authorization": `Bearer ${token}` } })
        if (res.ok) setCategories(await res.json())
    } catch (e) { console.error(e) }
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

      let endpoint = "/pagamentos/"
      if (type === "Receita") {
          endpoint = "/recebimentos/"
          formData.append("cliente", "Diversos") 
          formData.append("status", "Recebido")
      } else if (file) {
          formData.append("comprovante", file)
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData
      })

      if (res.ok) {
        onSuccess(); toast.success("Salvo!"); onOpenChange(false)
        setTitle(""); setValue(""); setCategory(""); setFile(null);
      } else { toast.error("Erro ao salvar.") }
    } catch (error) { toast.error("Erro conexão.") } finally { setIsLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
        <Tabs defaultValue="Despesa" onValueChange={setType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
                <TabsTrigger value="Despesa">Despesa</TabsTrigger>
                <TabsTrigger value="Receita">Receita</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required className="bg-zinc-900 border-zinc-800" />
                <div className="grid grid-cols-2 gap-4">
                    <Input type="number" step="0.01" placeholder="Valor" value={value} onChange={e => setValue(e.target.value)} required className="bg-zinc-900 border-zinc-800" />
                    <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white" value={category} onChange={e => setCategory(e.target.value)} required>
                        <option value="" disabled>Categoria...</option>
                        {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                {type === "Despesa" && (
                    <Input type="file" className="bg-zinc-900 border-zinc-800" onChange={e => setFile(e.target.files?.[0] || null)} />
                )}
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <PlusCircle />} Salvar
                </Button>
            </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}