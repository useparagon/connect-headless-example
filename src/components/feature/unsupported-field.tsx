export function UnsupportedField({ field }: { field: unknown }) {
  return (
    <div>
      <p>Field not supported:</p>
      <pre className="max-w-full max-h-[150px] text-sm overflow-auto bg-card p-2 rounded-md border border-border">
        {JSON.stringify(field, null, 2)}
      </pre>
    </div>
  );
}
