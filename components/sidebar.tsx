"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-provider"
import { DateFilter } from "@/components/date-filter"
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  LogOut
} from "lucide-react"

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "text-emerald-500" },
  { label: "Pagamentos", icon: CreditCard, href: "/pagamentos", color: "text-zinc-400" },
  { label: "Recebimentos", icon: TrendingUp, href: "/recebimentos", color: "text-zinc-400" },
  { label: "Relatórios", icon: BarChart3, href: "/relatorios", color: "text-zinc-400" },
  { label: "Fluxo de Caixa", icon: TrendingUp, href: "/fluxo", color: "text-zinc-400" },
  { label: "Documentos", icon: FileText, href: "/documentos", color: "text-zinc-400" },
  { label: "Fornecedores", icon: Users, href: "/fornecedores", color: "text-zinc-400" },
  { label: "Configurações", icon: Settings, href: "/configuracoes", color: "text-zinc-400" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, close } = useSidebar() 

  const handleLogout = () => {
    localStorage.removeItem("finance_token")
    localStorage.removeItem("finance_user_name")
    localStorage.removeItem("finance_user_email")
    document.cookie = "finance_token=; path=/; max-age=0; SameSite=Lax;"
    router.push("/login")
  }

  return (
    <>
      <div 
        onClick={close}
        className={cn(
          "fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-black text-white border-r border-zinc-900 transition-transform duration-300 ease-in-out flex flex-col h-full",
        "lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* PARTE DE CIMA */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-4">
            
            {/* LOGO EM TEXTO DOURADO (SEM IMAGEM) */}
            <Link href="/" className="flex items-center justify-center mb-8 mt-4" onClick={close}>
              <h1 className="text-2xl font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                LINCOLN BUGS
              </h1>
            </Link>

            <div className="mb-6 lg:hidden px-1">
               <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block px-2">
                 Período
               </label>
               <DateFilter />
            </div>

            <div className="space-y-1">
              {routes.map((route) => {
                const isActive = pathname === route.href

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={close}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-zinc-900 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className={cn("h-5 w-5 mr-3 transition-colors", isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                      {route.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* PARTE DE BAIXO */}
        <div className="p-3 border-t border-zinc-900 bg-black">
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 mb-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                    <p className="text-xs font-bold text-white">Status: Ativo</p>
                    <p className="text-[10px] text-zinc-500">Lincoln Bugs System</p>
                </div>
            </div>

            <Button 
                variant="ghost" 
                className="w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-500/5 group transition-colors h-10"
                onClick={handleLogout}
            >
                <LogOut className="h-5 w-5 mr-3 group-hover:text-red-500 transition-colors" />
                Sair
            </Button>
        </div>

      </div>
    </>
  )
}