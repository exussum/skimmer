import { useEffect, useState, createContext } from "react";

export const MouseInUseContext = createContext(false);

export const useMouseInUseState = (document) => {
  const [inUse, inUseCtx] = useState(false);
  useEffect(() => {
    let timer;
    document.addEventListener("mousemove", () => {
      inUseCtx(true);
      clearTimeout(timer);
      timer = setTimeout(() => inUseCtx(false), 3000);
    });
  });
  return inUse;
};
