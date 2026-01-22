"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface DateContextType {
  currentDate: Date
  month: number
  year: number
  nextMonth: () => void
  prevMonth: () => void
  setToToday: () => void
  formatCurrentDate: () => string
}

const DateContext = createContext<DateContextType | undefined>(undefined)

export function DateProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const setToToday = () => {
    setCurrentDate(new Date())
  }

  const formatCurrentDate = () => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)
  }

  const value = {
    currentDate,
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    nextMonth,
    prevMonth,
    setToToday,
    formatCurrentDate
  }

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>
}

export function useDate() {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error("useDate must be used within a DateProvider")
  }
  return context
}