import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";
import "./message-format.css";

const starterConversations = [
  { id: crypto.randomUUID(), title: "Welcome to Nova", messages: [] },
];
const prompts = [
  {
    icon: "✦",
    title: "Explore an idea",
    text: "Help me think through a new project idea",
  },
  {
    icon: "⌘",
    title: "Write something",
    text: "Draft a clear, friendly email for me",
  },
  {
    icon: "◇",
    title: "Learn something",
    text: "Explain a complex topic in simple terms",
  },
  {
    icon: "↗",
    title: "Make a plan",
    text: "Create a practical plan for my week",
  },
];
const plans = [
  {
    name: "Free",
    price: "$0",
    detail: "For getting started",
    features: [
      "20 messages per day",
      "Nova 1.0 access",
      "Conversation history",
    ],
  },
  {
    name: "Plus",
    price: "$20",
    detail: "For everyday productivity",
    features: [
      "Unlimited messages",
      "Advanced Nova models",
      "Priority responses",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: "$40",
    detail: "For demanding workflows",
    features: [
      "Everything in Plus",
      "Early feature access",
      "Expanded context",
    ],
  },
];

function loadConversations() {
  try {
    const saved = JSON.parse(localStorage.getItem("nova-conversations"));
    if (!Array.isArray(saved)) return starterConversations;
    const conversations = saved
      .filter((item) => item?.id)
      .map((item) => ({
        ...item,
        messages: (item.messages || []).filter(
          (message, index, list) =>
            message?.id &&
            list.findIndex((candidate) => candidate.id === message.id) ===
              index,
        ),
      }));
    return conversations.length ? conversations : starterConversations;
  } catch {
    return starterConversations;
  }
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (
      !form.email.includes("@") ||
      form.password.length < 6 ||
      (mode === "register" && !form.name.trim())
    ) {
      setError(
        mode === "login"
          ? "Enter a valid email and a password with 6+ characters."
          : "Add your name, a valid email, and a password with 6+ characters.",
      );
      return;
    }
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(mode === "register"
            ? { redirectTo: window.location.origin }
            : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Authentication failed.");
      if (result.requiresEmailConfirmation) {
        setError("Account created. Check your email to confirm it, then sign in.");
        return;
      }
      onAuth(result.user);
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const signInWithProvider = async (provider) => {
    setGoogleLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectTo: window.location.origin }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `${provider} sign-in failed.`);
      window.location.assign(result.url);
    } catch (requestError) {
      setGoogleLoading(false);
      setError(requestError.message);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-brand">
          <span className="brand-mark">N</span>
          <span>nova</span>
        </div>
        <div className="auth-quote">
          <span>“</span>
          <h1>
            A clearer way
            <br />
            to think.
          </h1>
          <p>
            Your thoughtful AI workspace for ideas, writing, and everything in
            between.
          </p>
        </div>
        <div className="auth-orbit orbit-one"></div>
        <div className="auth-orbit orbit-two"></div>
      </div>
      <main className="auth-panel">
        <div className="auth-mobile-brand">
          <span className="brand-mark">N</span>
          <span>nova</span>
        </div>
        <div className="auth-heading">
          <p className="eyebrow">
            {mode === "login" ? "Welcome back" : "Start thinking clearly"}
          </p>
          <h2>
            {mode === "login" ? "Sign in to Nova" : "Create your account"}
          </h2>
          <p>
            {mode === "login"
              ? "Continue where you left off."
              : "Your first conversation is just a minute away."}
          </p>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <label>
              Full name
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Alex Morgan"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {mode === "login" && (
            <button
              type="button"
              className="forgot"
              onClick={() =>
                setError(
                  "Password reset will be available when email delivery is connected.",
                )
              }
            >
              Forgot password?
            </button>
          )}
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit">
            {mode === "login" ? "Sign in" : "Create account"} <span>→</span>
          </button>
        </form>
        <div className="auth-divider">
          <span>or continue with</span>
        </div>
        <button
          className="oauth-button"
          type="button"
          onClick={() => signInWithProvider("google")}
          disabled={googleLoading}
        >
          ◉ {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>
        <button
          className="oauth-button"
          type="button"
          onClick={() => signInWithProvider("github")}
          disabled={googleLoading}
        >
          ◇ {googleLoading ? "Connecting..." : "Continue with GitHub"}
        </button>
        <p className="auth-switch">
          {mode === "login" ? "New to Nova?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <small className="legal">
          By continuing, you agree to Nova’s Terms and Privacy Policy.
        </small>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nova-user"));
    } catch {
      return null;
    }
  });
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState("welcome");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("nova-theme") || "light",
  );
  const [openMenu, setOpenMenu] = useState(null);
  const [view, setView] = useState("chat");
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ||
    conversations[0];
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    const accessToken = new URLSearchParams(window.location.hash.slice(1)).get("access_token");
    if (!accessToken) return;
    fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (result?.user) setUser(result.user);
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("nova-user", JSON.stringify(user));
    else localStorage.removeItem("nova-user");
  }, [user]);
  useEffect(() => {
    localStorage.setItem("nova-conversations", JSON.stringify(conversations));
  }, [conversations]);
  useEffect(() => {
    localStorage.setItem("nova-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (!user || user.id) return;
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((savedUser) => savedUser && setUser(savedUser))
      .catch(() => {});
  }, [user]);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    fetch(`/api/conversations/${user.id}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((savedConversations) => {
        if (!cancelled && savedConversations.length) {
          setConversations(savedConversations);
          setActiveId(savedConversations[0].id);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  const saveConversation = (conversation, ownerId = user?.id) => {
    if (!ownerId) return;
    fetch(`/api/conversations/${conversation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: ownerId,
        title: conversation.title,
        messages: conversation.messages,
      }),
    }).catch(() => {});
  };
  const startNewChat = () => {
    const conversation = {
      id: crypto.randomUUID(),
      title: "New conversation",
      messages: [],
    };
    setConversations((current) => [conversation, ...current]);
    saveConversation(conversation);
    setActiveId(conversation.id);
    setInput("");
    setAttachment(null);
    setAttachmentError("");
    setView("chat");
    textareaRef.current?.focus();
  };
  const handleAttachment = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 4_000_000) {
      setAttachmentError("Please choose a file smaller than 4 MB.");
      return;
    }
    const isImage = file.type.startsWith("image/");
    const isTextDocument =
      file.type.startsWith("text/") ||
      /\.(csv|json|md|markdown|html|xml|js|jsx|ts|tsx|py|css)$/i.test(
        file.name,
      );
    if (!isImage && !isTextDocument) {
      setAttachmentError("Use an image or a text document (TXT, MD, CSV, JSON).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type || "text/plain",
        kind: isImage ? "image" : "document",
        data: reader.result,
      });
      setAttachmentError("");
    };
    reader.onerror = () => setAttachmentError("That file could not be read.");
    if (isImage) reader.readAsDataURL(file);
    else reader.readAsText(file);
  };
  const sendMessage = async (message = input) => {
    const text = message.trim();
    if ((!text && !attachment) || isThinking) return;
    const conversation = activeConversation;
    const displayText = [text, attachment && `Attached: ${attachment.name}`]
      .filter(Boolean)
      .join("\n\n");
    const apiContent = attachment?.kind === "image"
      ? [
          { type: "text", text: text || "Please analyze this image." },
          { type: "image_url", image_url: { url: attachment.data } },
        ]
      : attachment
        ? `${text}\n\nAttached document (${attachment.name}):\n${attachment.data}`
        : text;
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: displayText,
      attachment: attachment
        ? { name: attachment.name, kind: attachment.kind, type: attachment.type }
        : undefined,
    };
    const nextMessages = [...(conversation?.messages || []), userMessage];
    const updatedConversation = {
      ...conversation,
      title: conversation.messages.length ? conversation.title : displayText.slice(0, 32),
      messages: nextMessages,
    };
    setConversations((current) => current.map((item) => item.id === activeId ? updatedConversation : item));
    saveConversation(updatedConversation);
    setInput("");
    setAttachment(null);
    setAttachmentError("");
    setIsThinking(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }, index) => ({
            role,
            content: index === nextMessages.length - 1 ? apiContent : content,
          })),
        }),
      });
      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(responseText || `Backend returned HTTP ${response.status}.`);
      }
      if (!response.ok)
        throw new Error(data.error || "The backend could not respond.");
      const reply = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
      };
      const completedConversation = { ...updatedConversation, messages: [...updatedConversation.messages, reply] };
      setConversations((current) => current.map((item) => item.id === activeId ? completedConversation : item));
      saveConversation(completedConversation);
    } catch (error) {
      const reply = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I could not reach the AI backend: ${error.message}`,
      };
      const failedConversation = { ...updatedConversation, messages: [...updatedConversation.messages, reply] };
      setConversations((current) => current.map((item) => item.id === activeId ? failedConversation : item));
      saveConversation(failedConversation);
    } finally {
      setIsThinking(false);
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };
  const signOut = () => {
    setUser(null);
    setOpenMenu(null);
    setView("chat");
  };
  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div className={`app-shell theme-${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">N</span>
          <span>nova</span>
        </div>
        <button className="new-chat" onClick={startNewChat}>
          <span>+</span> New chat <kbd>Ctrl K</kbd>
        </button>
        <div className="sidebar-label">Your chats</div>
        <nav className="conversation-list" aria-label="Conversations">
          {conversations.map((conversation) => (
            <button
              className={`conversation ${conversation.id === activeId ? "active" : ""}`}
              key={conversation.id}
              onClick={() => {
                setActiveId(conversation.id);
                setView("chat");
              }}
            >
              <span className="chat-icon">◌</span>
              <span>{conversation.title}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="menu-anchor">
            <button
              className="sidebar-action"
              aria-expanded={openMenu === "appearance"}
              onClick={() =>
                setOpenMenu(openMenu === "appearance" ? null : "appearance")
              }
            >
              <span>◒</span> Appearance <span className="chevron">›</span>
            </button>
            {openMenu === "appearance" && (
              <div className="pop-menu appearance-menu">
                <strong>Appearance</strong>
                {["light", "dim", "dark"].map((option) => (
                  <button
                    className={theme === option ? "selected" : ""}
                    key={option}
                    onClick={() => {
                      setTheme(option);
                      setOpenMenu(null);
                    }}
                  >
                    <span className={`theme-swatch ${option}`}></span>
                    {option[0].toUpperCase() + option.slice(1)}
                    <span className="check">{theme === option ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="menu-anchor">
            <button
              className="profile"
              aria-expanded={openMenu === "profile"}
              onClick={() =>
                setOpenMenu(openMenu === "profile" ? null : "profile")
              }
            >
              <span className="avatar">{user.name[0].toUpperCase()}</span>
              <span>
                <strong>{user.name}</strong>
                <small>{user.plan} plan</small>
              </span>
              <span className="more">•••</span>
            </button>
            {openMenu === "profile" && (
              <div className="pop-menu profile-menu">
                <div className="profile-heading">
                  <span className="avatar large">
                    {user.name[0].toUpperCase()}
                  </span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setView("settings");
                    setOpenMenu(null);
                  }}
                >
                  ⚙ Account settings
                </button>
                <button
                  onClick={() => {
                    setView("plans");
                    setOpenMenu(null);
                  }}
                >
                  ♧ Manage plan
                </button>
                <button className="sign-out" onClick={signOut}>
                  ↪ Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu">
            ☰
          </button>
          <div className="model-picker">
            <span className="status-dot"></span>
            <strong>Nova 1.0</strong>
            <span className="down">⌄</span>
          </div>
          <button className="share-button" onClick={() => setView("plans")}>
            ↗ <span>Share</span>
          </button>
        </header>
        {view === "chat" && (
          <>
            <section
              className={`chat-area ${messages.length ? "has-messages" : ""}`}
            >
              {messages.length === 0 ? (
                <div className="welcome">
                  <div className="welcome-mark">N</div>
                  <p className="eyebrow">A clearer way to think</p>
                  <h1>What’s on your mind?</h1>
                  <p className="welcome-copy">
                    Ask anything, explore ideas, or get help making something
                    real.
                  </p>
                  <div className="prompt-grid">
                    {prompts.map((prompt) => (
                      <button
                        className="prompt-card"
                        key={prompt.title}
                        onClick={() => sendMessage(prompt.text)}
                      >
                        <span className="prompt-icon">{prompt.icon}</span>
                        <span>
                          <strong>{prompt.title}</strong>
                          <small>{prompt.text}</small>
                        </span>
                        <span className="prompt-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="messages">
                  {messages.map((message) => (
                    <article
                      className={`message ${message.role}`}
                      key={message.id}
                    >
                      <div className="message-avatar">
                        {message.role === "user"
                          ? user.name[0].toUpperCase()
                          : "N"}
                      </div>
                      <div>
                        <div className="message-name">
                          {message.role === "user" ? "You" : "Nova"}
                        </div>
                        {message.role === "assistant" ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </article>
                  ))}
                  {isThinking && (
                    <article className="message assistant">
                      <div className="message-avatar">N</div>
                      <div>
                        <div className="message-name">Nova</div>
                        <div className="typing">
                          <i></i>
                          <i></i>
                          <i></i>
                        </div>
                      </div>
                    </article>
                  )}
                </div>
              )}
            </section>
            <div className="composer-wrap">
              <div className="composer">
                {attachment && (
                  <div className="attachment-chip">
                    <span>{attachment.kind === "image" ? "Image" : "Document"}</span>
                    <strong>{attachment.name}</strong>
                    <button
                      type="button"
                      aria-label="Remove attachment"
                      onClick={() => setAttachment(null)}
                    >
                      ×
                    </button>
                  </div>
                )}
                {attachmentError && (
                  <div className="attachment-error">{attachmentError}</div>
                )}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Nova..."
                  rows="1"
                />
                <div className="composer-tools">
                  <input
                    ref={fileInputRef}
                    className="file-input"
                    type="file"
                    accept="image/*,.txt,.md,.csv,.json,.html,.xml,.js,.jsx,.ts,.tsx,.py,.css"
                    onChange={handleAttachment}
                  />
                  <button
                    type="button"
                    aria-label="Attach image or document"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    ＋
                  </button>
                  <span>Nova can make mistakes. Check important info.</span>
                  <button
                    className="send-button"
                    aria-label="Send message"
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isThinking}
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {view === "settings" && (
          <Settings
            user={user}
            onSave={(updated) => {
              setUser(updated);
              setView("chat");
            }}
            onBack={() => setView("chat")}
          />
        )}
        {view === "plans" && (
          <Plans
            current={user.plan}
            onSelect={(plan) => {
              setUser({ ...user, plan });
              setView("chat");
            }}
            onBack={() => setView("chat")}
          />
        )}
      </main>
    </div>
  );
}

function Settings({ user, onSave, onBack }) {
  const [form, setForm] = useState(user);
  const update = (key, value) => setForm({ ...form, [key]: value });
  return (
    <section className="page-view settings-view">
      <button className="back-link" onClick={onBack}>
        ← Back to chat
      </button>
      <div className="page-heading">
        <p className="eyebrow">Your account</p>
        <h1>Account settings</h1>
        <p>Manage your profile and preferences.</p>
      </div>
      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-avatar">{form.name[0].toUpperCase()}</div>
          <div>
            <strong>Profile photo</strong>
            <small>JPG or PNG, up to 5MB</small>
          </div>
          <button className="outline-button">Upload photo</button>
        </div>
        <div className="settings-card form-card">
          <h3>Personal information</h3>
          <label>
            Full name
            <input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </label>
          <div className="settings-actions">
            <button className="outline-button" onClick={onBack}>
              Cancel
            </button>
            <button
              className="primary-button compact"
              onClick={() => onSave(form)}
            >
              Save changes <span>→</span>
            </button>
          </div>
        </div>
        <div className="settings-card form-card">
          <h3>Security</h3>
          <button
            className="setting-row"
            onClick={() =>
              alert(
                "Password reset email would be sent when the backend is connected.",
              )
            }
          >
            Change password <span>→</span>
          </button>
          <button className="setting-row">
            Two-factor authentication <span className="muted">Not set up</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Plans({ current, onSelect, onBack }) {
  return (
    <section className="page-view plans-view">
      <button className="back-link" onClick={onBack}>
        ← Back to chat
      </button>
      <div className="page-heading">
        <p className="eyebrow">Plans that fit your pace</p>
        <h1>Choose your Nova plan</h1>
        <p>Upgrade your workspace as your ideas grow.</p>
      </div>
      <div className="plans-grid">
        {plans.map((plan) => (
          <article
            className={`plan-card ${plan.popular ? "popular" : ""}`}
            key={plan.name}
          >
            {plan.popular && (
              <span className="popular-label">Most popular</span>
            )}
            <h2>{plan.name}</h2>
            <p>{plan.detail}</p>
            <div className="plan-price">
              {plan.price}
              <small>{plan.price !== "$0" ? "/month" : "/forever"}</small>
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
            <button
              className={
                current === plan.name ? "outline-button" : "primary-button"
              }
              onClick={() => onSelect(plan.name)}
            >
              {current === plan.name ? "Current plan" : `Choose ${plan.name}`}{" "}
              {current !== plan.name && <span>→</span>}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default App;
