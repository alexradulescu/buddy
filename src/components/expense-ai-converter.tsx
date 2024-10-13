'use client'

import { useCompletion } from 'ai/react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useCategoryStore } from '@/stores/category-store'

interface Props {
  handleTextareaAddExpenses: () => void
  setTextareaContent: (value: string) => void
  textareaContent: string
}

export const ExpenseAiConverter = ({ handleTextareaAddExpenses, setTextareaContent, textareaContent }: Props) => {
  const { toast } = useToast()
  const expenseCategories = useCategoryStore((state) => state.expenseCategories)

  const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: '/api/completion',
    body: {
      expenseCategories: expenseCategories.map((category) => category.name)
    },
    onFinish: (prompt: string, completion: string) => {
      setTextareaContent(completion.replaceAll('```', ''))
    },
    onError: (error: Error) => {
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        })
      }
    }
  })

  return (
    <>
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
      {error && <div className="text-red-500 mt-4">Error: {error.message}</div>}
      {completion ? (
        <>
          <div className="space-y-4">
            <Textarea
              value={textareaContent}
              onChange={(e) => setTextareaContent(e.target.value)}
              placeholder="Enter expenses (amount,category,date,description)"
              rows={10}
              className="font-mono max-h-[50dvh] overflow-y-scroll"
            />
            <Button onClick={handleTextareaAddExpenses}>Add Expenses</Button>
          </div>
        </>
      ) : null}
    </>
  )
}
