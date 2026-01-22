"use client"

import { Menu, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  PieChart, 
  TrendingUp, 
  FileText, 
  Users, 
  Settings 
} from "lucide-react"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Receipt, label: "Pagamentos", href: "/pagamentos" },
    { icon: CreditCard, label: "Recebimentos", href: "/recebimentos" },
    { icon: PieChart, label: "Relatórios", href: "/relatorios" },
    { icon: TrendingUp, label: "Fluxo de Caixa", href: "/fluxo-caixa" },
    { icon: FileText, label: "Documentos", href: "/documentos" },
    { icon: Users, label: "Fornecedores", href: "/fornecedores" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("finance_token")
    router.push("/login")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-card w-72">
        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
        <div className="flex flex-col h-full py-6 px-4">
            <div className="flex items-center gap-2 px-2 mb-8">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Receipt className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Finance.OS</span>
            </div>

            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = item.href === "/" 
                        ? pathname === "/" 
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)} // Fecha o menu ao clicar
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto pt-4 border-t">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}