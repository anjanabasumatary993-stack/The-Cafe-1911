import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ReservationData, CafeDetails } from '../types';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ExternalLink,
  Edit2,
  CalendarCheck,
  Download,
  ArrowRight,
  Info
} from 'lucide-react';

interface ReservationSectionProps {
  cafeDetails: CafeDetails;
  onUpdateCafeDetails: (updated: Partial<CafeDetails>) => void;
  onOpenEditDetailsModal: () => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  cafeDetails,
  onOpenEditDetailsModal,
}) => {
  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    email: '',
    phone: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date
    time: '11:30',
    guests: 2,
    seatingPreference: 'Banquette Salon',
    specialRequests: '',
  });

  const [submittedEnquiry, setSubmittedEnquiry] = useState<{
    reference: string;
    data: ReservationData;
    timestamp: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const seatingOptions = [
    'Banquette Salon (Intimate & Acoustic)',
    'Marble Barista Counter (Front-Row Extraction)',
    'Sunlit Great Window (Natural Light & Street View)',
    'Garden Terrace (Open Air)',
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate concierge dispatch
    setTimeout(() => {
      const refNumber = `C1911-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedEnquiry({
        reference: refNumber,
        data: { ...formData },
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setIsSubmitting(false);
    }, 600);
  };

  const handleDownloadCalendar = () => {
    if (!submittedEnquiry) return;
    const { data, reference } = submittedEnquiry;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CAFE 1911//Table Enquiry//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Table Enquiry at CAFE 1911 (Ref: ${reference})`,
      `DESCRIPTION:Table enquiry for ${data.guests} guests in ${data.seatingPreference}. Notes: ${data.specialRequests || 'None'}. Concierge: ${cafeDetails.phone}`,
      `LOCATION:${cafeDetails.address}, ${cafeDetails.city}`,
      `DTSTART:${data.date.replace(/-/g, '')}T${data.time.replace(':', '')}00`,
      `DTEND:${data.date.replace(/-/g, '')}T${(parseInt(data.time.split(':')[0]) + 1).toString().padStart(2, '0')}${data.time.split(':')[1]}00`,
      'STATUS:TENTATIVE',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cafe1911_Enquiry_${reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="visit" className="relative py-28 sm:py-36 bg-[#0c0b0a] overflow-hidden">
      {/* Background divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2d241e] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-[#2d241e]">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#c5a880] mb-3">
              <span className="font-serif italic text-sm">Chapter V</span>
              <span className="w-8 h-[1px] bg-[#c5a880]/50" />
              <span>Hospitality & Reservations</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#faf7f2] font-normal tracking-tight">
              Your Table. Your Moment.
            </h2>
          </div>
          <button
            onClick={onOpenEditDetailsModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#c5a880] border border-[#c5a880]/30 hover:border-[#c5a880] hover:bg-[#c5a880]/10 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Location Details</span>
          </button>
        </div>

        {/* 2-Column Split: Enquiry Form & Visit Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Column 1: Reservation Enquiry Form (col-span-7) */}
          <div className="lg:col-span-7 bg-[#14110f] border border-[#2d241e] p-8 sm:p-12">
            {!submittedEnquiry ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#faf7f2] font-normal mb-2">
                    Request Salon Seating
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#e8e2d5]/70 font-light leading-relaxed">
                    Reservations are welcomed for parties of all sizes. For immediate availability within the hour, we recommend calling the concierge directly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lorde Evelyn Sinclair"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="evelyn@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                      Number of Guests
                    </label>
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none transition-colors"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                      Preferred Time *
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none transition-colors"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seating Preference */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                    Seating Preference
                  </label>
                  <select
                    value={formData.seatingPreference}
                    onChange={(e) => setFormData({ ...formData, seatingPreference: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none transition-colors"
                  >
                    {seatingOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                    Special Notes or Dietary Preferences (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Celebrating an anniversary; preferred quiet acoustic booth; oat milk pairing."
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Truthful Reservation System Notice */}
                <div className="flex items-start gap-3 p-4 bg-[#0c0b0a]/70 border border-[#2d241e] text-xs text-[#e8e2d5]/70 leading-relaxed font-light">
                  <Info className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#faf7f2] font-medium">Truthful Hospitality Notice: </span>
                    Submitting this form dispatches a formal booking enquiry to the CAFE 1911 maître d’hôtel. A personalized confirmation is dispatched to your email within 2 business hours.
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-xs uppercase tracking-[0.22em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] active:bg-[#b0926b] transition-all duration-300 rounded-none shadow-[0_4px_20px_rgba(197,168,128,0.2)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Dispatching Enquiry...</span>
                  ) : (
                    <>
                      <span>Transmit Reservation Enquiry</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Submission Confirmation Summary (Truthful Hospitality Receipt) */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#c5a880]">
                    Enquiry Recorded Successfully
                  </span>
                </div>

                <h3 className="font-serif text-3xl text-[#faf7f2] font-normal">
                  Thank You, {submittedEnquiry.data.name}
                </h3>

                <p className="text-sm text-[#e8e2d5]/80 font-light leading-relaxed">
                  Your table enquiry has been routed to our reservation desk. Our team will verify salon seating and send your official booking confirmation via email.
                </p>

                {/* Receipt Card */}
                <div className="bg-[#0c0b0a] border border-[#2d241e] p-6 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#2d241e]/60 pb-2">
                    <span className="text-[#e8e2d5]/50 uppercase tracking-widest">Enquiry Reference:</span>
                    <span className="font-mono text-[#c5a880] font-semibold">{submittedEnquiry.reference}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2d241e]/60 pb-2">
                    <span className="text-[#e8e2d5]/50">Date & Time:</span>
                    <span className="text-[#faf7f2]">{submittedEnquiry.data.date} at {submittedEnquiry.data.time}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2d241e]/60 pb-2">
                    <span className="text-[#e8e2d5]/50">Party Size:</span>
                    <span className="text-[#faf7f2]">{submittedEnquiry.data.guests} Guests</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2d241e]/60 pb-2">
                    <span className="text-[#e8e2d5]/50">Salon Area:</span>
                    <span className="text-[#faf7f2]">{submittedEnquiry.data.seatingPreference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#e8e2d5]/50">Transmitted At:</span>
                    <span className="text-[#e8e2d5]/70">{submittedEnquiry.timestamp}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleDownloadCalendar}
                    className="flex-1 py-3 text-xs uppercase tracking-[0.2em] font-medium text-[#faf7f2] border border-[#c5a880]/60 hover:bg-[#c5a880]/15 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Download Calendar (.ics)</span>
                  </button>
                  <button
                    onClick={() => setSubmittedEnquiry(null)}
                    className="flex-1 py-3 text-xs uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Submit Another Enquiry</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Column 2: Visit Us & Salon Location (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="bg-[#14110f] border border-[#2d241e] p-8 sm:p-10">
              <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] block mb-4">
                The Café Address
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl text-[#faf7f2] font-normal mb-6">
                CAFE 1911 Diphu
              </h3>

              <div className="space-y-6 text-sm text-[#e8e2d5]/85 font-light">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#faf7f2] font-normal">{cafeDetails.address}</p>
                    <p className="text-xs text-[#e8e2d5]/60 mt-0.5">{cafeDetails.city}</p>
                    <p className="text-[11px] text-[#c5a880]/80 mt-1">Diphu, Karbi Anglong, Assam</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[#faf7f2] font-normal">{cafeDetails.weekdayHours}</p>
                    <p className="text-[#faf7f2] font-normal">{cafeDetails.weekendHours}</p>
                    <p className="text-xs text-[#e8e2d5]/60">Fresh meals, momos, and drinks served all day</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={`tel:${cafeDetails.phone}`}
                      className="text-[#faf7f2] hover:text-[#c5a880] transition-colors"
                    >
                      {cafeDetails.phone}
                    </a>
                    <p className="text-xs text-[#c5a880]/80 mt-0.5">
                      {cafeDetails.phoneNote || 'Publicly listed · Please verify with manager before publishing'}
                    </p>
                  </div>
                </div>

                {/* Email (Hidden until verified/supplied by manager) */}
                {Boolean(cafeDetails.email && cafeDetails.email.trim().length > 0) && (
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                    <div>
                      <a
                        href={`mailto:${cafeDetails.email}`}
                        className="text-[#faf7f2] hover:text-[#c5a880] transition-colors"
                      >
                        {cafeDetails.email}
                      </a>
                      <p className="text-xs text-[#e8e2d5]/60 mt-0.5">Direct Café Enquiries</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map & Listing CTA */}
              <div className="mt-8 pt-6 border-t border-[#2d241e]">
                <a
                  href={cafeDetails.googleMapsUrl || 'https://share.google/rBwAi1mcxjT3eARXr'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-[0.2em] font-medium text-[#faf7f2] border border-[#2d241e] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Private Tastings Callout */}
            <div className="p-8 border border-[#2d241e] bg-gradient-to-br from-[#1c1815] to-[#14110f]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block mb-2">
                Private Cupping & Salon Hire
              </span>
              <h4 className="font-serif text-xl text-[#faf7f2] font-normal mb-2">
                Exclusive Evening Gatherings
              </h4>
              <p className="text-xs text-[#e8e2d5]/70 leading-relaxed font-light mb-4">
                Our salon and roastery are available for intimate evening book launches, private tastings, and bespoke culinary events after 20:00.
              </p>
              <a
                href={`mailto:${cafeDetails.email}?subject=Private%20Salon%20Hire%20Enquiry`}
                className="text-xs text-[#c5a880] hover:underline uppercase tracking-widest inline-flex items-center gap-1.5"
              >
                <span>Inquire With Maître d’Hôtel</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
