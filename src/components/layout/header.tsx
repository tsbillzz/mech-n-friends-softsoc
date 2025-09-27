import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
        {/* <Image src="/images/LogoCampusComputers.png" alt="Campus Computers Logo" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" /> */}
        <h1 className="text-xl md:text-2xl font-bold font-headline tracking-tight">
          Campus Computers
        </h1>
      </div>
    </header>
  );
}
