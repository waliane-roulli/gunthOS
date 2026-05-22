"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSoundContext } from "@/lib/contexts/sound-context";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration: number | null; // ms, null = persist until dismissed
  onClick?: () => void;
}

export type NotifyOptions = Omit<Notification, "id" | "duration"> & { duration?: number | null };

interface NotificationStateValue {
  notifications: Notification[];
}

interface NotificationActionsValue {
  notify: (opts: NotifyOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const NotificationStateContext = createContext<NotificationStateValue>({
  notifications: [],
});

const NotificationActionsContext = createContext<NotificationActionsValue>({
  notify: () => "",
  dismiss: () => {},
  dismissAll: () => {},
});

function NotificationSoundBridge({ notifications }: { notifications: Notification[] }) {
  const { playNotifyInfo, playNotifySuccess, playNotifyError, playNotifyWarning } = useSoundContext();
  const prevCountRef = useRef(0);

  useEffect(() => {
    const current = notifications.length;
    if (current > prevCountRef.current) {
      const latest = notifications[current - 1];
      if (latest) {
        switch (latest.type) {
          case "success": playNotifySuccess(); break;
          case "error":   playNotifyError();   break;
          case "warning": playNotifyWarning(); break;
          default:        playNotifyInfo();    break;
        }
      }
    }
    prevCountRef.current = current;
  }, [notifications, playNotifyInfo, playNotifySuccess, playNotifyError, playNotifyWarning]);

  return null;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) { clearTimeout(t); timersRef.current.delete(id); }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (opts: NotifyOptions): string => {
      const id = crypto.randomUUID();
      const duration = opts.duration !== undefined ? opts.duration : 4000;

      const notif: Notification = { ...opts, id, duration };
      setNotifications((prev) => [...prev.slice(-4), notif]); // max 5 visible

      if (duration !== null) {
        const t = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, t);
      }

      return id;
    },
    [dismiss]
  );

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
    setNotifications([]);
  }, []);

  const stateValue = useMemo(() => ({ notifications }), [notifications]);

  const actionsValue = useMemo(
    () => ({ notify, dismiss, dismissAll }),
    [notify, dismiss, dismissAll]
  );

  return (
    <NotificationStateContext.Provider value={stateValue}>
      <NotificationActionsContext.Provider value={actionsValue}>
        <NotificationSoundBridge notifications={notifications} />
        {children}
      </NotificationActionsContext.Provider>
    </NotificationStateContext.Provider>
  );
}

/** State only — re-renders when notifications change */
export function useNotificationState() {
  return useContext(NotificationStateContext);
}

/** Actions only — never re-renders */
export function useNotificationActions() {
  return useContext(NotificationActionsContext);
}

/** Convenience hook — just the notify() function */
export function useNotify() {
  return useContext(NotificationActionsContext).notify;
}
