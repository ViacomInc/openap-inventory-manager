import React from "react";
import Styles from "./Notification.module.css";

import { Icon, Icons } from "./";

export enum NotificationType {
  Info = "info",
  Success = "success",
  Warning = "warning",
  Error = "error",
}

export type NotificationProps = {
  type?: NotificationType;
  onClick?: () => void;
  children: React.ReactNode;
};

const NotificationStyles: Record<NotificationType, string> = {
  [NotificationType.Info]: Styles.Info,
  [NotificationType.Success]: Styles.Success,
  [NotificationType.Warning]: Styles.Warning,
  [NotificationType.Error]: Styles.Error,
};

const NotificationIcons: Record<NotificationType, Icons> = {
  [NotificationType.Info]: Icons.Info,
  [NotificationType.Success]: Icons.Success,
  [NotificationType.Warning]: Icons.Warning,
  [NotificationType.Error]: Icons.Error,
};

export default function Notification({
  type = NotificationType.Info,
  onClick,
  children,
}: NotificationProps): JSX.Element {
  return (
    <div
      className={`${Styles.Container} ${NotificationStyles[type]}`}
      onClick={onClick}
    >
      <Icon className={Styles.Icon} icon={NotificationIcons[type]} />
      <div>{children}</div>
    </div>
  );
}
