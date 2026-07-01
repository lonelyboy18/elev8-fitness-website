import { useEffect, useState, type FormEvent } from "react";
import { bookingApi } from "@entities/booking/api/bookingApi";
import type { SlotAvailability } from "@entities/booking/model/types";
import type { PlanId } from "@shared/constants/plans";
import { TIME_SLOTS } from "@shared/constants/plans";
import { useToast } from "@shared/hooks/useToast";
import { SubmitButton } from "@shared/ui/SubmitButton";
import { useBootstrapModal } from "../model/useBootstrapModal";

const SLOT_LABELS: Record<string, string> = {
  "05:30": "5:30 AM",
  "06:30": "6:30 AM",
  "07:30": "7:30 AM",
  "17:00": "5:00 PM",
  "18:00": "6:00 PM",
  "19:00": "7:00 PM",
};

type FieldErrors = Partial<Record<"type" | "date" | "slot", string>>;

interface BookingFormProps {
  defaultPlan: PlanId;
  onBooked: () => Promise<void>;
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function maxDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

export function BookingForm({ defaultPlan, onBooked }: BookingFormProps) {
  const [classType, setClassType] = useState<PlanId>(defaultPlan);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { modalRef, hide } = useBootstrapModal("bookModal");

  useEffect(() => {
    setClassType(defaultPlan);
  }, [defaultPlan]);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setCheckingSlots(true);
    setTimeSlot("");
    setErrors((prev) => ({ ...prev, slot: undefined }));

    bookingApi
      .availability(date, classType)
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          setSlots(result.data.slots);
        } else {
          setSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingSlots(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, classType]);

  const fullCount = slots.filter((s) => s.full).length;
  const slotHint = checkingSlots ? "Checking…" : slots.length > 0 && fullCount === slots.length ? "— all slots full" : "";

  function slotAvailability(time: string): SlotAvailability | undefined {
    return slots.find((s) => s.time === time);
  }

  function resetForm() {
    setClassType(defaultPlan);
    setDate("");
    setTimeSlot("");
    setSlots([]);
    setErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!classType) nextErrors.type = "Please select a class type.";
    if (!date) nextErrors.date = "Please select a class date.";
    if (!timeSlot) nextErrors.slot = "Please select a time slot.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await bookingApi.create({ class_type: classType, date, time_slot: timeSlot });
      if (result.success) {
        showToast(result.message ?? "Booking confirmed!", "success", 5000);
        hide();
        resetForm();
        await onBooked();
      } else if (result.errors) {
        setErrors(result.errors as FieldErrors);
      } else {
        showToast(result.message || "Booking failed. Please try again.", "error");
      }
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal fade" id="bookModal" ref={modalRef} tabIndex={-1} aria-labelledby="bookModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content glass-modal">
          <div className="modal-header">
            <h5 className="modal-title" id="bookModalLabel">
              Book a Class
            </h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form id="bookingForm" noValidate onSubmit={handleSubmit}>
              <div className="mb-4">
                <p className="modal-field-label">Class Type</p>
                <div className="plan-grid">
                  <label className="plan-card">
                    <input
                      type="radio"
                      name="bk-classType"
                      value="bft"
                      checked={classType === "bft"}
                      onChange={() => setClassType("bft")}
                    />
                    <span className="plan-content">
                      <strong className="plan-abbr">BFT</strong>
                      <span className="plan-name">Bodyweight Functional</span>
                    </span>
                  </label>
                  <label className="plan-card">
                    <input
                      type="radio"
                      name="bk-classType"
                      value="cst"
                      checked={classType === "cst"}
                      onChange={() => setClassType("cst")}
                    />
                    <span className="plan-content">
                      <strong className="plan-abbr">CST</strong>
                      <span className="plan-name">Calisthenics Skill</span>
                    </span>
                  </label>
                </div>
                <span className="field-err" id="bk-typeErr" role="alert">
                  {errors.type}
                </span>
              </div>

              <div className="elev8-field">
                <input
                  type="date"
                  id="bk-date"
                  name="date"
                  placeholder=" "
                  autoComplete="off"
                  min={todayIso()}
                  max={maxDateIso()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <label htmlFor="bk-date">Class Date</label>
                <span className="field-err" id="bk-dateErr" role="alert">
                  {errors.date}
                </span>
              </div>

              <div className="mb-4">
                <p className="modal-field-label">
                  Time Slot <span className="slot-hint">{slotHint}</span>
                </p>
                <div className="slot-grid" id="slotGrid" role="group" aria-label="Choose a time slot">
                  {TIME_SLOTS.map((slot) => {
                    const avail = slotAvailability(slot);
                    const label = SLOT_LABELS[slot] || slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        className={`slot-btn${timeSlot === slot ? " selected" : ""}`}
                        data-slot={slot}
                        aria-label={label}
                        disabled={Boolean(avail?.full)}
                        onClick={() => {
                          setTimeSlot(slot);
                          setErrors((prev) => ({ ...prev, slot: undefined }));
                        }}
                      >
                        {label}
                        {avail && <span className="slot-avail">{avail.full ? "Full" : `${avail.available} left`}</span>}
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" id="bk-timeSlot" name="time_slot" value={timeSlot} />
                <span className="field-err" id="bk-slotErr" role="alert">
                  {errors.slot}
                </span>
              </div>

              <SubmitButton id="bookBtn" className="btn btn-success w-100" loading={submitting}>
                Confirm Booking
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
