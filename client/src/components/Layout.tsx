import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function Layout({ title, children, backTo, backLabel = 'Back', actions }: LayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 no-print">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="text-orange-400 font-bold text-lg min-w-[44px] min-h-[44px] flex items-center"
            >
              ←
            </button>
          )}
          <h1 className="text-lg font-bold text-white flex-1 truncate">{title}</h1>
          {actions}
        </div>
      </header>
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
