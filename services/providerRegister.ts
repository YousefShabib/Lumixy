import { getApiBaseCandidates } from "@/services/api";

export type ServiceCategory = {
  id: string;
  name: string;
};

function getProviderApiBaseUrl() {
  return getApiBaseCandidates()[0] ?? "http://127.0.0.1:8000/api";
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function parseApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const validationMessage = data?.errors
      ? Object.values(data.errors)
          .flat()
          .filter(Boolean)
          .join("\n")
      : null;

    throw new ApiError(
      validationMessage || data?.message || "Request failed",
      response.status,
      data?.errors
    );
  }

  return data;
}

function getFileMetaFromUri(uri: string) {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  const extension = match?.[1]?.toLowerCase() || "jpg";

  const typeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };

  return {
    name: `profile.${extension}`,
    type: typeMap[extension] || "image/jpeg",
  };
}

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const response = await fetch(`${getProviderApiBaseUrl()}/service-categories`, {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await parseApiResponse(response);

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
  const response = await fetch(`${getProviderApiBaseUrl()}/provider/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function uploadProviderImage(token: string, imageUri: string) {
  const formData = new FormData();
  const fileMeta = getFileMetaFromUri(imageUri);

  formData.append("profile_image", {
    uri: imageUri,
    name: fileMeta.name,
    type: fileMeta.type,
  } as any);

  formData.append("onboarding_step", "1");

  const response = await fetch(`${getProviderApiBaseUrl()}/provider/profile/image`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseApiResponse(response);
}

export async function uploadProviderGallery(token: string, imageUris: string[]) {
  for (const [index, imageUri] of imageUris.entries()) {
    const fileMeta = getFileMetaFromUri(imageUri);
    const formData = new FormData();

    formData.append("sort_order", String(index));
    formData.append("image", {
      uri: imageUri,
      name: `gallery-${index + 1}.${fileMeta.name.split(".").pop() || "jpg"}`,
      type: fileMeta.type,
    } as any);

    const response = await fetch(`${getProviderApiBaseUrl()}/provider/gallery`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    await parseApiResponse(response);
  }
}

export async function updateProviderBusiness(token: string, payload: BusinessPayload) {
  const response = await fetch(`${getProviderApiBaseUrl()}/provider/profile/business`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function updateProviderLocationSchedule(
  token: string,
  payload: LocationSchedulePayload
) {
  const response = await fetch(`${getProviderApiBaseUrl()}/provider/profile/location-schedule`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function updateProviderContact(token: string, payload: ContactPayload) {
  const response = await fetch(`${getProviderApiBaseUrl()}/provider/profile/contact`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export async function submitProviderApplication(token: string) {
  const response = await fetch(`${getProviderApiBaseUrl()}/provider/submit`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse(response);
}
export async function getProviderApplicationStatus(token: string) {
  const response = await fetch(`${getProviderApiBaseUrl()}/provider/application-status`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse(response);
}
