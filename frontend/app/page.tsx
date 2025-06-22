"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Database, Moon, Sun, Loader2, Copy, Check, Menu, X, Plus, Trash2, Send } from "lucide-react"
import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface DatabaseConnection {
  uri: string
  type: "postgresql" | "mysql" | "sqlite" | "mongodb" | "other"
}

export default function ChatWithDatabase() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  // Sidebar and database URI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [connection, setConnection] = useState<DatabaseConnection>({ uri: "", type: "postgresql" })
  const [newConnectionUri, setNewConnectionUri] = useState("")
  const [newConnectionType, setNewConnectionType] = useState<DatabaseConnection["type"]>("postgresql")

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const setDatabaseConnection = () => {
    if (!newConnectionUri.trim()) return
    setConnection({ uri: newConnectionUri.trim(), type: newConnectionType })
    setNewConnectionUri("")
    setNewConnectionType("postgresql")
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    // Ensure a database URI is provided
    if (!connection.uri) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "No database URI provided. Please add a connection in the sidebar.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          db_uri: connection.uri,
          query: currentInput,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            data.error ||
            data.detail ||
            "Sorry, I encountered an error while processing your request. Please check your database URI and try again.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.message || "No response received",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error: any) {
      console.error("Network error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I encountered a network error. Please check your backend server and try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    setInput("")
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const formatMessage = (content: string) => {
    const sqlKeywords = ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "JOIN"]
    const containsSQL = sqlKeywords.some((keyword) => content.toUpperCase().includes(keyword))

    if (containsSQL) {
      return (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground font-medium">Generated SQL Query:</div>
          <div className="relative group">
            <pre className="bg-slate-900 dark:bg-slate-800 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono border border-slate-700">
              <code>{content}</code>
            </pre>
          </div>
        </div>
      )
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getDatabaseIcon = (type: DatabaseConnection["type"]) => {
    switch (type) {
      case "postgresql":
        return "🐘"
      case "mysql":
        return "🐬"
      case "sqlite":
        return "📁"
      case "mongodb":
        return "🍃"
      default:
        return "🗄️"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-all duration-500">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Manager
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {/* Active Connection */}
            {connection.uri && (
              <Card className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-800 dark:text-green-400 flex items-center gap-2">
                    <span className="text-lg">{getDatabaseIcon(connection.type)}</span>
                    Active Connection
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono truncate">{connection.uri}</p>
                    <Badge variant="secondary" className="text-xs">
                      {connection.type.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add New Connection */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Set Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="conn-type" className="text-xs">
                    Database Type
                  </Label>
                  <Select
                    value={newConnectionType}
                    onValueChange={(value: DatabaseConnection["type"]) => setNewConnectionType(value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">🐘 PostgreSQL</SelectItem>
                      <SelectItem value="mysql">🐬 MySQL</SelectItem>
                      <SelectItem value="sqlite">📁 SQLite</SelectItem>
                      <SelectItem value="mongodb">🍃 MongoDB</SelectItem>
                      <SelectItem value="other">🗄️ Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="conn-uri" className="text-xs">
                    Connection URI
                  </Label>
                  <Textarea
                    id="conn-uri"
                    placeholder="postgresql://user:pass@localhost:5432/db"
                    value={newConnectionUri}
                    onChange={(e) => setNewConnectionUri(e.target.value)}
                    className="h-16 text-xs font-mono resize-none"
                  />
                </div>
                <Button
                  onClick={setDatabaseConnection}
                  disabled={!newConnectionUri.trim()}
                  className="w-full h-8 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Set Connection
                </Button>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-80" : ""}`}>
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl shadow-indigo-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarOpen(true)}
                      className="rounded-xl lg:hidden"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
                      <Database className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        ChatWithDatabase
                      </h1>
                      <p className="text-muted-foreground mt-1">Query your database with plain English</p>
                      {connection.uri && (
                        <Badge
                          variant="secondary"
                          className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarOpen(true)}
                      className="rounded-xl hidden lg:flex"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearConversation}
                            className="rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear conversation</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="rounded-xl"
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl shadow-indigo-500/10 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {/* Messages Area */}
              <ScrollArea className="h-[60vh] p-6" ref={scrollAreaRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 inline-block mb-6">
                      <Database className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Welcome to ChatWithDatabase!
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-4">
                      Start asking questions about your database in plain English. I'll convert them to SQL queries for
                      you.
                    </p>

                    {!connection.uri && (
                      <Alert className="max-w-md mx-auto mb-6">
                        <Database className="h-4 w-4" />
                        <AlertDescription>
                          Open the sidebar to configure your database connection and get started.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary" className="rounded-full px-4 py-2">
                        "Show me all users"
                      </Badge>
                      <Badge variant="secondary" className="rounded-full px-4 py-2">
                        "Count orders by status"
                      </Badge>
                      <Badge variant="secondary" className="rounded-full px-4 py-2">
                        "Find top customers"
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-lg transition-all duration-200 hover:shadow-xl group ${
                                  message.type === "user"
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white ml-4"
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mr-4"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">{formatMessage(message.content)}</div>
                                  {message.type === "assistant" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(message.content, message.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                    >
                                      {copiedId === message.id ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{formatTime(message.timestamp)}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg mr-4">
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                            <span className="text-sm text-muted-foreground">Generating SQL query...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-900/50">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        connection.uri
                          ? "Ask a question about your database..."
                          : "Configure database connection first..."
                      }
                      disabled={isLoading}
                      className="pr-16 h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="h-12 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}