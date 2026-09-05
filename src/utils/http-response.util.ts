import { HttpException, HttpStatus } from '@nestjs/common';

type MessageType = 'warning' | 'success' | 'danger' | 'info';

interface HttpResponseOptions {
  data: string | Record<string, any>;
  type?: MessageType;
  status: HttpStatus | number;
}

export const HttpResponse = (opt: HttpResponseOptions): never => {
  const { status, data, type } = opt;
  const message = typeof data === 'string' ? data.toUpperCase() : data;

  const isSuccess = status >= 200 && status < 300;

  throw new HttpException(
    {
      status,
      type: type ?? (isSuccess ? 'success' : 'danger'),
      data: message || 'ERROR NO MANEJADO',
    },
    status,
  );
};
