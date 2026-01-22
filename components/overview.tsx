"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewProps {
  data: any[]
}

export function Overview({ data }: OverviewProps) {
  // Se não tiver dados, mostra mensagem ou gráfico vazio
  if (!data || data.length === 0) {
    return <div className="flex h-[350px] items-center justify-center text-zinc-500 text-sm">Sem dados suficientes</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
            itemStyle={{ color: '#f4f4f5' }}
            cursor={{ fill: '#27272a' }}
        />
        {/* Barras com cor dinâmica e cantos arredondados */}
        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}