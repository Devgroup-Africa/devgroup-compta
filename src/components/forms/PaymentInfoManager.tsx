import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface MobileMoneyAccount {
  provider: string;
  number: string;
  name: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface PaymentInfo {
  mobileMoney?: MobileMoneyAccount[];
  bankAccounts?: BankAccount[];
}

interface PaymentInfoManagerProps {
  paymentInfo: PaymentInfo;
  onChange: (paymentInfo: PaymentInfo) => void;
  onFocus?: (field: string) => void;
  onBlur?: (field: string) => void;
}

const MOBILE_MONEY_PROVIDERS = [
  'Orange Money',
  'MTN Mobile Money',
  'Airtel Money',
  'Moov Money'
];

const PaymentInfoManager: React.FC<PaymentInfoManagerProps> = ({
  paymentInfo,
  onChange,
  onFocus,
  onBlur
}) => {
  const handleAddMobileMoney = () => {
    const newMobileMoney = [
      ...(paymentInfo.mobileMoney || []),
      { provider: '', number: '', name: '' }
    ];
    onChange({
      ...paymentInfo,
      mobileMoney: newMobileMoney
    });
  };

  const handleRemoveMobileMoney = (index: number) => {
    const newMobileMoney = paymentInfo.mobileMoney?.filter((_, i) => i !== index);
    onChange({
      ...paymentInfo,
      mobileMoney: newMobileMoney
    });
  };

  const handleMobileMoneyChange = (
    index: number,
    field: keyof MobileMoneyAccount,
    value: string
  ) => {
    const newMobileMoney = [...(paymentInfo.mobileMoney || [])];
    newMobileMoney[index] = {
      ...newMobileMoney[index],
      [field]: value
    };
    onChange({
      ...paymentInfo,
      mobileMoney: newMobileMoney
    });
  };

  const handleAddBankAccount = () => {
    const newBankAccounts = [
      ...(paymentInfo.bankAccounts || []),
      { bankName: '', accountNumber: '', accountName: '' }
    ];
    onChange({
      ...paymentInfo,
      bankAccounts: newBankAccounts
    });
  };

  const handleRemoveBankAccount = (index: number) => {
    const newBankAccounts = paymentInfo.bankAccounts?.filter((_, i) => i !== index);
    onChange({
      ...paymentInfo,
      bankAccounts: newBankAccounts
    });
  };

  const handleBankAccountChange = (
    index: number,
    field: keyof BankAccount,
    value: string
  ) => {
    const newBankAccounts = [...(paymentInfo.bankAccounts || [])];
    newBankAccounts[index] = {
      ...newBankAccounts[index],
      [field]: value
    };
    onChange({
      ...paymentInfo,
      bankAccounts: newBankAccounts
    });
  };

  return (
    <div className="space-y-6">
      {/* Mobile Money Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-semibold">Mobile Money</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMobileMoney}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter Mobile Money
          </Button>
        </div>

        {(!paymentInfo.mobileMoney || paymentInfo.mobileMoney.length === 0) ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500 text-sm mb-3">Aucun compte Mobile Money ajouté</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMobileMoney}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter le premier compte
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentInfo.mobileMoney.map((mm, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Mobile Money {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMobileMoney(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Fournisseur</Label>
                    <Select
                      value={mm.provider}
                      onValueChange={(value) => handleMobileMoneyChange(index, 'provider', value)}
                    >
                      <SelectTrigger className="bg-white mt-1">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOBILE_MONEY_PROVIDERS.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Numéro</Label>
                    <Input
                      type="tel"
                      value={mm.number}
                      onChange={(e) => handleMobileMoneyChange(index, 'number', e.target.value)}
                      onFocus={() => onFocus?.(`mobileMoney.${index}.number`)}
                      onBlur={() => onBlur?.(`mobileMoney.${index}.number`)}
                      placeholder="+237 6 XX XX XX XX"
                      className="bg-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Nom du titulaire</Label>
                    <Input
                      type="text"
                      value={mm.name}
                      onChange={(e) => handleMobileMoneyChange(index, 'name', e.target.value)}
                      onFocus={() => onFocus?.(`mobileMoney.${index}.name`)}
                      onBlur={() => onBlur?.(`mobileMoney.${index}.name`)}
                      placeholder="Nom complet"
                      className="bg-white mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-semibold">Comptes bancaires</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBankAccount}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un compte
          </Button>
        </div>

        {(!paymentInfo.bankAccounts || paymentInfo.bankAccounts.length === 0) ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500 text-sm mb-3">Aucun compte bancaire ajouté</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBankAccount}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter le premier compte
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentInfo.bankAccounts.map((bank, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Compte bancaire {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBankAccount(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Nom de la banque</Label>
                    <Input
                      type="text"
                      value={bank.bankName}
                      onChange={(e) => handleBankAccountChange(index, 'bankName', e.target.value)}
                      onFocus={() => onFocus?.(`bankAccount.${index}.bankName`)}
                      onBlur={() => onBlur?.(`bankAccount.${index}.bankName`)}
                      placeholder="Afriland First Bank"
                      className="bg-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Numéro de compte</Label>
                    <Input
                      type="text"
                      value={bank.accountNumber}
                      onChange={(e) => handleBankAccountChange(index, 'accountNumber', e.target.value)}
                      onFocus={() => onFocus?.(`bankAccount.${index}.accountNumber`)}
                      onBlur={() => onBlur?.(`bankAccount.${index}.accountNumber`)}
                      placeholder="10002 12345678 90"
                      className="bg-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Nom du titulaire</Label>
                    <Input
                      type="text"
                      value={bank.accountName}
                      onChange={(e) => handleBankAccountChange(index, 'accountName', e.target.value)}
                      onFocus={() => onFocus?.(`bankAccount.${index}.accountName`)}
                      onBlur={() => onBlur?.(`bankAccount.${index}.accountName`)}
                      placeholder="Nom complet"
                      className="bg-white mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInfoManager;
