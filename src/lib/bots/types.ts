import { NextApiRequest } from 'next';

export type BotHandlerArgs = {
  req: NextApiRequest;
  message: string;
  file: any;
};
