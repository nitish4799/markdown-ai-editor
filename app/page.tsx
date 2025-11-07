import SplitPane from '@/components/SplitPane';
import fs from 'fs';
import path from 'path';

export default async function Home() {
  const filePath = path.join(process.cwd(), 'manual.mmd');
  const initialMarkdown = fs.readFileSync(filePath, 'utf8');

  return (
    <main className="h-screen">
      <SplitPane initialMarkdown={initialMarkdown} />
    </main>
  );
}
