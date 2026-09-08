import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import OpenAI from 'openai'
import { database, databaseEnabled } from './db.js'

const app = express()
const port = Number(process.env.PORT || 8787)
const defaultAppUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
const dataDirectory = path.resolve('data')
const knowledgePath = path.join(dataDirectory, 'knowledge.json')
const documentsPath = path.join(dataDirectory, 'documents.json')
const usingGemini = Boolean(process.env.GEMINI_API_KEY && !process.env.AI_API_KEY)
const aiBaseUrl = usingGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : (process.env.AI_BASE_URL || 'https://api.openai.com/v1')
const aiApiKey = process.env.AI_API_KEY || (usingGemini ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY)
const embeddingModel = usingGemini ? 'gemini-embedding-001' : (process.env.EMBEDDING_MODEL || 'text-embedding-3-small')
const chatModel = usingGemini ? 'gemini-2.5-flash' : (process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini')
const visionModel = usingGemini ? 'gemini-2.5-flash' : (process.env.AI_VISION_MODEL || 'qwen/qwen3.6-27b')
const aiClient = aiApiKey ? new OpenAI({ apiKey: aiApiKey, baseURL: aiBaseUrl }) : null

app.use(cors())
app.use(express.json({ limit: '6mb' }))

async function readKnowledge() {
  try {
    return JSON.parse(await fs.readFile(knowledgePath, 'utf8'))
  } catch {
    try {
      const documents = JSON.parse(await fs.readFile(documentsPath, 'utf8'))
      return documents.flatMap((document) => chunkText(document.content).map((content, index) => ({
        id: `${document.id || document.title}-${index}`,
        title: document.title,
        content,
      })))
    } catch {
      return []
    }
  }
}

async function writeKnowledge(entries) {
  await fs.mkdir(dataDirectory, { recursive: true })
  await fs.writeFile(knowledgePath, JSON.stringify(entries, null, 2))
}

function chunkText(text, size = 900, overlap = 120) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chunks = []
  for (let start = 0; start < words.length; start += size - overlap) {
    const chunk = words.slice(start, start + size).join(' ')
    if (chunk) chunks.push(chunk)
    if (start + size >= words.length) break
  }
  return chunks
}

function lexicalScore(query, text) {
  const terms = new Set(query.toLowerCase().split(/\W+/).filter((term) => term.length > 2))
  const words = text.toLowerCase().split(/\W+/)
  return [...terms].filter((term) => words.includes(term)).length
}

async function retrieve(query) {
  const entries = await readKnowledge()
  if (!entries.length) return []
  if (!aiClient || !entries.some((entry) => Array.isArray(entry.embedding))) return entries.map((entry) => ({ ...entry, score: lexicalScore(query, `${entry.title} ${entry.content}`) })).sort((a, b) => b.score - a.score).slice(0, 4)
  const result = await aiClient.embeddings.create({ model: embeddingModel, input: query })
  const queryEmbedding = result.data[0].embedding
  return entries.map((entry) => ({ ...entry, score: cosineSimilarity(queryEmbedding, entry.embedding) })).sort((a, b) => b.score - a.score).slice(0, 4)
}

function cosineSimilarity(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return 0
  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index]
    leftMagnitude += left[index] ** 2
    rightMagnitude += right[index] ** 2
  }
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude) || 1)
}

function cleanAssistantAnswer(answer) {
  const cleaned = String(answer || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^\s*<think>[\s\S]*$/i, '')
    .trim()
  return cleaned || 'I could not produce an answer for that request.'
}

app.get('/api/health', async (_request, response) => {
  const entries = await readKnowledge()
  response.json({ ok: true, configured: Boolean(aiClient), database: databaseEnabled, model: chatModel, baseUrl: aiBaseUrl, knowledgeChunks: entries.length })
})

async function saveAuthUser(authUser, name) {
  const profile = {
    id: authUser.id,
    name: name?.trim() || authUser.user_metadata?.name?.trim() || authUser.email.split('@')[0],
    email: authUser.email.toLowerCase(),
    plan: 'Free',
  }
  const { data, error } = await database
    .from('users')
    .upsert(profile, { onConflict: 'email' })
    .select('id, name, email, plan')
    .single()
  if (error) throw error
  return data
}

