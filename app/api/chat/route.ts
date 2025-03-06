import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  // In a real application, you would retrieve the PDF content here
  // and include it in the system prompt or as context

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-latest"),
    messages,
    system:
      "You are a helpful study assistant that helps students prepare for exams. You provide clear explanations, answer questions, and help test knowledge based on the study materials they've uploaded.",
  })

  return result.toDataStreamResponse()
}

