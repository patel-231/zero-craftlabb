import React, { useState, useEffect } from 'react';
import { Save, Upload, Check, AlertCircle, MessageSquare, Shield, Sliders, Send, Loader2, ExternalLink } from 'lucide-react';
import { WebsiteSettings } from '../types/index.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import { api } from '../services/api.ts';

export const AdminSettings: React.FC = () => {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestEmail = async () => {
    const target = testEmailAddress.trim() || formData?.contact.businessOrderEmail;
    if (!target) return;
    setIsTestingEmail(true);
    setTestEmailResult(null);

    try {
      if (formData) {
        await api.updateSettings(formData);
        await refreshSettings();
      }
      const res = await api.testEmail(target);
      if (res.success) {
        setTestEmailResult({
          success: true,
          message: `Success! Test email sent to ${target} via ${res.provider}. Check your inbox / spam folder!`,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: `Brevo Error: ${res.error || 'Failed to dispatch email. Please verify that your sender email is verified in Brevo.'}`,
        });
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err.message || 'Error executing test email.',
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  useEffect(() => {
    api.getSettings()
      .then((res) => {
        setFormData(res.settings);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await api.uploadImage(base64, file.name);
        setFormData({
          ...formData,
          brand: { ...formData.brand, logoUrl: res.url },
        });
      } catch {
        setFormData({
          ...formData,
          brand: { ...formData.brand, logoUrl: base64 },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await api.updateSettings(formData);
      await refreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save website settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17191F]">Website Settings &amp; Content</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configure branding, WhatsApp ordering numbers, hero messaging, shipping thresholds, and policies.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <Check size={18} className="text-emerald-600" />
          <span>Website settings updated successfully! Public storefront reflects changes immediately.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <AlertCircle size={18} className="text-red-600" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 1. Brand Identity */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-4">
          <h2 className="text-base font-extrabold text-[#17191F] border-b border-[#E7E3D8] pb-3">
            Brand Identity &amp; Logo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={formData.brand.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brand: { ...formData.brand, name: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.brand.tagline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brand: { ...formData.brand, tagline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Brand Logo (SVG or Image)</label>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#F7F5F0] rounded-xl border border-[#E7E3D8] max-w-xs">
                  <img src={formData.brand.logoUrl} alt="Logo preview" className="h-10 w-auto object-contain" />
                </div>
                <label className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload size={14} />
                  <span>Replace Logo</span>
                  <input type="file" accept="image/*,.svg" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. WhatsApp & Contact Settings */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E7E3D8] pb-3">
            <MessageSquare size={18} className="text-[#25D366]" />
            <h2 className="text-base font-extrabold text-[#17191F]">
              WhatsApp &amp; Communication Channels
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Business WhatsApp Number (With Country Code, e.g. 919876543210) *
              </label>
              <input
                type="text"
                required
                value={formData.contact.whatsappNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, whatsappNumber: e.target.value },
                  })
                }
                placeholder="919876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm font-mono focus:outline-none"
              />
              <p className="text-[10px] text-zinc-400 mt-1">This number receives all click-to-chat customer order messages.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Display Phone Number
              </label>
              <input
                type="text"
                value={formData.contact.displayPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, displayPhone: e.target.value },
                  })
                }
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Business Order Email (Receives New Orders)
              </label>
              <input
                type="email"
                value={formData.contact.businessOrderEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, businessOrderEmail: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Public Support Email
              </label>
              <input
                type="email"
                value={formData.contact.publicContactEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, publicContactEmail: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Workshop / Studio Address
              </label>
              <input
                type="text"
                value={formData.contact.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, address: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2.1 Automated Email Configuration (Brevo / SMTP) */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E7E3D8] pb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#5B5FEF]/10 text-[#5B5FEF] flex items-center justify-center font-bold">
                ✉️
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#17191F]">
                  Automated Order Emails Configuration
                </h2>
                <p className="text-xs text-zinc-500">
                  Sends automatic order receipts to customers and instant order alerts to your business inbox.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              Brevo API &amp; SMTP Supported
            </span>
          </div>

          {/* Important Brevo IP Fix Notice Banner */}
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl text-xs text-amber-950 leading-relaxed space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>Brevo Security Requirement for Cloud &amp; Hosting Servers:</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-normal">
              If Brevo reports an <strong>"unrecognised IP address"</strong> error, this is a security setting inside your Brevo account. Because cloud hosting servers (Vercel, Cloud Run) change IPs dynamically, you must disable the IP restriction:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <a
                href="https://app.brevo.com/security/authorised_ips"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>Open Brevo Authorised IPs</span>
                <ExternalLink size={12} />
              </a>
              <span className="text-[11px] text-amber-800 font-medium">
                &rarr; Turn OFF / delete all entries in "Authorised IP addresses". Emails will then send instantly!
              </span>
            </div>
          </div>

          {/* Provider Selection & Method */}
          <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-4">
            <h3 className="text-xs font-bold uppercase text-zinc-800 tracking-wider">
              Method 1: Brevo API (Recommended &amp; 300 Free Emails/Day)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Brevo API Key
                </label>
                <input
                  type="text"
                  value={formData.emailConfig?.brevoApiKey || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailConfig: {
                        ...(formData.emailConfig || {}),
                        brevoApiKey: e.target.value.trim(),
                      },
                    })
                  }
                  placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-white text-xs font-mono focus:outline-none focus:border-[#5B5FEF]"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  From: Brevo Dashboard &rarr; SMTP &amp; API &rarr; API Keys
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={formData.emailConfig?.brevoSenderName || formData.brand.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailConfig: {
                        ...(formData.emailConfig || {}),
                        brevoSenderName: e.target.value,
                      },
                    })
                  }
                  placeholder="Zero Craftlabb"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-white text-xs focus:outline-none focus:border-[#5B5FEF]"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Sender name displayed on customer receipts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Verified Sender Email
                </label>
                <input
                  type="email"
                  value={formData.emailConfig?.brevoSenderEmail || formData.contact.businessOrderEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailConfig: {
                        ...(formData.emailConfig || {}),
                        brevoSenderEmail: e.target.value.trim(),
                      },
                    })
                  }
                  placeholder="ompatel787877@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-white text-xs focus:outline-none focus:border-[#5B5FEF]"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Must be verified in your Brevo account.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Method 2: Custom SMTP / Gmail */}
          <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-4">
            <h3 className="text-xs font-bold uppercase text-zinc-800 tracking-wider">
              Method 2: Custom SMTP / Gmail App Password (Optional Alternative)
            </h3>
            <p className="text-[11px] text-zinc-500">
              You can also send emails directly via Gmail SMTP (<code className="bg-zinc-200 px-1 py-0.5 rounded font-mono">smtp.gmail.com:587</code> with Google App Password) or any custom SMTP server.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={formData.emailConfig?.smtpHost || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailConfig: {
                        ...(formData.emailConfig || {}),
                        smtpHost: e.target.value.trim(),
                      },
                    })
                  }
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E3D8] bg-white text-xs focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.emailConfig?.smtpPort || 587}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailConfig: {
                        ...(formData.emailConfig || {}),
                        smtpPort: Number(e.target.value),
                      },
                    })
                  }
                  placeholder="587"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E3D8] bg-white text-xs focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={formData.emailConfig?.smtpUser || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailConfig: {
                        ...(formData.emailConfig || {}),
                        smtpUser: e.target.value.trim(),
                      },
                    })
                  }
                  placeholder="you@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E3D8] bg-white text-xs focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  SMTP Password / App Key
                </label>
                <input
                  type="password"
                  value={formData.emailConfig?.smtpPass || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailConfig: {
                        ...(formData.emailConfig || {}),
                        smtpPass: e.target.value,
                      },
                    })
                  }
                  placeholder="16-character App Password"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E3D8] bg-white text-xs focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>
            </div>
          </div>

          {/* Test Email Dispatch Tool */}
          <div className="pt-3 border-t border-[#E7E3D8]">
            <span className="block text-xs font-bold uppercase text-zinc-700 mb-2">
              🧪 Test Email Delivery
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder={`Send test email to (default: ${formData.contact.businessOrderEmail})`}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none focus:border-[#5B5FEF]"
              />
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                className="px-5 py-2.5 rounded-xl bg-[#17191F] hover:bg-[#5B5FEF] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                {isTestingEmail ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>

            {testEmailResult && (
              <div
                className={`mt-3 p-3.5 rounded-xl text-xs font-medium leading-relaxed flex items-start gap-2.5 ${
                  testEmailResult.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-red-50 text-red-900 border border-red-300'
                }`}
              >
                {testEmailResult.success ? (
                  <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="font-bold">
                    {testEmailResult.success ? 'Email Sent Successfully!' : 'Email Delivery Issue'}
                  </div>
                  <div>{testEmailResult.message}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Announcement Bar */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E3D8] pb-3">
            <h2 className="text-base font-extrabold text-[#17191F]">Top Promotional Announcement Bar</h2>
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcement.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    announcement: { ...formData.announcement, enabled: e.target.checked },
                  })
                }
                className="rounded text-[#5B5FEF]"
              />
              <span>Bar Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                value={formData.announcement.text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    announcement: { ...formData.announcement, text: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Commerce & Shipping Rules */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-4">
          <h2 className="text-base font-extrabold text-[#17191F] border-b border-[#E7E3D8] pb-3">
            Commerce, Currency &amp; Shipping Charges
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.commerce.freeShippingThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commerce: {
                      ...formData.commerce,
                      freeShippingThreshold: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
              <p className="text-[10px] text-zinc-400 mt-1">Orders above this amount receive free shipping.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.commerce.standardShippingFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commerce: {
                      ...formData.commerce,
                      standardShippingFee: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Order Prefix
              </label>
              <input
                type="text"
                value={formData.commerce.orderPrefix}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commerce: {
                      ...formData.commerce,
                      orderPrefix: e.target.value.toUpperCase(),
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Policy Texts */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-4">
          <h2 className="text-base font-extrabold text-[#17191F] border-b border-[#E7E3D8] pb-3">
            Store Policies &amp; Terms
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Shipping Policy Content
              </label>
              <textarea
                rows={3}
                value={formData.policies.shippingPolicy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policies: { ...formData.policies, shippingPolicy: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Returns &amp; Cancellation Policy Content
              </label>
              <textarea
                rows={3}
                value={formData.policies.returnsPolicy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policies: { ...formData.policies, returnsPolicy: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Privacy Policy Content
              </label>
              <textarea
                rows={3}
                value={formData.policies.privacyPolicy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policies: { ...formData.policies, privacyPolicy: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-xl bg-[#5B5FEF] text-white font-bold text-sm hover:bg-[#4d51df] transition-colors flex items-center gap-2 shadow-lg shadow-[#5B5FEF]/30"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving Configurations...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