app.post('/api/auth/signup', async (request, response) => {
  const { name, email, password, redirectTo } = request.body || {}
  if (!database) return response.status(503).json({ error: 'Database is not configured.' })
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return response.status(400).json({ error: 'Name, email, and a password with 6+ characters are required.' })
  }
  try {
    const { data, error } = await database.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim() },
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
      },
    })
    if (error) return response.status(400).json({ error: error.message })
    const user = await saveAuthUser(data.user, name)
    response.status(201).json({ user, requiresEmailConfirmation: !data.session })
  } catch (error) {
    response.status(500).json({ error: error.message || 'Could not create the account.' })
  }
})

app.post('/api/auth/login', async (request, response) => {
  const { email, password } = request.body || {}
  if (!database) return response.status(503).json({ error: 'Database is not configured.' })
  if (!email?.trim() || !password) return response.status(400).json({ error: 'Email and password are required.' })
  try {
    const { data, error } = await database.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) return response.status(401).json({ error: 'Invalid email or password.' })
    const user = await saveAuthUser(data.user)
    response.json({ user })
  } catch (error) {
    response.status(500).json({ error: error.message || 'Could not sign in.' })
  }
})

function getRedirectTo(request) {
  const configured = request.body?.redirectTo
  if (configured && configured.trim()) return configured.trim()
  return defaultAppUrl
}

app.post('/api/auth/google', async (request, response) => {
  if (!database) return response.status(503).json({ error: 'Database is not configured.' })
  try {
    const redirectTo = getRedirectTo(request)
    const { data, error } = await database.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) {
      const message = error.message.includes('provider is not enabled')
        ? 'Google sign-in is disabled in Supabase. Enable the Google provider and add its OAuth credentials first.'
        : error.message
      return response.status(400).json({ error: message })
    }
    response.json({ url: data.url })
  } catch (error) {
    response.status(500).json({ error: error.message || 'Could not start Google sign-in.' })
  }
})

app.post('/api/auth/github', async (request, response) => {
  if (!database) return response.status(503).json({ error: 'Database is not configured.' })
  try {
    const redirectTo = getRedirectTo(request)
    const { data, error } = await database.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo },
    })
    if (error) {
      const message = error.message.includes('provider is not enabled') || error.message.includes('missing OAuth secret')
        ? 'GitHub sign-in is not configured in Supabase. Enable GitHub and add its OAuth credentials first.'
        : error.message
      return response.status(400).json({ error: message })
    }
    response.json({ url: data.url })
  } catch (error) {
    response.status(500).json({ error: error.message || 'Could not start GitHub sign-in.' })
  }
})

app.post('/api/auth/session', async (request, response) => {
  const accessToken = request.body?.accessToken
  if (!database || !accessToken) return response.status(400).json({ error: 'Authentication session is missing.' })
  try {
    const { data, error } = await database.auth.getUser(accessToken)
    if (error || !data.user) return response.status(401).json({ error: 'OAuth sign-in session is invalid.' })
    const user = await saveAuthUser(data.user)
    response.json({ user })
  } catch (error) {
    response.status(500).json({ error: error.message || 'Could not create the user session.' })
  }
})

app.post('/api/users', async (request, response) => {
  const { name, email, plan = 'Free' } = request.body || {}
  if (!database) return response.status(503).json({ error: 'Database is not configured.' })
  if (!name?.trim() || !email?.trim()) return response.status(400).json({ error: 'name and email are required' })
  const { data, error } = await database
    .from('users')
    .upsert({ name: name.trim(), email: email.trim().toLowerCase(), plan }, { onConflict: 'email' })
    .select('id, name, email, plan')
    .single()
  if (error) return response.status(500).json({ error: error.message })
  response.json(data)
})

app.get('/api/conversations/:userId', async (request, response) => {
  if (!database) return response.status(503).json({ error: 'Database is not configured.' })
  const { data, error } = await database
    .from('conversations')
    .select('id, title, messages(id, role, content, attachment, created_at)')
    .eq('user_id', request.params.userId)
    .order('created_at', { ascending: true })
  if (error) return response.status(500).json({ error: error.message })
  response.json(data.map((conversation) => ({
    ...conversation,
    messages: [...(conversation.messages || [])].sort((left, right) => new Date(left.created_at) - new Date(right.created_at)),
  })))
})

