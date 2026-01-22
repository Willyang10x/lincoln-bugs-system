"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, BrainCircuit } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface AiAnalysisModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AiAnalysisModal({ open, onOpenChange }: AiAnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState("")

  const handleAnalyze = async () => {
    setIsLoading(true)
    setAnalysis("") 
    const token = localStorage.getItem("finance_token")

    try {
      const res = await fetch(`${API_URL}/system/analyze-finances`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setAnalysis(data.analysis)
      } else {
        setAnalysis("Erro ao conectar com o cérebro da IA. Verifique se a API Key está configurada.")
      }
    } catch (error) {
      console.error(error)
      setAnalysis("Erro de conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-emerald-500/20 text-zinc-100 sm:max-w-[600px] shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 animate-pulse">
                <BrainCircuit className="h-6 w-6 text-purple-400" />
            </div>
            <div>
                <DialogTitle className="text-xl text-white">Consultor IA</DialogTitle>
                <DialogDescription className="text-zinc-400">Análise inteligente dos seus gastos recentes.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-[200px] bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 relative">
            {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="animate-pulse text-sm">Lendo suas transações...</p>
                </div>
            ) : !analysis ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-2">
                    <Sparkles className="h-8 w-8 opacity-20" />
                    <p className="text-sm">Clique em "Gerar Análise" para começar.</p>
                </div>
            ) : (
                <ScrollArea className="h-[300px] pr-4">
                    {/* Exibe o texto preservando quebras de linha */}
                    <div className="prose prose-invert prose-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {analysis}
                    </div>
                </ScrollArea>
            )}
        </div>

        <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
                Fechar
            </Button>
            <Button 
                onClick={handleAnalyze} 
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 gap-2"
            >
                {isLoading ? "Analisando..." : <><Sparkles className="h-4 w-4" /> Gerar Análise IA</>}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}