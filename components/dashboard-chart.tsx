"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#ec4899'];

interface DashboardChartProps {
  recebimentos: any[]
  pagamentos: any[]
}

export function DashboardChart({ recebimentos, pagamentos }: DashboardChartProps) {

  // 1. Lógica NOVA: Agrupa por DIA do mês (1 a 31)
  const dailyData = useMemo(() => {
    const daysMap = new Map()

    // Processa Pagamentos
    pagamentos.forEach(p => {
        // rawDate vem do objeto que criamos na page.tsx
        const day = new Date(p.rawDate).getDate()
        if (!daysMap.has(day)) daysMap.set(day, { name: day, Receitas: 0, Despesas: 0 })
        daysMap.get(day).Despesas += Number(p.value)
    })

    // Processa Recebimentos
    recebimentos.forEach(r => {
        const day = new Date(r.rawDate).getDate()
        if (!daysMap.has(day)) daysMap.set(day, { name: day, Receitas: 0, Despesas: 0 })
        daysMap.get(day).Receitas += Number(r.value)
    })

    // Converte para array e ordena por dia (1, 2, 3...)
    return Array.from(daysMap.values()).sort((a: any, b: any) => a.name - b.name)
  }, [recebimentos, pagamentos])

  // 2. Lógica ANTIGA: Mantida para o gráfico de Pizza
  const pieData = useMemo(() => {
    const categories: Record<string, number> = {}
    pagamentos.forEach((pag) => {
      if (categories[pag.category]) {
        categories[pag.category] += Number(pag.value)
      } else {
        categories[pag.category] = Number(pag.value)
      }
    })
    return Object.keys(categories).map((key) => ({
      name: key,
      value: categories[key],
    })).sort((a, b) => b.value - a.value) // Ordena do maior para o menor
  }, [pagamentos])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      
      {/* GRÁFICO 1: EVOLUÇÃO DIÁRIA (Substitui o Balanço Geral) */}
      <Card className="bg-zinc-900/40 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Movimentação Diária</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 sm:pl-2">
          <div className="h-[300px] w-full">
            {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(d) => `Dia ${d}`}
                    />
                    <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `R$${value}`} 
                        width={80} 
                    />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                        labelFormatter={(label) => `Dia ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                    Sem movimentações neste mês.
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GRÁFICO 2: CATEGORIAS (Mantido igual, só ajustei a mensagem de vazio) */}
      <Card className="bg-zinc-900/40 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                       contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
            ) : (
                <span className="text-zinc-500 text-sm">Nenhuma despesa registrada.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}