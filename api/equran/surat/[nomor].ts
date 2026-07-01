import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatch } from "../../../_dispatch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return dispatch(req, res);
}
