import { ConflictException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { AuthProviders, Roles } from '../../user/types';
import { UpdateUserDto } from '../../user/dto/update-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { emails, name, photos, id: googleId } = profile;

    if (!emails || !emails.length || !emails[0]?.value) {
      return done(new Error('Email is required for authentication'), false);
    }

    const email = emails[0].value;

    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.create({
        authProvider: AuthProviders.Google,
        role: Roles.User,
        email,
        firstName: name?.givenName || email.split('@')[0],
        lastName: name?.familyName || '',
        picture: photos?.[0]?.value,
        googleId,
      });
    } else if (user.authProvider === AuthProviders.Google) {
      const googlePicture = photos?.[0]?.value;
      const updates: Pick<UpdateUserDto, 'picture' | 'googleId'> = {};
      if (googlePicture && user.picture !== googlePicture) {
        updates.picture = googlePicture;
      }
      if (googleId && user.googleId !== googleId) {
        updates.googleId = googleId;
      }
      if (Object.keys(updates).length > 0) {
        user = await this.userService.update(user.id, updates);
      }
    } else {
      return done(
        new ConflictException(
          'An account with this email already exists. Please sign in with your password.',
        ),
        false,
      );
    }

    done(null, { user });
  }
}
