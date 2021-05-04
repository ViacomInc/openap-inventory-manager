import React from "react";
import { useTransition, a } from "react-spring";
import useTimeout from "use-timeout";

import { useDispatch, useSelector } from "../store";
import { Notification } from "../store/types";
import { removeNotification } from "../store/actions";
import { selectNotifications } from "../store/notifications";

import { Notification as NotificationElement } from "./ui";
import Styles from "./Notifications.module.css";

export default function Notifications(): JSX.Element {
  const notifications = useSelector(selectNotifications);
  const notificationsWithTransitions = useTransition(notifications, {
    keys: (n) => n.id,
    from: { opacity: 0, transform: "translateY(-8px)" },
    enter: { opacity: 1, transform: "translateY(0)" },
    leave: { opacity: 0, transform: "translateY(-8px)" },
  });

  return (
    <div className={Styles.Container}>
      {notificationsWithTransitions((style, item) => (
        <a.div style={style}>
          <NotificationComponent notification={item} />
        </a.div>
      ))}
    </div>
  );
}

interface NotificationComponentProps {
  notification: Notification;
}

function NotificationComponent({ notification }: NotificationComponentProps) {
  const dispatch = useDispatch();

  if (notification.timeout) {
    useTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, notification.timeout);
  }

  return (
    <NotificationElement
      type={notification.type}
      onClick={() => dispatch(removeNotification(notification.id))}
    >
      <p>{notification.message}</p>
    </NotificationElement>
  );
}
