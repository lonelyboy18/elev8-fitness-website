import { cleanMobile } from "../../shared/utils/mobile.js";
import { cleanText } from "../../shared/utils/text.js";
import type { IContactRepository } from "./contact.repository.js";
import type { SubmitContactInput } from "./contact.validation.js";

export class ContactService {
  constructor(private readonly contactRepo: IContactRepository) {}

  async submit(input: SubmitContactInput): Promise<{ name: string }> {
    const name = cleanText(input.name);
    await this.contactRepo.create({
      name,
      email: input.email,
      phone: input.phone ? cleanMobile(input.phone) : null,
      message: cleanText(input.message),
    });
    return { name };
  }
}
