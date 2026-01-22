"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Star, Shield, Zap, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const STRIPE_PRICE_ID = "price_1Ss8kk2KZhkDuQq1fWYnT3T8"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function PlanosPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Verifica se já é premium
    const checkUser = async () => {
        const token = localStorage.getItem("finance_token")
        if (!token) return router.push("/login")
        
        try {
            const res = await fetch(`${API_URL}/users/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const userData = await res.json()
                setUser(userData)
                if (userData.is_premium) {
                    toast.success("Você já é Premium! Redirecionando...")
                    router.push("/dashboard")
                }
            }
        } catch (e) { console.error(e) }
    }
    checkUser()
  }, [router])

  const handleSubscribe = async () => {
    setIsLoading(true)
    const token = localStorage.getItem("finance_token")

    try {
      const formData = new FormData()
      formData.append("price_id", STRIPE_PRICE_ID)

      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })

      const data = await response.json()
      
      if (data.checkout_url) {
        // Redireciona para o Stripe
        window.location.href = data.checkout_url
      } else {
        toast.error("Erro ao iniciar pagamento.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro de conexão.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 text-zinc-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Desbloqueie o Poder Total
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Organize suas finanças com recursos avançados de IA e automação.
                Escolha o plano ideal para sua jornada financeira.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* PLANO GRÁTIS */}
            <Card className="bg-zinc-900/50 border-zinc-800 relative">
                <CardHeader>
                    <CardTitle className="text-2xl text-white">Starter</CardTitle>
                    <CardDescription className="text-zinc-400">Para quem está começando a se organizar.</CardDescription>
                    <div className="mt-4">
                        <span className="text-4xl font-bold text-white">R$ 0</span>
                        <span className="text-zinc-500">/mês</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-3">
                        <li className="flex items-center text-zinc-300"><Check className="h-5 w-5 text-emerald-500 mr-3" /> Lançamentos Manuais</li>
                        <li className="flex items-center text-zinc-300"><Check className="h-5 w-5 text-emerald-500 mr-3" /> Dashboard Básico</li>
                        <li className="flex items-center text-zinc-300"><Check className="h-5 w-5 text-emerald-500 mr-3" /> Até 5 Categorias</li>
                        <li className="flex items-center text-zinc-500"><Shield className="h-5 w-5 mr-3 opacity-50" /> Sem Análise de IA</li>
                        <li className="flex items-center text-zinc-500"><Shield className="h-5 w-5 mr-3 opacity-50" /> Sem Upload de Comprovantes</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white" disabled>
                        Plano Atual
                    </Button>
                </CardFooter>
            </Card>

            {/* PLANO PREMIUM */}
            <Card className="bg-zinc-900/80 border-emerald-500/50 relative shadow-2xl shadow-emerald-500/10 scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                    <Star className="h-4 w-4 mr-1 fill-white" /> MAIS POPULAR
                </div>
                <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center justify-between">
                        Pro
                        <Zap className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                    </CardTitle>
                    <CardDescription className="text-emerald-200/70">Para quem quer dominar o dinheiro.</CardDescription>
                    <div className="mt-4">
                        <span className="text-4xl font-bold text-white">R$ 39,90</span>
                        <span className="text-zinc-400 text-sm ml-2">/mês</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-3">
                        <li className="flex items-center text-white"><Check className="h-5 w-5 text-emerald-400 mr-3" /> <strong>Análise Financeira com IA</strong></li>
                        <li className="flex items-center text-white"><Check className="h-5 w-5 text-emerald-400 mr-3" /> Upload Ilimitado de Comprovantes</li>
                        <li className="flex items-center text-white"><Check className="h-5 w-5 text-emerald-400 mr-3" /> Categorias Ilimitadas</li>
                        <li className="flex items-center text-white"><Check className="h-5 w-5 text-emerald-400 mr-3" /> Suporte Prioritário</li>
                        <li className="flex items-center text-white"><Check className="h-5 w-5 text-emerald-400 mr-3" /> Acesso Antecipado a Novidades</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleSubscribe} 
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 text-lg shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Assinar Agora"}
                    </Button>
                </CardFooter>
            </Card>

        </div>

        <p className="text-center text-zinc-500 text-sm mt-8">
            Pagamento seguro via Stripe. Cancele quando quiser.
        </p>
      </div>
    </div>
  )
}