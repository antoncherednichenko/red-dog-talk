"use client";

import { IProfileDTO } from "@/lib/api/auth";
import { createContext, FC, PropsWithChildren, useContext } from "react";

interface IProfileContext {
  profile: IProfileDTO;
}

const ProfileContext = createContext<IProfileContext | null>(null);

interface ProfileProviderProps {
  profile: IProfileDTO;
}

export const ProfileProvider: FC<PropsWithChildren<ProfileProviderProps>> = ({
  children,
  profile,
}) => {
  return (
    <ProfileContext.Provider value={{ profile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileData = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfileData must be used within a ProfileProvider");
  }

  return context;
};
