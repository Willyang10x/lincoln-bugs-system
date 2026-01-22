"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { SuppliersTable } from "@/components/suppliers-table"
import { NewSupplierModal } from "@/components/new-supplier-modal"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Loader2, Users } from "lucide-react"
import { useDate } from "@/contexts/date-context" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function FornecedoresPage() {
  const router = useRouter()
  const { month, year } = useDate() // <--- USA MÊS E ANO
  
  const [suppliers, setSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (!token) {
      router.push("/login")
    } else {
      setIsCheckingAuth(false)
      fetchSuppliers(token)
    }
  }, [router, updateTrigger, month, year]) // Recarrega ao mudar data

  const fetchSuppliers = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/fornecedores/`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem("finance_token")
        router.push("/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        
        // Mapeia e filtra
        const mappedData = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.nome,
          email: item.email,
          phone: item.telefone,
          category: item.categoria,
          date: new Date(item.data_cadastro).toLocaleDateString('pt-BR'),
          rawDate: new Date(item.data_cadastro) // Data crua para filtro
        }))

        // Filtra pelo mês de cadastro
        const filteredData = mappedData.filter((item: any) => {
            const itemMonth = item.rawDate.getMonth() + 1
            const itemYear = item.rawDate.getFullYear()
            return itemMonth === month && itemYear === year
        })

        setSuppliers(filteredData.reverse())
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este fornecedor?")) return;
    const token = localStorage.getItem("finance_token")
    try {
        const response = await fetch(`${API_URL}/fornecedores/${id}`, { 
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
        if (response.ok) setUpdateTrigger(prev => prev + 1)
    } catch (error) { console.error(error) }
  }

  if (isCheckingAuth) return <div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-zinc-950/50">
            <div className="max-w-[1600px] mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Users className="h-8 w-8 text-emerald-500" />
                      Fornecedores
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">Cadastrados em <strong>{month}/{year}</strong>.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setUpdateTrigger(prev => prev + 1)} disabled={isLoading} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white">
                     <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  <Button 
                      onClick={() => setIsNewSupplierOpen(true)} 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Fornecedor
                  </Button>
                </div>
              </div>
              
              <SuppliersTable suppliers={suppliers} onDelete={handleDeleteSupplier} />
            </div>
          </main>
        </div>
        <NewSupplierModal open={isNewSupplierOpen} onOpenChange={setIsNewSupplierOpen} onSuccess={() => setUpdateTrigger(prev => prev + 1)} />
      </div>
    </SidebarProvider>
  )
}