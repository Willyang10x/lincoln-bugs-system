import { DollarSign } from "lucide-react"

interface LogoProps {
  withText?: boolean; // Opção para mostrar só o ícone ou o ícone + texto
  className?: string;
}

export function Logo({ withText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* O ÍCONE VERDE PADRÃO */}
      <div className="h-8 w-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
        <DollarSign className="h-5 w-5 text-emerald-500" strokeWidth={3} />
      </div>
      
      {/* O TEXTO (Opcional) */}
      {withText && (
        <span className="font-bold text-xl tracking-tight text-white">
          Finance<span className="text-emerald-500">.OS</span>
        </span>
      )}
    </div>
  )
}