# Markdown AI Editor

An intelligent markdown editor with AI-powered editing capabilities, built with Next.js and OpenAI. This editor allows you to write markdown content with real-time preview, get AI suggestions for improvements, and manage your document changes with ease.

## Features

- 🎨 **Real-time Markdown Preview**: See your markdown rendered in real-time
- 🤖 **AI-Powered Editing**: Get intelligent suggestions for improving your content
- 🔄 **Undo/Redo Support**: Full undo/redo functionality with keyboard shortcuts
- 💾 **Auto-save**: Your content is automatically saved to local storage
- 🌓 **Dark Mode Support**: Comfortable editing in both light and dark environments
- 📝 **Smart Text Selection**: Select text to get context-aware AI suggestions
- 👀 **Diff View**: Clear visualization of proposed changes before applying them
- ↔️ **Resizable Panels**: Adjust editor and preview panes to your preference

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **UI**: TailwindCSS for styling
- **AI Integration**: OpenAI API for intelligent suggestions
- **State Management**: React Hooks with custom persistence
- **Editor Components**: Custom React components for markdown editing

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/nitish4799/markdown-ai-editor.git
   cd markdown-ai-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Project Structure

```
markdown-ai-editor/
├── app/                   # Next.js app directory
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── public/                # Static files
```

## Key Components

- `MarkdownEditor`: Handles markdown input and preview
- `ChatPanel`: Manages AI interaction and suggestions
- `DiffViewer`: Shows proposed changes with highlighting
- `SplitPane`: Provides resizable split view functionality

## Usage

1. Start editing markdown content in the editor pane with AI.
2. Select text to get AI suggestions
3. Review suggested changes in the diff viewer
4. Accept or reject proposed changes
5. Use Ctrl+Z/Ctrl+Y for undo/redo


## Limitations & Future Improvements

### Current Limitations

1. **OpenAI API Constraints**:
   - Using the free tier API has rate limits and potential timeouts
   - Response times can be slower during peak usage
   - Context length is limited, which may affect larger documents
   - Better results could be achieved with a paid subscription

2. **Performance Considerations**:
   - Large markdown files might experience slight rendering delays
   - Local storage has size limitations for document storaget

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- AI powered by [OpenAI](https://openai.com)
- Styling with [TailwindCSS](https://tailwindcss.com)
