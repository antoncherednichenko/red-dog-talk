import { useState } from "react";

export function useToggle(
  initialState: boolean = false,
): [boolean, () => void] {
  const [state, setState] = useState(initialState);

  const toggle = () => setState((prev) => !prev);

  return [state, toggle];
}
