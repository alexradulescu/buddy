import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

interface BasePromptProps {
  transactions?: string
  categories?: string
  historicalExpenses?: string
}

const basePrompt = ({
  transactions,
  categories,
  historicalExpenses
}: BasePromptProps) => `You are an intelligent assistant tasked with categorizing a list of bank transactions for an expense tracker. The user has provided 3 key inputs:
1. A list of past transactions, each with a description and its assigned category name and category ID.
2. A user-defined list of active categories that must be strictly followed. They are in key-value format as follows: categoryId: categoryName
3. List of current transactions to process based in the following rules:
- Skip/ignore any expense with the description containing any of the following words: Salary, Bullish
- Format the amount as a number with two decimal places, without including the currency symbol.
- If there are 2 amounts for an expense the smaller one is the amount, the larger one is the remaining balance.
- Format the date as 'yyyy-MM-dd'. If no year is present on the date of an expense, set current year, 2025.
- If there are 2 dates on an expense, use the latest one available.
- Do minimal cleanup of the description to be better human readable and easier to identify.
- Categorize each transaction based on the provided categories and historical expenses. Follow these steps:
- Use the past transactions to help infer the correct categoryId for new transactions.
- Only assign categoryId from the provided map of active categories.
- If a new transaction's description or context closely matches a past transaction, use the same categoryId if available. If the categoryId is not available, use the categoryif of the category with the closest label to the category label in the past transactions. For example if closest category label was "Food [2024]" but in the available categories the closest label is "Food", use the categoryId of "Food".
- If no clear match exists, make your best guess based on the description while adhering strictly to the category list.
- Make sure to return the categoryId (example: "0db82f5d-1979-4568-8bbc-f67ece393c23") and not category label (example: "Food [2024]").


Here are examples of past expenses:
${historicalExpenses}

The user-defined categories are:
${categories}

Now, categorize the following new transactions:
${transactions}
`

const newBasePrompt = ({
  transactions,
  categories,
  historicalExpenses
}: BasePromptProps) => `Below is a detailed prompt you can use. It clearly explains the process, includes dedicated sections for historicalExpenses, expenseCategories, and newExpenses, and provides an illustrative example:

---

**Prompt for AI Expense Categorization**

Your task is to categorize new expenses based on historical expense data and a set of defined expense categories. Follow these instructions carefully:

- **Objective:**  
  Map each new expense to the most appropriate category based on past expense descriptions and category details.

- **Data Sections:**  
  - **historicalExpenses:** A list of objects, each with an "expense" (a descriptive string) and a "categoryId" (the ID associated with that expense).  
  - **expenseCategories:** A list of objects, each containing:  
    - "id": Unique identifier for the category.  
    - "name": The name of the category (which may include a year or other details).  
    - "isActive": A boolean indicating if this category is active.  
  - **newExpenses:** A list of objects, each with an "expense" field containing the description of the expense that needs to be categorized.

- **Instructions for Matching:**  
  - **Step 1: Analyze Historical Data**  
    Review the historicalExpenses to understand how previous expenses were categorized.
  
  - **Step 2: Compare Expense Descriptions**  
    For each new expense, compare its description with the descriptions in historicalExpenses. Identify the closest match based on similarity of wording (e.g., "Supermarket shopping" is similar to "Supermarket").

  - **Step 3: Determine Category Mapping**  
    - Use the categoryId from the matching historical expense as a starting point.  
    - Check the corresponding expenseCategories: If there are multiple categories that could match (for instance, due to similar labels across different years), prioritize the one where "isActive" is true.

  - **Step 4: Return the Mapping**  
    Output a JSON array where each new expense object is augmented with the determined categoryId.

- **Example:**  

  - *Historical Expenses:*  
    <code>
    [
      { "expense": "Supermarket", "categoryId": "123" }
    ]
    </code>

  - *Expense Categories:*  
    <code>
    [
      { "id": "123", "name": "Groceries [2024]", "isActive": false },
      { "id": "987", "name": "Groceries 2025", "isActive": true }
    ]
    </code>

  - *New Expenses:*  
    <code>
    [
      { "expense": "Supermarket shopping" }
    ]
    </code>

  - *Expected Output:*  
    <code>
    [
      { "expense": "Supermarket shopping", "categoryId": "987" }
    ]
    </code>

  *Rationale:* The new expense "Supermarket shopping" closely resembles the historical expense "Supermarket". Although the historical mapping is linked to categoryId "123", the active category in the expenseCategories list is "Groceries 2025" (id "987"). Therefore, the new expense should be mapped to categoryId "987".

- **Template Section for Input Data:**  
  <code>
  historicalExpenses: ${historicalExpenses}
  expenseCategories: ${categories}
  newExpenses: ${transactions}
  </code>

- **Final Task:**  
  Given the provided historicalExpenses, expenseCategories, and newExpenses, determine the best matching category for each new expense. Return the results as a JSON array with each expense and its corresponding categoryId.

---

This prompt provides clear guidance and examples, ensuring the AI understands how to use past expense data to accurately categorize new expenses.`

export const maxDuration = 60

/** Based on the first user and openai messages, generates a title for the conversation */
export async function POST(req: Request) {
  const {
    prompt,
    expenseCategories,
    historicalExpenses
  }: { prompt: string; expenseCategories: string; historicalExpenses: Record<string, string> } = await req.json()

  const result = streamObject({
    model: openai('gpt-4o'),
    output: 'array',
    schema: z.object({
      amount: z.number().nonnegative().describe('Amount of the expense'),
      categoryId: z
        .string()
        .describe(
          'CategoryId of the expense, based on the expense category mapping provided. Example: 0db82f5d-1979-4568-8bbc-f67ece393c23'
        ),
      date: z.string().describe('Date of the expense, in yyyy-MM-dd format'),
      description: z
        .string()
        .describe('Description of the expense with minimal cleanup, but keeping the original description')
    }),
    prompt: basePrompt({
      transactions: prompt,
      categories: expenseCategories,
      historicalExpenses: JSON.stringify(historicalExpenses)
    })
  })

  return result.toTextStreamResponse()
}
