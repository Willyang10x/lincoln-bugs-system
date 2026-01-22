"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner" // <--- IMPORTADO

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
            toast.error("As senhas não coincidem!") // MUDANÇA
            return
        }

        if (!token) {
            toast.error("Token inválido ou expirado.") // MUDANÇA
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
                toast.success("Senha alterada com sucesso!") // ADICIONADO
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
            <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-zinc-900/50 border border-green-500/20 rounded-2xl">
                <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Senha Redefinida!</h2>
                <p className="text-zinc-400">Sua senha foi alterada com sucesso. Redirecionando para o login...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="mb-8 text-center">
                <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <Lock className="h-6 w-6 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Nova Senha</h1>
                <p className="text-sm text-zinc-400">Crie uma nova senha segura para sua conta.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-zinc-300">Nova Senha</Label>
                    <Input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/50 border-zinc-700 text-white focus:border-indigo-500"
                        required
                        minLength={6}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-zinc-300">Confirmar Senha</Label>
                    <Input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-black/50 border-zinc-700 text-white focus:border-indigo-500"
                        required
                        minLength={6}
                    />
                </div>

                {status === "error" && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        Erro ao redefinir. O link pode ter expirado.
                    </div>
                )}

                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Nova Senha"}
                </Button>
            </form>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-black relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
            
            <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-indigo-500" />}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    )
}