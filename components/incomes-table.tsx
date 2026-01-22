"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, TrendingUp } from "lucide-react"

interface IncomesTableProps {
  incomes: any[]
  onDelete: (id: string) => void
}

export function IncomesTable({ incomes, onDelete }: IncomesTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur w-full max-w-[85vw] sm:max-w-full overflow-hidden mx-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-zinc-900/50 bg-zinc-900/30">
            <TableHead className="w-[300px] text-zinc-400 font-medium pl-6">Título</TableHead>
            <TableHead className="text-zinc-400 font-medium">Cliente</TableHead>
            <TableHead className="text-zinc-400 font-medium">Data</TableHead>
            <TableHead className="text-zinc-400 font-medium">Status</TableHead>
            <TableHead className="text-right text-zinc-400 font-medium">Valor</TableHead>
            <TableHead className="text-right text-zinc-400 font-medium pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader><TableBody>
          {incomes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                <div className="flex flex-col items-center justify-center gap-2">
                    <TrendingUp className="h-8 w-8 opacity-20" />
                    <p>Nenhuma receita registrada.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            incomes.map((income) => (
              <TableRow key={income.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="font-medium text-zinc-200 pl-6">{income.title}</TableCell>
                <TableCell className="text-zinc-400">{income.client}</TableCell>
                <TableCell className="text-zinc-400 text-sm font-mono">{income.date}</TableCell>
                <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        income.status === 'Recebido' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                        {income.status}
                    </span>
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-500">
                  + {income.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10" onClick={() => onDelete(income.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}