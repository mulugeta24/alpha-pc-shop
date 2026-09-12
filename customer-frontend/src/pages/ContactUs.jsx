import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6 text-primary-600" />,
      title: 'Our Location',
      lines: ['Bole Sub-City, Addis Ababa', 'Ethiopia'],
    },
    {
      icon: <Phone className="w-6 h-6 text-primary-600" />,
      title: 'Phone Numbers',
      lines: ['+251 960 286 319', '+251 922 456 789'],
    },
    {
      icon: <Mail className="w-6 h-6 text-primary-600" />,
      title: 'Email Addresses',
      lines: ['info@alphapcshop.com', 'support@alphapcshop.com'],
    },
    {
      icon: <Clock className="w-6 h-6 text-primary-600" />,
      title: 'Working Hours',
      lines: ['Mon – Sat: 8:00 AM – 7:00 PM', 'Sunday: 10:00 AM – 5:00 PM'],
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-wide mb-4">
          Contact Us
        </h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto">
          Have a question, a custom order request, or need tech advice? We're here to help.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info */}
        <div className="space-y-6">
          {contactInfo.map((item) => (
            <div key={item.title} className="card p-6 flex gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                {item.lines.map((line) => (
                  <p key={line} className="text-gray-600 text-sm">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900">Message Sent!</h2>
                <p className="text-gray-600 max-w-sm">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-primary mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Abebe Kebede"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="abebe@example.com"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+251 911 123 456"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        className="input-field"
                      >
                        <option value="">Select a subject</option>
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Order Support">Order Support</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Custom Build Request">Custom Build Request</option>
                        <option value="Warranty & Returns">Warranty &amp; Returns</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Write your message here..."
                      className="input-field resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Google Maps - Dembel City Center */}
      <section className="rounded-2xl overflow-hidden h-80 shadow-md">
        <iframe
          title="Dembel City Center, Addis Ababa"
          src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d1970.3232753487052!2d38.76604105642489!3d9.004633316887007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sdembel%20city%20center%20addis%20ababa!5e0!3m2!1sen!2set!4v1783600746006!5m2!1sen!2set"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
    </div>
  );
};

export default ContactUs;
