"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { SidebarProvider } from "@/components/sidebar-provider" 
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ReportsCharts } from "@/components/reports-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Loader2, PieChart, TrendingUp, TrendingDown, Download, FileText, Table } from "lucide-react"
import { useDate } from "@/contexts/date-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

export default function RelatoriosPage() {
  const router = useRouter()
  const { year } = useDate() 
  
  const [isLoading, setIsLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [receipts, setReceipts] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (!token) router.push("/login")
    else fetchData(token)
  }, [router, year]) 

  const fetchData = async (token: string) => {
    setIsLoading(true)
    try {
      const [resPag, resRec] = await Promise.all([
        fetch(`${API_URL}/pagamentos/`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/recebimentos/`, { headers: { "Authorization": `Bearer ${token}` } })
      ])

      if (resPag.ok && resRec.ok) {
        const dataPag = await resPag.json()
        const dataRec = await resRec.json()
        setPayments(dataPag)
        setReceipts(dataRec)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const monthlyData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
        name: MONTH_NAMES[i].substring(0, 3), 
        fullName: MONTH_NAMES[i],
        Receitas: 0,
        Despesas: 0,
        monthIndex: i
    }))

    payments.forEach(p => {
        const date = new Date(p.data_pagamento)
        if (date.getFullYear() === year) {
            data[date.getMonth()].Despesas += p.valor
        }
    })

    receipts.forEach(r => {
        const date = new Date(r.data_recebimento)
        if (date.getFullYear() === year) {
            data[date.getMonth()].Receitas += r.valor
        }
    })

    return data
  }, [payments, receipts, year])

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {}

    payments.forEach(p => {
        const date = new Date(p.data_pagamento)
        if (date.getFullYear() === year) {
            if (!categories[p.categoria]) categories[p.categoria] = 0
            categories[p.categoria] += p.valor
        }
    })

    return Object.keys(categories).map(key => ({
        name: key,
        value: categories[key]
    })).sort((a, b) => b.value - a.value)

  }, [payments, year])

  const yearTotals = useMemo(() => {
    const totalExp = monthlyData.reduce((acc, curr) => acc + curr.Despesas, 0)
    const totalInc = monthlyData.reduce((acc, curr) => acc + curr.Receitas, 0)
    return { totalExp, totalInc, balance: totalInc - totalExp }
  }, [monthlyData])

  const handleExportExcel = () => {
    const csvRows = []
    csvRows.push(["Mês", "Receitas", "Despesas", "Saldo"].join(","))
    
    monthlyData.forEach(row => {
        const saldo = row.Receitas - row.Despesas
        csvRows.push([
            row.fullName,
            row.Receitas.toFixed(2),
            row.Despesas.toFixed(2),
            saldo.toFixed(2)
        ].join(","))
    })

    csvRows.push(["TOTAL", yearTotals.totalInc.toFixed(2), yearTotals.totalExp.toFixed(2), yearTotals.balance.toFixed(2)].join(","))

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `relatorio_anual_${year}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = async () => {
    const doc = new jsPDF()
    
    try {
        const imgData = await fetch('/icon.png').then(res => res.blob()).then(blob => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        });
        doc.addImage(imgData, 'PNG', 14, 12, 10, 10);
    } catch (e) {
        console.error("Erro ao carregar logo", e)
    }
    
    doc.setFontSize(18)
    doc.text(`Relatório Anual - ${year}`, 28, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 28, 26)
    
    doc.setDrawColor(200)
    doc.line(14, 32, 196, 32)

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(`Resumo do Ano:`, 14, 42)
    
    doc.setFontSize(10)
    doc.text(`Total Receitas:`, 14, 50)
    doc.setTextColor(0, 150, 0)
    doc.text(`R$ ${yearTotals.totalInc.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 45, 50)
    
    doc.setTextColor(0)
    doc.text(`Total Despesas:`, 80, 50)
    doc.setTextColor(200, 0, 0)
    doc.text(`R$ ${yearTotals.totalExp.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 115, 50)

    doc.setTextColor(0)
    doc.text(`Balanço Final:`, 150, 50)
    if (yearTotals.balance >= 0) doc.setTextColor(0, 150, 0)
    else doc.setTextColor(200, 0, 0)
    doc.text(`R$ ${yearTotals.balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 180, 50)

    const tableData = monthlyData.map(row => [
        row.fullName,
        `R$ ${row.Receitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
        `R$ ${row.Despesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
        `R$ ${(row.Receitas - row.Despesas).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
    ])

    tableData.push([
        "TOTAL",
        `R$ ${yearTotals.totalInc.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
        `R$ ${yearTotals.totalExp.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
        `R$ ${yearTotals.balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
    ])

    autoTable(doc, {
        head: [['Mês', 'Receitas', 'Despesas', 'Saldo']],
        body: tableData,
        startY: 60,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3, halign: 'center' },
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 
            0: { halign: 'left', fontStyle: 'bold' },
            1: { textColor: [0, 120, 0] },
            2: { textColor: [180, 0, 0] }
        },
        didParseCell: function(data) {
            if (data.row.index === tableData.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 240, 240];
            }
        }
    })

    doc.save(`relatorio_anual_${year}.pdf`)
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-black/20">
            <div className="max-w-[1600px] mx-auto space-y-8">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                      <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                          <PieChart className="h-8 w-8 text-emerald-500" />
                          Relatórios Avançados
                      </h2>
                      <p className="text-zinc-400">Análise detalhada do seu desempenho em <strong className="text-white">{year}</strong>.</p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-emerald-950/30 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 gap-2">
                            <Download className="h-4 w-4" />
                            Exportar Relatório
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer focus:bg-zinc-800">
                            <FileText className="mr-2 h-4 w-4 text-emerald-400" />
                            PDF (Anual)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer focus:bg-zinc-800">
                            <Table className="mr-2 h-4 w-4 text-blue-400" />
                            Excel (CSV)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-zinc-900/50 border-zinc-800 border-l-4 border-l-emerald-500 min-w-0">
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">Receita Anual</CardTitle></CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold text-white flex items-center gap-2">
                              {yearTotals.totalInc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              <TrendingUp className="h-4 w-4 text-emerald-500" />
                          </div>
                      </CardContent>
                  </Card>
                  <Card className="bg-zinc-900/50 border-zinc-800 border-l-4 border-l-red-500 min-w-0">
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">Despesa Anual</CardTitle></CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold text-white flex items-center gap-2">
                              {yearTotals.totalExp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              <TrendingDown className="h-4 w-4 text-red-500" />
                          </div>
                      </CardContent>
                  </Card>
                  <Card className="bg-zinc-900/50 border-zinc-800 border-l-4 border-l-blue-500 min-w-0">
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 font-medium">Balanço do Ano</CardTitle></CardHeader>
                      <CardContent>
                          <div className={`text-2xl font-bold flex items-center gap-2 ${yearTotals.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                              {yearTotals.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                      </CardContent>
                  </Card>
              </div>

              <ReportsCharts monthlyData={monthlyData} categoryData={categoryData} />

            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}