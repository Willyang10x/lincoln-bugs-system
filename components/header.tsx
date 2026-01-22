"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User, Camera, Loader2, Menu, X, Settings } from "lucide-react" 
import { useSidebar } from "@/components/sidebar-provider" 
import { DateFilter } from "@/components/date-filter" 
import { toast } from "sonner" // <--- Melhor que alert

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function Header() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toggle, isOpen } = useSidebar() 

  const [user, setUser] = useState<any>({ name: "Usuário", email: "...", avatar_url: null })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (!token) return 

    fetch(`${API_URL}/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) {
            handleLogout()
            throw new Error("Sessão expirada")
        }
        if (res.ok) return res.json()
        throw new Error("Falha ao carregar usuário")
    })
    .then(data => {
        if(data) {
            setUser({
                name: data.full_name,
                email: data.email,
                avatar_url: data.avatar_url
            })
        }
    })
    .catch(err => console.error(err))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("finance_token")
    localStorage.removeItem("finance_user_name")
    localStorage.removeItem("finance_user_email")
    document.cookie = "finance_token=; path=/; max-age=0; SameSite=Lax;"
    router.push("/login")
    router.refresh()
  }

  const handleGoToProfile = () => {
    router.push("/configuracoes?tab=conta")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const token = localStorage.getItem("finance_token")

    const formData = new FormData()
    formData.append("file", file)

    try {
        const response = await fetch(`${API_URL}/users/me/avatar`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        })

        if (response.ok) {
            const data = await response.json()
            setUser((prev: any) => ({ ...prev, avatar_url: data.avatar_url }))
            toast.success("Foto de perfil atualizada!")
        } else {
            toast.error("Erro ao enviar foto.")
        }
    } catch (error) {
        console.error("Erro no upload", error)
        toast.error("Erro de conexão.")
    } finally {
        setIsUploading(false)
    }
  }

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U"

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-black/80 px-6 backdrop-blur sticky top-0 z-40">
      
      <div className="flex items-center gap-4">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggle} 
            className="lg:hidden text-zinc-400 hover:text-emerald-500 hover:bg-zinc-900"
        >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* --- DATA FILTER CENTRALIZADO --- */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
        <DateFilter />
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-emerald-500/50 transition-all">
              <Avatar className="h-10 w-10 border border-zinc-700">
                <AvatarImage src={user.avatar_url} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-zinc-900 text-emerald-500 font-bold border border-emerald-500/20">
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                <p className="text-xs leading-none text-zinc-500">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            
            <DropdownMenuItem 
                className="cursor-pointer focus:bg-zinc-900 focus:text-emerald-400" 
                onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}
            >
              <Camera className="mr-2 h-4 w-4" /> <span>Alterar Foto</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleGoToProfile} className="cursor-pointer focus:bg-zinc-900 focus:text-emerald-400">
              <User className="mr-2 h-4 w-4" /> <span>Meu Perfil</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/configuracoes")} className="cursor-pointer focus:bg-zinc-900 focus:text-emerald-400">
              <Settings className="mr-2 h-4 w-4" /> <span>Configurações</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:bg-red-950/30 focus:text-red-300">
              <LogOut className="mr-2 h-4 w-4" /> <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </header>
  )
}