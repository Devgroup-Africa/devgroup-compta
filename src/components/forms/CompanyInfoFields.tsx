import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isValidEmail, isValidURL } from '@/utils/invoiceValidation';

export interface CompanyInfo {
  name?: string;
  logo?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  registrationNumber?: string;
}

interface CompanyInfoFieldsProps {
  companyInfo: CompanyInfo;
  onChange: (companyInfo: CompanyInfo) => void;
  onFocus?: (field: string) => void;
  onBlur?: (field: string) => void;
}

const CompanyInfoFields: React.FC<CompanyInfoFieldsProps> = ({
  companyInfo,
  onChange,
  onFocus,
  onBlur
}) => {
  const [emailError, setEmailError] = useState<string>('');
  const [websiteError, setWebsiteError] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>(companyInfo.logo || '');

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    onChange({
      ...companyInfo,
      [field]: value
    });
  };

  const handleEmailBlur = () => {
    if (companyInfo.email && !isValidEmail(companyInfo.email)) {
      setEmailError('Email invalide');
    } else {
      setEmailError('');
    }
    onBlur?.('email');
  };

  const handleWebsiteBlur = () => {
    if (companyInfo.website && !isValidURL(companyInfo.website)) {
      setWebsiteError('URL du site web invalide');
    } else {
      setWebsiteError('');
    }
    onBlur?.('website');
  };

  const handleNameChange = (value: string) => {
    if (value.length > 100) {
      setNameError("Le nom de l'entreprise ne peut pas dépasser 100 caractères");
    } else {
      setNameError('');
    }
    handleChange('name', value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale: 500KB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Type de fichier invalide. Formats acceptés: JPG, PNG, SVG');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      handleChange('logo', base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    handleChange('logo', '');
  };

  return (
    <div className="space-y-4">
      {/* Company Name */}
      <div>
        <Label htmlFor="companyName">Nom de l'entreprise</Label>
        <Input
          id="companyName"
          type="text"
          value={companyInfo.name || ''}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => onFocus?.('name')}
          onBlur={() => onBlur?.('name')}
          placeholder="DevGroup Africa"
          maxLength={100}
        />
        {companyInfo.name && (
          <p className="text-xs text-gray-500 mt-1">
            {companyInfo.name.length}/100 caractères
          </p>
        )}
        {nameError && (
          <p className="text-xs text-red-600 mt-1">{nameError}</p>
        )}
      </div>

      {/* Logo Upload */}
      <div>
        <Label htmlFor="companyLogo">Logo de l'entreprise</Label>
        <div className="mt-2">
          {logoPreview ? (
            <div className="flex items-center gap-4">
              <img 
                src={logoPreview} 
                alt="Logo preview" 
                className="h-16 w-16 object-contain border rounded"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveLogo}
              >
                <X className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Input
                id="companyLogo"
                type="file"
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="companyLogo"
                className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" />
                Télécharger un logo
              </label>
              <span className="text-xs text-gray-500">ou</span>
              <Input
                type="text"
                value={companyInfo.logo || ''}
                onChange={(e) => {
                  handleChange('logo', e.target.value);
                  setLogoPreview(e.target.value);
                }}
                placeholder="URL du logo"
                className="flex-1"
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Formats acceptés: JPG, PNG, SVG (max 500KB)
          </p>
        </div>
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="companyAddress">Adresse</Label>
        <Input
          id="companyAddress"
          type="text"
          value={companyInfo.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          onFocus={() => onFocus?.('address')}
          onBlur={() => onBlur?.('address')}
          placeholder="Rue de la Réunification"
        />
      </div>

      {/* City */}
      <div>
        <Label htmlFor="companyCity">Ville</Label>
        <Input
          id="companyCity"
          type="text"
          value={companyInfo.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          onFocus={() => onFocus?.('city')}
          onBlur={() => onBlur?.('city')}
          placeholder="Douala"
        />
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="companyPhone">Téléphone</Label>
        <Input
          id="companyPhone"
          type="tel"
          value={companyInfo.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          onFocus={() => onFocus?.('phone')}
          onBlur={() => onBlur?.('phone')}
          placeholder="+237 6 XX XX XX XX"
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="companyEmail">Email</Label>
        <Input
          id="companyEmail"
          type="email"
          value={companyInfo.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          onFocus={() => onFocus?.('email')}
          onBlur={handleEmailBlur}
          placeholder="contact@devgroup.ga"
        />
        {emailError && (
          <p className="text-xs text-red-600 mt-1">{emailError}</p>
        )}
      </div>

      {/* Website */}
      <div>
        <Label htmlFor="companyWebsite">Site web</Label>
        <Input
          id="companyWebsite"
          type="text"
          value={companyInfo.website || ''}
          onChange={(e) => handleChange('website', e.target.value)}
          onFocus={() => onFocus?.('website')}
          onBlur={handleWebsiteBlur}
          placeholder="www.devgroup.ga"
        />
        {websiteError && (
          <p className="text-xs text-red-600 mt-1">{websiteError}</p>
        )}
      </div>

      {/* Registration Number */}
      <div>
        <Label htmlFor="companyRegistration">Numéro d'enregistrement</Label>
        <Input
          id="companyRegistration"
          type="text"
          value={companyInfo.registrationNumber || ''}
          onChange={(e) => handleChange('registrationNumber', e.target.value)}
          onFocus={() => onFocus?.('registrationNumber')}
          onBlur={() => onBlur?.('registrationNumber')}
          placeholder="RC/DLA/2024/B/XXXX"
        />
      </div>
    </div>
  );
};

export default CompanyInfoFields;
