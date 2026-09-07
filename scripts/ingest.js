import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import OpenAI from 'openai'

const dataDirectory = path.resolve('data')
const documentsPath = path.join(dataDirectory, 'documents.json')
const knowledgePath = path.join(dataDirectory, 'knowledge.json')
const usingGemini = Boolean(process.env.GEMINI_API_KEY && !process.env.AI_API_KEY)
const apiKey = process.env.AI_API_KEY || (usingGemini ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY)
const baseURL = usingGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : (process.env.AI_BASE_URL || 'https://api.openai.com/v1')
const embeddingModel = usingGemini ? 'gemini-embedding-001' : (process.env.EMBEDDING_MODEL || 'text-embedding-3-small')

if (!apiKey) throw new Error('Set AI_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in .env before running npm run ingest.')

const client = new OpenAI({ apiKey, baseURL })
const documents = JSON.parse(await fs.readFile(documentsPath, 'utf8'))

function chunkText(text, size = 900, overlap = 120) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chunks = []
  for (let start = 0; start < words.length; start += size - overlap) {
    const content = words.slice(start, start + size).join(' ')
    if (content) chunks.push(content)
    if (start + size >= words.length) break
  }
  return chunks
}

const chunks = documents.flatMap((document) => chunkText(document.content).map((content, index) => ({
  id: `${document.id || document.title}-${index}`,
  title: document.title,
  content,
})))
const embeddings = await client.embeddings.create({ model: embeddingModel, input: chunks.map((chunk) => chunk.content) })
const indexed = chunks.map((chunk, index) => ({ ...chunk, embedding: embeddings.data[index].embedding }))
await fs.mkdir(dataDirectory, { recursive: true })
await fs.writeFile(knowledgePath, JSON.stringify(indexed, null, 2))
console.log(`Indexed ${indexed.length} chunks from ${documents.length} documents into ${knowledgePath}`)