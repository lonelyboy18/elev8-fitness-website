import { httpClient } from "@shared/api/httpClient";
import type { SubmitContactPayload } from "../model/types";

export const contactApi = {
  submit: (payload: SubmitContactPayload) => httpClient.post<Record<string, never>>("/contact", payload),
};
