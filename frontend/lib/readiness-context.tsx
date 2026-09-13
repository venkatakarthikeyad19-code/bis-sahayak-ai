'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ReadinessContextType {
  score: number;
  setScore: (val: number) => void;
  productName: string;
  setProductName: (name: string) => void;
}

const ReadinessContext = createContext<ReadinessContextType>({
  score: 0,
  setScore: () => {},
  productName: '',
  setProductName: () => {},
})

export function ReadinessProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(0)
  const [productName, setProductName] = useState('')

  return (
    <ReadinessContext.Provider value={{ score, setScore, productName, setProductName }}>
      {children}
    </ReadinessContext.Provider>
  )
}

export function useReadiness() {
  return useContext(ReadinessContext)
}
