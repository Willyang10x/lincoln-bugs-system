"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UploadCloud, FileText } from "lucide-react"
import { toast } from "sonner" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface NewDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewDocumentModal({ open, onOpenChange, onSuccess }: NewDocumentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [file, setFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return toast.error("Por favor, selecione um arquivo.") // <--- MUDANÇA
    
    setIsLoading(true)
    const token = localStorage.getItem("finance_token")

    try {
      const data = new FormData()
      data.append("titulo", title)
      data.append("categoria", category)
      data.append("arquivo", file)

      const response = await fetch(`${API_URL}/documentos/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      })

      if (response.ok) {
        setTitle(""); setCategory(""); setFile(null);
        onSuccess()
        toast.success("Documento arquivado com sucesso!") // <--- MUDANÇA
        onOpenChange(false)
      } else {
        toast.error("Erro ao enviar documento.") // <--- MUDANÇA
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
                    <UploadCloud className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                    <DialogTitle className="text-white">Arquivar Documento</DialogTitle>
                    <DialogDescription className="text-zinc-400">Envie contratos, notas fiscais ou recibos.</DialogDescription>
                </div>
            </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Nome do Arquivo</Label>
            <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="Ex: Contrato Aluguel 2024"
                className="bg-zinc-900 border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-zinc-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-zinc-300">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-emerald-500/20">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="Contrato" className="cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-500">Contrato</SelectItem>
                <SelectItem value="Fiscal" className="cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-500">Fiscal (NF)</SelectItem>
                <SelectItem value="Legal" className="cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-500">Legal</SelectItem>
                <SelectItem value="Garantia" className="cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-500">Garantia</SelectItem>
                <SelectItem value="Outros" className="cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-500">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Upload</Label>
            <div className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl p-8 text-center cursor-pointer relative transition-all group">
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                />
                
                <div className="flex flex-col items-center justify-center gap-2">
                    {file ? (
                        <>
                            <FileText className="h-8 w-8 text-emerald-500" />
                            <span className="text-sm text-emerald-400 font-medium truncate max-w-[200px]">{file.name}</span>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="h-8 w-8 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                            <span className="text-sm text-zinc-500 group-hover:text-zinc-300">Clique ou arraste o arquivo</span>
                        </>
                    )}
                </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-900">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 
                Salvar Arquivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}