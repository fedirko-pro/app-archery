import './user-card.scss';

import Avatar from '@mui/material/Avatar';

export default function UserCard(props: any) {
  const user = props.user;

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
