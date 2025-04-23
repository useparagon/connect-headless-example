export function Header() {
  return (
    <header className="flex items-center py-4 px-8 border-b border-border">
      <img
        src="https://dashboard.useparagon.com/images/icons/paragon-no-text.svg"
        className="w-7 h-7 mr-2"
      />
      <div className="text-sm font-bold mr-8" style={{ lineHeight: '1.1rem' }}>
        Paragon{' '}
        <p
          className="text-xs opacity-70 uppercase font-extrabold"
          style={{ fontSize: 10 }}
        >
          Headless Connect
        </p>
      </div>
    </header>
  );
}
