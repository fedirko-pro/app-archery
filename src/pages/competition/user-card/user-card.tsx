import './user-card.scss';

import Avatar from '@mui/material/Avatar';

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

  return (
    <div className="user_card">
      <Avatar
        src={user.picture}
        alt={`${user.firstName} ${user.lastName}`}
      ></Avatar>
      <div className="name">{`${user.firstName} ${user.lastName}`}</div>
      {user.role !== 'member' && (
        <div className={'role ' + user.role}>{user.role}</div>
      )}
    </div>
  );
}
