"use client"

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDate } from "@/contexts/date-context"

export function DateFilter() {
  const { formatCurrentDate, nextMonth, prevMonth, setToToday } = useDate()
  
  return (
    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-sm">
      <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-zinc-400 hover:text-white">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 px-4 min-w-[160px] justify-center cursor-pointer hover:bg-zinc-800/50 rounded-md py-1" onClick={setToToday}>
        <Calendar className="h-3 w-3 text-emerald-500" />
        <span className="text-sm font-medium text-zinc-100 capitalize">{formatCurrentDate()}</span>
      </div>

      <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-zinc-400 hover:text-white">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}