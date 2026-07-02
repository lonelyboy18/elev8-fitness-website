import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/respond.js";
import type { ContactService } from "./contact.service.js";
import type { SubmitContactInput } from "./contact.validation.js";

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  submit = async (req: Request, res: Response): Promise<void> => {
    const { name } = await this.contactService.submit(req.body as SubmitContactInput);
    sendSuccess(res, {}, `Thanks, ${name}! We'll get back to you within 24 hours.`);
  };
}
