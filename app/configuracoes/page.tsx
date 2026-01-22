"use client"

import { useEffect, useState, Suspense } from "react" 
import { useRouter, useSearchParams } from "next/navigation" 
import Image from "next/image" // <--- IMPORTADO
import { SidebarProvider } from "@/components/sidebar-provider" 
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Loader2, Tag, User, Camera, Lock, Save, Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner" 

const API_URL = process.env.NEXT_PUBLIC_API_URL

function ConfiguracoesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "conta" ? "conta" : "categorias"

  const [isLoading, setIsLoading] = useState(true)
  
  const [categories, setCategories] = useState<any[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryType, setNewCategoryType] = useState("Despesa")
  const [isSubmittingCat, setIsSubmittingCat] = useState(false)

  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (!token) router.push("/login")
    else {
        fetchCategories(token)
        fetchUserProfile(token)
    }
  }, [router])

  const fetchCategories = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/categories/`, { headers: { "Authorization": `Bearer ${token}` } })
      if (res.ok) setCategories(await res.json())
    } catch (error) { console.error(error) } finally { setIsLoading(false) }
  }

  const fetchUserProfile = async (token: string) => {
    try {
        const res = await fetch(`${API_URL}/users/me`, { headers: { "Authorization": `Bearer ${token}` } })
        if (res.ok) {
            const data = await res.json()
            setUser(data)
            setFullName(data.full_name || "")
        }
    } catch (error) { console.error(error) }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName) return
    setIsSubmittingCat(true)
    const token = localStorage.getItem("finance_token")
    
    try {
      const formData = new FormData()
      formData.append("name", newCategoryName)
      formData.append("type", newCategoryType)
      
      const res = await fetch(`${API_URL}/categories/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })

      if (res.status === 403) {
          toast.info("Limite de Categorias Atingido", {
              description: "Upgrade necessário para criar mais categorias.",
              action: {
                  label: "Ver Planos",
                  onClick: () => router.push("/planos")
              },
          })
          return 
      }

      if (res.ok) {
        toast.success("Categoria criada!") 
        setNewCategoryName("")
        fetchCategories(token!)
      } else {
        toast.error("Erro ao criar categoria")
      }
    } catch (error) { 
        toast.error("Erro de conexão") 
    } finally { 
        setIsSubmittingCat(false) 
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if(!confirm("Deseja excluir esta categoria?")) return
    const token = localStorage.getItem("finance_token")
    await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    toast.success("Categoria excluída.")
    fetchCategories(token!)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    const token = localStorage.getItem("finance_token")
    
    try {
        const formData = new FormData()
        formData.append("file", file)
        
        const res = await fetch(`${API_URL}/users/me/avatar`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        })
        
        if (res.ok) {
            const data = await res.json()
            setUser({ ...user, avatar_url: data.avatar_url })
            toast.success("Foto atualizada!") 
            window.location.reload() 
        }
    } catch (error) {
        toast.error("Erro ao enviar foto.") 
    } finally {
        setIsUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    const token = localStorage.getItem("finance_token")

    try {
        const res = await fetch(`${API_URL}/users/me`, {
            method: "PUT",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name: fullName,
                password: password || undefined 
            })
        })

        if (res.ok) {
            localStorage.setItem("finance_user_name", fullName)
            toast.success("Perfil atualizado!") 
            setTimeout(() => window.location.reload(), 1000)
        } else {
            toast.error("Erro ao atualizar perfil.") 
        }
    } catch (error) {
        toast.error("Erro de conexão.")
    } finally {
        setIsSavingProfile(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-black text-zinc-100 selection:bg-emerald-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-zinc-950/50">
            <div className="max-w-4xl mx-auto space-y-8">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Configurações</h2>
                    <p className="text-zinc-400">Gerencie sua conta e sistema.</p>
                </div>
              </div>

              {/* --- CARD VIP COM LOGO --- */}
              <div className="bg-gradient-to-r from-zinc-900 to-black border border-emerald-500/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-lg shadow-emerald-900/10 gap-4">
                <div className="flex items-center gap-6">
                    {/* LOGO AQUI */}
                    <div className="relative h-20 w-48 drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        <Image 
                            src="/logo-full.png" 
                            alt="Lincoln Bugs Logo" 
                            fill 
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="hidden sm:flex bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full items-center gap-2">
                        <Crown className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-500">Membro Black</span>
                    </div>
                </div>
                
                <div className="text-right">
                    <p className="text-xs text-zinc-500 font-mono">Licença Vitalícia Ativa</p>
                </div>
              </div>

              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800 p-1 w-full sm:w-auto">
                  <TabsTrigger value="categorias" className="flex-1 sm:flex-none data-[state=active]:bg-emerald-600 data-[state=active]:text-black font-bold">
                      Categorias
                  </TabsTrigger>
                  <TabsTrigger value="conta" className="flex-1 sm:flex-none data-[state=active]:bg-emerald-600 data-[state=active]:text-black font-bold">
                      Minha Conta
                  </TabsTrigger>
                </TabsList>

                {/* ABA DE CATEGORIAS */}
                <TabsContent value="categorias" className="space-y-4 mt-6">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-emerald-500" />
                            Categorias do Sistema
                          </div>
                          {user && !user.is_premium && (
                              <span className={`text-xs font-normal px-2 py-1 rounded border ${categories.length >= 5 ? 'bg-red-900/20 text-red-400 border-red-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                  {categories.length} / 5 Usadas
                              </span>
                          )}
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Organize suas finanças por tipos.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      
                      <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4 sm:items-end mb-8 border-b border-zinc-800 pb-6">
                          <div className="grid gap-2 w-full sm:flex-1">
                              <Label className="text-white">Nome</Label>
                              <Input 
                                  placeholder="Ex: Mercado, Uber..." 
                                  value={newCategoryName}
                                  onChange={e => setNewCategoryName(e.target.value)}
                                  className="bg-black border-zinc-800 focus:border-emerald-500 text-white placeholder:text-zinc-600"
                              />
                          </div>
                          
                          <div className="flex gap-4 w-full sm:w-auto items-end">
                            <div className="grid gap-2 flex-1 sm:w-40">
                                <Label className="text-white">Tipo</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={newCategoryType}
                                    onChange={e => setNewCategoryType(e.target.value)}
                                >
                                    <option value="Despesa">Despesa</option>
                                    <option value="Receita">Receita</option>
                                </select>
                            </div>

                            <Button type="submit" disabled={isSubmittingCat} className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold w-auto shrink-0 shadow-lg shadow-emerald-900/20">
                                {isSubmittingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                <span className="ml-2">Adicionar</span>
                            </Button>
                          </div>
                      </form>

                      {isLoading ? (
                          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-emerald-500" /></div>
                      ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {categories.map((cat) => (
                                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-black border border-zinc-800 group hover:border-emerald-500/30 transition-colors">
                                      <div className="flex items-center gap-3">
                                          <div className={`h-2 w-2 rounded-full ${cat.type === 'Receita' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                          <span className="text-sm font-medium text-zinc-200">{cat.name}</span>
                                      </div>
                                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                                          <Trash2 className="h-4 w-4" />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ABA MINHA CONTA */}
                <TabsContent value="conta" className="mt-6 space-y-6">
                  <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                              <Camera className="h-5 w-5 text-emerald-500" />
                              Foto de Perfil
                          </CardTitle>
                          <CardDescription className="text-zinc-400">Clique na imagem para alterar.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="relative group">
                              <Avatar className="h-24 w-24 border-4 border-black ring-2 ring-emerald-500/30 cursor-pointer group-hover:ring-emerald-500 transition-all">
                                  <AvatarImage src={user?.avatar_url} />
                                  <AvatarFallback className="bg-zinc-800 text-2xl text-white font-bold">{user?.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity backdrop-blur-sm">
                                  <Camera className="h-6 w-6" />
                                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                              </label>
                          </div>
                          <div className="text-center sm:text-left">
                              <p className="text-lg font-bold text-white">{user?.full_name}</p>
                              <p className="text-sm text-zinc-500">{user?.email}</p>
                              {isUploading && <p className="text-xs text-emerald-500 mt-2 flex items-center justify-center sm:justify-start"><Loader2 className="h-3 w-3 animate-spin mr-1"/> Enviando...</p>}
                          </div>
                      </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                              <User className="h-5 w-5 text-emerald-500" />
                              Dados Pessoais
                          </CardTitle>
                          <CardDescription className="text-zinc-400">Atualize suas credenciais.</CardDescription>
                      </CardHeader>
                      <form onSubmit={handleUpdateProfile}>
                          <CardContent className="space-y-4">
                              <div className="grid gap-2">
                                  <Label className="text-white">Nome Completo</Label>
                                  <Input 
                                      value={fullName} 
                                      onChange={e => setFullName(e.target.value)}
                                      className="bg-black border-zinc-800 focus:border-emerald-500 text-white placeholder:text-zinc-600"
                                  />
                              </div>
                              <div className="grid gap-2">
                                  <Label className="text-white">Nova Senha (Opcional)</Label>
                                  <div className="relative">
                                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                      <Input 
                                          type="password"
                                          placeholder="Deixe em branco para manter a atual" 
                                          value={password}
                                          onChange={e => setPassword(e.target.value)}
                                          className="pl-10 bg-black border-zinc-800 focus:border-emerald-500 text-white placeholder:text-zinc-600"
                                      />
                                  </div>
                              </div>
                          </CardContent>
                          <CardFooter className="border-t border-zinc-800 pt-6 bg-zinc-950/30">
                              <Button type="submit" disabled={isSavingProfile} className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold w-full sm:w-auto shadow-lg shadow-emerald-900/20">
                                  {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                  Salvar Alterações
                              </Button>
                          </CardFooter>
                      </form>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function ConfiguracoesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black"><Loader2 className="animate-spin text-emerald-500"/></div>}>
            <ConfiguracoesContent />
        </Suspense>
    )
}