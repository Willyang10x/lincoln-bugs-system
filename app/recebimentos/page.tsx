"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { IncomesTable } from "@/components/incomes-table"
import { NewIncomeModal } from "@/components/new-income-modal"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Loader2, TrendingUp } from "lucide-react"
import { useDate } from "@/contexts/date-context" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function RecebimentosPage() {
  const router = useRouter()
  const { month, year } = useDate() // <--- PEGAMOS A DATA DO HEADER
  
  const [incomes, setIncomes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isNewIncomeOpen, setIsNewIncomeOpen] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (!token) {
      router.push("/login")
    } else {
      setIsCheckingAuth(false)
      fetchIncomes(token)
    }
  }, [router, updateTrigger, month, year]) // <--- ATUALIZA QUANDO MÊS/ANO MUDAR

  const fetchIncomes = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/recebimentos/`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem("finance_token")
        router.push("/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        
        const mappedData = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.titulo,
          value: item.valor,
          client: item.cliente,
          status: item.status,
          date: new Date(item.data_recebimento).toLocaleDateString('pt-BR'),
          rawDate: new Date(item.data_recebimento) // Data crua para filtro
        }))

        // --- FILTRO INTELIGENTE ---
        const filteredData = mappedData.filter((item: any) => {
            const itemMonth = item.rawDate.getMonth() + 1
            const itemYear = item.rawDate.getFullYear()
            return itemMonth === month && itemYear === year
        })

        setIncomes(filteredData.reverse())
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este recebimento?")) return;
    const token = localStorage.getItem("finance_token")
    try {
        const response = await fetch(`${API_URL}/recebimentos/${id}`, { 
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
        if (response.ok) setUpdateTrigger(prev => prev + 1)
    } catch (error) { console.error(error) }
  }

  if (isCheckingAuth) return <div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-zinc-950/50">
            <div className="max-w-[1600px] mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
                      Receitas
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">Gerencie suas entradas financeiras.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="secondary" onClick={() => setUpdateTrigger(prev => prev + 1)} disabled={isLoading} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white shrink-0">
                     <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  <Button 
                      onClick={() => setIsNewIncomeOpen(true)} 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-bold flex-1 sm:flex-none"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Nova Receita</span>
                    <span className="sm:hidden">Nova</span>
                  </Button>
                </div>
              </div>
              
              <IncomesTable incomes={incomes} onDelete={handleDeleteIncome} />
            </div>
          </main>
        </div>
        <NewIncomeModal open={isNewIncomeOpen} onOpenChange={setIsNewIncomeOpen} onSuccess={() => setUpdateTrigger(prev => prev + 1)} />
      </div>
    </SidebarProvider>
  )
}