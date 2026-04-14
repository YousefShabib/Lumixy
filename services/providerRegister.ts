const BASE_URL = "http:// 192.168.68.117:8000/api";


export type ServiceCategory = {
  id: string;
  name: string;
};

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const response = await fetch(`${BASE_URL}/service-categories`, {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;

  return [];
}

type RegisterPayload = {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
};

type BusinessPayload = {
  provider_name: string;
  bio?: string;
  category_id: string;
  custom_services: string[];
  onboarding_step?: number;
};

type LocationSchedulePayload = {
  city: string;
  location_text?: string;
  latitude?: number | null;
  longitude?: number | null;
  onboarding_step?: number;
  hours: {
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active?: boolean;
  }[];
};

type ContactPayload = {
  whatsapp_number: string;
  instagram_username?: string;
  facebook_url?: string;
  onboarding_step?: number;
};

export async function registerProvider(payload: RegisterPayload) {
  const response = await fetch(`${BASE_URL}/provider/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Register failed");
  }

  return data;
}

export async function uploadProviderImage(token: string, imageUri: string) {
  const formData = new FormData();

  formData.append("profile_image", {
    uri: imageUri,
    name: "profile.jpg",
    type: "image/jpeg",
  } as any);

  formData.append("onboarding_step", "1");

  const response = await fetch(`${BASE_URL}/provider/profile/image`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Image upload failed");
  }

  return data;
}

export async function updateProviderBusiness(token: string, payload: BusinessPayload) {
  const response = await fetch(`${BASE_URL}/provider/profile/business`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Business update failed");
  }

  return data;
}

export async function updateProviderLocationSchedule(
  token: string,
  payload: LocationSchedulePayload
) {
  const response = await fetch(`${BASE_URL}/provider/profile/location-schedule`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Location update failed");
  }

  return data;
}

export async function updateProviderContact(token: string, payload: ContactPayload) {
  const response = await fetch(`${BASE_URL}/provider/profile/contact`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Contact update failed");
  }

  return data;
}

export async function submitProviderApplication(token: string) {
  const response = await fetch(`${BASE_URL}/provider/submit`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Submit failed");
  }

  return data;
}