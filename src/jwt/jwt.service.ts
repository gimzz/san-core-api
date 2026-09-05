import { Injectable } from "@nestjs/common";
import { JwtService as jwt } from "@nestjs/jwt";

@Injectable()
export class JwtService {
  constructor(private jwtService: jwt) { }

  generateToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verify(token);
    } catch (error) {
      console.log(
        "Error al verificar el token. Error: " + error
      )
      return null;
    }
  }

  decoder(token: string) {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      return null;
    }
  }
}
