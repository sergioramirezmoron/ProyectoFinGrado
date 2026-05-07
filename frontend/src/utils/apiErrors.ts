interface ApiErrorResponse {
  detail?: string;
  "hydra:description"?: string;
  violations?: Array<{ message?: string }>;
}

interface HttpErrorLike {
  response?: {
    data?: ApiErrorResponse;
  };
}

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return fallback;
  }

  const data = (error as HttpErrorLike).response?.data;
  return (
    data?.detail ||
    data?.["hydra:description"] ||
    data?.violations?.find((violation) => violation.message)?.message ||
    fallback
  );
};
