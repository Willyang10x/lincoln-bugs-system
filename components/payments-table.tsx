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
import { Trash2, Edit2, FileText, CreditCard } from "lucide-react"

interface PaymentsTableProps {
  payments: any[]
  onDelete: (id: string) => void
  onEdit: (payment: any) => void
  onViewReceipt: (payment: any) => void
}

export function PaymentsTable({ payments, onDelete, onEdit, onViewReceipt }: PaymentsTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur w-full max-w-[85vw] sm:max-w-full overflow-hidden mx-auto">
      {/* max-w-[85vw] segura a tabela dentro da tela no celular */}
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-zinc-900/50 bg-zinc-900/30">
            <TableHead className="w-[200px] sm:w-[300px] text-zinc-400 font-medium pl-6">Título</TableHead>
            <TableHead className="text-zinc-400 font-medium">Categoria</TableHead>
            <TableHead className="text-zinc-400 font-medium">Data</TableHead>
            <TableHead className="text-right text-zinc-400 font-medium">Valor</TableHead>
            <TableHead className="text-right text-zinc-400 font-medium pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader><TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                <div className="flex flex-col items-center justify-center gap-2">
                    <CreditCard className="h-8 w-8 opacity-20" />
                    <p>Nenhum pagamento registrado.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="font-medium text-zinc-200 pl-6">{payment.title}</TableCell>
                <TableCell>
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-700 whitespace-nowrap">
                        {payment.category}
                    </span>
                </TableCell>
                <TableCell className="text-zinc-400 text-sm font-mono whitespace-nowrap">{payment.date}</TableCell>
                <TableCell className="text-right font-bold text-zinc-200 whitespace-nowrap">
                  {payment.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    {payment.hasReceipt && (
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => onViewReceipt(payment)} title="Ver Comprovante">
                         <FileText className="h-4 w-4" />
                       </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10" onClick={() => onEdit(payment)} title="Editar">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10" onClick={() => onDelete(payment.id)} title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}