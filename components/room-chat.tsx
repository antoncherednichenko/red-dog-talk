"use client";

import { useProfileData } from "@/components/providers/profile-provider";
import { useRoomData } from "@/components/providers/room-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import {
  getRoomMessages,
  IRoomMessageDTO,
  sendRoomMessage,
} from "@/lib/api/rooms";
import { cn } from "@/lib/utils";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import {
  ChevronUp,
  LoaderCircle,
  MessageSquare,
  Send,
  Smile,
} from "lucide-react";
import {
  type FC,
  type KeyboardEvent,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

const INITIAL_MESSAGE_LIMIT = 50;
const OLDER_MESSAGE_LIMIT = 30;
const MAX_MESSAGE_LENGTH = 2000;
const POLL_INTERVAL_MS = 5000;

const TIME_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

const toDayKey = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const formatDayLabel = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  const todayKey = toDayKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  if (dayKey === todayKey) {
    return "Сегодня";
  }

  if (dayKey === yesterdayKey) {
    return "Вчера";
  }

  return DAY_FORMATTER.format(date);
};

const mergeMessages = (
  currentMessages: IRoomMessageDTO[],
  incomingMessages: IRoomMessageDTO[],
) => {
  const messagesMap = new Map<string, IRoomMessageDTO>();

  for (const message of currentMessages) {
    messagesMap.set(message.id, message);
  }

  for (const message of incomingMessages) {
    messagesMap.set(message.id, message);
  }

  return [...messagesMap.values()].sort((left, right) => {
    const leftTimestamp = new Date(left.createdAt).getTime();
    const rightTimestamp = new Date(right.createdAt).getTime();

    if (leftTimestamp === rightTimestamp) {
      return left.id.localeCompare(right.id);
    }

    return leftTimestamp - rightTimestamp;
  });
};

const getViewportElement = (container: HTMLDivElement | null) => {
  return container?.querySelector(
    "[data-slot='scroll-area-viewport']",
  ) as HTMLDivElement | null;
};

const LoadingState: FC = () => {
  return (
    <div className="space-y-4 px-4 py-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={cn("flex gap-3", index % 2 === 1 && "justify-end")}
        >
          {index % 2 === 0 ? (
            <Skeleton className="size-9 rounded-full" />
          ) : null}
          <div className="max-w-[min(100%,30rem)] space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-20 w-72 rounded-3xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState: FC = () => {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex size-[4.5rem] items-center justify-center rounded-full border border-primary/15 bg-primary/8 text-primary shadow-[0_20px_60px_rgba(99,102,241,0.12)]">
        <MessageSquare className="size-8 stroke-[1.75]" />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Сообщений пока нет
      </p>
    </div>
  );
};

interface MarkdownMessageProps {
  isOwnMessage: boolean;
  text: string;
}

