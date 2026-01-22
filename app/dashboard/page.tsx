"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner" // Importando toast para avisar que é premium

import { SidebarProvider } from "@/components/sidebar-provider" 
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

import { DashboardChart } from "@/components/dashboard-chart"
import { PaymentsTable } from "@/components/payments-table"
import { EditPaymentModal } from "@/components/edit-payment-modal"
import { NewTransactionModal } from "@/components/new-transaction-modal"
import { ReceiptViewerModal } from "@/components/receipt-viewer-modal"
import { AiAnalysisModal } from "@/components/ai-analysis-modal"
import { 
    DollarSign, CreditCard, TrendingUp, Wallet, Loader2,
    Download, FileText, Table, Plus, Sparkles, Lock 
} from "lucide-react"

import { useDate } from "@/contexts/date-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export default function Dashboard() {
  const router = useRouter()
  const { month, year } = useDate() 

  const [isLoading, setIsLoading] = useState(true)
  
  const [allPayments, setAllPayments] = useState<any[]>([]) 
  const [allReceipts, setAllReceipts] = useState<any[]>([]) 
  
  // Modais
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [selectedPaymentToEdit, setSelectedPaymentToEdit] = useState<any>(null)
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false)
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // ESTADO DO USUÁRIO (PARA CHECAR PREMIUM)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (!token) {
        router.push("/login")
    } else {
        fetchDashboardData(token)
        fetchUserData(token) 
    }
  }, [router, updateTrigger])

  const fetchUserData = async (token: string) => {
      try {
          const res = await fetch(`${API_URL}/users/me`, {
              headers: { "Authorization": `Bearer ${token}` }
          })
          if (res.ok) {
              const data = await res.json()
              setUser(data)
          }
      } catch (e) { console.error("Erro ao buscar user", e) }
  }

  const fetchDashboardData = async (token: string) => {
    try {
      const [resPagamentos, resRecebimentos] = await Promise.all([
        fetch(`${API_URL}/pagamentos/`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/recebimentos/`, { headers: { "Authorization": `Bearer ${token}` } })
      ])
      
      if (resPagamentos.status === 401 || resRecebimentos.status === 401) { 
          localStorage.removeItem("finance_token"); 
          router.push("/login"); 
          return 
      }
      
      if (resPagamentos.ok && resRecebimentos.ok) {
        const dataPag = await resPagamentos.json()
        const dataRec = await resRecebimentos.json()
        
        const formattedPayments = dataPag.map((item: any) => ({
          id: item.id.toString(),
          title: item.titulo,
          value: item.valor,
          category: item.categoria,
          date: new Date(item.data_pagamento).toLocaleDateString('pt-BR'),
          rawDate: new Date(item.data_pagamento),
          hasReceipt: !!item.comprovante_path,
          receiptUrl: item.comprovante_path 
        })).sort((a:any, b:any) => b.rawDate - a.rawDate)

        const formattedReceipts = dataRec.map((item: any) => ({
          id: item.id,
          title: item.titulo,
          value: item.valor,
          category: "Receita", 
          date: new Date(item.data_recebimento),
          rawDate: new Date(item.data_recebimento)
        }))

        setAllPayments(formattedPayments)
        setAllReceipts(formattedReceipts)
      }
    } catch (error) { console.error("Erro", error) } finally { setIsLoading(false) }
  }

  const { filteredPayments, filteredReceipts, totalExpenses, totalIncome, balance } = useMemo(() => {
    const fPayments = allPayments.filter(p => {
        const pMonth = p.rawDate.getMonth() + 1
        const pYear = p.rawDate.getFullYear()
        return pMonth === month && pYear === year
    })

    const fReceipts = allReceipts.filter(r => {
        const rMonth = r.rawDate.getMonth() + 1
        const rYear = r.rawDate.getFullYear()
        return rMonth === month && rYear === year
    })

    const tExpenses = fPayments.reduce((acc, curr) => acc + curr.value, 0)
    const tIncome = fReceipts.reduce((acc, curr) => acc + curr.value, 0)
    
    return {
        filteredPayments: fPayments,
        filteredReceipts: fReceipts,
        totalExpenses: tExpenses,
        totalIncome: tIncome,
        balance: tIncome - tExpenses
    }
  }, [allPayments, allReceipts, month, year])

  const handleExportExcel = () => {
    const csvRows = []
    csvRows.push(["Data", "Titulo", "Categoria", "Valor", "Tipo"].join(","))
    filteredReceipts.forEach(r => csvRows.push([r.date.toLocaleDateString('pt-BR'), `"${r.title}"`, r.category, r.value.toFixed(2), "Receita"].join(",")))
    filteredPayments.forEach(p => csvRows.push([p.date, `"${p.title}"`, p.category, `-${p.value.toFixed(2)}`, "Despesa"].join(",")))
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `relatorio_${MONTHS[month-1]}_${year}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = async () => {
    const doc = new jsPDF()
    
    try {
        const imgData = await fetch('/logo-text.png').then(res => res.blob()).then(blob => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        });
        // Ajuste para logo retangular (texto)
        doc.addImage(imgData, 'PNG', 14, 10, 40, 15);
    } catch (e) {
        console.error("Erro ao carregar logo", e)
    }

    doc.setFontSize(18)
    doc.text(`Relatório Mensal - ${MONTHS[month-1]}/${year}`, 14, 35)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 40)
    
    doc.setTextColor(0)
    doc.setDrawColor(200)
    doc.line(14, 45, 196, 45)
    doc.setFontSize(12)
    doc.text(`Receitas:`, 14, 55)
    doc.setTextColor(0, 150, 0)
    doc.text(`R$ ${totalIncome.toFixed(2)}`, 35, 55)
    doc.setTextColor(0)
    doc.text(`Despesas:`, 80, 55)
    doc.setTextColor(200, 0, 0)
    doc.text(`R$ ${totalExpenses.toFixed(2)}`, 105, 55)
    doc.setTextColor(0)
    doc.text(`Saldo:`, 150, 55)
    if (balance >= 0) doc.setTextColor(0, 150, 0)
    else doc.setTextColor(200, 0, 0)
    doc.text(`R$ ${balance.toFixed(2)}`, 165, 55)
    doc.setTextColor(0)
    
    const tableData: any[] = []
    filteredReceipts.forEach(r => {
        tableData.push([r.date.toLocaleDateString('pt-BR'), r.title, r.category, `+ R$ ${r.value.toFixed(2)}`, "Receita"])
    })
    filteredPayments.forEach(p => {
        tableData.push([p.date, p.title, p.category, `- R$ ${p.value.toFixed(2)}`, "Despesa"])
    })
    
    autoTable(doc, {
        head: [['Data', 'Título', 'Categoria', 'Valor', 'Tipo']],
        body: tableData,
        startY: 65,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 0, 0], textColor: [212, 175, 55], fontStyle: 'bold' }, // Cabeçalho Preto e Dourado
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: { 0: { cellWidth: 30 }, 3: { halign: 'right' }, 4: { fontStyle: 'bold' } }
    })
    doc.save(`relatorio_lincoln_${MONTHS[month-1]}_${year}.pdf`)
  }

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const token = localStorage.getItem("finance_token")
    await fetch(`${API_URL}/pagamentos/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } })
    setUpdateTrigger(prev => prev + 1)
  }

  const handleAiClick = () => {
    if (user && !user.is_premium) {
        toast("Recurso Exclusivo PRO 🔒", {
            description: "A Inteligência Artificial é exclusiva para assinantes.",
            action: {
                label: "Virar Premium",
                onClick: () => router.push("/planos")
            },
            duration: 5000,
        })
        return 
    }
    setIsAiModalOpen(true)
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-black selection:bg-emerald-500/30"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-black text-zinc-100 selection:bg-emerald-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-zinc-950/50">
            <div className="space-y-6 max-w-[1600px] mx-auto">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Dashboard</h2>
                      <div className="text-sm text-zinc-400">Visão geral de <span className="text-emerald-500 font-bold">{MONTHS[month-1]} de {year}</span></div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <div className="flex gap-2 w-full md:w-auto">
                          {/* BOTÃO IA (BLACK & GOLD) */}
                          <Button 
                              variant="outline"
                              onClick={handleAiClick}
                              className={`
                                  gap-2 flex-1 md:flex-none border
                                  ${user?.is_premium 
                                      ? "bg-zinc-900 border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                                      : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800"}
                              `}
                          >
                              {user?.is_premium ? (
                                  <Sparkles className="h-4 w-4" />
                              ) : (
                                  <Lock className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">IA Insights</span>
                          </Button>

                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-2 flex-none">
                                  <Download className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-400"><FileText className="mr-2 h-4 w-4" />PDF (Black)</DropdownMenuItem>
                              <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer focus:bg-emerald-500/20 focus:text-emerald-400"><Table className="mr-2 h-4 w-4" />Excel (CSV)</DropdownMenuItem>
                          </DropdownMenuContent>
                          </DropdownMenu>

                          <Button 
                              onClick={() => setIsNewTransactionOpen(true)} 
                              className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold gap-2 flex-1 md:flex-none shadow-lg shadow-emerald-500/20"
                          >
                              <Plus className="h-4 w-4" />
                              <span className="hidden sm:inline">Novo Lançamento</span>
                          </Button>
                      </div>
                  </div>
              </div>
              
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Despesas</CardTitle>
                    <DollarSign className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-white">{totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Receitas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-white">{totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Movimentações</CardTitle>
                    <CreditCard className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-white">{filteredPayments.length + filteredReceipts.length}</div></CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-zinc-900 to-black border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-400">Saldo Atual</CardTitle>
                    <Wallet className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DashboardChart pagamentos={filteredPayments} recebimentos={filteredReceipts} />

              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                <Card className="col-span-7 bg-zinc-900 border-zinc-800 min-w-0 shadow-md">
                  <CardHeader><CardTitle className="text-white">Transações Recentes</CardTitle></CardHeader>
                  <CardContent className="p-0 sm:p-6 text-zinc-300"> 
                    <PaymentsTable 
                      payments={filteredPayments} 
                      onDelete={handleDeletePayment}
                      onEdit={(p) => { setSelectedPaymentToEdit(p); setIsEditPaymentOpen(true) }}
                      onViewReceipt={setSelectedReceipt} 
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
        
        <NewTransactionModal open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen} onSuccess={() => setUpdateTrigger(prev => prev + 1)} />
        <AiAnalysisModal open={isAiModalOpen} onOpenChange={setIsAiModalOpen} />
        <ReceiptViewerModal payment={selectedReceipt} open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)} />
        <EditPaymentModal payment={selectedPaymentToEdit} open={isEditPaymentOpen} onOpenChange={setIsEditPaymentOpen} onSuccess={() => setUpdateTrigger(prev => prev + 1)} />
      </div>
    </SidebarProvider>
  )
}