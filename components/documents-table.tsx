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
import { Trash2, FileText, Download, FolderOpen } from "lucide-react"

interface DocumentsTableProps {
  documents: any[]
  onDelete: (id: string) => void
}

export function DocumentsTable({ documents, onDelete }: DocumentsTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur w-full max-w-[85vw] sm:max-w-full overflow-hidden mx-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-zinc-900/50 bg-zinc-900/30">
            <TableHead className="w-[300px] text-zinc-400 font-medium pl-6">Nome do Arquivo</TableHead>
            <TableHead className="text-zinc-400 font-medium">Categoria</TableHead>
            <TableHead className="text-zinc-400 font-medium">Data Envio</TableHead>
            <TableHead className="text-right text-zinc-400 font-medium pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader><TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                <div className="flex flex-col items-center justify-center gap-2">
                    <FolderOpen className="h-8 w-8 opacity-20" />
                    <p>Nenhum documento encontrado.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="font-medium text-zinc-200 pl-6 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    {doc.title}
                </TableCell>
                <TableCell>
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 border border-zinc-700">
                        {doc.category}
                    </span>
                </TableCell>
                <TableCell className="text-zinc-500 text-sm font-mono">{doc.date}</TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10" onClick={() => window.open(doc.url, "_blank")}>
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10" onClick={() => onDelete(doc.id)}>
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