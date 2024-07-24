import * as React from 'react';
import './UserCard.scss';
import Avatar from "@mui/material/Avatar";

export default function UserCard(props) {
    const user = props.user;

    return (
        <div className="user_card">
            <Avatar></Avatar>
            <div className="name">
                {`${user.firstName} ${user.lastName}`}
            </div>
            {user.role !== 'member' && (<div className={"role " + user.role}>
                {user.role}
            </div>)}
        </div>
    );
}