"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            // MUDEI AQUI: bg-zinc-900 (em vez de background) para destacar do fundo preto
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-50 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg font-sans",
          
          description: "group-[.toast]:text-zinc-400",
          
          actionButton:
            "group-[.toast]:bg-emerald-500 group-[.toast]:text-white",
          
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400",
          
          // --- ESTILOS ESPECÍFICOS PARA ERRO E SUCESSO ---
          error:
            "group-[.toaster]:bg-red-950 group-[.toaster]:border-red-900 group-[.toaster]:text-red-200",
          success:
            "group-[.toaster]:bg-emerald-950 group-[.toaster]:border-emerald-900 group-[.toaster]:text-emerald-200",
          warning:
            "group-[.toaster]:bg-yellow-950 group-[.toaster]:border-yellow-900 group-[.toaster]:text-yellow-200",
          info:
            "group-[.toaster]:bg-blue-950 group-[.toaster]:border-blue-900 group-[.toaster]:text-blue-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }