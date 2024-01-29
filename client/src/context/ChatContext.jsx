import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

// eslint-disable-next-line react/prop-types
export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChat, setPotenntialChat] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // console.log('currentChat', currentChat);

    //initial socket
    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        }
    }, [user]);

    useEffect(() => {
        if (socket === null) return;
        // eslint-disable-next-line react/prop-types
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });
        return () => {
            socket.off("getOnlineUsers");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    //send message
    useEffect(() => {
        console.log('11111111');
        if (socket === null) return;

        // eslint-disable-next-line react/prop-types
        const recepientId = currentChat?.members?.find((id) => id !== user?._id);
        console.log('recepientIdrecepientId', recepientId);

        socket.emit("sendMessage", { ...newMessage, recepientId });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newMessage]);

    //receive message and notification
    useEffect(() => {
        if (socket === null) return;

        socket.on("getMessage", (res) => {
            // console.log('resres', res);
            console.log('currentChat', currentChat._id);
            if (currentChat._id !== res.chatId) return;

            setMessages((prev) => [...prev, res]);
        });

        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

            if (isChatOpen) {
                setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
            } else {
                setNotifications((prev) => [res, ...prev]);
            }
        });
        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        }
    }, [socket, currentChat]);

    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);
            // console.log('response', response);
            if (response.error) {
                return console.log("Error Fetching Users", response);
            }
            const pChat = response.filter((u) => {
                let isChatCreated = false;
                // eslint-disable-next-line react/prop-types
                if (user?._id === u._id) return false;

                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        // console.log('chat.members[0]', chat.members[0]);
                        return chat.members[0] === u._id || chat.members[1] === u._id;
                    });
                }
                return !isChatCreated;
            });
            // console.log('pChat', pChat);
            setPotenntialChat(pChat);
            setAllUsers(response)
        }
        getUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userChats]);

    useEffect(() => {
        const getUserChats = async () => {
            // eslint-disable-next-line react/prop-types
            if (user?._id) {
                setIsUserChatsLoading(true);
                setUserChatsError(null);
                // eslint-disable-next-line react/prop-types
                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
                setIsUserChatsLoading(false);

                if (response.error) {
                    return setUserChatsError(response);
                }

                setUserChats(response);
            }
        }

        getUserChats();
    }, [user, notifications]);

    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessagesError(null);

            const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

            setIsMessagesLoading(false);

            if (response.error) {
                return setUserChatsError(response);
            }

            setMessages(response);
        };
        getMessages();
    }, [currentChat]);

    const sendTextMessages = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
        if (!textMessage) return console.log("You must type something.....");

        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify({
            chatId: currentChatId,
            senderId: sender._id,
            text: textMessage,
        }));

        if (response.error) {
            return setSendTextMessageError(response);
        }

        setNewMessage(response);
        setMessages((prev) => [...prev, response]);
        setTextMessage("");
    }, []);

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({
            firstId, secondId
        }));

        if (response.error) {
            console.log("Error Creating Chat..", response);
        }

        setUserChats((prev) => [...prev, response]);
    }, []);

    const markAllNotificationsAsRead = useCallback((notification) => {
        const mNotification = notification.map((n) => {
            return { ...n, isRead: true };
        });
        setNotifications(mNotification)
    }, []);

    const markNotificationAsRead = useCallback((n, userChats, user, notifications) => {
        const desiredChat = userChats.find((chat) => {
            // eslint-disable-next-line react/prop-types
            const chatMembers = [user._id, n.senderId];
            const isDesiredChat = chat?.members.every((member) => {
                return chatMembers.includes(member);
            });
            return isDesiredChat;
        });

        const mNotification = notifications.map((el) => {
            if (n.senderId === el.senderId) {
                return { ...n, isRead: true };
            } else {
                return el;
            }
        });
        updateCurrentChat(desiredChat);
        setNotifications(mNotification);
    }, []);

    const markThisUserNotificationAsRead = useCallback((thisUserNotifications, notifications) => {
        const mNotifications = notifications.map((el) => {
            let notification;

            thisUserNotifications.forEach((n) => {
                if (n.senderId === el.senderId) {
                    notification = { ...n, isRead: true };
                } else {
                    notification = el;
                }
            });
            return notification;
        });
        setNotifications(mNotifications);
    }, []);

    return (
        <ChatContext.Provider
            value={{
                userChats,
                isUserChatsLoading,
                userChatsError,
                potentialChat,
                createChat,
                updateCurrentChat,
                messages,
                isMessagesLoading,
                messagesError,
                currentChat,
                sendTextMessages,
                onlineUsers,
                notifications,
                allUsers,
                markAllNotificationsAsRead,
                markNotificationAsRead,
                markThisUserNotificationAsRead,
                sendTextMessageError
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};