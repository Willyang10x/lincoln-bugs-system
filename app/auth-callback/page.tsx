"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Tenta encontrar o token com nomes comuns
    const token = searchParams.get("access_token") || searchParams.get("token")
    
    if (token) {
      // 1. Salva no LocalStorage
      localStorage.setItem("finance_token", token)
      
      // 2. Salva no Cookie (Essencial para o Middleware)
      document.cookie = `finance_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax;`

      // 3. Aguarda um pouco e redireciona
      // O timeout ajuda a garantir que o cookie foi gravado antes do redirect
      setTimeout(() => {
          router.refresh() 
          router.push("/dashboard")
      }, 1500)
    }
  }, [router, searchParams])

  const tokenFound = searchParams.get("access_token") || searchParams.get("token")

  // CENÁRIO 1: Sucesso (Token encontrado)
  if (tokenFound) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 gap-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
            <span className="text-xl font-bold">Login realizado!</span>
          </div>
          <p className="text-zinc-400 animate-pulse">Redirecionando para o painel...</p>
        </div>
      )
  }

  // CENÁRIO 2: Erro (Nenhum token na URL)
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 gap-6 p-4">
      <div className="flex flex-col items-center gap-2 text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
        <h2 className="text-xl font-bold text-white">Não foi possível completar o login</h2>
        <p className="text-zinc-400">
            O Google retornou, mas não encontramos o token de acesso na URL.
        </p>
        
        {/* Mostra o que veio na URL para debug */}
        <div className="mt-6 w-full p-4 bg-black/50 rounded-lg border border-zinc-800 text-left">
            <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Parâmetros Recebidos:</p>
            <code className="text-xs font-mono text-emerald-400 break-all">
                {searchParams.toString() || "Nenhum parâmetro recebido (URL vazia)"}
            </code>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={() => router.push("/login")}
        className="mt-4 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
      >
        Voltar para Login
      </Button>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}