import { Check, Clipboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function CodeBlock({ children }: { children: React.ReactNode }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      setIsOverflowing(preRef.current.scrollHeight > 200);
    }
  }, [children]);

  const handleCopy = async () => {
    if (preRef.current) {
      await navigator.clipboard.writeText(preRef.current.textContent || "");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative bg-muted rounded-md">
      <div className="absolute right-2 top-2 flex gap-2">
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-muted-foreground/20 rounded-md"
          title="Copy code"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre
        ref={preRef}
        className={`p-4 overflow-auto ${
          !isExpanded ? "max-h-[200px]" : ""
        } bg-transparent`}
      >
        <code className="bg-transparent whitespace-pre-line">{children}</code>
      </pre>
      {!isExpanded && isOverflowing && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-2 text-sm text-center hover:bg-muted-foreground/20 border-t border-muted-foreground/20"
        >
          Show more
        </button>
      )}
    </div>
  );
}