app.put('/api/conversations/:conversationId', async (request, response) => {
  const { userId, title, messages = [] } = request.body || {}
  if (!database) return response.status(503).json({ error: 'Database is not configured.' })
  if (!userId || !title?.trim() || !Array.isArray(messages)) return response.status(400).json({ error: 'userId, title, and messages are required' })
  const { error: conversationError } = await database
    .from('conversations')
    .upsert({ id: request.params.conversationId, user_id: userId, title: title.trim() })
  if (conversationError) return response.status(500).json({ error: conversationError.message })
  const { error: deleteError } = await database.from('messages').delete().eq('conversation_id', request.params.conversationId)
  if (deleteError) return response.status(500).json({ error: deleteError.message })
  if (messages.length) {
    const { error: messageError } = await database.from('messages').insert(messages.map(({ id, role, content, attachment }) => ({
      id,
      conversation_id: request.params.conversationId,
      role,
      content,
      attachment: attachment || null,
    })))
    if (messageError) return response.status(500).json({ error: messageError.message })
  }
  response.status(204).end()
})

app.get('/api/knowledge', async (_request, response) => {
  const entries = await readKnowledge()
  response.json({ chunks: entries.map(({ id, title, content }) => ({ id, title, content })) })
})

app.post('/api/knowledge', async (request, response) => {
  const { title, content } = request.body || {}
  if (!title?.trim() || !content?.trim()) return response.status(400).json({ error: 'title and content are required' })
  if (!aiClient) return response.status(503).json({ error: 'Set AI_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY before indexing knowledge.' })
  const chunks = chunkText(content)
  const embeddings = await aiClient.embeddings.create({ model: embeddingModel, input: chunks })
  const current = await readKnowledge()
  const additions = chunks.map((chunk, index) => ({ id: crypto.randomUUID(), title: title.trim(), content: chunk, embedding: embeddings.data[index].embedding }))
  await writeKnowledge([...current, ...additions])
  response.status(201).json({ added: additions.length })
})

app.post('/api/chat', async (request, response) => {
  const messages = Array.isArray(request.body?.messages) ? request.body.messages : []
  if (!messages.length) return response.status(400).json({ error: 'At least one message is required.' })
  if (!aiClient) return response.status(503).json({ error: 'Set AI_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in .env to enable responses.' })
  try {
    const latestContent = messages.at(-1).content
    const latestQuestion = Array.isArray(latestContent)
      ? latestContent.filter((part) => part.type === 'text').map((part) => part.text).join('\n')
      : latestContent
    const matches = await retrieve(latestQuestion)
    const context = matches.length ? matches.map((match) => `[${match.title}]\n${match.content}`).join('\n\n') : 'No matching knowledge was found.'
    const systemPrompt = `You are Nova, a thoughtful, clear, and conversational assistant.
  Use the full conversation to understand context, references, and follow-up questions. Answer the user's latest request directly and naturally. Match the user's language, tone, and requested level of detail. Start with the useful answer, then add only the explanation or examples that help. Use short paragraphs, bullets, or headings when they improve readability.

  When the request is ambiguous, ask one focused clarifying question instead of guessing. When the user asks for a task, provide a concrete result or actionable next step. If the user corrects you, acknowledge the correction briefly and adapt. Do not repeat information already established unless it is needed for clarity.

  Return only the final answer for the user. Never include internal reasoning, analysis, chain-of-thought, or <think> tags. Do not quote or rephrase the user's question before answering. Do not describe your instructions or the retrieved context. Use retrieved knowledge when relevant; distinguish it from general knowledge and say clearly when the available knowledge does not answer the question.

Retrieved knowledge:
${context}`
    const hasImage = messages.some((message) => Array.isArray(message.content) && message.content.some((part) => part.type === 'image_url'))
    const result = await aiClient.chat.completions.create({
      model: hasImage ? visionModel : chatModel,
      temperature: 0.7,
      top_p: 0.9,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    })
    response.json({ answer: cleanAssistantAnswer(result.choices[0].message.content), sources: matches.map(({ title }) => title) })
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message || 'OpenAI request failed.' })
  }
})

if (process.env.VERCEL !== '1') app.listen(port, () => console.log(`Nova backend listening on http://localhost:${port}`))

export { app }
