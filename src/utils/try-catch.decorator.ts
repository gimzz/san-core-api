import { HttpException, HttpStatus } from '@nestjs/common';

export const TryCatch = () => {
  return (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (e) {
        console.error(e);

        if (e instanceof HttpException) {
          throw e;
        }

        if (e.status && e.response) {
          throw new HttpException(e.response, e.status);
        }

        throw new HttpException(
          {
            data: 'OCURRIÓ UN ERROR INESPERADO EN EL SERVIDOR, COMUNÍQUESE CON EL ÁREA DEL SISTEMA',
            type: 'danger',
            status: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    };

    return descriptor;
  };
};
