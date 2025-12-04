import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { QuotaDialog } from "./QuotaDialog"
import { api, type User } from "@/lib/api"

export function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchPhone, setSearchPhone] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchPhone.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter((user) =>
        user.phone?.includes(searchPhone.trim()) || false
      )
      setFilteredUsers(filtered)
    }
  }, [searchPhone, users])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await api.getUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("加载用户列表失败:", error)
      alert("加载用户列表失败，请检查后端服务是否启动")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleUpdateQuota = async (amount: number) => {
    if (selectedUser) {
      try {
        await api.updateUserQuota(selectedUser.id, amount)
        await loadUsers()
        alert("修改成功！")
      } catch (error) {
        console.error("修改购买次数失败:", error)
        alert("修改失败，请重试")
      }
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN")
  }

  if (loading) {
    return <div className="flex justify-center p-8">加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="搜索手机号"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-64"
          />
          <Button onClick={loadUsers} variant="outline">刷新</Button>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>手机号</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>每日配额</TableHead>
              <TableHead>购买次数</TableHead>
              <TableHead>总可用次数</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  未找到匹配的用户
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono">{user.phone}</TableCell>
                  <TableCell>
                    <span className="font-medium">{user.nickname}</span>
                  </TableCell>
                  <TableCell>{user.daily_quota}</TableCell>
                  <TableCell>
                    {user.purchased_quota === 999999 ? (
                      <Badge>无限</Badge>
                    ) : (
                      user.purchased_quota
                    )}
                  </TableCell>
                  <TableCell>
                    {user.purchased_quota === 999999
                      ? "无限"
                      : user.daily_quota + user.purchased_quota}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleOpenDialog(user)}
                    >
                      修改次数
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <QuotaDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleUpdateQuota}
      />
    </div>
  )
}
