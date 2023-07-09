import {Backdrop, CircularProgress} from "@mui/material"
import { ReactNode } from "react"

type SpinProps = {
  spinning: boolean
  children: ReactNode
}
export default function Spin({spinning, children}: SpinProps) {
  return (
    <div className="relative w-full h-full">
      <Backdrop open={spinning} className="absolute">
        <CircularProgress className="text-white"/>
      </Backdrop>
      {children}
    </div>
  )
}