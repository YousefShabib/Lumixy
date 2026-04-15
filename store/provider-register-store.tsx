import React, { createContext, useContext, useMemo, useState } from "react";

type ProviderRegisterData = {
  imageUri: string | null;
  portfolioImages: string[];
  fullName: string;
  displayName: string;
  bio: string;
  services: string[];
  city: string;
  address: string;
  locationDescription: string;
  workingDays: string[];
  fromTime: string;
  toTime: string;

  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;

  whatsappNumber: string;
  instagramUsername: string;
  facebookUrl: string;
  categoryId: string;
  token: string | null;
};

type ProviderRegisterContextType = {
  form: ProviderRegisterData;
  setForm: React.Dispatch<React.SetStateAction<ProviderRegisterData>>;
};

const ProviderRegisterContext = createContext<ProviderRegisterContextType | null>(null);

export function ProviderRegisterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [form, setForm] = useState<ProviderRegisterData>({
    imageUri: null,
    portfolioImages: [],
    fullName: "",
    displayName: "",
    bio: "",
    services: [],
    city: "",
    address: "",
    locationDescription: "",
    workingDays: [],
    fromTime: "09:00",
    toTime: "18:00",

    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",

    whatsappNumber: "",
    instagramUsername: "",
    facebookUrl: "",
    categoryId: "",
    token: null,
  });

  const value = useMemo(() => ({ form, setForm }), [form]);

  return (
    <ProviderRegisterContext.Provider value={value}>
      {children}
    </ProviderRegisterContext.Provider>
  );
}

export function useProviderRegister() {
  const context = useContext(ProviderRegisterContext);

  if (!context) {
    throw new Error("useProviderRegister must be used within ProviderRegisterProvider");
  }

  return context;
}
