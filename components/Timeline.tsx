import { ScrapbookEntry } from '@/types';
import EntryCard from './EntryCard';

interface TimelineProps {
  entries: ScrapbookEntry[];
}

export default function Timeline({ entries }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-vintage-brown font-handwritten">
          No memories yet. Start creating your scrapbook!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 p-8">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
