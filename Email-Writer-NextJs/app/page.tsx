"use client"

import { useState } from "react"
import { Sparkles, Copy, Send, Clock, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

export default function EmailReplyGenerator() {
  const [emailContent, setEmailContent] = useState("")
  const [tone, setTone] = useState("")
  const [generatedReply, setGeneratedReply] = useState("")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Array<{ content: string; reply: string; tone: string }>>([])
  const [activeTab, setActiveTab] = useState("compose")

  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Email content required",
        description: "Please enter the original email content to generate a reply.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await axios.post("http://localhost:8080/api/email/generate", {
        emailContent,
        tone,
      })

      const reply = typeof response.data === "string" ? response.data : JSON.stringify(response.data)
      setGeneratedReply(reply)

      // Add to history
      setHistory((prev) => [{ content: emailContent, reply, tone }, ...prev.slice(0, 4)])

      toast({
        title: "Reply generated successfully",
        description: "Your AI-powered email reply is ready!",
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate email reply. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The generated reply has been copied to your clipboard.",
    })
  }

  const loadFromHistory = (index: number) => {
    const item = history[index]
    setEmailContent(item.content)
    setTone(item.tone)
    setGeneratedReply(item.reply)
    setActiveTab("compose")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              AI Email Reply Generator
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Generate personalized email replies with the power of AI. Just paste the original email and let the AI do the
            rest!
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">Original Email</CardTitle>
                  <CardDescription>Paste the email you want to respond to</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste the original email content here..."
                    className="min-h-[200px] resize-none"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>{emailContent.length} characters</span>
                    <span>{Math.ceil(emailContent.length / 5)} words</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">No specific tone</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="empathetic">Empathetic</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                    onClick={handleSubmit}
                    disabled={loading || !emailContent.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate AI Reply
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card
                className={`shadow-md transition-opacity duration-300 ${generatedReply ? "opacity-100" : "opacity-70"}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Generated Reply</CardTitle>
                    {tone && (
                      <Badge variant="outline" className="capitalize">
                        {tone}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Your AI-crafted response</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Your AI-generated reply will appear here..."
                    className="min-h-[200px] resize-none"
                    value={generatedReply}
                    readOnly
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(generatedReply)}
                    disabled={!generatedReply}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Recent Generations</CardTitle>
                <CardDescription>Your last 5 generated email replies</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No history yet. Generate your first reply!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium truncate max-w-[80%]">{item.content.substring(0, 60)}...</div>
                          {item.tone && (
                            <Badge variant="outline" className="capitalize">
                              {item.tone}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {item.reply.substring(0, 120)}...
                        </p>
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" onClick={() => loadFromHistory(index)}>
                            Load
                          </Button>
                        </div>
                        {index < history.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} AI Email Reply Generator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
