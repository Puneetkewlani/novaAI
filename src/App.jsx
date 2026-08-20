import { useEffect, useRef, useState } from 'react'
import './App.css'

const starterConversations = [{ id: 'welcome', title: 'Welcome to Nova', messages: [] }]
const prompts = [
  { icon: '✦', title: 'Explore an idea', text: 'Help me think through a new project idea' },
  { icon: '⌘', title: 'Write something', text: 'Draft a clear, friendly email for me' },
  { icon: '◇', title: 'Learn something', text: 'Explain a complex topic in simple terms' },
  { icon: '↗', title: 'Make a plan', text: 'Create a practical plan for my week' },
]
const plans = [
  { name: 'Free', price: '$0', detail: 'For getting started', features: ['20 messages per day', 'Nova 1.0 access', 'Conversation history'] },
  { name: 'Plus', price: '$20', detail: 'For everyday productivity', features: ['Unlimited messages', 'Advanced Nova models', 'Priority responses'], popular: true },
  { name: 'Pro', price: '$40', detail: 'For demanding workflows', features: ['Everything in Plus', 'Early feature access', 'Expanded context'] },
]

function loadConversations() {
  try {
    const saved = JSON.parse(localStorage.getItem('nova-conversations'))
    if (!Array.isArray(saved)) return starterConversations
    const conversations = saved.filter((item) => item?.id).map((item) => ({ ...item, messages: (item.messages || []).filter((message, index, list) => message?.id && list.findIndex((candidate) => candidate.id === message.id) === index) }))
    return conversations.length ? conversations : starterConversations
  } catch { return starterConversations }
}

function createReply(prompt) {
  const lowerPrompt = prompt.toLowerCase()
  if (lowerPrompt.includes('email')) return 'Absolutely. Tell me who the email is for, the tone you want, and the key points to include. I can turn that into a polished draft in one pass.'
  if (lowerPrompt.includes('plan') || lowerPrompt.includes('week')) return 'Let’s make it practical. Start by listing your three most important outcomes, then we can shape them into small, focused blocks with room for the unexpected.'
  if (lowerPrompt.includes('explain') || lowerPrompt.includes('learn')) return 'I can break that down from the big picture to the details, using examples along the way. What topic would you like to explore?'
  return `That’s an interesting direction. I’d start by clarifying the outcome you want from “${prompt}”, then break it into a few small experiments. What would success look like?`
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!form.email.includes('@') || form.password.length < 6 || (mode === 'register' && !form.name.trim())) {
      setError(mode === 'login' ? 'Enter a valid email and a password with 6+ characters.' : 'Add your name, a valid email, and a password with 6+ characters.')
      return
    }
    const name = mode === 'register' ? form.name.trim() : form.email.split('@')[0]
    onAuth({ name, email: form.email, plan: 'Free' })
  }
  return <div className="auth-page"><div className="auth-art"><div className="auth-brand"><span className="brand-mark">N</span><span>nova</span></div><div className="auth-quote"><span>“</span><h1>A clearer way<br />to think.</h1><p>Your thoughtful AI workspace for ideas, writing, and everything in between.</p></div><div className="auth-orbit orbit-one"></div><div className="auth-orbit orbit-two"></div></div><main className="auth-panel"><div className="auth-mobile-brand"><span className="brand-mark">N</span><span>nova</span></div><div className="auth-heading"><p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Start thinking clearly'}</p><h2>{mode === 'login' ? 'Sign in to Nova' : 'Create your account'}</h2><p>{mode === 'login' ? 'Continue where you left off.' : 'Your first conversation is just a minute away.'}</p></div><form onSubmit={submit} className="auth-form">{mode === 'register' && <label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" /></label>}<label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label><label>Password<div className="password-input"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>{mode === 'login' && <button type="button" className="forgot" onClick={() => setError('Password reset will be available when email delivery is connected.')}>Forgot password?</button>}{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button></form><div className="auth-divider"><span>or continue with</span></div><button className="oauth-button" onClick={() => onAuth({ name: 'Alex Morgan', email: 'alex@example.com', plan: 'Free' })}>◉ Continue with Google</button><p className="auth-switch">{mode === 'login' ? 'New to Nova?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p><small className="legal">By continuing, you agree to Nova’s Terms and Privacy Policy.</small></main></div>
}

