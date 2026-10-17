import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, MapPin, Phone, ShieldCheck, Truck, RotateCcw, Send, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF7547]">Our Heritage</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17191F] mt-1 mb-4">
          The Story Behind Zero Craftlabb
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Where engineering precision, motorsport adrenaline, and authentic Indian artisan craft merge into lasting tangible pieces.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 space-y-6 text-zinc-700 leading-relaxed text-sm sm:text-base">
        <p>
          {settings?.policies?.aboutUsStory ||
            'Zero Craftlabb was founded by a collective of industrial designers, automotive enthusiasts, and traditional wood and brass craftspeople. Our vision began with a simple problem: automotive decor was almost universally cheap plastic posters or gaudy imported souvenirs.'}
        </p>
        <p>
          We set out to build pieces that belong in contemporary architectural living spaces, enthusiast garages, and design studios. We use computer-aided laser vectoring with 0.1 mm tolerances to capture the legendary curvature of iconic supercars and Formula racing tracks, cut from cast acrylics and solid metals.
        </p>
        <p>
          Concurrently, we partner with heritage brass-casters and wood-turners across India to produce solid brass oil lamps (diyas), teakwood geometric clocks, and bespoke desk accessories. Each item is individually inspected, hand-finished with natural oils or lacquers, and packaged with extreme care.
        </p>

        <div className="pt-6 border-t border-[#E7E3D8] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-[#F7F5F0] rounded-2xl">
            <span className="text-2xl font-extrabold text-[#5B5FEF] block mb-1">100%</span>
            <span className="text-xs font-bold text-zinc-600 uppercase">Made in India</span>
          </div>
          <div className="p-4 bg-[#F7F5F0] rounded-2xl">
            <span className="text-2xl font-extrabold text-[#FF7547] block mb-1">0.1mm</span>
            <span className="text-xs font-bold text-zinc-600 uppercase">Laser Precision</span>
          </div>
          <div className="p-4 bg-[#F7F5F0] rounded-2xl">
            <span className="text-2xl font-extrabold text-[#17191F] block mb-1">Direct</span>
            <span className="text-xs font-bold text-zinc-600 uppercase">Artisan to Customer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const cleanPhone = settings?.contact?.whatsappNumber.replace(/[^0-9]/g, '') || '';

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    // Open WhatsApp with inquiry or display confirmed
    const inquiryText = `Hi Zero Craftlabb, my name is ${name} (${email}). Inquiry: ${message}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(inquiryText)}`, '_blank');
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-[#5B5FEF]">Get In Touch</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17191F] mt-1 mb-2">
          Contact Zero Craftlabb
        </h1>
        <p className="text-sm text-zinc-500">
          Have a question about a track silhouette, custom dimension, or bulk festive order? We respond promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17191F]">Direct WhatsApp Support</h3>
              <p className="text-xs text-zinc-500 mt-0.5 mb-2">
                Fastest way to get personalized assistance, custom orders, or shipping updates.
              </p>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] hover:underline"
              >
                <span>Chat on WhatsApp ({settings?.contact?.displayPhone})</span>
                &rarr;
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5B5FEF]/10 text-[#5B5FEF] flex items-center justify-center shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17191F]">Email Inquiries</h3>
              <p className="text-xs text-zinc-500 mt-0.5 mb-2">
                For order questions, corporate gifting, or studio inquiries.
              </p>
              <a
                href={`mailto:${settings?.contact?.publicContactEmail}`}
                className="text-xs font-bold text-[#5B5FEF] hover:underline"
              >
                {settings?.contact?.publicContactEmail}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF7547]/10 text-[#FF7547] flex items-center justify-center shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17191F]">Workshop Location</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                {settings?.contact?.address}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 sm:p-8">
          <h2 className="text-lg font-extrabold text-[#17191F] mb-4">Send a Direct Message</h2>

          {formSubmitted ? (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Check size={24} />
              </div>
              <h3 className="font-bold text-emerald-900 text-base">Inquiry Prepared</h3>
              <p className="text-xs text-emerald-800 mt-1">
                Your message has been initiated. If your WhatsApp window did not open, chat directly at {settings?.contact?.displayPhone}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Message / Custom Inquiry *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the track, silhouette, or custom dimensions you need..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#17191F] text-white font-bold text-sm hover:bg-[#5B5FEF] transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} />
                <span>Send via WhatsApp / Email</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => {
  const { settings } = useSettings();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24">
      <h1 className="text-3xl font-extrabold text-[#17191F] mb-6">Shipping &amp; Delivery Policy</h1>
      <div className="bg-white rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 prose max-w-none text-zinc-700 leading-relaxed text-sm space-y-4">
        <p>{settings?.policies?.shippingPolicy}</p>
        <h3 className="text-base font-bold text-[#17191F] pt-4">Packaging &amp; Protection</h3>
        <p>
          Automotive wall art and acrylic silhouettes are shipped with protective scratch-resistant masking films, sandwiched between rigid twin-wall honeycomb boards, and packed in reinforced corner-protected cartons to withstand transit across any Indian pin code.
        </p>
        <h3 className="text-base font-bold text-[#17191F] pt-4">Free Shipping Eligibility</h3>
        <p>
          Orders with a subtotal exceeding {settings?.commerce?.currencySymbol || '₹'}{settings?.commerce?.freeShippingThreshold || 1499} qualify for free insured express delivery. Standard delivery for orders below this threshold is {settings?.commerce?.currencySymbol || '₹'}{settings?.commerce?.standardShippingFee || 99}.
        </p>
      </div>
    </div>
  );
};

export const ReturnsPolicyPage: React.FC = () => {
  const { settings } = useSettings();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24">
      <h1 className="text-3xl font-extrabold text-[#17191F] mb-6">Returns &amp; Cancellations</h1>
      <div className="bg-white rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 prose max-w-none text-zinc-700 leading-relaxed text-sm space-y-4">
        <p>{settings?.policies?.returnsPolicy}</p>
        <h3 className="text-base font-bold text-[#17191F] pt-4">Damaged in Transit</h3>
        <p>
          In the rare event that your piece arrives damaged or cracked, please share an unboxing photo or video via WhatsApp to {settings?.contact?.displayPhone} within 48 hours of delivery. We will arrange an immediate replacement free of charge.
        </p>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useSettings();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24">
      <h1 className="text-3xl font-extrabold text-[#17191F] mb-6">Privacy Policy</h1>
      <div className="bg-white rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 prose max-w-none text-zinc-700 leading-relaxed text-sm space-y-4">
        <p>{settings?.policies?.privacyPolicy}</p>
        <h3 className="text-base font-bold text-[#17191F] pt-4">Information We Collect</h3>
        <p>
          We only collect information required for order fulfillment and communication: your name, phone/WhatsApp number, delivery postal address, and email address. We do not store credit card or debit card credentials on our servers.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const { settings } = useSettings();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-24">
      <h1 className="text-3xl font-extrabold text-[#17191F] mb-6">Terms &amp; Conditions</h1>
      <div className="bg-white rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 prose max-w-none text-zinc-700 leading-relaxed text-sm space-y-4">
        <p>{settings?.policies?.termsAndConditions}</p>
        <h3 className="text-base font-bold text-[#17191F] pt-4">Custom &amp; Bespoke Orders</h3>
        <p>
          Products configured with bespoke dimensions or custom automotive silhouette cuts enter production immediately after customer confirmation on WhatsApp. Specifications cannot be altered once cutting has commenced.
        </p>
      </div>
    </div>
  );
};
