"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function EsqueciSenha() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            if (response.ok) {
                setSent(true)
                toast.success("E-mail enviado! Verifique sua caixa de entrada.")
            } else {
                const error = await response.json()
                toast.error(error.detail || "Erro ao buscar e-mail.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro de conexão. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex h-screen w-full items-center justify-center bg-black overflow-hidden selection:bg-yellow-500/30">
            
            {/* Efeitos de Fundo Dourados (Luxo) */}
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-700/10 blur-[120px]" />
            
            <div className="z-10 w-full max-w-md p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl ring-1 ring-white/10">
                <Link href="/login" className="flex items-center text-xs uppercase font-bold text-zinc-500 mb-8 hover:text-yellow-500 transition-colors w-fit group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                    Voltar para Login
                </Link>
                
                <div className="mb-8 text-center">
                    <div className="relative h-20 w-20 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                         <Image 
                            src="/logo-icon.png" // Usa o ícone do Lincoln
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Recuperar Acesso</h1>
                    <p className="text-sm text-zinc-400">
                        {sent 
                            ? "E-mail de recuperação enviado com sucesso!" 
                            : "Digite seu e-mail corporativo para receber as instruções."}
                    </p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-zinc-300 ml-1">E-mail Cadastrado</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <Input 
                                    type="email" 
                                    className="pl-10 bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-yellow-500/20 h-11 transition-all" 
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-11 rounded-xl shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02]" disabled={loading}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Link de Recuperação"}
                        </Button>
                    </form>
                ) : (
                    <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                            <CheckCircle2 className="h-8 w-8 text-yellow-500" />
                        </div>
                        <p className="text-center text-sm text-zinc-400">
                            Verifique sua caixa de entrada (e spam). O link expira em 1 hora.
                        </p>
                        <Button 
                            onClick={() => setSent(false)} 
                            variant="outline" 
                            className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-11 rounded-xl"
                        >
                            Tentar outro e-mail
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}