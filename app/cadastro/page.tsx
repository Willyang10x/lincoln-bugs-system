"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image" // <--- Importante
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function CadastroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
        return toast.error("As senhas não coincidem!") 
    }
    
    setIsLoading(true)

    try {
      const data = new FormData()
      data.append("email", formData.email)
      data.append("password", formData.password)
      data.append("full_name", formData.name)

      const response = await fetch(`${API_URL}/auth/register`, { method: "POST", body: data })

      if (response.ok) {
        toast.success("Conta criada com sucesso! Redirecionando para login...")
        setTimeout(() => {
            router.push("/login")
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(error.detail || "Erro ao criar conta. Tente outro e-mail.")
      }
    } catch (error) { 
        console.error("Erro", error) 
        toast.error("Erro de conexão com o servidor.")
    } finally { 
        setIsLoading(false) 
    }
  }

  const handleGoogleRegister = () => {
     window.location.href = `${API_URL}/auth/login/google`
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-600/10 blur-[120px]" />

      <div className="z-10 w-full max-w-md p-6">
        
        {/* --- CABEÇALHO COM LOGO --- */}
        <div className="flex flex-col items-center mb-6 space-y-2 text-center">
            {/* Aqui usei a logo menor (só o ícone) se você salvou como logo-icon.png, 
                ou pode usar a full também. Vou usar a full menorzinha. */}
            <div className="relative h-24 w-24 mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                 <Image 
                    src="/logo-full.png" 
                    alt="Lincoln Bugs Logo"
                    fill
                    className="object-contain"
                />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Criar Nova Conta</h1>
            <p className="text-sm text-zinc-400">Junte-se à elite financeira.</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl ring-1 ring-white/10">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300 ml-1">Nome Completo</Label>
              <Input 
                placeholder="Ex: Lincoln Bugs" 
                className="bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 ml-1">E-mail</Label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                className="bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label className="text-zinc-300 ml-1">Senha</Label>
                <Input 
                    type="password" 
                    className="bg-black/60 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                    disabled={isLoading}
                />
                </div>
                <div className="space-y-2">
                <Label className="text-zinc-300 ml-1">Confirmar</Label>
                <Input 
                    type="password" 
                    className="bg-black/60 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all" 
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                    required 
                    disabled={isLoading}
                />
                </div>
            </div>
            
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold h-11 rounded-xl shadow-lg shadow-emerald-500/20 mt-2 transition-all hover:scale-[1.02]" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Finalizar Cadastro"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 opacity-70" />}
            </Button>
          </form>

            {/* --- GOOGLE ALTERNATIVO --- */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0c0c0e] px-2 text-zinc-500">Ou cadastre com</span>
                </div>
            </div>

            <Button 
                variant="outline" 
                className="w-full bg-white text-black hover:bg-zinc-200 border-none font-bold h-11 rounded-xl"
                onClick={handleGoogleRegister}
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
            </Button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Já possui acesso?{" "}
          <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors">
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  )
}