"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner" // <--- IMPORTADO

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function EsqueciSenha() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            // MUDANÇA: alert -> toast.success
            toast.success("Se o e-mail existir, você receberá um link em breve.")
        } catch (error) {
            console.error(error)
            toast.error("Erro ao tentar enviar. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
            
            <div className="z-10 w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl">
                <Link href="/login" className="flex items-center text-sm text-zinc-400 mb-6 hover:text-white transition-colors w-fit">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Login
                </Link>
                
                <div className="mb-6 text-center">
                    <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                        <Mail className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h1>
                    <p className="text-sm text-zinc-400">Digite seu e-mail cadastrado para receber o link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">E-mail</Label>
                        <Input 
                            type="email" 
                            className="bg-black/50 border-zinc-700 text-white focus:border-indigo-500" 
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar Link de Recuperação"}
                    </Button>
                </form>
            </div>
        </div>
    )
}