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
import { Trash2, Users } from "lucide-react"

interface SuppliersTableProps {
  suppliers: any[]
  onDelete: (id: string) => void
}

export function SuppliersTable({ suppliers, onDelete }: SuppliersTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur w-full max-w-[85vw] sm:max-w-full overflow-hidden mx-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-zinc-900/50 bg-zinc-900/30">
            <TableHead className="w-[250px] text-zinc-400 font-medium pl-6">Nome</TableHead>
            <TableHead className="text-zinc-400 font-medium">Categoria</TableHead>
            <TableHead className="text-zinc-400 font-medium">Contato</TableHead>
            <TableHead className="text-zinc-400 font-medium">Data Cadastro</TableHead>
            <TableHead className="text-right text-zinc-400 font-medium pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader><TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 opacity-20" />
                    <p>Nenhum fornecedor cadastrado.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="font-medium text-zinc-200 pl-6">{supplier.name}</TableCell>
                <TableCell>
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 border border-zinc-700">
                        {supplier.category}
                    </span>
                </TableCell>
                <TableCell className="text-zinc-400 text-sm">
                    <div className="flex flex-col">
                        <span>{supplier.email}</span>
                        <span className="text-xs text-zinc-500">{supplier.phone}</span>
                    </div>
                </TableCell>
                <TableCell className="text-zinc-500 text-sm font-mono">{supplier.date}</TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10" onClick={() => onDelete(supplier.id)}>
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