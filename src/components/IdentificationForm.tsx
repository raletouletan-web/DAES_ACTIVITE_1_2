import React, { useState } from 'react';
import { UserInfo } from '../types';
import { User, Mail, ArrowRight } from 'lucide-react';

interface Props {
  onSubmit: (info: UserInfo) => void;
}

const IdentificationForm: React.FC<Props> = ({ onSubmit }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!email.trim()) {
      newErrors.email = "L'adresse e-mail est requise";
    } else if (!validateEmail(email)) {
      newErrors.email = "L'adresse e-mail n'est pas valide";
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true });

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg shadow-sky-100/50 border border-sky-100 p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Identification</h2>
          <p className="text-gray-500 text-sm">Veuillez renseigner vos informations avant de commencer.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prénom */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur('firstName')}
              placeholder="Votre prénom"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-gray-700 placeholder-gray-300 ${
                touched.firstName && errors.firstName
                  ? 'border-red-300 bg-red-50/50 focus:border-red-400'
                  : 'border-gray-200 bg-gray-50/50 focus:border-sky-400 focus:bg-white'
              }`}
            />
            {touched.firstName && errors.firstName && (
              <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.firstName}</p>
            )}
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur('lastName')}
              placeholder="Votre nom"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-gray-700 placeholder-gray-300 ${
                touched.lastName && errors.lastName
                  ? 'border-red-300 bg-red-50/50 focus:border-red-400'
                  : 'border-gray-200 bg-gray-50/50 focus:border-sky-400 focus:bg-white'
              }`}
            />
            {touched.lastName && errors.lastName && (
              <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="votre.email@exemple.com"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-gray-700 placeholder-gray-300 ${
                  touched.email && errors.email
                    ? 'border-red-300 bg-red-50/50 focus:border-red-400'
                    : 'border-gray-200 bg-gray-50/50 focus:border-sky-400 focus:bg-white'
                }`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            Commencer
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default IdentificationForm;
