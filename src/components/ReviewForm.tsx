"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type ActionState } from "@/actions/orders";
import { SubmitButton } from "./SubmitButton";

export default function ReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [state, action, pending] = useActionState(submitReviewAction, {} as ActionState);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-accent-50 p-5 text-center">
        <p className="text-3xl">🙏</p>
        <p className="mt-2 font-bold text-accent-800">Thank you for your review!</p>
        <p className="mt-1 text-sm text-accent-700">It helps other food lovers in Tamenglong.</p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <input type="hidden" name="orderId" value={orderId} />
      <h3 className="font-bold text-slate-900">Rate your order</h3>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl transition-transform hover:scale-110 ${n <= (hover || rating) ? "" : "opacity-25 grayscale"}`}
            aria-label={`${n} stars`}
          >
            ⭐
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>
      <textarea
        name="comment"
        placeholder="How was the food and delivery?"
        rows={3}
        maxLength={1000}
        className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:bg-white"
      />
      {state.error && <p className="mt-2 text-sm font-medium text-red-600">{state.error}</p>}
      <div className="mt-3">
        <SubmitButton pending={pending} className="bg-primary-500 hover:bg-primary-600">
          Submit review
        </SubmitButton>
      </div>
    </form>
  );
}
