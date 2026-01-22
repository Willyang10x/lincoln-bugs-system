"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image" // <--- Importante
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Limpa tokens antigos ao carregar
  useEffect(() => {
    const token = localStorage.getItem("finance_token")
    if (token) {
        localStorage.removeItem("finance_token")
        localStorage.removeItem("finance_user_name")
        localStorage.removeItem("finance_user_email")
        document.cookie = "finance_token=; path=/; max-age=0; SameSite=Lax;"
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const params = new URLSearchParams()
      params.append("username", email)
      params.append("password", password)

      const response = await fetch(`${API_URL}/token`, { 
        method: "POST", 
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params 
      })

      if (response.ok) {
        const result = await response.json()
        
        localStorage.setItem("finance_token", result.access_token)
        if(result.user_name) localStorage.setItem("finance_user_name", result.user_name)
        if(result.user_email) localStorage.setItem("finance_user_email", result.user_email)
        
        document.cookie = `finance_token=${result.access_token}; path=/; max-age=604800; SameSite=Lax;`

        toast.success("Bem-vindo de volta ao Lincoln Bugs!")
        router.refresh()
        router.push("/dashboard")
      } else {
        toast.error("Credenciais inválidas. Verifique e-mail e senha.")
      }
    } catch (error) {
      console.error("Erro no login", error)
      toast.error("Erro de conexão. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/login/google`
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-black overflow-hidden selection:bg-emerald-500/30">
      
      {/* Efeitos de Fundo Dourados/Escuros */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-600/10 blur-[120px]" />

      <div className="z-10 w-full max-w-md p-8">
        
        {/* --- LOGO DA MARCA --- */}
        <div className="flex flex-col items-center mb-10 space-y-4 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative h-40 w-40 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <Image 
                    src="/logo-full.png" // Certifique-se que o arquivo está em public/logo-full.png
                    alt="Lincoln Bugs Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            {/* O texto já está na logo, então removemos o h1 de texto puro para ficar limpo */}
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                Acesse seu ecossistema financeiro exclusivo.
            </p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl ring-1 ring-white/10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-300 ml-1">E-mail</Label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                className="bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20 h-11 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-zinc-300">Senha</Label>
                <Link href="/esqueci-senha" className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input 
                type="password" 
                className="bg-black/60 border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/20 h-11 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar no Sistema"}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5 opacity-70" />}
            </Button>
          </form>

          {/* --- GOOGLE --- */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0c0c0e] px-2 text-zinc-500">Ou continue com</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full bg-white text-black hover:bg-zinc-200 border-none font-bold h-11 rounded-xl"
            onClick={handleGoogleLogin} 
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

        <p className="mt-4 text-center text-sm text-zinc-500">
          Ainda não é membro?{" "}
          <Link href="/cadastro" className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors">
            Solicitar Acesso
          </Link>
        </p>
      </div>
    </div>
  )
}