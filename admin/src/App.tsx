import { useState, useEffect } from "react"
import { LoginForm } from "./components/LoginForm"
import { UserTable } from "./components/UserTable"
import { Button } from "./components/ui/button"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">AI 高管教练 - 管理后台</h1>
          <Button onClick={handleLogout} variant="outline">
            退出登录
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <UserTable />
      </main>
    </div>
  )
}

export default App
