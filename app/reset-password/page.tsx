"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            toast.warning("As senhas não coincidem!")
            return
        }

        if (!token) {
            toast.error("Token inválido ou expirado.")
            return
        }

        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append("token", token)
            formData.append("new_password", password)

            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                body: formData
            })

            if (response.ok) {
                setStatus("success")
                toast.success("Senha alterada com sucesso!")
                setTimeout(() => router.push("/login"), 3000)
            } else {
                setStatus("error")
                toast.error("Não foi possível redefinir a senha.")
            }
        } catch (error) {
            setStatus("error")
            toast.error("Erro de conexão.")
        } finally {
            setIsLoading(false)
        }
    }

    if (status === "success") {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-zinc-900/50 border border-yellow-500/20 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                    <CheckCircle className="h-8 w-8 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Senha Redefinida!</h2>
                <p className="text-zinc-400">Sua senha foi alterada com sucesso. <br/>Redirecionando para o login...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl ring-1 ring-white/10">
            <div className="mb-8 text-center">
                <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20 drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                    <Lock className="h-6 w-6 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Nova Senha</h1>
                <p className="text-sm text-zinc-400">Crie uma nova senha segura para sua conta.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-zinc-300 ml-1">Nova Senha</Label>
                    <Input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-yellow-500/20 h-11 transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-zinc-300 ml-1">Confirmar Senha</Label>
                    <Input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-yellow-500/20 h-11 transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                {status === "error" && (
                    <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center gap-2 text-sm text-red-400 animate-in fade-in slide-in-from-top-1">
                        <AlertTriangle className="h-4 w-4" />
                        Erro ao redefinir. O link pode ter expirado.
                    </div>
                )}

                <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-11 rounded-xl shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02]" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Nova Senha"}
                </Button>
            </form>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-black relative overflow-hidden selection:bg-yellow-500/30">
             {/* Background Effects (Golden Theme) */}
             <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-600/10 blur-[120px]" />
             <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-700/10 blur-[120px]" />
            
            <Suspense fallback={<div className="flex flex-col items-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-yellow-500" /><p className="text-zinc-500 text-sm">Carregando...</p></div>}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    )
}