function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('nova-user')) } catch { return null } })
  const [conversations, setConversations] = useState(loadConversations)
  const [activeId, setActiveId] = useState('welcome')
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('nova-theme') || 'light')
  const [openMenu, setOpenMenu] = useState(null)
  const [view, setView] = useState('chat')
  const textareaRef = useRef(null)
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || conversations[0]
  const messages = activeConversation?.messages || []

  useEffect(() => { user ? localStorage.setItem('nova-user', JSON.stringify(user)) : localStorage.removeItem('nova-user') }, [user])
  useEffect(() => { localStorage.setItem('nova-conversations', JSON.stringify(conversations)) }, [conversations])
  useEffect(() => { localStorage.setItem('nova-theme', theme) }, [theme])
  const startNewChat = () => { const conversation = { id: crypto.randomUUID(), title: 'New conversation', messages: [] }; setConversations((current) => [conversation, ...current]); setActiveId(conversation.id); setInput(''); setView('chat'); textareaRef.current?.focus() }
  const sendMessage = (message = input) => { const text = message.trim(); if (!text || isThinking) return; const userMessage = { id: crypto.randomUUID(), role: 'user', content: text }; setConversations((current) => current.map((conversation) => conversation.id === activeId ? { ...conversation, title: conversation.messages.length ? conversation.title : text.slice(0, 32), messages: [...conversation.messages, userMessage] } : conversation)); setInput(''); setIsThinking(true); window.setTimeout(() => { const reply = { id: crypto.randomUUID(), role: 'assistant', content: createReply(text) }; setConversations((current) => current.map((conversation) => conversation.id === activeId ? { ...conversation, messages: [...conversation.messages, reply] } : conversation)); setIsThinking(false) }, 650) }
  const handleKeyDown = (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }
  const signOut = () => { setUser(null); setOpenMenu(null); setView('chat') }
  if (!user) return <AuthScreen onAuth={setUser} />

  return <div className={`app-shell theme-${theme}`}>
    <aside className="sidebar"><div className="brand"><span className="brand-mark">N</span><span>nova</span></div><button className="new-chat" onClick={startNewChat}><span>+</span> New chat <kbd>Ctrl K</kbd></button><div className="sidebar-label">Your chats</div><nav className="conversation-list" aria-label="Conversations">{conversations.map((conversation) => <button className={`conversation ${conversation.id === activeId ? 'active' : ''}`} key={conversation.id} onClick={() => { setActiveId(conversation.id); setView('chat') }}><span className="chat-icon">◌</span><span>{conversation.title}</span></button>)}</nav><div className="sidebar-bottom"><div className="menu-anchor"><button className="sidebar-action" aria-expanded={openMenu === 'appearance'} onClick={() => setOpenMenu(openMenu === 'appearance' ? null : 'appearance')}><span>◒</span> Appearance <span className="chevron">›</span></button>{openMenu === 'appearance' && <div className="pop-menu appearance-menu"><strong>Appearance</strong>{['light', 'dim', 'dark'].map((option) => <button className={theme === option ? 'selected' : ''} key={option} onClick={() => { setTheme(option); setOpenMenu(null) }}><span className={`theme-swatch ${option}`}></span>{option[0].toUpperCase() + option.slice(1)}<span className="check">{theme === option ? '✓' : ''}</span></button>)}</div>}</div><div className="menu-anchor"><button className="profile" aria-expanded={openMenu === 'profile'} onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}><span className="avatar">{user.name[0].toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.plan} plan</small></span><span className="more">•••</span></button>{openMenu === 'profile' && <div className="pop-menu profile-menu"><div className="profile-heading"><span className="avatar large">{user.name[0].toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div><button onClick={() => { setView('settings'); setOpenMenu(null) }}>⚙ Account settings</button><button onClick={() => { setView('plans'); setOpenMenu(null) }}>♧ Manage plan</button><button className="sign-out" onClick={signOut}>↪ Sign out</button></div>}</div></div></aside>
    <main className="main-content"><header className="topbar"><button className="mobile-menu" aria-label="Open menu">☰</button><div className="model-picker"><span className="status-dot"></span><strong>Nova 1.0</strong><span className="down">⌄</span></div><button className="share-button" onClick={() => setView('plans')}>↗ <span>Share</span></button></header>{view === 'chat' && <><section className={`chat-area ${messages.length ? 'has-messages' : ''}`}>{messages.length === 0 ? <div className="welcome"><div className="welcome-mark">N</div><p className="eyebrow">A clearer way to think</p><h1>What’s on your mind?</h1><p className="welcome-copy">Ask anything, explore ideas, or get help making something real.</p><div className="prompt-grid">{prompts.map((prompt) => <button className="prompt-card" key={prompt.title} onClick={() => sendMessage(prompt.text)}><span className="prompt-icon">{prompt.icon}</span><span><strong>{prompt.title}</strong><small>{prompt.text}</small></span><span className="prompt-arrow">↗</span></button>)}</div></div> : <div className="messages">{messages.map((message) => <article className={`message ${message.role}`} key={message.id}><div className="message-avatar">{message.role === 'user' ? user.name[0].toUpperCase() : 'N'}</div><div><div className="message-name">{message.role === 'user' ? 'You' : 'Nova'}</div><p>{message.content}</p></div></article>)}{isThinking && <article className="message assistant"><div className="message-avatar">N</div><div><div className="message-name">Nova</div><div className="typing"><i></i><i></i><i></i></div></div></article>}</div>}</section><div className="composer-wrap"><div className="composer"><textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Message Nova..." rows="1" /><div className="composer-tools"><button aria-label="Attach file">＋</button><span>Nova can make mistakes. Check important info.</span><button className="send-button" aria-label="Send message" onClick={() => sendMessage()} disabled={!input.trim() || isThinking}>↑</button></div></div></div></>}{view === 'settings' && <Settings user={user} onSave={(updated) => { setUser(updated); setView('chat') }} onBack={() => setView('chat')} />}{view === 'plans' && <Plans current={user.plan} onSelect={(plan) => { setUser({ ...user, plan }); setView('chat') }} onBack={() => setView('chat')} />}</main>
  </div>
}

function Settings({ user, onSave, onBack }) { const [form, setForm] = useState(user); const update = (key, value) => setForm({ ...form, [key]: value }); return <section className="page-view settings-view"><button className="back-link" onClick={onBack}>← Back to chat</button><div className="page-heading"><p className="eyebrow">Your account</p><h1>Account settings</h1><p>Manage your profile and preferences.</p></div><div className="settings-grid"><div className="settings-card"><div className="settings-avatar">{form.name[0].toUpperCase()}</div><div><strong>Profile photo</strong><small>JPG or PNG, up to 5MB</small></div><button className="outline-button">Upload photo</button></div><div className="settings-card form-card"><h3>Personal information</h3><label>Full name<input value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label>Email address<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label><div className="settings-actions"><button className="outline-button" onClick={onBack}>Cancel</button><button className="primary-button compact" onClick={() => onSave(form)}>Save changes <span>→</span></button></div></div><div className="settings-card form-card"><h3>Security</h3><button className="setting-row" onClick={() => alert('Password reset email would be sent when the backend is connected.')}>Change password <span>→</span></button><button className="setting-row">Two-factor authentication <span className="muted">Not set up</span></button></div></div></section> }

function Plans({ current, onSelect, onBack }) { return <section className="page-view plans-view"><button className="back-link" onClick={onBack}>← Back to chat</button><div className="page-heading"><p className="eyebrow">Plans that fit your pace</p><h1>Choose your Nova plan</h1><p>Upgrade your workspace as your ideas grow.</p></div><div className="plans-grid">{plans.map((plan) => <article className={`plan-card ${plan.popular ? 'popular' : ''}`} key={plan.name}>{plan.popular && <span className="popular-label">Most popular</span>}<h2>{plan.name}</h2><p>{plan.detail}</p><div className="plan-price">{plan.price}<small>{plan.price !== '$0' ? '/month' : '/forever'}</small></div><ul>{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul><button className={current === plan.name ? 'outline-button' : 'primary-button'} onClick={() => onSelect(plan.name)}>{current === plan.name ? 'Current plan' : `Choose ${plan.name}`} {current !== plan.name && <span>→</span>}</button></article>)}</div></section> }

export default App
