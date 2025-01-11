export default function Step({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <li>
      <div className="flex items-center gap-2">
        <span className="text-sm text-background bg-foreground min-w-6 max-w-6 h-6 flex items-center justify-center rounded-full border border-border">
          {step}
        </span>
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      {description && (
        <p className="ml-8 text-sm mt-1.5 text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-2">{children}</div>
    </li>
  );
}
