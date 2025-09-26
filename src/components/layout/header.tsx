import { Computer } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
        <Computer className="w-8 h-8" />
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          Campus Computers
        </h1>
      </div>
    </header>
  );
}
