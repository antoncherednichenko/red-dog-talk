"use client";

import * as jdenticon from "jdenticon";
import { FC, useEffect, useMemo, useRef } from "react";

interface UserAvatarProps {
  value: string;
  size?: number;
}

export const UserAvatar: FC<UserAvatarProps> = ({ value, size = 32 }) => {
  const src = useMemo(() => {
    const svg = jdenticon.toSvg(value, size);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [value, size]);

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="User avatar"
      className="rounded-full bg-white border border-border shrink-0"
    />
  );
};
