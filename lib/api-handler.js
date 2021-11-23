import withCors from './cors';
import { withDb } from './db';

function withApiHandler(handler) {
  return withDb(withCors(handler));
}

export default withApiHandler;
