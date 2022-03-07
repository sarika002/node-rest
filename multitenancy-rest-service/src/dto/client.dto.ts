import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

class ClientDetails implements ClientRepresentation {
  clientId?: string;
  rootUrl?: string;
  redirectUris?: string[];
  serviceAccountsEnabled?: boolean;
  authorizationServicesEnabled?: boolean;
  directAccessGrantsEnabled?: boolean;
}

export class ClientDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tenantName: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'password must be minimum eight characters, at least one uppercase letter, one lowercase letter, one number and ' +
      'one special character'
  })
  password: string;

  clientDetails: ClientDetails;
}
