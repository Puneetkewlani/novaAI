# 🤖 NovaAI

> **An affordable, personalized AI chatbot built for everyone.**

NovaAI is an AI-powered chatbot inspired by modern conversational AI platforms like ChatGPT. It is designed to provide **fast, intelligent, and user-specific responses while using fewer credits**, making advanced AI more affordable and accessible.

## 🚀 Why NovaAI?

Most AI chatbots can become expensive with frequent usage, especially when users need personalized or repeated interactions.

**NovaAI focuses on:**

* 💰 **Lower cost** compared to many AI chatbot platforms
* 🎯 **User-specific responses** based on context and preferences
* ⚡ **Fast AI-powered conversations**
* 🪙 **Lower credit consumption**
* 🧠 **Personalized interactions**
* 💬 Natural conversational experience
* 🔄 Context-aware responses
* 📱 Designed for a modern, easy-to-use interface

## ✨ Features

### 🧠 Personalized AI

NovaAI aims to understand the user's context and preferences so responses become more relevant over time.

Instead of giving generic answers, NovaAI can provide responses tailored to the individual user.

### 🪙 Credit-Efficient AI

One of the core goals of NovaAI is **doing more with fewer credits**.

The platform is designed around efficient AI usage so users can get useful, personalized responses without unnecessarily consuming large amounts of credits.

### 💬 Conversational Chat

Interact with NovaAI naturally through a familiar chatbot interface.

Users can:

* Ask questions
* Get explanations
* Generate ideas
* Solve problems
* Write content
* Learn new topics
* Continue conversations using previous context

### 💰 Affordable AI

NovaAI is designed to compete on **value rather than simply adding more expensive AI features**.

The goal is to make AI accessible to students, developers, creators, and everyday users.

### 🎯 User-Centric Responses

NovaAI focuses on understanding:

* User preferences
* Previous conversation context
* User goals
* Frequently requested information
* Communication preferences

This allows the AI to provide increasingly relevant responses.

---

## 🏗️ Project Vision

NovaAI aims to become a **cost-efficient personalized AI assistant** rather than simply another ChatGPT clone.

### Our vision:

> **"More useful AI. Less cost. More personalization."**

The long-term goal is to create an AI platform where users can access powerful AI capabilities without needing to spend excessive credits or money.

---

## 🔥 Core Differentiators

| Feature                     | NovaAI |
| --------------------------- | ------ |
| AI Chat                     | ✅      |
| Personalized Responses      | ✅      |
| Context-Aware Conversations | ✅      |
| Credit-Efficient Responses  | ✅      |
| Affordable Usage            | ✅      |
| Modern Chat Interface       | ✅      |
| User-Centric AI             | ✅      |
| Designed for Scalability    | 🚧     |

---

## 🛠️ Tech Stack

> Update this section according to the technologies actually used in the project.

**Frontend**

* HTML
* CSS
* JavaScript / React

**Backend**

* Node.js
* Express.js

**AI**

* Large Language Model API
* Prompt Engineering
* Context Management

**Database**

* MongoDB / Firebase

**Deployment**

* Vercel / Render / Firebase

---

## 📂 Project Structure

```text
NovaAI/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── ...
│
├── README.md
└── package.json
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/novaai.git
```

### 2. Navigate to the project

```bash
cd novaai
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file:

```env
AI_API_KEY=your_api_key
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_url
```

### 5. Configure Supabase persistence

Create a Supabase project, open its SQL Editor, and run [`database/schema.sql`](database/schema.sql). Then copy the Supabase project URL and service role key into `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is used only by the Express server and must never be added to frontend code. When these variables are present, users and conversations are saved through the `/api/users` and `/api/conversations` endpoints. Without them, the app continues using its local browser storage fallback.

### 6. Start the application

```bash
npm run dev
```

NovaAI should now be running locally.

---

## 🔮 Future Roadmap

* [ ] Advanced user memory
* [ ] Better personalization
* [ ] Multi-model support
* [ ] Voice conversations
* [ ] Image generation
* [ ] Document analysis
* [ ] Web search integration
* [ ] AI-powered coding assistant
* [ ] Mobile application
* [ ] Usage analytics
* [ ] Subscription plans
* [ ] Advanced credit optimization

---

## 💡 The Idea Behind NovaAI

AI shouldn't feel expensive just because you want to use it frequently.

NovaAI is built around a simple idea:

**Give users more useful responses while consuming fewer resources.**

By combining efficient AI usage with personalization and contextual understanding, NovaAI aims to provide a better balance between **cost, intelligence, and user experience**.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 📄 License

This project is currently intended for educational and development purposes.

Add your preferred license here, such as **MIT License**, before publishing the project publicly.

---

## 👨‍💻 Author

