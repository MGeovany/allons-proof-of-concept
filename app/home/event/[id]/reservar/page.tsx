"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Minus,
  Plus,
  Mail,
  Trash2,
  UserPlus,
  Search,
} from "lucide-react";
import { getEventById } from "@/lib/events";
import {
  createReservation,
  cancelReservation,
  getReservationForEvent,
} from "@/lib/reservation-actions";
import { checkEmailHasAccount } from "@/lib/tickets-actions";
import { getMyFriends, type FriendProfile } from "@/lib/friends-actions";

function formatPrice(amount: number) {
  return `L. ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

type Assignment =
  | ""
  | string
  | { type: "friend"; id: string; name: string; avatar_url: string | null };

export default function ReservarPage() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [assignments, setAssignments] = useState<Assignment[]>([""]);
  const [showEmailInputForSlot, setShowEmailInputForSlot] = useState<
    number | null
  >(null);
  const [friendPickerSlot, setFriendPickerSlot] = useState<number | null>(null);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [giftChecks, setGiftChecks] = useState<
    Record<
      number,
      {
        state: "idle" | "checking" | "exists" | "missing";
        name?: string | null;
      }
    >
  >({});
  const [loading, setLoading] = useState(false);
  const event = getEventById(params.id as string);

  useEffect(() => {
    if (!event?.id) return;
    getReservationForEvent(event.id).then((r) => {
      if (r?.quantity != null) setQuantity(r.quantity);
    });
  }, [event?.id]);

  useEffect(() => {
    setAssignments((prev) => {
      const n = Math.max(1, quantity);
      const next: Assignment[] = Array(n).fill("");
      for (let i = 0; i < n && i < prev.length; i++) next[i] = prev[i] ?? "";
      return next;
    });
  }, [quantity]);

  useEffect(() => {
    if (friendPickerSlot !== null) getMyFriends().then(setFriends);
  }, [friendPickerSlot]);

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Evento no encontrado</p>
        <Link
          href="/home"
          className="rounded-2xl bg-orange-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const total = event.price * quantity;
  const isCancel = quantity === 0;
  const giftRecipientEmails = assignments
    .map((a): string =>
      typeof a === "object" && a.type === "friend"
        ? a.id
        : typeof a === "string"
          ? a.trim()
          : "",
    )
    .filter(Boolean);

  const filteredFriends = !friendSearch.trim()
    ? friends
    : friends.filter((f) =>
        f.name?.toLowerCase().includes(friendSearch.trim().toLowerCase()),
      );

  async function runGiftCheck(slotIndex: number, email: string) {
    const e = email.trim();
    if (!e) {
      setGiftChecks((prev) => ({ ...prev, [slotIndex]: { state: "idle" } }));
      return;
    }
    setGiftChecks((prev) => ({ ...prev, [slotIndex]: { state: "checking" } }));
    const result = await checkEmailHasAccount(e);
    setGiftChecks((prev) => ({
      ...prev,
      [slotIndex]: result.exists
        ? { state: "exists", name: result.name ?? null }
        : { state: "missing" },
    }));
  }

  function setAssignment(slotIndex: number, value: Assignment) {
    setAssignments((prev) => prev.map((v, i) => (i === slotIndex ? value : v)));
    if (
      value === "" ||
      (typeof value === "object" && value.type === "friend")
    ) {
      setShowEmailInputForSlot((s) => (s === slotIndex ? null : s));
    }
  }

  function selectFriend(slotIndex: number, friend: FriendProfile) {
    setAssignment(slotIndex, {
      type: "friend",
      id: friend.id,
      name: friend.name ?? "Usuario",
      avatar_url: friend.avatar_url,
    });
    setFriendPickerSlot(null);
    setFriendSearch("");
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="min-w-0 flex-1 text-center text-lg font-semibold leading-tight text-foreground">
          {event.title}
        </h1>
        <div className="w-10 shrink-0" aria-hidden />
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
        {/* Card selección de entradas */}
        <div className="shrink-0 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-neutral-900">Entrada general</p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {formatPrice(event.price)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label="Menos"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2ch] text-center text-base font-medium text-neutral-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label="Más"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {quantity >= 1 && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background border border-border shadow-sm">
              <div className="shrink-0 p-4 pb-0">
                <p className="font-semibold text-foreground">
                  ¿Vas con amigos?
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Añade a quienes te acompañarán. Envía cada entrada a un correo o elige de tus amigos.
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-3">
                <div className="flex flex-col gap-3">
                  {assignments.map((assignment, slotIndex) => {
                    const isForMe = assignment === "";
                    const isEmail = typeof assignment === "string";
                    const isFriend =
                      typeof assignment === "object" &&
                      assignment.type === "friend";
                    const check = giftChecks[slotIndex]?.state ?? "idle";
                    const checkName = giftChecks[slotIndex]?.name ?? null;
                    const showEmailHere = showEmailInputForSlot === slotIndex;

                    return (
                      <div
                        key={slotIndex}
                        className="rounded-xl border border-border p-3"
                      >
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Entrada {slotIndex + 1}
                        </p>

                        {isForMe && !showEmailHere && (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <span className="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">
                                Para mí
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowEmailInputForSlot(slotIndex)
                                  }
                                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                  Enviar a correo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFriendPickerSlot(slotIndex)}
                                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                  Elegir amigo
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {(showEmailHere || isEmail) && (
                          <>
                            <div className="flex items-center gap-2">
                              <input
                                value={isEmail ? assignment : ""}
                                onChange={(e) =>
                                  setAssignment(slotIndex, e.target.value)
                                }
                                onBlur={() =>
                                  isEmail &&
                                  runGiftCheck(slotIndex, assignment as string)
                                }
                                placeholder="Correo del destinatario"
                                className="w-full rounded-lg bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-primary"
                                autoFocus={showEmailHere}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignment(slotIndex, "");
                                  setShowEmailInputForSlot(null);
                                }}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
                                aria-label="Quitar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {isEmail && (assignment as string).trim() && (
                              <div className="mt-2 text-xs">
                                {check === "checking" ? (
                                  <p className="text-muted-foreground">
                                    Verificando…
                                  </p>
                                ) : check === "exists" ? (
                                  <p className="text-green-400">
                                    Tiene cuenta
                                    {checkName ? ` (${checkName})` : ""}. Le
                                    llegará correo y mensaje en la app.
                                  </p>
                                ) : check === "missing" ? (
                                  <p className="text-muted-foreground">
                                    No tiene cuenta. Le llegará invitación para
                                    crear una y redimir la entrada.
                                  </p>
                                ) : (
                                  <p className="text-muted-foreground">
                                    Se enviará 1 entrada a este correo.
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {isFriend && assignment.type === "friend" && (
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                              {assignment.avatar_url ? (
                                <Image
                                  src={assignment.avatar_url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                  unoptimized={assignment.avatar_url.includes(
                                    "googleusercontent",
                                  )}
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-orange-primary">
                                  {(assignment.name ?? "?")[0]}
                                </span>
                              )}
                            </div>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                              {assignment.name}
                            </span>
                            <span className="shrink-0 rounded-lg bg-orange-primary px-3 py-1.5 text-xs font-medium text-white">
                              Invitada
                            </span>
                            <button
                              type="button"
                              onClick={() => setAssignment(slotIndex, "")}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
                              aria-label="Quitar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: elegir amigo (absolute dentro del frame para verse bien en mobile) */}
        {friendPickerSlot !== null && (
          <div className="absolute inset-0 z-50 flex flex-col bg-background">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setFriendPickerSlot(null);
                  setFriendSearch("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
                aria-label="Cerrar"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-bold text-foreground">
                Elegir amigo
              </h2>
              <div className="w-10" aria-hidden />
            </div>
            <div className="relative shrink-0 px-4 py-2">
              <input
                type="search"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Búsqueda"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-primary focus:outline-none focus:ring-2 focus:ring-orange-primary/30"
              />
              <Search className="absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
              {filteredFriends.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  {friends.length === 0
                    ? "Aún no tienes amigos. Agrégalos desde Amigos."
                    : "No hay coincidencias."}
                </li>
              ) : (
                filteredFriends.map((friend) => (
                  <li
                    key={friend.id}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-0"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                      {friend.avatar_url ? (
                        <Image
                          src={friend.avatar_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized={friend.avatar_url.includes(
                            "googleusercontent",
                          )}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-orange-primary">
                          {(friend.name ?? "?")[0]}
                        </span>
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {friend.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => selectFriend(friendPickerSlot, friend)}
                      className="rounded-lg border border-neutral-300 bg-orange-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      Invitar
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <p className="shrink-0 pt-3 text-sm text-muted-foreground">
          Reservas disponibles hasta el {event.reserveUntil}
        </p>
        {event.capacity != null && (
          <p className="shrink-0 text-sm text-muted-foreground">
            Límite: {event.capacity} personas
          </p>
        )}
      </div>

      {/* Resumen y botón (fijo abajo) */}
      <div className="flex shrink-0 flex-col gap-3 bg-background px-4 py-3 pb-5">
        {!isCancel && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">{event.displayDateTime}</span>
            <span className="font-semibold text-foreground">
              {formatPrice(total)}
            </span>
          </div>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            if (isCancel) {
              const { error } = await cancelReservation(event.id);
              if (error) {
                alert(error);
                setLoading(false);
                return;
              }
              router.push(`/home/event/${event.id}/reservar/cancelado`);
            } else {
              const { error, emailSent, invited } = await createReservation(
                event.id,
                quantity,
                giftRecipientEmails,
              );
              if (error) {
                alert(error);
                setLoading(false);
                return;
              }
              router.push(
                `/home/event/${event.id}/reservar/success?sent=${emailSent ? "1" : "0"}&invited=${invited?.length ?? 0}`,
              );
            }
          }}
          className={`flex w-full items-center justify-center rounded-2xl py-3.5 text-base font-semibold transition-opacity hover:opacity-90 ${
            isCancel
              ? "border border-red-500 bg-transparent text-red-500 hover:bg-red-500/10"
              : "bg-orange-primary text-white"
          }`}
        >
          {isCancel ? "Cancelar reserva" : "Reservar, Pago en el local"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          ¿Vas con amigos?{" "}
          <Link
            href="/home/messages"
            className="text-orange-primary hover:underline"
          >
            Coordina en Mensajes
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
