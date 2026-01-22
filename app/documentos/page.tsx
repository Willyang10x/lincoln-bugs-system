"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DocumentsTable } from "@/components/documents-table"
import { NewDocumentModal } from "@/components/new-document-modal"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Loader2, FolderOpen } from "lucide-react"
import { useDate } from "@/contexts/date-context" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DocumentosPage() {
  const router = useRouter()
  const { month, year } = useDate() // <--- USA MÊS E ANO
  
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isNewDocOpen, setIsNewDocOpen] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (!token) {
      router.push("/login")
    } else {
      setIsCheckingAuth(false)
      fetchDocuments(token)
    }
  }, [router, updateTrigger, month, year]) // Recarrega ao mudar data

  const fetchDocuments = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/documentos/`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem("finance_token")
        router.push("/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        const mappedData = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.titulo,
          category: item.categoria,
          url: item.arquivo_url,
          date: new Date(item.data_upload).toLocaleDateString('pt-BR'),
          rawDate: new Date(item.data_upload) // Data crua para filtro
        }))

        // Filtra pelo mês de upload
        const filteredData = mappedData.filter((item: any) => {
            const itemMonth = item.rawDate.getMonth() + 1
            const itemYear = item.rawDate.getFullYear()
            return itemMonth === month && itemYear === year
        })

        setDocuments(filteredData.reverse())
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return;
    const token = localStorage.getItem("finance_token")
    try {
        const response = await fetch(`${API_URL}/documentos/${id}`, { 
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
        if (response.ok) setDocuments(documents.filter((d: any) => d.id !== id))
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
                      <FolderOpen className="h-8 w-8 text-emerald-500" />
                      Documentos
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">Arquivos enviados em <strong>{month}/{year}</strong>.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setUpdateTrigger(prev => prev + 1)} disabled={isLoading} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white">
                     <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  <Button 
                      onClick={() => setIsNewDocOpen(true)} 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Documento
                  </Button>
                </div>
              </div>
              
              <DocumentsTable documents={documents} onDelete={handleDeleteDocument} />
            </div>
          </main>
        </div>
        <NewDocumentModal open={isNewDocOpen} onOpenChange={setIsNewDocOpen} onSuccess={() => setUpdateTrigger(prev => prev + 1)} />
      </div>
    </SidebarProvider>
  )
}