
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import SEO from '../components/SEO';
import { api } from '../services/api';
import analyticsTracking from '../services/analytics-tracking';

const getApiBase = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api';
  }
  return `${protocol}//${hostname}:4000/api`;
};
const API_BASE = getApiBase();

const Contact: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: t('solutions.rooftop'),
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    try {
      // Call API to submit contact form
      const response = await fetch(`${API_BASE}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setFormStatus('success');
        showToast('✅ ' + result.message, 'success');
        
        // Track contact request in analytics
        analyticsTracking.trackContactRequest(formData.service, {
          name: formData.name,
          email: formData.email
        });
        
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          service: t('solutions.rooftop'),
          message: ''
        });
        
        // Reset status after 3 seconds
        setTimeout(() => setFormStatus('idle'), 3000);
      } else {
        throw new Error(result.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('❌ Có lỗi xảy ra. Vui lòng thử lại!', 'error');
      setFormStatus('idle');
    }
  };

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "alternateName": "CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS  CONSTRUCTION JOINT - STOCK COMPANY",
      "taxID": "0400458940",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "50B Nguyễn Du",
        "addressLocality": "Hải Châu",
        "addressRegion": "Đà Nẵng",
        "postalCode": "550000",
        "addressCountry": "VN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 16.0759,
        "longitude": 108.2201
      },
      "telephone": "+84-236-3745-555",
      "email": "info@ctcdn.vn",
      "url": "https://www.ctcdn.vn"
    }
  };

  return (
    <div className="w-full bg-gray-50 pb-0 animate-fade-in">
      <SEO 
        title={t('contact.title')} 
        description={t('contact.desc')}
        schema={contactSchema}
      />

      <div className="bg-corporate text-white py-12 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">{t('contact.title')}</h1>
          <p className="mt-2 opacity-90">{t('contact.desc')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full">
              <h3 className="text-xl font-bold text-corporate mb-6">{t('contact.company_info')}</h3>
              
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg text-primary">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{t('common.name')}</h4>
                    <p className="text-sm text-gray-600 font-semibold uppercase">Công ty Cổ phần Xây lắp Bưu điện Miền Trung</p>
                    <p className="text-sm text-gray-500 mt-1">MST: 0400458940</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{t('footer.address')}</h4>
                    <p className="text-sm text-gray-600">50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP Đà Nẵng</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg text-primary">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{t('contact.phone')}</h4>
                    <p className="text-sm text-gray-600">0236 3745 555 - 0915 059 666</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg text-primary">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{t('contact.email')}</h4>
                    <p className="text-sm text-gray-600">info@ctcdn.vn</p>
                  </div>
                </div>

                 <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Working Hours</h4>
                    <p className="text-sm text-gray-600">Mon - Sat: 8:00 - 17:30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-lg h-full">
              <h3 className="text-2xl font-bold text-corporate mb-6">{t('contact.form_title')}</h3>
              
              {formStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center animate-fade-in h-64 flex flex-col justify-center items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Send size={32} />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{t('contact.success')}</h4>
                  <p>We will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.name')} *</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                        placeholder="Nguyen Van A" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.phone')} *</label>
                      <input 
                        required 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                        placeholder="090xxxxxxx" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                      placeholder="email@example.com" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.service')}</label>
                    <select 
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option>{t('solutions.rooftop')}</option>
                      <option>{t('solutions.farm')}</option>
                      <option>{t('solutions.floating')}</option>
                      <option>{t('nav.products')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')}</label>
                    <textarea 
                      rows={4} 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                      placeholder="..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className={`w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2 ${formStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {formStatus === 'submitting' ? 'Sending...' : <><Send size={18} /> {t('contact.submit')}</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="w-full h-96 bg-gray-200 relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.847325759783!2d108.22992137591056!3d16.073407984606735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421823e98d9d19%3A0x51162c0c8358b9c4!2zMjU5IFRo4bq_IEzhu68sIEFuIEjhuqNpIELhuq9jLCBTxqFuIFRyw6AsIMSQw6AgTuG6tW5nIDU1MDAwMCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1716345678901!5m2!1sen!2s" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="CTC Office Map"
          className="grayscale hover:grayscale-0 transition-all duration-500"
        ></iframe>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/50 to-transparent h-20 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Contact;
