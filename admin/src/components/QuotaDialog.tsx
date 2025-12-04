import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import type { User } from "@/lib/api"

interface QuotaDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (amount: number) => void
}

export function QuotaDialog({ user, open, onOpenChange, onConfirm }: QuotaDialogProps) {
  const [customAmount, setCustomAmount] = useState("")

  const handleQuickSelect = (amount: number) => {
    onConfirm(amount)
    onOpenChange(false)
    setCustomAmount("")
  }

  const handleCustomSubmit = () => {
    const amount = parseInt(customAmount)
    if (!isNaN(amount)) {
      onConfirm(amount)
      onOpenChange(false)
      setCustomAmount("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改购买次数 - {user?.nickname}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              当前购买次数：{user?.purchased_quota}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => handleQuickSelect(20)} variant="outline">
                +20次
              </Button>
              <Button onClick={() => handleQuickSelect(50)} variant="outline">
                +50次
              </Button>
              <Button onClick={() => handleQuickSelect(100)} variant="outline">
                +100次
              </Button>
              <Button onClick={() => handleQuickSelect(999999)} variant="outline">
                无限次数
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">自定义数量</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="正数增加，负数减少"
              />
              <Button onClick={handleCustomSubmit}>确定</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
