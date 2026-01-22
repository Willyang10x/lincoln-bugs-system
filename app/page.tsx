import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Lock, FileText } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      
      {/* --- NAVBAR --- */}
      <header className="flex h-16 items-center justify-between px-4 lg:px-12 border-b border-zinc-800 bg-black/50 backdrop-blur fixed w-full z-50">
        
        {/* LOGO EM TEXTO DOURADO (Igual Sidebar) */}
        <Link href="/">
            <h1 className="text-2xl font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] cursor-pointer hover:brightness-110 transition-all">
                LINCOLN BUGS
            </h1>
        </Link>

        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 hidden sm:inline-flex">
              Acessar Painel
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 border border-emerald-500/20">
              Criar Acesso
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-28">
        
        {/* --- HERO SECTION --- */}
        <section className="flex flex-col items-center justify-center text-center px-4 space-y-8 max-w-6xl mx-auto">
          
          <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm font-medium text-emerald-500 backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Versão Exclusiva Black
          </div>
          
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.1]">
            Controle Financeiro <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-200">De Alto Padrão</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Gestão financeira blindada. Visualização de dados em tempo real, segurança criptografada e design exclusivo para o <strong>Lincoln Bugs</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
            <Link href="/cadastro">
              <Button size="lg" className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold h-14 px-10 text-lg rounded-full w-full sm:w-auto shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all border border-emerald-400/20">
                Entrar no Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* --- DASHBOARD PREVIEW (Sem Imagem, Com Texto Dourado) --- */}
          <div className="mt-16 w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden min-h-[400px] flex items-center justify-center bg-[url('/grid-pattern.svg')]">
               {/* Simulação da Tela do Sistema */}
               <div className="text-center space-y-4">
                   <h2 className="text-4xl sm:text-6xl font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400/20 via-yellow-200/20 to-yellow-500/20 select-none">
                        LINCOLN BUGS
                   </h2>
                   <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">
                       System Dashboard Preview
                   </p>
               </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES --- */}
        <section className="bg-black/50 py-32 border-y border-zinc-900 mt-20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4 group">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Analytics Black</h3>
                <p className="text-zinc-400">
                  Dashboard com tema escuro de alto contraste para visualização noturna e precisão nos dados.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <FileText className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Relatórios VIP</h3>
                <p className="text-zinc-400">
                  Exporte seus dados financeiros com cabeçalho personalizado e layout profissional.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <Lock className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Segurança Total</h3>
                <p className="text-zinc-400">
                  Seus dados estão protegidos em um banco de dados isolado e criptografado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-zinc-900 bg-black py-12 text-center text-sm text-zinc-500">
          <p>&copy; 2026 Lincoln Bugs System. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  )
}