const MarkdownMessage: FC<MarkdownMessageProps> = ({ isOwnMessage, text }) => {
  const markdownComponents: Components = {
    p: ({ children }) => (
      <p className="leading-6 [&:not(:last-child)]:mb-3">{children}</p>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "font-medium underline underline-offset-4",
          isOwnMessage
            ? "text-primary-foreground/95 decoration-primary-foreground/35"
            : "text-primary decoration-primary/30",
        )}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-6">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          "mb-3 rounded-2xl border-l-3 px-4 py-3 text-sm last:mb-0",
          isOwnMessage
            ? "border-primary-foreground/35 bg-white/10"
            : "border-primary/25 bg-primary/6",
        )}
      >
        {children}
      </blockquote>
    ),
    pre: ({ children }) => (
      <pre
        className={cn(
          "mb-3 overflow-x-auto rounded-2xl px-4 py-3 text-[13px] leading-6 last:mb-0",
          isOwnMessage
            ? "bg-black/20 text-primary-foreground"
            : "bg-slate-950 text-slate-50",
        )}
      >
        {children}
      </pre>
    ),
    code: ({ children, className }) => (
      <code
        className={cn(
          "rounded-md px-1.5 py-0.5 font-mono text-[0.92em]",
          className?.includes("language-")
            ? "bg-transparent p-0"
            : isOwnMessage
              ? "bg-black/15 text-primary-foreground"
              : "bg-muted text-foreground",
          className,
        )}
      >
        {children}
      </code>
    ),
    hr: () => (
      <hr
        className={cn(
          "my-4 border-dashed",
          isOwnMessage ? "border-white/20" : "border-border",
        )}
      />
    ),
  };

  return (
    <div
      className={cn(
        "text-sm break-words",
        isOwnMessage ? "text-primary-foreground" : "text-foreground",
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

interface MessageBubbleProps {
  isOwnMessage: boolean;
  message: IRoomMessageDTO;
}

const MessageBubble: FC<MessageBubbleProps> = ({ isOwnMessage, message }) => {
  return (
    <div className={cn("flex gap-3", isOwnMessage && "justify-end")}>
      {!isOwnMessage ? (
        <UserAvatar value={message.author.email} size={36} />
      ) : null}

      <div
        className={cn(
          "max-w-[min(100%,42rem)] space-y-1",
          isOwnMessage && "items-end",
        )}
      >
        <div
          className={cn(
            "px-1 text-xs text-muted-foreground",
            isOwnMessage && "text-right",
          )}
        >
          <span className="font-medium text-foreground/80">
            {isOwnMessage ? "Вы" : message.author.name}
          </span>
          <span className="mx-1.5 text-muted-foreground/60">•</span>
          <span>{TIME_FORMATTER.format(new Date(message.createdAt))}</span>
        </div>

        <div
          className={cn(
            "rounded-2xl border px-4 py-3 shadow-none",
            isOwnMessage
              ? "border-transparent bg-primary"
              : "border-border/70 bg-card",
          )}
        >
          <MarkdownMessage isOwnMessage={isOwnMessage} text={message.text} />
        </div>
      </div>
    </div>
  );
};

export const RoomChat: FC = () => {
  const { profile } = useProfileData();
  const { room, roomId } = useRoomData();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<IRoomMessageDTO[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingRestoreRef = useRef<{
    previousHeight: number;
    previousTop: number;
  } | null>(null);
  const pendingScrollBehaviorRef = useRef<ScrollBehavior | null>(null);
  const isNearBottomRef = useRef(true);
  const requestVersionRef = useRef(0);

  const [messages, setMessages] = useState<IRoomMessageDTO[]>([]);
  const [draft, setDraft] = useState("");
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const trimmedDraft = useMemo(() => draft.trim(), [draft]);
  const isDraftReady =
    trimmedDraft.length > 0 && trimmedDraft.length <= MAX_MESSAGE_LENGTH;
  const isNearLimit = draft.length >= MAX_MESSAGE_LENGTH - 160;

  const syncMessagesState = (nextMessages: IRoomMessageDTO[]) => {
    messagesRef.current = nextMessages;
    startTransition(() => {
      setMessages(nextMessages);
    });
  };

  const requestScrollToBottom = (behavior: ScrollBehavior = "auto") => {
    pendingScrollBehaviorRef.current = behavior;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const viewport = getViewportElement(scrollContainerRef.current);

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior,
    });

    setUnseenCount(0);
  };

  const hydrateLatestMessages = useCallback(
    async (mode: "initial" | "poll", requestVersion: number) => {
      try {
        const latestMessages = await getRoomMessages(roomId, {
          limit: INITIAL_MESSAGE_LIMIT,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const previousMessages = messagesRef.current;
        const nextMessages = mergeMessages(previousMessages, latestMessages);
        const newMessagesCount = nextMessages.length - previousMessages.length;

        syncMessagesState(nextMessages);

        if (mode === "initial") {
          setLoadError(null);
          setHasOlderMessages(latestMessages.length === INITIAL_MESSAGE_LIMIT);
          requestScrollToBottom("auto");
          return;
        }

        if (newMessagesCount > 0) {
          if (isNearBottomRef.current) {
            requestScrollToBottom("smooth");
          } else {
            setUnseenCount((currentCount) => currentCount + newMessagesCount);
          }
        }
      } catch (error) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (mode === "initial") {
          console.error("Failed to load room messages", error);
          setLoadError("Не удалось загрузить чат. Попробуйте ещё раз.");
        }
      } finally {
        if (
          mode === "initial" &&
          requestVersion === requestVersionRef.current
        ) {
          setIsInitialLoading(false);
        }
      }
    },
    [roomId],
  );

  useEffect(() => {
    messagesRef.current = [];
    setMessages([]);
    setDraft("");
    setLoadError(null);
    setHasOlderMessages(false);
    setUnseenCount(0);
    setIsInitialLoading(true);

    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    void hydrateLatestMessages("initial", requestVersion);

    const intervalId = window.setInterval(() => {
      void hydrateLatestMessages("poll", requestVersion);
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hydrateLatestMessages, roomId]);

  useEffect(() => {
    const viewport = getViewportElement(scrollContainerRef.current);

    if (!viewport) {
      return;
    }

    const updateScrollState = () => {
      const distanceToBottom =
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;

      isNearBottomRef.current = distanceToBottom < 120;

      if (isNearBottomRef.current) {
        setUnseenCount(0);
      }
    };

    updateScrollState();
    viewport.addEventListener("scroll", updateScrollState);

    return () => {
      viewport.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  useLayoutEffect(() => {
    const restorePosition = pendingRestoreRef.current;

    if (!restorePosition) {
      return;
    }

    const viewport = getViewportElement(scrollContainerRef.current);

    if (!viewport) {
      return;
    }

    viewport.scrollTop =
      viewport.scrollHeight -
      restorePosition.previousHeight +
      restorePosition.previousTop;

    pendingRestoreRef.current = null;
  }, [messages]);

  useEffect(() => {
    const behavior = pendingScrollBehaviorRef.current;

    if (!behavior || pendingRestoreRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom(behavior);
      pendingScrollBehaviorRef.current = null;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [messages]);

  const handleReload = () => {
    const requestVersion = requestVersionRef.current;
    setIsInitialLoading(true);
    void hydrateLatestMessages("initial", requestVersion);
  };

  const handleLoadOlderMessages = async () => {
    const oldestMessage = messagesRef.current[0];

    if (!oldestMessage || isLoadingOlder) {
      return;
    }

    const viewport = getViewportElement(scrollContainerRef.current);

    if (viewport) {
      pendingRestoreRef.current = {
        previousHeight: viewport.scrollHeight,
        previousTop: viewport.scrollTop,
      };
    }

    setIsLoadingOlder(true);

    try {
      const olderMessages = await getRoomMessages(roomId, {
        limit: OLDER_MESSAGE_LIMIT,
        beforeCreatedAt: oldestMessage.createdAt,
      });

      const nextMessages = mergeMessages(olderMessages, messagesRef.current);
      syncMessagesState(nextMessages);
      setHasOlderMessages(olderMessages.length === OLDER_MESSAGE_LIMIT);
    } catch (error) {
      console.error("Failed to load older messages", error);
      pendingRestoreRef.current = null;
      toast.error("Не удалось загрузить предыдущие сообщения");
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const handleSendMessage = async () => {
    if (!isDraftReady || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const createdMessage = await sendRoomMessage(roomId, {
        text: draft,
      });

      const nextMessages = mergeMessages(messagesRef.current, [createdMessage]);
      syncMessagesState(nextMessages);
      requestScrollToBottom("smooth");
      setDraft("");
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("Сообщение не отправилось");
    } finally {
      setIsSending(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? draft.length;
    const selectionEnd = textarea?.selectionEnd ?? draft.length;

    const nextDraft =
      `${draft.slice(0, selectionStart)}${emoji}${draft.slice(selectionEnd)}`.slice(
        0,
        MAX_MESSAGE_LENGTH,
      );

    setDraft(nextDraft);
    setIsEmojiMenuOpen(false);

    window.requestAnimationFrame(() => {
      const nextCursorPosition = Math.min(
        selectionStart + emoji.length,
        nextDraft.length,
      );

      textarea?.focus();
      textarea?.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    insertEmoji(emojiData.emoji);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    textareaRef.current = event.currentTarget;

    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    void handleSendMessage();
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
      <div className="shrink-0 px-1 pb-2">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_14px_34px_rgba(99,102,241,0.22)]">
          <span className="text-primary-foreground/80">#</span>
          <span>{room.name}</span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="h-full min-h-0 overflow-hidden"
        >
          <ScrollArea className="h-full min-h-0 [&>[data-slot=scroll-area-scrollbar]]:hidden [&>[data-slot=scroll-area-viewport]]:no-scrollbar">
            <div className="px-1 py-2">
              {hasOlderMessages ? (
                <div className="mb-4 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-background/80 backdrop-blur"
                    onClick={handleLoadOlderMessages}
                    disabled={isLoadingOlder}
                  >
                    {isLoadingOlder ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <ChevronUp className="size-4" />
                    )}
                    Показать предыдущие
                  </Button>
                </div>
              ) : null}

              {isInitialLoading ? <LoadingState /> : null}

              {!isInitialLoading && loadError ? (
                <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                    {loadError}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReload}
                  >
                    Повторить загрузку
                  </Button>
                </div>
              ) : null}

              {!isInitialLoading && !loadError && messages.length === 0 ? (
                <EmptyState />
              ) : null}

              {!isInitialLoading && !loadError && messages.length > 0 ? (
                <div className="space-y-5 pb-3">
                  {messages.map((message, index) => {
                    const previousMessage = messages[index - 1];
                    const showDateDivider =
                      !previousMessage ||
                      toDayKey(previousMessage.createdAt) !==
                        toDayKey(message.createdAt);

                    return (
                      <div key={message.id} className="space-y-4">
                        {showDateDivider ? (
                          <div className="flex justify-center">
                            <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-xs backdrop-blur">
                              {formatDayLabel(message.createdAt)}
                            </div>
                          </div>
                        ) : null}

                        <MessageBubble
                          message={message}
                          isOwnMessage={message.author.id === profile.id}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </div>

        {unseenCount > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
            <Button
              type="button"
              size="sm"
              className="pointer-events-auto rounded-full shadow-lg"
              onClick={() => scrollToBottom("smooth")}
            >
              <MessageSquare className="size-4" />
              {unseenCount} новых сообщений
            </Button>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border/60 bg-background/95 px-1 pt-3 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-end gap-3">
          <UserAvatar value={profile.email} size={38} />

          <div className="flex flex-1 items-end gap-3">
            <div className="relative flex-1">
              <Textarea
                placeholder="Напишите сообщение и отправьте Enter"
                value={draft}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={1}
                className="min-h-20 resize-none rounded-[22px] border-border/70 bg-background px-4 py-3 pr-14"
                onChange={(event) => {
                  textareaRef.current = event.currentTarget;
                  setDraft(event.target.value);
                }}
                onClick={(event) => {
                  textareaRef.current = event.currentTarget;
                }}
                onFocus={(event) => {
                  textareaRef.current = event.currentTarget;
                }}
                onKeyDown={handleKeyDown}
                onSelect={(event) => {
                  textareaRef.current = event.currentTarget;
                }}
              />
              <span
                className={cn(
                  "absolute right-4 bottom-3 text-xs font-medium",
                  isNearLimit ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {draft.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-end">
              <DropdownMenu
                open={isEmojiMenuOpen}
                onOpenChange={setIsEmojiMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                    aria-label="Открыть выбор emoji"
                  >
                    <Smile className="size-4.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-fit rounded-2xl p-0"
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    lazyLoadEmojis
                    searchDisabled
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                    width={320}
                    height={420}
                    theme={Theme.AUTO}
                  />
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                type="button"
                size="icon"
                className="rounded-full"
                onClick={() => void handleSendMessage()}
                disabled={!isDraftReady || isSending}
                aria-label="Отправить сообщение"
              >
                {isSending ? (
                  <LoaderCircle className="size-4.5 animate-spin" />
                ) : (
                  <Send className="size-4.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
