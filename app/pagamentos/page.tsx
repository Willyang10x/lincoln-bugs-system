"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { PaymentsTable } from "@/components/payments-table"
import { NewPaymentModal } from "@/components/new-payment-modal" 
import { EditPaymentModal } from "@/components/edit-payment-modal"
import { ReceiptViewerModal } from "@/components/receipt-viewer-modal"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Loader2, CreditCard } from "lucide-react"
import { useDate } from "@/contexts/date-context" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function PagamentosPage() {
  const router = useRouter()
  // --- PEGANDO DATA DO CONTEXTO ---
  const { month, year } = useDate()
  
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Modais
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [selectedPaymentToEdit, setSelectedPaymentToEdit] = useState<any>(null)
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false)
  
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (!token) {
      router.push("/login")
    } else {
      setIsCheckingAuth(false)
      fetchPayments(token)
    }
  }, [router, updateTrigger, month, year]) // <--- ADICIONADO month e year NAS DEPENDÊNCIAS

  const fetchPayments = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/pagamentos/`, { headers: { "Authorization": `Bearer ${token}` } })
      
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
          category: item.categoria,
          date: new Date(item.data_pagamento).toLocaleDateString('pt-BR'),
          rawDate: new Date(item.data_pagamento), // DATA CRUA PARA FILTRAR
          hasReceipt: !!item.comprovante_path,
          receiptUrl: item.comprovante_path
        }))

        // --- FILTRAGEM ---
        const filteredData = mappedData.filter((item: any) => {
            // +1 pois getMonth é 0-11
            const itemMonth = item.rawDate.getMonth() + 1
            const itemYear = item.rawDate.getFullYear()
            
            return itemMonth === month && itemYear === year
        })

        setPayments(filteredData.reverse())
      }
    } catch (error) { console.error("Erro:", error) } finally { setIsLoading(false) }
  }

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const token = localStorage.getItem("finance_token")
    await fetch(`${API_URL}/pagamentos/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } })
    // Força atualização para pegar o filtro certo
    setUpdateTrigger(prev => prev + 1)
  }

  if (isCheckingAuth) return <div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          {/* AJUSTE: p-4 no mobile para ganhar espaço */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-zinc-950/50">
            <div className="max-w-[1600px] mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  {/* AJUSTE: Tamanho da fonte responsivo */}
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                      <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
                      Pagamentos
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Histórico completo de despesas.
                  </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="secondary" onClick={() => setUpdateTrigger(prev => prev + 1)} disabled={isLoading} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white shrink-0">
                     <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  {/* AJUSTE: Botão flexível que esconde texto no mobile */}
                  <Button 
                      onClick={() => setIsNewPaymentOpen(true)} 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-bold flex-1 sm:flex-none"
                  >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Novo Pagamento</span>
                    <span className="sm:hidden">Novo</span>
                  </Button>
                </div>
              </div>

              <PaymentsTable 
                  payments={payments} 
                  onDelete={handleDeletePayment}
                  onEdit={(p) => { setSelectedPaymentToEdit(p); setIsEditPaymentOpen(true) }} 
                  onViewReceipt={setSelectedReceipt}
              />
            </div>
          </main>
        </div>

        <NewPaymentModal open={isNewPaymentOpen} onOpenChange={setIsNewPaymentOpen} onSuccess={() => setUpdateTrigger(prev => prev + 1)} />
        <ReceiptViewerModal payment={selectedReceipt} open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)} />
        <EditPaymentModal payment={selectedPaymentToEdit} open={isEditPaymentOpen} onOpenChange={setIsEditPaymentOpen} onSuccess={() => setUpdateTrigger(prev => prev + 1)} />
      </div>
    </SidebarProvider>
  )
}