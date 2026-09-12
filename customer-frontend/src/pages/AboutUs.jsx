import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Shield, Truck, Headphones, Users, Award, MapPin, Phone, Mail } from 'lucide-react';

const AboutUs = () => {
  const team = [
    { name: 'Abebe Kebede', role: 'Founder & CEO', initials: 'AK' },
    { name: 'Meron Tadesse', role: 'Head of Sales', initials: 'MT' },
    { name: 'Yonas Girma', role: 'Technical Lead', initials: 'YG' },
    { name: 'Sara Haile', role: 'Customer Support', initials: 'SH' },
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Quality Assurance',
      desc: 'Every product is tested and verified before it reaches your hands. We only stock genuine, brand-certified hardware.',
    },
    {
      icon: <Truck className="w-8 h-8 text-primary-600" />,
      title: 'Fast Delivery',
      desc: 'We deliver across Ethiopia with reliable logistics partners.',
    },
    {
      icon: <Headphones className="w-8 h-8 text-primary-600" />,
      title: 'Expert Support',
      desc: 'Our tech-savvy team is always ready to help you find the perfect machine and assist after purchase.',
    },
    {
      icon: <Award className="w-8 h-8 text-primary-600" />,
      title: 'Best Prices',
      desc: 'We work directly with distributors to bring you competitive prices without compromising on quality.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{
          minHeight: '340px',
          backgroundImage:
            'url("https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div
          className="relative z-10 flex flex-col justify-center items-center text-center p-8 md:p-16"
          style={{ minHeight: '340px' }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white uppercase tracking-wide mb-4">
            About Alpha PC Shop
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Ethiopia's trusted destination for premium Gaming PCs and Laptops since 2020.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Alpha PC Shop was founded with a single mission: to make high-performance computing accessible to every
            Ethiopian. We started as a small shop in Addis Ababa and have grown into one of the most trusted tech
            retailers in the country.
          </p>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We specialize in Gaming PCs and Laptops, sourcing directly from certified distributors to guarantee
            authenticity. Whether you're a student, a professional, or a hardcore gamer, we have the right machine
            for you.
          </p>
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">500+</div>
              <div className="text-sm text-gray-500 mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">4+</div>
              <div className="text-sm text-gray-500 mt-1">Years in Business</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">200+</div>
              <div className="text-sm text-gray-500 mt-1">Products</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 flex items-center justify-center">
          <Monitor className="w-40 h-40 text-primary-400" />
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="card p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                {v.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Meet the Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">{member.initials}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-primary-600">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="card p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Visit Our Store</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold">Address</h3>
            <p className="text-gray-600 text-sm">Bole Sub-City, Addis Ababa<br />Ethiopia</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold">Phone</h3>
            <p className="text-gray-600 text-sm">+251 911 123 456<br />+251 922 456 789</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold">Email</h3>
            <p className="text-gray-600 text-sm">info@alphapcshop.com<br />support@alphapcshop.com</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Have a Question?</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Our team is ready to help you find the perfect product. Reach out to us anytime.
        </p>
        <Link to="/contact" className="btn-primary">
          Contact Us
        </Link>
      </section>
    </div>
  );
};

export default AboutUs;
