"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Payment } from "@/app/dashboard/page"
import Image from "next/image"

interface ReceiptViewerModalProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiptViewerModal({ payment, open, onOpenChange }: ReceiptViewerModalProps) {
  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Comprovante de Pagamento</DialogTitle>
          <DialogDescription>
            {payment.id} • {payment.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valor</p>
              <p className="text-lg font-semibold text-green-500">
                R$ {payment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Data</p>
              <p className="text-lg font-semibold">{new Date(payment.date).toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Categoria</p>
              <Badge variant="outline" className="mt-1">
                {payment.category}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ID do Pagamento</p>
              <p className="text-sm font-mono font-medium">{payment.id}</p>
            </div>
          </div>

          {/* Receipt Image */}
          {payment.receiptUrl && (
            <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={payment.receiptUrl || "/placeholder.svg"}
                  alt={`Comprovante de ${payment.title}`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
