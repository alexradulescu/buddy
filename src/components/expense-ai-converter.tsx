'use client'

import { useCompletion } from 'ai/react'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Props {
  handleTextareaAddExpenses: () => void
  setTextareaContent: (value: string) => void
  textareaContent: string
}

export const ExpenseAiConverter = ({ handleTextareaAddExpenses, setTextareaContent, textareaContent }: Props) => {
  const { toast } = useToast()

  const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: '/api/completion',
    onResponse: (response: Response) => {
      console.log('Received response from server:', response)
    },
    onFinish: (prompt: string, completion: string) => {
      console.log('Finished streaming message:', { prompt, completion })
      setTextareaContent(completion.replaceAll(`\`\`\``, ''))
    },
    onError: (error: Error) => {
      console.error('An error occurred:', error)
    }
  })

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }, [error, toast])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Expense AI Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            name="prompt"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your expense details here..."
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {error && <div className="text-red-500 mt-4">Error: {error.message}</div>}
        {completion ? (
          <>
            <div className="space-y-4">
              <Textarea
                value={textareaContent}
                onChange={(e) => setTextareaContent(e.target.value)}
                placeholder="Enter expenses (amount,category,date,description)"
                rows={10}
                className="font-mono"
              />
              <Button onClick={handleTextareaAddExpenses}>Add Expenses</Button>
            </div>
          </>
        ) : null}
      </CardFooter>
    </Card>
  )
}
