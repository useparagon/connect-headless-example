import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function App() {
  const [counter, setCounter] = useState(0);

  return (
    <div>
      <h1>
        Hello <span className="line-through text-black/50">World</span> Paragon
      </h1>
      <Button onClick={() => setCounter((c) => c + 1)}>Count: {counter}</Button>
    </div>
  );
}