**Puneet Kewlani**

CSE Student & Developer

---

⭐ **If you like NovaAI, consider giving the repository a star!**

> **NovaAI — Smarter conversations. Lower cost. More personal.**
# 🤖 NovaAI

> **An affordable, personalized AI chatbot built for everyone.**

NovaAI is an AI-powered chatbot inspired by modern conversational AI platforms like ChatGPT. It is designed to provide **fast, intelligent, and user-specific responses while using fewer credits**, making advanced AI more affordable and accessible.

## 🚀 Why NovaAI?

Most AI chatbots can become expensive with frequent usage, especially when users need personalized or repeated interactions.

**NovaAI focuses on:**

* 💰 **Lower cost** compared to many AI chatbot platforms
* 🎯 **User-specific responses** based on context and preferences
* ⚡ **Fast AI-powered conversations**
* 🪙 **Lower credit consumption**
* 🧠 **Personalized interactions**
* 💬 Natural conversational experience
* 🔄 Context-aware responses
* 📱 Designed for a modern, easy-to-use interface

## ✨ Features

### 🧠 Personalized AI

NovaAI aims to understand the user's context and preferences so responses become more relevant over time.

Instead of giving generic answers, NovaAI can provide responses tailored to the individual user.

### 🪙 Credit-Efficient AI

One of the core goals of NovaAI is **doing more with fewer credits**.

The platform is designed around efficient AI usage so users can get useful, personalized responses without unnecessarily consuming large amounts of credits.

### 💬 Conversational Chat

Interact with NovaAI naturally through a familiar chatbot interface.

Users can:

* Ask questions
* Get explanations
* Generate ideas
* Solve problems
* Write content
* Learn new topics
* Continue conversations using previous context

### 💰 Affordable AI

NovaAI is designed to compete on **value rather than simply adding more expensive AI features**.

The goal is to make AI accessible to students, developers, creators, and everyday users.

### 🎯 User-Centric Responses

NovaAI focuses on understanding:

* User preferences
* Previous conversation context
* User goals
* Frequently requested information
* Communication preferences

This allows the AI to provide increasingly relevant responses.

---

## 🏗️ Project Vision

NovaAI aims to become a **cost-efficient personalized AI assistant** rather than simply another ChatGPT clone.

### Our vision:

> **"More useful AI. Less cost. More personalization."**

The long-term goal is to create an AI platform where users can access powerful AI capabilities without needing to spend excessive credits or money.

---

## 🔥 Core Differentiators

| Feature                     | NovaAI |
| --------------------------- | ------ |
| AI Chat                     | ✅      |
| Personalized Responses      | ✅      |
| Context-Aware Conversations | ✅      |
| Credit-Efficient Responses  | ✅      |
| Affordable Usage            | ✅      |
| Modern Chat Interface       | ✅      |
| User-Centric AI             | ✅      |
| Designed for Scalability    | 🚧     |

---

## 🛠️ Tech Stack

> Update this section according to the technologies actually used in the project.

**Frontend**

* HTML
* CSS
* JavaScript / React

**Backend**

* Node.js
* Express.js

**AI**

* Large Language Model API
* Prompt Engineering
* Context Management

**Database**

* MongoDB / Firebase

**Deployment**

* Vercel / Render / Firebase

---

## 📂 Project Structure

```text
NovaAI/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── ...
│
├── README.md
└── package.json
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/novaai.git
```

### 2. Navigate to the project

```bash
cd novaai
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file:

```env
AI_API_KEY=your_api_key
DATABASE_URL=your_database_url
```

### 5. Start the application

```bash
npm run dev
```

NovaAI should now be running locally.

---

## 🔮 Future Roadmap

* [ ] Advanced user memory
* [ ] Better personalization
* [ ] Multi-model support
* [ ] Voice conversations
* [ ] Image generation
* [ ] Document analysis
* [ ] Web search integration
* [ ] AI-powered coding assistant
* [ ] Mobile application
* [ ] Usage analytics
* [ ] Subscription plans
* [ ] Advanced credit optimization

---

## 💡 The Idea Behind NovaAI

AI shouldn't feel expensive just because you want to use it frequently.

NovaAI is built around a simple idea:

**Give users more useful responses while consuming fewer resources.**

By combining efficient AI usage with personalization and contextual understanding, NovaAI aims to provide a better balance between **cost, intelligence, and user experience**.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 📄 License

This project is currently intended for educational and development purposes.

Add your preferred license here, such as **MIT License**, before publishing the project publicly.

---

## 👨‍💻 Author

**Puneet Kewlani**

CSE Student & Developer

---

⭐ **If you like NovaAI, consider giving the repository a star!**

> **NovaAI — Smarter conversations. Lower cost. More personal.**
