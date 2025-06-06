<p align="center">
  <img src="https://socialify.git.ci/gbagush/nesahub/image?custom_description=A+modern+social+media+platform+built+for+real-time+sharing%2C+authentic+connections%2C+and+vibrant+communities.+Experience+a+fresh+way+to+stay+connected.&description=1&font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pattern=Formal+Invitation&pulls=1&stargazers=1&theme=Dark" alt="Nesahub - Modern Social Media Platform" />
</p>

<p align="center">
  <a href="https://nesahub.web.id">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#getting-started">🚀 Getting Started</a> •
  <a href="#contributing">🤝 Contributing</a>
</p>

## 🌟 About Nesahub

Nesahub represents the next generation of social media platforms, designed with modern web technologies to deliver seamless user experiences. Built with performance, scalability, and user engagement at its core, Nesahub offers a fresh approach to social networking that prioritizes authentic connections and meaningful interactions.

<img src="https://nesahub.web.id/screenshot.png" alt="Nesahub Platform Screenshot" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

<h2 id="features">✨ Features</h2>

### Core Functionality

- **📝 Create Posts** - Share your thoughts, moments, and media with the world
- **🖼️ Media Sharing** - Share posts with photos and GIFs
- **🤖 AI-Powered Assistant** - Mention @oxa in any post to get smart, contextual AI replies
- **💬 Real-time Messaging** - Instant one-on-one DMs with seamless conversations
- **🔁 Social Interactions** - Follow/unfollow users, like, dislike, and repost content
- **💚 Healthy Community** - Built-in toxicity filtering and positive vibes focus

### Technical Highlights

- **⚡ Lightning Fast** - Optimized performance with [Next.js 15](https://nextjs.org/)
- **🎨 Modern UI/UX** - Beautiful components with [HeroUI](https://www.heroui.com/) and [shadcn/ui](https://ui.shadcn.com/)
- **🔐 Secure Authentication** - Complete user management with [Clerk](https://clerk.com/)

## 💻 Built with

<img src="https://skillicons.dev/icons?i=nodejs,typescript,nextjs,tailwindcss,prisma,mysql" height="64">

<h2 id="getting-started">🚀 Getting Started</h2>

### Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) v22 or higher
- Node Package Manager (npm)
- Required API keys and credentials for `.env.local` (see step 4)

### Installation

1. Set up the [Socket.io Server](https://github.com/gbagush/nesahub/tree/socketio-server) first
2. Clone the repository
   ```bash
   git clone https://github.com/gbagush/nesahub.git
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Set up environment variables

   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local` file with:

   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   DATABASE_URL=""

   NEXT_PUBLIC_CLERK_FROTENT_API_URL=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   CLERK_WEBHOOK_SIGNING_SECRET=

   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/home
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/home

   GIPHY_API_KEY=

   NEXT_PUBLIC_FTP_BASE_URL=
   FTP_USERNAME=
   FTP_PASSWORD=
   FTP_HOST=
   FTP_PORT=

   DEEPSEEK_API_KEY=

   NEXT_PUBLIC_SOCKET_BASE_URI=
   SOCKET_WEBHOOK_BASE_URI=
   SOCKET_WEBHOOK_SECRET=

   NEXT_PUBLIC_TURNSTILE_SITE_KEY=
   TURNSTILE_SECRET_KEY=
   ```

5. Set up the database
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
6. Run the development server
   ```bash
   npm run dev
   ```

Your application should now be running on `http://localhost:3000`.

### Production Deployment

For production deployment instructions, please check the [deploy-config](https://github.com/gbagush/nesahub/tree/deploy-config) branch.

<h2 id="contributing">🤝 Contributing</h2>

We welcome contributions from the community!

<a href="https://github.com/gbagush/nesahub/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=gbagush/nesahub" />
</a>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
