import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export const Join: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    program: 'Cricket Academy',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setFormSubmitted(true);
      setFormData({ name: '', phone: '', email: '', program: 'Cricket Academy', message: '' });
    }, 800);
  };

  return (
    <>
      <section
        id="join"
        className="relative min-h-[60vh] flex items-center justify-center py-24 bg-cover bg-center text-center overflow-hidden"
        style={{ backgroundImage: "url('/Hero3.png')" }}
      >
        {/* Transparent layout spacer if needed, but no darkening gradients */}

        <div className="relative z-10 max-w-4xl mx-auto px-6 w-full flex flex-col items-center">
          {/* Main Title */}
          <h2 
            className="font-condensed text-5xl sm:text-7xl md:text-8xl font-bold tracking-wide text-white uppercase leading-none drop-shadow-lg"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            JOIN R-PLAY TODAY
          </h2>

          {/* Subtitle */}
          <h3 
            className="mt-4 font-condensed text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-[var(--color-rplay-green)] uppercase drop-shadow-md"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            YOUR JOURNEY TO GREATNESS STARTS HERE.
          </h3>

          {/* Details */}
          <p className="mt-3 text-white/90 font-sans text-sm sm:text-base md:text-lg tracking-wide drop-shadow-sm">
            Admissions Open for Cricket Academy & Turf Bookings.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 bg-[var(--color-rplay-green)] text-white font-bold text-sm sm:text-base tracking-[0.15em] px-8 py-3.5 rounded shadow-[0_0_20px_rgba(94,186,66,0.4)] hover:shadow-[0_0_30px_rgba(94,186,66,0.6)] transform hover:scale-105 active:scale-95 transition-all duration-300 font-sans uppercase"
          >
            ENROLL NOW
          </button>
        </div>
      </section>

      {/* Anchor for Contact */}
      <div id="contact" />

      {/* Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-none overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-display text-xl tracking-wider text-white uppercase font-bold">
                R-PLAY ADMISSION FORM
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormSubmitted(false);
                }}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-[var(--color-rplay-green)]/10 text-[var(--color-rplay-green)] rounded-full flex items-center justify-center mb-4 border border-[var(--color-rplay-green)]/20 animate-bounce">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-display text-2xl font-semibold text-white uppercase tracking-wider mb-2">
                    Application Submitted!
                  </h4>
                  <p className="text-white/60 text-sm font-sans max-w-sm">
                    Thank you for reaching out to R-Play Sports Academy. Our team will contact you shortly to complete your registration.
                  </p>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormSubmitted(false);
                    }}
                    className="mt-6 bg-white text-black font-semibold text-xs tracking-wider px-6 py-2.5 rounded-none hover:bg-gray-100 transition-colors"
                  >
                    CLOSE WINDOW
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                  <div>
                    <label className="block text-white/60 text-xs font-semibold tracking-wider uppercase mb-1.5 font-sans">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-[#161616] border border-white/10 rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-rplay-green)] text-sm font-sans"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-xs font-semibold tracking-wider uppercase mb-1.5 font-sans">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-[#161616] border border-white/10 rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-rplay-green)] text-sm font-sans"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs font-semibold tracking-wider uppercase mb-1.5 font-sans">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#161616] border border-white/10 rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-rplay-green)] text-sm font-sans"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 text-xs font-semibold tracking-wider uppercase mb-1.5 font-sans">
                      Select Program / Inquiry
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="w-full bg-[#161616] border border-white/10 rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-rplay-green)] text-sm font-sans"
                    >
                      <option value="Cricket Academy">Cricket Academy Admission</option>
                      <option value="Turf Booking">Turf Booking Inquiry</option>
                      <option value="Both">Both Academy & Turf</option>
                      <option value="General">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/60 text-xs font-semibold tracking-wider uppercase mb-1.5 font-sans">
                      Message / Special Requirements
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full bg-[#161616] border border-white/10 rounded-none px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-rplay-green)] text-sm font-sans resize-none"
                      placeholder="Tell us about yourself or request dates for turf bookings..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-4 w-full bg-[var(--color-rplay-green)] hover:bg-opacity-95 text-white font-bold text-sm tracking-widest py-3 rounded-none flex items-center justify-center gap-2 transform active:scale-95 transition-all font-sans uppercase"
                  >
                    <Send size={16} />
                    Submit Application
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Join;
