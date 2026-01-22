"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, TrendingDown, DollarSign, BarChart4 } from "lucide-react"
import { useDate } from "@/contexts/date-context" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export default function FluxoCaixaPage() {
  const router = useRouter()
  const { year } = useDate() // <--- USA O ANO GLOBAL
  
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
        setPayments(await resPag.json())
        setReceipts(await resRec.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const flowData = useMemo(() => {
    let currentAccumulated = 0

    return MONTHS.map((monthName, index) => {
        // Filtra transações do mês e ANO DO CONTEXTO
        const monthPayments = payments.filter(p => {
            const d = new Date(p.data_pagamento)
            return d.getMonth() === index && d.getFullYear() === year
        })

        const monthReceipts = receipts.filter(r => {
            const d = new Date(r.data_recebimento)
            return d.getMonth() === index && d.getFullYear() === year
        })

        const totalExp = monthPayments.reduce((acc, curr) => acc + curr.valor, 0)
        const totalInc = monthReceipts.reduce((acc, curr) => acc + curr.valor, 0)
        const monthlyBalance = totalInc - totalExp
        
        currentAccumulated += monthlyBalance

        return {
            month: monthName,
            totalExp,
            totalInc,
            monthlyBalance,
            accumulated: currentAccumulated
        }
    })
  }, [payments, receipts, year]) // Atualiza quando o ano muda

  const yearSummary = useMemo(() => {
    const lastMonth = flowData[flowData.length - 1]
    const totalExp = flowData.reduce((acc, curr) => acc + curr.totalExp, 0)
    const totalInc = flowData.reduce((acc, curr) => acc + curr.totalInc, 0)
    return { 
        totalExp, 
        totalInc, 
        finalBalance: lastMonth ? lastMonth.accumulated : 0 
    }
  }, [flowData])

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-zinc-950/50">
            <div className="max-w-[1600px] mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                      <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                          <BarChart4 className="h-8 w-8 text-emerald-500" />
                          Fluxo de Caixa
                      </h2>
                      <p className="text-zinc-400">Acompanhamento mensal do saldo em <strong className="text-white">{year}</strong>.</p>
                  </div>
              </div>

              {/* CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/20 transition-all">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-medium text-zinc-400">Entradas {year}</CardTitle>
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold text-emerald-400">
                              {yearSummary.totalInc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                      </CardContent>
                  </Card>
                  <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-500/20 transition-all">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-medium text-zinc-400">Saídas {year}</CardTitle>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold text-red-400">
                              {yearSummary.totalExp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                      </CardContent>
                  </Card>
                  <Card className="bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-medium text-emerald-400">Saldo Acumulado</CardTitle>
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                      </CardHeader>
                      <CardContent>
                          <div className={`text-2xl font-bold ${yearSummary.finalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {yearSummary.finalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                      </CardContent>
                  </Card>
              </div>

              {/* TABELA */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur overflow-hidden">
                  <Table>
                      <TableHeader>
                          <TableRow className="border-zinc-800 hover:bg-zinc-900/50 bg-zinc-900/30">
                              <TableHead className="text-zinc-400 pl-6 h-12">Mês</TableHead>
                              <TableHead className="text-right text-zinc-400">Entradas</TableHead>
                              <TableHead className="text-right text-zinc-400">Saídas</TableHead>
                              <TableHead className="text-right text-zinc-400">Saldo do Mês</TableHead>
                              <TableHead className="text-right text-zinc-400 pr-6">Acumulado</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {flowData.map((row) => (
                              <TableRow key={row.month} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                                  <TableCell className="font-medium text-zinc-200 pl-6">{row.month}</TableCell>
                                  <TableCell className="text-right text-emerald-500 font-medium">
                                      {row.totalInc > 0 ? `+ ${row.totalInc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : '-'}
                                  </TableCell>
                                  <TableCell className="text-right text-red-500 font-medium">
                                      {row.totalExp > 0 ? `- ${row.totalExp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <Badge variant="outline" className={`font-bold ${row.monthlyBalance >= 0 
                                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                                          : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                                          {row.monthlyBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className={`text-right font-bold pr-6 ${row.accumulated >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {row.accumulated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </div>

            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}