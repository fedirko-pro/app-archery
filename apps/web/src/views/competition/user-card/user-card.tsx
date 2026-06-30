import './user-card.scss';

import Avatar from '@mui/material/Avatar';

import { resolveUserAvatar, getAvatarInitials } from '../../../utils/placeholder-images';

interface UserCardUser {
  picture?: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UserCardProps {
  user: UserCardUser;
}

export default function UserCard(props: UserCardProps) {
  const { user } = props;
  const avatarSrc = resolveUserAvatar(user.picture);

  return (
    <div className="user_card">
      <Avatar
        src={avatarSrc}
        alt={`${user.firstName} ${user.lastName}`}
        imgProps={{ referrerPolicy: 'no-referrer' }}
      >
        {!avatarSrc ? getAvatarInitials(user.firstName, user.lastName) : null}
      </Avatar>
      <div className="name">{`${user.firstName} ${user.lastName}`}</div>
      {user.role !== 'member' && <div className={'role ' + user.role}>{user.role}</div>}
    </div>
  );
}
