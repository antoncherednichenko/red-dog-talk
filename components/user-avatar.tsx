"use client";

import * as jdenticon from "jdenticon";
import { FC, useMemo } from "react";

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
      className="block shrink-0 rounded-full border border-border bg-white object-cover"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    />
  );
};
