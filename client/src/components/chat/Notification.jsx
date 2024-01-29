import { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { unreadNotificationFunc } from "../../utils/unreadNotification";
import moment from "moment";

const Notification = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const { notifications, userChats, allUsers, markAllNotificationsAsRead, markNotificationAsRead } = useContext(ChatContext);
    // console.log('allUsers', allUsers);
    // console.log('markNotificationAsRead', markNotificationAsRead);

    const unreadeNotification = unreadNotificationFunc(notifications);
    const modifiedNotifications = notifications.map((n) => {
        const sender = allUsers.find((user) => user._id === n.senderId);

        return {
            ...n,
            senderName: sender?.name,
        };
    });

    // console.log('unreadeNotification', unreadeNotification);
    // console.log('modifiedNotifications', modifiedNotifications);

    return (
        <div className="notifications">
            <div className="notification-icon" onClick={() => setIsOpen(!isOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chat-dots" viewBox="0 0 16 16">
                    <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                    <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2" />
                </svg>
                {unreadeNotification.length === 0 ? null : <span className="notification-count">
                    <span>{unreadeNotification?.length}</span>
                </span>}
            </div>
            {isOpen ? <div className="notifications-box">
                <div className="notifications-header">
                    <h3>Notifications</h3>
                    <div className="mark-as-read" onClick={() => markAllNotificationsAsRead(notifications)}>Mark all as read</div>
                </div>
                {modifiedNotifications?.length === 0 ? <span className="notification">No notification yet..</span> : null}
                {modifiedNotifications && modifiedNotifications.map((n, index) => {
                    // console.log('index', index);
                    return <div key={index} className={n.isRead ? 'notification' : 'notification not-read'}
                        onClick={() => { markNotificationAsRead(n, userChats, user, notifications), setIsOpen(false) }}
                    >
                        <span>{`${n.senderName} sent you a new message`}</span>
                        <span className="notification-time">{moment(n.date).calendar()}</span>
                    </div>
                })}
            </div> : null
            }
        </div >
    )
}

export default Notification;