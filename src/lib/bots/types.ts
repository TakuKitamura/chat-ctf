import { NextApiRequest } from 'next';
import type { File } from "formidable";

export type BotHandlerArgs = {
  req: NextApiRequest;
  message: string;
  file: File;
};
